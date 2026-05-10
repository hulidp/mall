<template>
  <div class="min-w-0">
    <div
      class="theme-card-interactive group flex aspect-square min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border text-left [contain-intrinsic-size:240px] [content-visibility:auto]"
      style="background-color: var(--ui-bg-elevated); border-color: var(--ui-border);"
      role="link"
      tabindex="0"
      @click="goToProduct"
      @keydown.enter.prevent="goToProduct"
      @keydown.space.prevent="goToProduct"
    >
    <div class="relative h-[50%] w-full shrink-0 overflow-hidden sm:h-[52%]" style="background-color: var(--ui-bg-soft);">
      <SmartImage
        :src="image"
        :alt="title"
        :loading="props.imageLoading || 'lazy'"
        img-class="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
      />
      <div class="pointer-events-none absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/[0.02]"></div>
      <span class="theme-badge theme-badge-xs absolute left-1.5 top-1.5 z-10 sm:left-2 sm:top-2" style="background-color: var(--ui-accent); color: var(--ui-text-on-accent); border-color: transparent;">
        {{ fulfillmentLabel }}
      </span>
      <span
        v-if="categoryName"
        class="theme-badge theme-badge-xs theme-badge-inverse absolute right-1.5 top-1.5 z-10 max-w-[calc(100%-5.75rem)] truncate sm:right-2 sm:top-2"
      >
        {{ categoryName }}
      </span>
      <div v-if="soldOut" class="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
        {{ t('products.stockStatus.outOfStock') }}
      </div>
    </div>
    <div class="flex min-h-0 flex-1 flex-col justify-between px-2.5 pb-2.5 pt-2.5 sm:px-3 sm:pb-3">
      <h3 class="shrink-0 truncate text-[13px] font-medium leading-snug sm:text-sm" style="color: var(--ui-text-primary);">
        {{ title }}
      </h3>
      <div class="flex min-w-0 shrink-0 items-center justify-between gap-2">
        <div class="flex min-w-0 items-baseline gap-1" style="color: var(--ui-accent);">
          <span class="min-w-0 truncate text-base font-bold tabular-nums leading-none sm:text-lg">{{ priceText }}</span>
        </div>
        <button
          type="button"
          class="theme-btn-primary inline-flex h-7 shrink-0 items-center justify-center rounded-lg border px-2.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:px-3 sm:text-xs"
          :disabled="soldOut"
          :aria-label="t('quickBuy.buyNow')"
          @click.stop="openQuickBuy"
        >
          {{ t('quickBuy.buyNow') }}
        </button>
      </div>
      <div class="flex min-w-0 shrink-0 items-center justify-between gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
        <div class="flex min-w-0 flex-wrap items-center gap-1">
          <span class="theme-badge theme-badge-xs" :class="stockClass">
            <span class="sm:hidden">{{ stockCompactLabel }}</span>
            <span class="hidden sm:inline">{{ stockLabel }}</span>
          </span>
        </div>
        <span v-if="soldCountText" class="theme-badge theme-badge-xs theme-badge-neutral">
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
  if (status === 'out_of_stock') return 'theme-badge-neutral'
  if (status === 'low_stock') return 'theme-badge-warning'
  return 'theme-badge-success'
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
