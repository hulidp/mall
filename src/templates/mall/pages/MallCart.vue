<template>
  <div class="mx-auto max-w-[1472px] overflow-x-hidden px-0 pb-24 pt-2 sm:px-6 xl:pb-8 lg:px-8">
    <div class="mb-2 flex items-start justify-between gap-3 px-3 sm:mb-4 sm:px-0">
      <div class="min-w-0">
        <h1 class="text-xl font-black leading-tight text-gray-950 dark:text-white sm:text-[26px]">{{ t('cart.title') }}</h1>
        <p class="mt-1 hidden text-sm text-gray-500 dark:text-gray-400 sm:block">{{ t('cart.subtitle') }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <router-link
          to="/"
          class="inline-flex h-9 items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition dark:border-white/10 dark:bg-neutral-900 dark:text-gray-200 sm:h-10 sm:px-4"
        >
          {{ t('cart.emptyAction') }}
        </router-link>
        <button
          v-if="cartStore.items.length"
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 sm:h-10 sm:w-auto sm:px-4 sm:text-sm sm:font-semibold"
          @click="cartStore.clear()"
        >
          <TrashIcon class="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span class="hidden sm:inline">{{ t('emptyState.clearFilters') }}</span>
        </button>
      </div>
    </div>

    <section
      v-if="cartStore.items.length === 0"
      class="mx-0 overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10"
    >
      <div class="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-orange-600" style="background-color: var(--ui-accent-soft);">
          <ShoppingBagIcon class="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('cart.empty') }}</h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ t('cart.subtitle') }}</p>
        <router-link
          to="/"
          class="mt-5 inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-bold text-white" style="background-color: var(--ui-accent);"
        >
          {{ t('cart.emptyAction') }}
        </router-link>
      </div>
    </section>

    <div v-else class="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-4">
      <section class="overflow-hidden border-y border-gray-100 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.04)] ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
        <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 dark:border-white/10 lg:hidden">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black text-gray-950 dark:text-white">{{ t('navbar.cart') }}</span>
            <span class="rounded-full px-2 py-0.5 text-xs font-bold" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
              {{ cartStore.totalItems }}
            </span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ totalQuantityLabel }}</span>
        </div>

        <div class="hidden items-center justify-between gap-3 px-4 py-4 sm:px-5 lg:flex">
          <div class="flex items-center gap-2">
            <span class="text-base font-black text-gray-950 dark:text-white">{{ t('navbar.cart') }}</span>
            <span class="rounded-full px-2.5 py-1 text-xs font-bold" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
              {{ cartStore.totalItems }}
            </span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('cart.subtitle') }}</span>
        </div>

        <div class="hidden gap-4 grid-cols-[minmax(0,1fr)_180px_150px_128px_56px] border-y border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500 dark:border-white/10 dark:bg-white/[0.04] lg:grid">
          <div>{{ orderProductLabel }}</div>
          <div class="flex items-center justify-center text-center">{{ t('cart.skuLabel') }}</div>
          <div class="flex items-center justify-center text-center">{{ quantityLabel }}</div>
          <div class="flex items-center justify-center text-center">{{ t('cart.priceLabel') }}</div>
          <div class="flex items-center justify-center text-center">{{ t('cart.remove') }}</div>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-white/10 lg:hidden">
          <div
            v-for="item in cartStore.items"
            :key="itemKey(item)"
            class="relative px-3 py-2"
          >
            <button
              type="button"
              class="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              :aria-label="t('cart.remove')"
              @click="cartStore.removeItem(item.productId, item.skuId)"
            >
              <TrashIcon class="h-4 w-4" aria-hidden="true" />
            </button>

            <div class="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-2.5">
              <button
                type="button"
                class="h-14 w-14 overflow-hidden rounded-lg bg-gray-100 text-left ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/10"
                @click="goProduct(item)"
              >
                <img v-if="item.image" :src="imageUrl(item.image)" :alt="titleText(item.title)" class="h-full w-full object-contain p-1" />
              </button>
              <div class="min-w-0 pr-7">
                <button
                  type="button"
                  class="line-clamp-1 text-left text-sm font-semibold leading-5 text-gray-950 [overflow-wrap:anywhere] dark:text-white"
                  @click="goProduct(item)"
                >
                  {{ titleText(item.title) }}
                </button>
                <div class="mt-0.5 line-clamp-1 text-xs leading-5 text-gray-500 [overflow-wrap:anywhere] dark:text-gray-400">
                  {{ t('cart.skuLabel') }}：{{ skuText(item) || t('productDetail.skuFallback') }}
                </div>
                <div class="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span class="rounded-full px-2 py-0.5 font-semibold" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
                    {{ fulfillmentTypeLabelText(item.fulfillmentType) }}
                  </span>
                  <span v-if="stockHint(item)" class="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {{ stockHint(item) }}
                  </span>
                </div>
                <div class="mt-1.5 flex items-center justify-between gap-2 rounded-xl bg-[#f8f5f0] px-2 py-1.5 ring-1 ring-black/[0.03] dark:bg-white/[0.04] dark:ring-white/10">
                  <div class="min-w-0 text-base font-black leading-none" style="color: var(--ui-accent);">{{ itemSubtotal(item) }}</div>
                  <MallQuantityInput
                    :model-value="item.quantity"
                    :min="itemMin(item)"
                    :max="itemLimit(item)"
                    @update:model-value="handleQuantityUpdate(item, $event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden divide-y divide-gray-100 dark:divide-white/10 lg:block">
          <div
            v-for="item in cartStore.items"
            :key="`desktop-${itemKey(item)}`"
            class="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_180px_150px_128px_56px] lg:items-center"
          >
            <div class="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-3">
              <button
                type="button"
                class="h-[72px] w-[72px] overflow-hidden rounded-lg bg-gray-100 text-left ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/10"
                @click="goProduct(item)"
              >
                <img v-if="item.image" :src="imageUrl(item.image)" :alt="titleText(item.title)" class="h-full w-full object-contain p-1" />
              </button>
              <div class="min-w-0">
                <button
                  type="button"
                  class="line-clamp-2 text-left text-sm font-semibold leading-6 text-gray-950 [overflow-wrap:anywhere] dark:text-white"
                  @click="goProduct(item)"
                >
                  {{ titleText(item.title) }}
                </button>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span class="rounded-full px-2 py-0.5 font-semibold" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
                    {{ fulfillmentTypeLabelText(item.fulfillmentType) }}
                  </span>
                  <span v-if="stockHint(item)" class="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {{ stockHint(item) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex min-h-[72px] items-center justify-center text-center text-sm text-gray-600 dark:text-gray-300">
              <div class="min-w-0 leading-6 [overflow-wrap:anywhere]">{{ skuText(item) || t('productDetail.skuFallback') }}</div>
            </div>

            <div class="flex min-h-[72px] items-center justify-center">
              <MallQuantityInput
                :model-value="item.quantity"
                :min="itemMin(item)"
                :max="itemLimit(item)"
                @update:model-value="handleQuantityUpdate(item, $event)"
              />
            </div>

            <div class="flex min-h-[72px] items-center justify-center">
              <div class="text-center text-lg font-black" style="color: var(--ui-accent);">{{ itemSubtotal(item) }}</div>
            </div>

            <div class="flex min-h-[72px] items-center justify-center">
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                :aria-label="t('cart.remove')"
                @click="cartStore.removeItem(item.productId, item.skuId)"
              >
                <TrashIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside class="hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-neutral-900/95 dark:ring-white/10 xl:sticky xl:top-4 xl:block">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('cart.summaryTitle') }}</h2>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ totalQuantityLabel }}</span>
        </div>

        <div class="mt-5 space-y-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">{{ t('cart.itemsCount') }}</span>
            <span class="font-semibold text-gray-950 dark:text-white">{{ cartStore.totalItems }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
            <span class="text-gray-500 dark:text-gray-400">{{ t('cart.totalLabel') }}</span>
            <span class="text-xl font-black" style="color: var(--ui-accent);">{{ moneyText(totalAmount) }}</span>
          </div>
        </div>

        <p class="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">{{ t('cart.disclaimer') }}</p>

        <router-link
          to="/checkout"
          class="mt-5 flex h-12 items-center justify-center rounded-xl text-sm font-black text-white transition" style="background-color: var(--ui-accent);"
        >
          {{ t('cart.checkout') }}
        </router-link>
      </aside>

      <div class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-neutral-950 xl:hidden">
        <div class="mx-auto flex max-w-[560px] items-center gap-3">
          <div class="min-w-0 flex-1">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ totalQuantityLabel }}</div>
            <div class="mt-0.5 truncate text-lg font-black" style="color: var(--ui-accent);">{{ moneyText(totalAmount) }}</div>
          </div>
          <router-link
            to="/checkout"
            class="inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-6 text-sm font-black text-white transition" style="background-color: var(--ui-accent);"
          >
            {{ t('cart.checkout') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ShoppingBagIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { CartItem } from '../../../stores/cart'
import { useCartStore } from '../../../stores/cart'
import { useAppStore } from '../../../stores/app'
import { useLocalized } from '../../../composables/useProduct'
import { fulfillmentTypeLabel } from '../../../utils/fulfillment'
import { amountToCents, centsToAmount } from '../../../utils/money'
import { getImageUrl } from '../../../utils/image'
import { buildSkuDisplayText, normalizeSkuId } from '../../../utils/sku'
import {
  cartItemAvailableStock,
  cartItemMaxQuantity,
  cartItemPurchaseLimit,
  cartItemPurchaseMin,
  refreshCartStockSnapshots,
} from '../../../utils/cartStock'
import MallQuantityInput from '../components/MallQuantityInput.vue'
import { formatMallMoney } from '../utils'

const router = useRouter()
const { t } = useI18n()
const cartStore = useCartStore()
const appStore = useAppStore()
const { getLocalizedText, siteCurrency } = useLocalized()

const titleText = (value: any) => getLocalizedText(value)
const imageUrl = (value: string) => getImageUrl(value)
const moneyText = (amount: unknown) => formatMallMoney(amount, siteCurrency.value)
const itemKey = (item: CartItem) => `${item.productId}:${normalizeSkuId(item.skuId)}`
const itemMin = (item: CartItem) => cartItemPurchaseMin(item)
const itemLimit = (item: CartItem) => cartItemMaxQuantity(item)
const skuText = (item: CartItem) => buildSkuDisplayText({
  skuCode: item.skuCode,
  specValues: item.skuSpecValues,
  fallback: '',
  locale: appStore.locale,
})
const fulfillmentTypeLabelText = (type?: string) => fulfillmentTypeLabel(t, type || '', 'orderDetail')
const orderProductLabel = computed(() => t('checkout.orderProductLabel'))
const quantityLabel = computed(() => t('checkout.quantityLabel'))
const totalQuantityLabel = computed(() => t('checkout.totalQuantityLabel', { count: cartStore.totalItems }))

const stockHint = (item: CartItem) => {
  const available = cartItemAvailableStock(item)
  const purchaseLimit = cartItemPurchaseLimit(item)
  const maxQuantity = itemLimit(item)
  if (available === null) return ''
  if (available <= 0) return t('cart.stockOut')
  if (purchaseLimit !== null && maxQuantity === purchaseLimit && purchaseLimit < available) {
    return t('cart.maxPurchaseExceeded', { count: purchaseLimit })
  }
  return t('cart.stockRemaining', { count: available })
}

const handleQuantityUpdate = (item: CartItem, quantity: number) => {
  const minimum = itemMin(item)
  const maximum = itemLimit(item)
  if (maximum !== null && maximum < minimum) return
  if (maximum !== null && quantity > maximum) return
  cartStore.updateQuantity(item.productId, quantity, item.skuId)
}

const normalizeCartQuantities = () => {
  for (const item of cartStore.items) {
    const minimum = itemMin(item)
    const maximum = itemLimit(item)
    if (maximum !== null && maximum >= minimum && item.quantity > maximum) {
      cartStore.updateQuantity(item.productId, maximum, item.skuId)
    }
  }
}

const itemSubtotal = (item: CartItem) => {
  const amount = amountToCents(item.priceAmount)
  if (amount === null) return moneyText(item.priceAmount)
  return moneyText(centsToAmount(amount * item.quantity))
}

const totalAmount = computed(() => {
  let cents = 0
  for (const item of cartStore.items) {
    const unit = amountToCents(item.priceAmount)
    if (unit !== null) cents += unit * item.quantity
  }
  return centsToAmount(cents)
})

const goProduct = (item: CartItem) => {
  const slug = String(item.slug || '').trim()
  if (!slug) return
  router.push(`/products/${slug}`)
}

onMounted(async () => {
  await refreshCartStockSnapshots(cartStore)
  normalizeCartQuantities()
})
</script>
