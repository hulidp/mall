import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
    productId: number
    skuId?: number
    skuCode?: string
    skuSpecValues?: Record<string, any>
    skuManualStockTotal?: number
    skuManualStockLocked?: number
    skuManualStockSold?: number
    skuAutoStockAvailable?: number
    skuUpstreamStock?: number
    skuStockEnforced?: boolean
    skuStockSnapshotAt?: string
    slug: string
    title: any
    priceAmount: string
    basePriceAmount?: string
    wholesaleRules?: Array<{ min_quantity: number; unit_price_amount: string | number }>
    image?: string
    quantity: number
    minPurchaseQuantity?: number
    maxPurchaseQuantity?: number
    purchaseType?: string
    fulfillmentType?: string
    manualFormSchema?: any
    paymentChannelIds?: number[]
}

const normalizeSkuId = (value: unknown) => {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return 0
    const integerValue = Math.trunc(numberValue)
    return integerValue > 0 ? integerValue : 0
}

const cartIdentity = (item: Pick<CartItem, 'productId' | 'skuId'>) => `${item.productId}:${normalizeSkuId(item.skuId)}`

const normalizeOptionalStockNumber = (value: unknown, allowUnlimited = false): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return undefined
    const integerValue = Math.floor(numberValue)
    if (allowUnlimited && integerValue === -1) return -1
    return Math.max(integerValue, 0)
}

const normalizeOptionalBoolean = (value: unknown): boolean | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    return Boolean(value)
}

const normalizeOptionalString = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined
    const text = String(value).trim()
    return text || undefined
}

const normalizeWholesaleRules = (value: unknown): Array<{ min_quantity: number; unit_price_amount: string | number }> | undefined => {
    if (!Array.isArray(value)) return undefined
    const rules = value
        .map((rule) => {
            const row = rule as any
            const minQuantity = Math.floor(Number(row?.min_quantity || 0))
            const unitPriceAmount = row?.unit_price_amount
            const priceNumber = Number(unitPriceAmount)
            if (!Number.isFinite(minQuantity) || minQuantity < 2 || !Number.isFinite(priceNumber) || priceNumber <= 0) {
                return null
            }
            return { min_quantity: minQuantity, unit_price_amount: unitPriceAmount }
        })
        .filter(Boolean) as Array<{ min_quantity: number; unit_price_amount: string | number }>
    if (!rules.length) return undefined
    return rules.sort((a, b) => a.min_quantity - b.min_quantity)
}

const resolveCartUnitPriceAmount = (item: CartItem, quantity: number) => {
    const basePrice = item.basePriceAmount || item.priceAmount
    let unitPrice = Number(basePrice)
    const qty = Math.max(Math.floor(Number(quantity) || 0), 0)
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || qty <= 0) {
        return item.priceAmount
    }
    let matched: { min_quantity: number; unit_price_amount: string | number } | null = null
    for (const rule of item.wholesaleRules || []) {
        if (rule.min_quantity <= qty && (!matched || rule.min_quantity > matched.min_quantity)) {
            matched = rule
        }
    }
    if (matched) {
        const wholesalePrice = Number(matched.unit_price_amount)
        if (Number.isFinite(wholesalePrice) && wholesalePrice > 0 && wholesalePrice < unitPrice) {
            unitPrice = wholesalePrice
        }
    }
    return String(unitPrice)
}

const normalizeOptionalLimitNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return undefined
    const integerValue = Math.floor(numberValue)
    if (integerValue <= 0) return undefined
    return integerValue
}

// 兜底将数量收敛到 [min, max] 区间，确保 store 内数据始终合法。
// UI 层（ProductDetail / Cart 等）应在调用前根据 min/max 给用户提示，避免出现"数量被静默抬升"的体验。
const clampCartQuantity = (quantity: number, maxPurchaseQuantity?: number, minPurchaseQuantity?: number) => {
    const lowerBound = minPurchaseQuantity && minPurchaseQuantity > 0 ? minPurchaseQuantity : 1
    const normalizedQuantity = Math.max(lowerBound, Math.floor(Number(quantity) || lowerBound))
    if (!maxPurchaseQuantity || maxPurchaseQuantity <= 0) {
        return normalizedQuantity
    }
    return Math.min(normalizedQuantity, maxPurchaseQuantity)
}

const loadCartItems = (): CartItem[] => {
    const raw = localStorage.getItem('cart_items')
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const row = item as any
                const productId = Number(row.productId)
                if (!Number.isFinite(productId) || productId <= 0) return null
                return {
                    ...(item as CartItem),
                    productId: Math.trunc(productId),
                    skuId: normalizeSkuId(row.skuId),
                    skuManualStockTotal: normalizeOptionalStockNumber(row.skuManualStockTotal ?? row.sku_manual_stock_total, true),
                    skuManualStockLocked: normalizeOptionalStockNumber(row.skuManualStockLocked ?? row.sku_manual_stock_locked),
                    skuManualStockSold: normalizeOptionalStockNumber(row.skuManualStockSold ?? row.sku_manual_stock_sold),
                    skuAutoStockAvailable: normalizeOptionalStockNumber(row.skuAutoStockAvailable ?? row.sku_auto_stock_available),
                    skuUpstreamStock: normalizeOptionalStockNumber(row.skuUpstreamStock ?? row.sku_upstream_stock, true),
                    skuStockEnforced: normalizeOptionalBoolean(row.skuStockEnforced ?? row.sku_stock_enforced),
                    skuStockSnapshotAt: normalizeOptionalString(row.skuStockSnapshotAt ?? row.sku_stock_snapshot_at),
                    basePriceAmount: normalizeOptionalString(row.basePriceAmount ?? row.base_price_amount),
                    wholesaleRules: normalizeWholesaleRules(row.wholesaleRules ?? row.wholesale_rules),
                    minPurchaseQuantity: normalizeOptionalLimitNumber(row.minPurchaseQuantity ?? row.min_purchase_quantity),
                    maxPurchaseQuantity: normalizeOptionalLimitNumber(row.maxPurchaseQuantity ?? row.max_purchase_quantity),
                } as CartItem
            })
            .filter(Boolean) as CartItem[]
    } catch (error) {
        console.error('Failed to parse cart items', error)
        return []
    }
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>(loadCartItems())

    const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

    const persist = () => {
        localStorage.setItem('cart_items', JSON.stringify(items.value))
    }

    const addItem = (item: CartItem, quantity = 1) => {
        const normalizedItem: CartItem = {
            ...item,
            productId: Math.trunc(Number(item.productId)),
            skuId: normalizeSkuId(item.skuId),
            skuManualStockTotal: normalizeOptionalStockNumber(item.skuManualStockTotal, true),
            skuManualStockLocked: normalizeOptionalStockNumber(item.skuManualStockLocked),
            skuManualStockSold: normalizeOptionalStockNumber(item.skuManualStockSold),
            skuAutoStockAvailable: normalizeOptionalStockNumber(item.skuAutoStockAvailable),
            skuUpstreamStock: normalizeOptionalStockNumber(item.skuUpstreamStock, true),
            skuStockEnforced: normalizeOptionalBoolean(item.skuStockEnforced),
            skuStockSnapshotAt: normalizeOptionalString(item.skuStockSnapshotAt) || new Date().toISOString(),
            basePriceAmount: normalizeOptionalString(item.basePriceAmount),
            wholesaleRules: normalizeWholesaleRules(item.wholesaleRules),
            minPurchaseQuantity: normalizeOptionalLimitNumber(item.minPurchaseQuantity),
            maxPurchaseQuantity: normalizeOptionalLimitNumber(item.maxPurchaseQuantity),
        }
        const qty = clampCartQuantity(quantity, normalizedItem.maxPurchaseQuantity, normalizedItem.minPurchaseQuantity)
        normalizedItem.priceAmount = resolveCartUnitPriceAmount(normalizedItem, qty)
        const identity = cartIdentity(normalizedItem)
        const existing = items.value.find((entry) => cartIdentity(entry) === identity)
        if (existing) {
            existing.quantity = clampCartQuantity(existing.quantity + qty, normalizedItem.maxPurchaseQuantity, normalizedItem.minPurchaseQuantity)
            existing.slug = normalizedItem.slug
            existing.title = normalizedItem.title
            existing.basePriceAmount = normalizedItem.basePriceAmount
            existing.wholesaleRules = normalizedItem.wholesaleRules
            existing.priceAmount = resolveCartUnitPriceAmount(existing, existing.quantity)
            existing.image = normalizedItem.image
            existing.minPurchaseQuantity = normalizedItem.minPurchaseQuantity
            existing.maxPurchaseQuantity = normalizedItem.maxPurchaseQuantity
            existing.purchaseType = normalizedItem.purchaseType
            existing.fulfillmentType = normalizedItem.fulfillmentType
            existing.manualFormSchema = normalizedItem.manualFormSchema
            existing.skuId = normalizedItem.skuId
            existing.skuCode = normalizedItem.skuCode
            existing.skuSpecValues = normalizedItem.skuSpecValues
            existing.skuManualStockTotal = normalizedItem.skuManualStockTotal
            existing.skuManualStockLocked = normalizedItem.skuManualStockLocked
            existing.skuManualStockSold = normalizedItem.skuManualStockSold
            existing.skuAutoStockAvailable = normalizedItem.skuAutoStockAvailable
            existing.skuUpstreamStock = normalizedItem.skuUpstreamStock
            existing.skuStockEnforced = normalizedItem.skuStockEnforced
            existing.skuStockSnapshotAt = normalizedItem.skuStockSnapshotAt
        } else {
            items.value.push({
                ...normalizedItem,
                quantity: qty,
            })
        }
        persist()
    }

    const updateQuantity = (productId: number, quantity: number, skuId?: number) => {
        const identity = `${Math.trunc(Number(productId))}:${normalizeSkuId(skuId)}`
        const target = items.value.find((entry) => cartIdentity(entry) === identity)
        if (!target) return
        const qty = clampCartQuantity(quantity, target.maxPurchaseQuantity, target.minPurchaseQuantity)
        target.quantity = qty
        target.priceAmount = resolveCartUnitPriceAmount(target, qty)
        persist()
    }

    const patchItem = (productId: number, skuId: number | undefined, patch: Partial<CartItem>) => {
        const identity = `${Math.trunc(Number(productId))}:${normalizeSkuId(skuId)}`
        const target = items.value.find((entry) => cartIdentity(entry) === identity)
        if (!target) return
        Object.assign(target, patch)
        target.productId = Math.trunc(Number(target.productId))
        target.skuId = normalizeSkuId(target.skuId)
        target.skuManualStockTotal = normalizeOptionalStockNumber(target.skuManualStockTotal, true)
        target.skuManualStockLocked = normalizeOptionalStockNumber(target.skuManualStockLocked)
        target.skuManualStockSold = normalizeOptionalStockNumber(target.skuManualStockSold)
        target.skuAutoStockAvailable = normalizeOptionalStockNumber(target.skuAutoStockAvailable)
        target.skuUpstreamStock = normalizeOptionalStockNumber(target.skuUpstreamStock, true)
        target.skuStockEnforced = normalizeOptionalBoolean(target.skuStockEnforced)
        target.skuStockSnapshotAt = normalizeOptionalString(target.skuStockSnapshotAt)
        target.basePriceAmount = normalizeOptionalString(target.basePriceAmount)
        target.wholesaleRules = normalizeWholesaleRules(target.wholesaleRules)
        target.priceAmount = resolveCartUnitPriceAmount(target, target.quantity)
        target.minPurchaseQuantity = normalizeOptionalLimitNumber(target.minPurchaseQuantity)
        target.maxPurchaseQuantity = normalizeOptionalLimitNumber(target.maxPurchaseQuantity)
        persist()
    }

    const removeItem = (productId: number, skuId?: number) => {
        const identity = `${Math.trunc(Number(productId))}:${normalizeSkuId(skuId)}`
        items.value = items.value.filter((entry) => cartIdentity(entry) !== identity)
        persist()
    }

    const clear = () => {
        items.value = []
        persist()
    }

    return {
        items,
        totalItems,
        addItem,
        updateQuantity,
        patchItem,
        removeItem,
        clear,
    }
})
