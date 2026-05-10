import { productAPI } from '../api'
import type { CartItem } from '../stores/cart'
import { normalizeSkuId } from './sku'

interface CartStoreLike {
  items: CartItem[]
  patchItem: (productId: number, skuId: number | undefined, patch: Partial<CartItem>) => void
}

const normalizeStockNumber = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  return Math.max(Math.floor(numberValue), 0)
}

const normalizeManualStockTotal = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  const integerValue = Math.floor(numberValue)
  if (integerValue === -1) return -1
  return Math.max(integerValue, 0)
}

const normalizeSkuCode = (value: unknown) => String(value || '').trim().toUpperCase()

const normalizeOptionalLimitNumber = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return undefined
  const integerValue = Math.floor(numberValue)
  if (integerValue <= 0) return undefined
  return integerValue
}

// cartItemPurchaseLimit 返回购物车项的单次最大购买上限（无限制时返回 null）。
export const cartItemPurchaseLimit = (item: Pick<CartItem, 'maxPurchaseQuantity'>) =>
  normalizeOptionalLimitNumber(item.maxPurchaseQuantity) ?? null

// cartItemPurchaseMin 返回购物车项的单次最小购买下限（默认 1）。
export const cartItemPurchaseMin = (item: Pick<CartItem, 'minPurchaseQuantity'>) => {
  const minimum = normalizeOptionalLimitNumber(item.minPurchaseQuantity)
  return minimum && minimum > 0 ? minimum : 1
}

const normalizeSnapshotStockTotal = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  const integerValue = Math.floor(numberValue)
  if (integerValue === -1) return -1
  return Math.max(integerValue, 0)
}

const hasItemStockSnapshot = (item: CartItem) => Boolean(String(item.skuStockSnapshotAt || '').trim())

const isAutoStockFulfillment = (fulfillmentType?: string) => fulfillmentType === 'auto'

export const shouldEnforceCartItemStock = (item: CartItem) => {
  if (isAutoStockFulfillment(item.fulfillmentType)) return true
  if (item.fulfillmentType === 'upstream') return true
  if (item.fulfillmentType !== 'manual') return false
  if (!hasItemStockSnapshot(item)) return false
  const total = normalizeSnapshotStockTotal(item.skuManualStockTotal)
  if (total === -1) return false
  if (item.skuStockEnforced === true) return true
  if (item.skuStockEnforced === false) return false
  return true
}

export const cartItemAvailableStock = (item: CartItem) => {
  if (!shouldEnforceCartItemStock(item)) return null
  if (item.fulfillmentType === 'upstream') {
    const upstreamStock = Number(item.skuUpstreamStock ?? 0)
    if (upstreamStock === -1) return null
    return Math.max(upstreamStock, 0)
  }
  if (isAutoStockFulfillment(item.fulfillmentType)) {
    return normalizeStockNumber(item.skuAutoStockAvailable)
  }
  const total = normalizeSnapshotStockTotal(item.skuManualStockTotal)
  if (total === -1) return null
  return total
}

export const cartItemMaxQuantity = (item: CartItem) => {
  const available = cartItemAvailableStock(item)
  const purchaseLimit = cartItemPurchaseLimit(item)
  if (available === null && purchaseLimit === null) return null
  if (available === null) return purchaseLimit || 0
  if (purchaseLimit === null) return Math.max(available, 0)
  return Math.max(Math.min(available, purchaseLimit), 0)
}

const resolveActiveSkus = (product: any) => {
  const rows = Array.isArray(product?.skus) ? product.skus : []
  return rows.filter((sku: any) => Boolean(sku?.is_active))
}

const resolveMatchedSku = (item: CartItem, activeSkus: any[]) => {
  const skuId = normalizeSkuId(item.skuId)
  if (skuId > 0) {
    const matchedById = activeSkus.find((sku: any) => normalizeSkuId(sku?.id) === skuId)
    if (matchedById) return matchedById
  }

  const skuCode = normalizeSkuCode(item.skuCode)
  if (skuCode) {
    const matchedByCode = activeSkus.find((sku: any) => normalizeSkuCode(sku?.sku_code) === skuCode)
    if (matchedByCode) return matchedByCode
  }

  if (activeSkus.length === 1) {
    return activeSkus[0]
  }

  return null
}

const shouldEnforceSkuStock = (product: any, sku: any) => {
  if (!product || !sku) return false
  const type = String(product?.fulfillment_type || '').trim()
  if (isAutoStockFulfillment(type)) return true
  if (type === 'upstream') return true
  if (type !== 'manual') return false
  const total = normalizeManualStockTotal(sku?.manual_stock_total)
  if (total === -1) return false
  return true
}

export const refreshCartStockSnapshots = async (cartStore: CartStoreLike) => {
  const items = Array.isArray(cartStore.items) ? cartStore.items : []
  if (items.length === 0) return

  const slugSet = new Set<string>()
  for (const item of items) {
    const slug = String(item.slug || '').trim()
    if (slug) slugSet.add(slug)
  }
  if (slugSet.size === 0) return

  const productMap = new Map<string, any>()
  const requests = Array.from(slugSet).map(async (slug) => {
    try {
      const response = await productAPI.detailFresh(slug)
      const product = response.data?.data
      if (product) {
        productMap.set(slug, product)
      }
    } catch {
      // 忽略单个商品刷新失败，避免影响整体页面可用性
    }
  })

  await Promise.all(requests)

  for (const item of items) {
    const slug = String(item.slug || '').trim()
    if (!slug) continue
    const product = productMap.get(slug)
    if (!product) continue

    const activeSkus = resolveActiveSkus(product)
    if (activeSkus.length === 0) continue

    const matchedSku = resolveMatchedSku(item, activeSkus)
    if (!matchedSku) continue

    const manualStockTotal = normalizeManualStockTotal(matchedSku?.manual_stock_total)
    const manualStockLocked = normalizeStockNumber(matchedSku?.manual_stock_locked)
    const manualStockSold = normalizeStockNumber(matchedSku?.manual_stock_sold)
    const autoStockAvailable = normalizeStockNumber(matchedSku?.auto_stock_available)
    const upstreamStock = normalizeManualStockTotal(matchedSku?.upstream_stock)
    const skuStockEnforced = shouldEnforceSkuStock(product, matchedSku)

    cartStore.patchItem(item.productId, item.skuId, {
      fulfillmentType: String(product?.fulfillment_type || item.fulfillmentType || ''),
      manualFormSchema: product?.manual_form_schema || item.manualFormSchema,
      purchaseType: String(product?.purchase_type || item.purchaseType || ''),
      paymentChannelIds: Array.isArray(product?.payment_channel_ids) ? product.payment_channel_ids : item.paymentChannelIds,
      skuCode: String(matchedSku?.sku_code || item.skuCode || ''),
      skuSpecValues: (matchedSku?.spec_values && typeof matchedSku.spec_values === 'object')
        ? matchedSku.spec_values
        : item.skuSpecValues,
      skuManualStockTotal: manualStockTotal,
      skuManualStockLocked: manualStockLocked,
      skuManualStockSold: manualStockSold,
      skuAutoStockAvailable: autoStockAvailable,
      skuUpstreamStock: upstreamStock,
      skuStockEnforced,
      skuStockSnapshotAt: new Date().toISOString(),
      minPurchaseQuantity: normalizeOptionalLimitNumber(product?.min_purchase_quantity),
      maxPurchaseQuantity: normalizeOptionalLimitNumber(product?.max_purchase_quantity),
    })
  }
}
