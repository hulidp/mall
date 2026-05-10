import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { amountToCents, centsToAmount } from '../utils/money'

export function useLocalized() {
  const appStore = useAppStore()

  const getLocalizedText = (jsonData: any): string => {
    if (!jsonData) return ''
    const locale = appStore.locale
    return jsonData[locale] || jsonData['zh-CN'] || jsonData['en-US'] || ''
  }

  const siteCurrency = computed(() => {
    const raw = String(appStore.config?.currency || '').trim().toUpperCase()
    return /^[A-Z]{3}$/.test(raw) ? raw : 'CNY'
  })

  const formatPrice = (amount: any, currency?: any): string => {
    const cur = currency ?? siteCurrency.value
    if (amount === null || amount === undefined || amount === '') return '-'
    if (cur === null || cur === undefined || cur === '') {
      return String(amount)
    }
    return `${amount} ${cur}`
  }

  return { getLocalizedText, siteCurrency, formatPrice }
}

export function useProductLabels() {
  const { t } = useI18n()

  const getPurchaseTypeLabel = (purchaseType: string) => {
    return purchaseType === 'guest' ? t('productPurchase.guest') : t('productPurchase.member')
  }

  const isAutoFulfillment = (fulfillmentType?: string) => {
    return fulfillmentType === 'auto' || fulfillmentType === 'upstream'
  }

  const getFulfillmentTypeLabel = (fulfillmentType: string) => {
    return isAutoFulfillment(fulfillmentType) ? t('products.fulfillmentType.auto') : t('products.fulfillmentType.manual')
  }

  const getStockBadgeClass = (status: string) => {
    switch (status) {
      case 'unlimited':
        return 'theme-badge-info'
      case 'low_stock':
        return 'theme-badge-warning'
      case 'out_of_stock':
        return 'theme-badge-danger'
      default:
        return 'theme-badge-success'
    }
  }

  const getStockStatusLabel = (product: any) => {
    const status = product?.stock_status || ''
    if (status === 'unlimited') return t('products.stockStatus.unlimited')
    if (status === 'out_of_stock') return t('products.stockStatus.outOfStock')
    if (status === 'low_stock') {
      const count = Number(product?.fulfillment_type === 'manual' ? product?.manual_stock_available : product?.auto_stock_available)
      if (Number.isFinite(count) && count > 0) {
        return t('products.stockStatus.lowStockCount', { count })
      }
      return t('products.stockStatus.lowStock')
    }
    return t('products.stockStatus.inStock')
  }

  const isSoldOut = (product: any) => Boolean(product?.is_sold_out || product?.stock_status === 'out_of_stock')

  const parsePriceAmount = (amount: any) => amountToCents(amount)

  const getPromotionPriceAmount = (product: any) => product?.promotion_price_amount

  const hasPromotionPrice = (product: any) => {
    if (!product) return false
    const original = parsePriceAmount(product.price_amount)
    const promotion = parsePriceAmount(product.promotion_price_amount)
    if (original === null || promotion === null) return false
    return promotion >= 0 && promotion < original
  }

  const getPromotionSaveAmount = (product: any) => {
    const original = parsePriceAmount(product?.price_amount)
    const promotion = parsePriceAmount(product?.promotion_price_amount)
    if (original === null || promotion === null || promotion >= original) {
      return '0.00'
    }
    return centsToAmount(original - promotion)
  }

  const hasSkuPromotionPrice = (sku: any) => {
    if (!sku) return false
    const original = parsePriceAmount(sku.price_amount)
    const promotion = parsePriceAmount(sku.promotion_price_amount)
    if (original === null || promotion === null) return false
    return promotion >= 0 && promotion < original
  }

  const getSkuPromotionPriceAmount = (sku: any) => sku?.promotion_price_amount

  const getSkuPromotionSaveAmount = (sku: any) => {
    const original = parsePriceAmount(sku?.price_amount)
    const promotion = parsePriceAmount(sku?.promotion_price_amount)
    if (original === null || promotion === null || promotion >= original) {
      return '0.00'
    }
    return centsToAmount(original - promotion)
  }

  const hasPromotionRules = (product: any) => product?.promotion_rules?.length > 0
  const getPromotionRules = (product: any): any[] => product?.promotion_rules ?? []

  const getWholesaleRules = (sku: any): any[] => {
    if (!sku || !Array.isArray(sku.wholesale_rules)) return []
    return sku.wholesale_rules
      .filter((rule: any) => Number(rule?.min_quantity) > 0 && parsePriceAmount(rule?.unit_price_amount) !== null)
      .sort((a: any, b: any) => Number(a.min_quantity || 0) - Number(b.min_quantity || 0))
  }

  const hasWholesaleRules = (sku: any) => getWholesaleRules(sku).length > 0

  const getMatchedWholesaleRule = (sku: any, quantity: any) => {
    const qty = Math.max(Math.floor(Number(quantity || 0)), 0)
    if (qty <= 0) return null
    let matched: any = null
    for (const rule of getWholesaleRules(sku)) {
      const minQuantity = Math.floor(Number(rule?.min_quantity || 0))
      if (minQuantity <= qty && (!matched || minQuantity > Number(matched.min_quantity || 0))) {
        matched = rule
      }
    }
    return matched
  }

  const getWholesaleUnitPriceAmount = (rule: any) => rule?.unit_price_amount

  return {
    getPurchaseTypeLabel,
    getFulfillmentTypeLabel,
    isAutoFulfillment,
    getStockBadgeClass,
    getStockStatusLabel,
    isSoldOut,
    hasPromotionPrice,
    getPromotionPriceAmount,
    getPromotionSaveAmount,
    hasSkuPromotionPrice,
    getSkuPromotionPriceAmount,
    getSkuPromotionSaveAmount,
    hasPromotionRules,
    getPromotionRules,
    getWholesaleRules,
    hasWholesaleRules,
    getMatchedWholesaleRule,
    getWholesaleUnitPriceAmount,
  }
}
