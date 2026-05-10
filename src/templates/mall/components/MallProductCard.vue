<template>
  <div class="min-w-0">
    <div
      class="group flex aspect-square min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-gray-200/70 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md dark:bg-neutral-900 dark:ring-white/10 [contain-intrinsic-size:240px] [content-visibility:auto]"
      role="link"
      tabindex="0"
      @click="goToProduct"
      @keydown.enter.prevent="goToProduct"
      @keydown.space.prevent="goToProduct"
    >
    <div class="relative h-[50%] w-full shrink-0 overflow-hidden bg-gray-100 ring-1 ring-black/5 transition duration-200 ease-out group-hover:ring-orange-400/60 dark:bg-neutral-900 dark:ring-white/10 dark:group-hover:ring-orange-500/40 sm:h-[52%]">
      <SmartImage
        :src="image"
        :alt="title"
        :loading="props.imageLoading || 'lazy'"
        img-class="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-105"
      />
      <div class="pointer-events-none absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.04]"></div>
      <span class="absolute left-1.5 top-1.5 z-10 rounded-full bg-[#ff5000] px-1.5 py-1 text-[11px] font-bold leading-none text-white shadow-[0_3px_10px_rgba(255,80,0,0.4)] ring-1 ring-white/80 sm:left-2 sm:top-2 sm:px-2 sm:text-xs">
        {{ fulfillmentLabel }}
      </span>
      <span
        v-if="categoryName"
        class="absolute right-1.5 top-1.5 z-10 max-w-[calc(100%-5.75rem)] truncate rounded-full bg-white/90 px-1.5 py-1 text-[11px] font-bold leading-none text-gray-800 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-neutral-950/80 dark:text-gray-100 dark:ring-white/10 sm:right-2 sm:top-2 sm:px-2 sm:text-xs"
      >
        {{ categoryName }}
      </span>
      <div v-if="soldOut" class="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">
        {{ t('products.stockStatus.outOfStock') }}
      </div>
    </div>
    <div class="flex min-h-0 flex-1 flex-col justify-between bg-white px-2 pb-2 pt-2 dark:bg-neutral-900 sm:px-2.5 sm:pb-2.5">
      <h3 class="shrink-0 truncate text-[13px] font-medium leading-[1.35] text-gray-900 group-hover:text-orange-600 dark:text-gray-100 sm:text-[14px]">
        {{ title }}
      </h3>
      <div class="flex min-w-0 shrink-0 items-center justify-between gap-1.5 sm:gap-2">
        <div class="flex min-w-0 items-baseline gap-1 text-[#ff5000]">
          <span class="min-w-0 truncate text-[16px] font-black leading-none sm:text-[18px]">{{ priceText }}</span>
        </div>
        <button
          type="button"
          class="inline-flex h-6 shrink-0 items-center justify-center rounded-full bg-[#ff5000] px-2 text-[10px] font-bold text-white shadow-sm transition duration-200 ease-out hover:bg-orange-600 group-hover:shadow-[0_6px_14px_rgba(255,80,0,0.22)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none dark:disabled:bg-white/10 dark:disabled:text-gray-400 sm:h-7 sm:px-2.5 sm:text-[11px]"
          :disabled="soldOut"
          :aria-label="t('quickBuy.buyNow')"
          @click.stop="openQuickBuy"
        >
          {{ t('quickBuy.buyNow') }}
        </button>
      </div>
      <div class="flex min-w-0 shrink-0 items-center justify-between gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
        <div class="flex min-w-0 flex-wrap items-center gap-1">
          <span class="rounded-full border px-2 py-0.5 font-semibold shadow-sm" :class="stockClass">
            <span class="sm:hidden">{{ stockCompactLabel }}</span>
            <span class="hidden sm:inline">{{ stockLabel }}</span>
          </span>
        </div>
        <span v-if="soldCountText" class="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-orange-600 shadow-sm dark:bg-orange-500/10 dark:text-orange-300">
          {{ soldCountText }}
        </span>
      </div>
    </div>
    </div>

    <MallQuickBuy
      v-if="quickBuyProduct"
      :product="quickBuyProduct"
      :visible="quickBuyVisible"
      @update:visible="quickBuyVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SmartImage from '../../../components/SmartImage.vue'
import { useLocalized, useProductLabels } from '../../../composables/useProduct'
import { fulfillmentTypeLabel } from '../../../utils/fulfillment'
import { firstProductImage, formatMallMoney, mallProductStockCount, resolveProductPrice } from '../utils'
import MallQuickBuy from './MallQuickBuy.vue'

const props = defineProps<{
  product: any
  showCategory?: boolean
  imageLoading?: 'lazy' | 'eager'
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getLocalizedText, siteCurrency } = useLocalized()
const { isSoldOut } = useProductLabels()
const quickBuyProduct = ref<any>(null)
const quickBuyVisible = ref(false)

const formatMallPrice = (value: unknown) => {
  const text = String(value ?? '').trim()
  const numeric = Number(text)
  if (!Number.isFinite(numeric)) return text
  return numeric.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

const pickPositiveNumber = (...values: unknown[]) => {
  for (const value of values) {
    const number = Number(value)
    if (Number.isFinite(number) && number > 0) return number
  }
  return 0
}

const title = computed(() => getLocalizedText(props.product?.title))
const image = computed(() => firstProductImage(props.product))
const currency = computed(() => String(props.product?.currency || siteCurrency.value || 'CNY').trim())
const priceAmount = computed(() => formatMallPrice(resolveProductPrice(props.product)))
const priceText = computed(() => formatMallMoney(priceAmount.value, currency.value))
const stockCompactLabel = computed(() => {
  const stock = mallProductStockCount(props.product)
  if (stock === null) return t('products.stockStatus.unlimited')
  if (stock <= 0) return t('products.stockStatus.outOfStock')
  return t('products.stockStatus.stockCountCompact', { count: stock })
})
const stockLabel = computed(() => {
  const stock = mallProductStockCount(props.product)
  if (stock === null) return t('products.stockStatus.unlimited')
  if (stock <= 0) return t('products.stockStatus.outOfStock')
  return t('products.stockStatus.stockCount', { count: stock })
})
const stockClass = computed(() => {
  const status = String(props.product?.stock_status || 'in_stock')
  if (status === 'out_of_stock') return 'border-gray-200 bg-gray-100 text-gray-500 dark:border-white/10 dark:bg-white/10 dark:text-gray-300'
  if (status === 'low_stock') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
})
const soldOut = computed(() => isSoldOut(props.product))
const fulfillmentLabel = computed(() => fulfillmentTypeLabel(t, props.product?.fulfillment_type, 'orderDetail'))
const soldCount = computed(() => pickPositiveNumber(
  props.product?.sales_count,
  props.product?.sold_count,
  props.product?.sold_num,
  props.product?.order_count,
))
const soldCountText = computed(() => {
  if (!soldCount.value) return ''
  return t('products.soldCount', { count: soldCount.value })
})
const categoryName = computed(() => {
  if (!props.showCategory) return ''
  return getLocalizedText(props.product?.category?.name)
})

const openQuickBuy = () => {
  if (soldOut.value) return
  quickBuyProduct.value = props.product
  quickBuyVisible.value = true
}

const goToProduct = () => {
  const slug = String(props.product?.slug || '').trim()
  if (!slug) return
  if (typeof window !== 'undefined') {
    const returnPath = route.name === 'home' || route.name === 'products' || route.name === 'category-products'
      ? route.fullPath
      : '/'
    window.sessionStorage.setItem('dujiao.mall.productReturnPath', returnPath)
  }
  router.push(`/products/${slug}`)
}
</script>
