import type { CartItem } from '../../stores/cart'
import { sanitizeHtml } from '../../utils/html'
import { getImageUrl } from '../../utils/image'
import { normalizeSkuId } from '../../utils/sku'

export type MallContentModalMode = 'blog' | 'notice' | 'about' | 'custom'
export type MallAuthModalMode = 'login' | 'register' | 'forgot'

export interface MallContentModalCustomItem {
  id: number
  title: Record<string, string>
  link_type: string
  url: string
  target: string
  sort_order: number
  enabled: boolean
  icon?: string
}

export interface MallContentModalDetail {
  mode: MallContentModalMode
  customItem?: MallContentModalCustomItem | null
  slug?: string
}

export const mallOpenContentModalEvent = 'dujiao.mall.open-content-modal'
export const mallOpenAuthModalEvent = 'dujiao.mall.open-auth-modal'
export const mallAuthModalModeStorageKey = 'dujiao.mall.openAuthMode'
export const mallAuthRedirectStorageKey = 'dujiao.mall.authRedirect'

let mallBodyScrollLockCount = 0
let mallBodyPreviousOverflow = ''

export const lockMallBodyScroll = () => {
  if (typeof document === 'undefined') return
  if (mallBodyScrollLockCount === 0) {
    mallBodyPreviousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  mallBodyScrollLockCount += 1
}

export const unlockMallBodyScroll = () => {
  if (typeof document === 'undefined') return
  mallBodyScrollLockCount = Math.max(mallBodyScrollLockCount - 1, 0)
  if (mallBodyScrollLockCount === 0) {
    document.body.style.overflow = mallBodyPreviousOverflow
    mallBodyPreviousOverflow = ''
  }
}

export const openMallContentModal = (detail: MallContentModalDetail) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<MallContentModalDetail>(mallOpenContentModalEvent, { detail }))
}

export const openMallAuthModal = (mode: MallAuthModalMode = 'login') => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<{ mode: MallAuthModalMode }>(mallOpenAuthModalEvent, { detail: { mode } }))
}

export const formatMallMoney = (amount: unknown, currency = 'CNY') => {
  if (amount === null || amount === undefined || amount === '') return '-'
  const normalizedCurrency = String(currency || '').trim().toUpperCase()
  if (!normalizedCurrency) return String(amount)
  const directSymbols: Record<string, string> = {
    CNY: '¥',
    RMB: '¥',
    USD: '$',
    HKD: 'HK$',
    TWD: 'NT$',
    JPY: '¥',
    KRW: '₩',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    SGD: 'S$',
    NZD: 'NZ$',
    MYR: 'RM',
    THB: '฿',
    PHP: '₱',
    VND: '₫',
    IDR: 'Rp',
    INR: '₹',
    RUB: '₽',
    TRY: '₺',
    BRL: 'R$',
    MXN: 'MX$',
  }
  const directSymbol = directSymbols[normalizedCurrency]
  return directSymbol ? `${directSymbol}${amount}` : `${amount} ${normalizedCurrency}`
}

export const paymentChannelIcon = (channel: any) => {
  const icon = String(channel?.icon || '').trim()
  return icon ? getImageUrl(icon) : ''
}

export const productImages = (product: any): string[] => {
  const rows = Array.isArray(product?.images) ? product.images : []
  return rows.map((image: unknown) => getImageUrl(String(image || '').trim())).filter(Boolean)
}

export const firstProductImage = (product: any) => productImages(product)[0] || ''

export const activeSkus = (product: any): any[] => {
  const rows = Array.isArray(product?.skus) ? product.skus : []
  return rows.filter((sku: any) => Boolean(sku?.is_active))
}

export const normalizeStockNumber = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  return Math.max(Math.floor(numberValue), 0)
}

export const normalizeManualStockTotal = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  const integerValue = Math.floor(numberValue)
  if (integerValue === -1) return -1
  return Math.max(integerValue, 0)
}

export const normalizeLimit = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return undefined
  const integerValue = Math.floor(numberValue)
  return integerValue > 0 ? integerValue : undefined
}

export const isAutoStockFulfillment = (type: unknown) => {
  const normalized = String(type || '').trim()
  return normalized === 'auto'
}

export const resolveSelectedSku = (product: any, selectedSkuId: number) => {
  const skus = activeSkus(product)
  if (skus.length === 0) return null
  if (selectedSkuId > 0) {
    const matched = skus.find((sku) => normalizeSkuId(sku?.id) === selectedSkuId)
    if (matched) return matched
  }
  return skus.find((sku) => isSkuPurchasable(product, sku)) || skus[0] || null
}

export const skuAvailableStock = (product: any, sku: any): number | null => {
  if (!product || !sku) return null
  const type = String(product?.fulfillment_type || '').trim()
  if (type === 'upstream') {
    const stock = normalizeManualStockTotal(sku?.upstream_stock)
    return stock === -1 ? null : stock
  }
  if (isAutoStockFulfillment(type)) {
    return normalizeStockNumber(sku?.auto_stock_available)
  }
  if (type !== 'manual') return null
  const total = normalizeManualStockTotal(sku?.manual_stock_total)
  if (total === -1) return null
  return Math.max(total - normalizeStockNumber(sku?.manual_stock_locked) - normalizeStockNumber(sku?.manual_stock_sold), 0)
}

export const mallProductStockCount = (product: any): number | null => {
  if (!product) return 0
  if (product?.is_sold_out || product?.stock_status === 'out_of_stock') return 0
  if (product?.stock_status === 'unlimited') return null

  const type = String(product?.fulfillment_type || '').trim()
  const skus = activeSkus(product)
  if (type === 'upstream') {
    if (skus.length === 0) return 0
    let total = 0
    let hasFiniteStock = false
    for (const sku of skus) {
      const stock = skuAvailableStock(product, sku)
      if (stock === null) return null
      hasFiniteStock = true
      total += stock
    }
    return hasFiniteStock ? total : 0
  }

  const directStock = type === 'manual'
    ? Number(product?.manual_stock_available)
    : isAutoStockFulfillment(type)
      ? Number(product?.auto_stock_available)
      : Number.NaN
  if (Number.isFinite(directStock)) {
    const stock = Math.floor(directStock)
    return stock < 0 ? null : Math.max(stock, 0)
  }

  if (skus.length === 0) return 0

  let total = 0
  let hasFiniteStock = false
  for (const sku of skus) {
    const stock = skuAvailableStock(product, sku)
    if (stock === null) return null
    hasFiniteStock = true
    total += stock
  }
  return hasFiniteStock ? total : 0
}

export const shouldEnforceSkuStock = (product: any, sku: any) => {
  if (!product || !sku) return false
  const type = String(product?.fulfillment_type || '').trim()
  if (isAutoStockFulfillment(type) || type === 'upstream') return true
  if (type !== 'manual') return false
  return normalizeManualStockTotal(sku?.manual_stock_total) !== -1
}

export const isSkuPurchasable = (product: any, sku: any) => {
  if (!sku || sku?.is_active === false) return false
  const stock = skuAvailableStock(product, sku)
  return stock === null || stock > 0
}

export const isProductSoldOut = (product: any) => {
  return Boolean(product?.is_sold_out || product?.stock_status === 'out_of_stock')
}

export const resolveProductPrice = (product: any, sku?: any) => {
  const source = sku || product || {}
  const promotion = String(source?.promotion_price_amount ?? '').trim()
  if (promotion !== '') return promotion
  return String(source?.price_amount ?? product?.price_amount ?? '0.00')
}

export const skuWholesaleRules = (sku: any) => {
  if (!sku || !Array.isArray(sku?.wholesale_rules)) return []
  return sku.wholesale_rules
    .filter((rule: any) => {
      const minQuantity = Number(rule?.min_quantity)
      const unitPrice = Number(rule?.unit_price_amount)
      return Number.isFinite(minQuantity) && minQuantity > 0 && Number.isFinite(unitPrice) && unitPrice > 0
    })
    .sort((left: any, right: any) => Number(left.min_quantity || 0) - Number(right.min_quantity || 0))
}

export const resolveSkuWholesaleRule = (sku: any, quantity: number) => {
  const qty = Math.max(Math.floor(Number(quantity) || 0), 0)
  if (qty <= 0) return null
  let matched: any = null
  for (const rule of skuWholesaleRules(sku)) {
    const minQuantity = Math.floor(Number(rule?.min_quantity || 0))
    if (minQuantity <= qty && (!matched || minQuantity > Number(matched.min_quantity || 0))) {
      matched = rule
    }
  }
  return matched
}

export const resolveMallMemberPrice = (product: any, sku: any, memberLevelId: number) => {
  const levelId = Number(memberLevelId || 0)
  if (!product?.member_prices || !levelId) return null
  const prices = Array.isArray(product.member_prices) ? product.member_prices : []
  const skuId = normalizeSkuId(sku?.id)
  const matchedSkuPrice = prices.find((price: any) =>
    Number(price?.member_level_id) === levelId && normalizeSkuId(price?.sku_id) === skuId,
  )
  if (matchedSkuPrice) {
    const amount = Number(matchedSkuPrice.price_amount)
    return Number.isFinite(amount) && amount > 0 ? amount : null
  }
  const matchedProductPrice = prices.find((price: any) =>
    Number(price?.member_level_id) === levelId && normalizeSkuId(price?.sku_id) === 0,
  )
  if (matchedProductPrice) {
    const amount = Number(matchedProductPrice.price_amount)
    return Number.isFinite(amount) && amount > 0 ? amount : null
  }
  return null
}

export const resolveMallBaseUnitPrice = (product: any, sku: any, memberLevelId = 0) => {
  const basePrice = Number(sku?.price_amount ?? product?.price_amount ?? 0)
  const promotionPrice = Number(resolveProductPrice(product, sku))
  const memberPrice = resolveMallMemberPrice(product, sku, memberLevelId)
  const candidates = [basePrice, promotionPrice, memberPrice]
    .filter((amount) => Number.isFinite(Number(amount)) && Number(amount) > 0)
    .map((amount) => Number(amount))
  if (!candidates.length) return String(Number.isFinite(basePrice) ? basePrice : 0)
  return String(Math.min(...candidates))
}

export const resolveMallUnitPrice = (product: any, sku: any, quantity: number, memberLevelId = 0) => {
  let unitPrice = Number(resolveMallBaseUnitPrice(product, sku, memberLevelId))
  const wholesaleRule = resolveSkuWholesaleRule(sku, quantity)
  const wholesalePrice = Number(wholesaleRule?.unit_price_amount)
  if (Number.isFinite(wholesalePrice) && wholesalePrice > 0 && wholesalePrice < unitPrice) {
    unitPrice = wholesalePrice
  }
  return String(unitPrice)
}

export const buildMallCartItem = (product: any, sku: any, quantity: number, memberLevelId = 0): CartItem => ({
  productId: Number(product?.id || 0),
  skuId: normalizeSkuId(sku?.id),
  skuCode: String(sku?.sku_code || ''),
  skuSpecValues: sku?.spec_values && typeof sku.spec_values === 'object' ? sku.spec_values : undefined,
  skuManualStockTotal: normalizeManualStockTotal(sku?.manual_stock_total),
  skuManualStockLocked: normalizeStockNumber(sku?.manual_stock_locked),
  skuManualStockSold: normalizeStockNumber(sku?.manual_stock_sold),
  skuAutoStockAvailable: normalizeStockNumber(sku?.auto_stock_available),
  skuUpstreamStock: normalizeManualStockTotal(sku?.upstream_stock),
  skuStockEnforced: shouldEnforceSkuStock(product, sku),
  slug: String(product?.slug || ''),
  title: product?.title || {},
  priceAmount: resolveMallUnitPrice(product, sku, quantity, memberLevelId),
  basePriceAmount: resolveMallBaseUnitPrice(product, sku, memberLevelId),
  wholesaleRules: skuWholesaleRules(sku),
  image: firstProductImage(product),
  minPurchaseQuantity: normalizeLimit(product?.min_purchase_quantity),
  maxPurchaseQuantity: normalizeLimit(product?.max_purchase_quantity),
  purchaseType: String(product?.purchase_type || 'member'),
  fulfillmentType: String(product?.fulfillment_type || ''),
  manualFormSchema: product?.manual_form_schema || {},
  paymentChannelIds: Array.isArray(product?.payment_channel_ids) && product.payment_channel_ids.length > 0
    ? product.payment_channel_ids
    : undefined,
  quantity,
})

export const paginationData = (response: any) => response?.data?.pagination || response?.pagination || null

export const listData = (response: any) => {
  const data = response?.data?.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.list)) return data.list
  return []
}

export const sanitizeMallHtml = (html: string) => {
  return sanitizeHtml(html)
}
