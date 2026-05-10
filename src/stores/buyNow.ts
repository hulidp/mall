import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem } from './cart'

const buyNowStorageKey = 'buy_now_item'

const loadBuyNowItem = (): CartItem | null => {
    const raw = sessionStorage.getItem(buyNowStorageKey)
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        const productId = Number(parsed?.productId)
        if (!Number.isFinite(productId) || productId <= 0) return null
        return {
            ...parsed,
            productId: Math.trunc(productId),
            quantity: Math.max(1, Math.floor(Number(parsed?.quantity) || 1)),
        } as CartItem
    } catch (error) {
        console.error('Failed to parse buy now item', error)
        sessionStorage.removeItem(buyNowStorageKey)
        return null
    }
}

export const useBuyNowStore = defineStore('buyNow', () => {
    const item = ref<CartItem | null>(loadBuyNowItem())

    const hasItem = computed(() => item.value !== null)

    const setItem = (newItem: CartItem) => {
        item.value = { ...newItem }
        sessionStorage.setItem(buyNowStorageKey, JSON.stringify(item.value))
    }

    const clear = () => {
        item.value = null
        sessionStorage.removeItem(buyNowStorageKey)
    }

    return {
        item,
        hasItem,
        setItem,
        clear,
    }
})
