<template>
  <div class="mx-auto max-w-[1472px] px-0 pb-20 pt-1.5 sm:px-6 sm:pt-3 lg:px-8 lg:pb-8">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-3 px-3 sm:mb-4 sm:px-0">
      <div>
        <h1 class="text-xl font-black leading-tight text-gray-950 dark:text-white sm:text-[26px]">{{ t('checkout.title') }}</h1>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{{ totalQuantityLabel }}</p>
      </div>
      <router-link
        to="/cart"
        class="inline-flex h-9 items-center justify-center rounded-full border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 transition dark:border-white/10 dark:bg-neutral-900 dark:text-gray-200 sm:h-10 sm:px-4"
      >
        {{ t('navbar.cart') }}
      </router-link>
    </div>

    <MallEmptyState
      v-if="items.length === 0"
      :title="t('checkout.empty')"
      action-to="/products"
      :action-label="t('checkout.emptyAction')"
    />

    <div v-else class="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_368px] lg:gap-4">
      <section class="space-y-2 sm:space-y-4">
        <div class="overflow-hidden border-y border-gray-100 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.04)] ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="flex items-center justify-between gap-3 px-3 py-2 sm:px-5 sm:py-4">
            <h2 class="text-base font-black text-gray-950 dark:text-white">{{ orderProductLabel }}</h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ totalQuantityLabel }}</span>
          </div>

          <div class="hidden gap-4 grid-cols-[minmax(0,1fr)_190px_110px_128px] border-y border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500 dark:border-white/10 dark:bg-white/[0.04] lg:grid">
            <div>{{ orderProductLabel }}</div>
            <div class="flex items-center justify-center text-center">{{ productAttributeLabel }}</div>
            <div class="flex items-center justify-center text-center">{{ t('checkout.quantityLabel') }}</div>
            <div class="flex items-center justify-center text-center">{{ priceLabel }}</div>
          </div>

          <div class="border-b border-gray-100 bg-gray-50/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.03] sm:px-5 sm:py-3">
            <div class="flex items-center gap-2 text-sm font-bold">
              <span class="text-orange-600">{{ siteName }}</span>
              <span class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-500 dark:bg-blue-500/10 dark:text-blue-300">
                {{ orderProductLabel }}
              </span>
            </div>
          </div>

          <div class="divide-y divide-gray-100 dark:divide-white/10">
            <div
              v-for="item in items"
              :key="itemKey(item)"
              class="grid gap-2 px-3 py-2 sm:gap-4 sm:px-5 sm:py-4 lg:grid-cols-[minmax(0,1fr)_190px_110px_128px] lg:items-center"
            >
              <div class="grid min-w-0 grid-cols-[50px_minmax(0,1fr)] gap-2.5 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-3">
                <div class="h-[50px] w-[50px] overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-950 sm:h-[72px] sm:w-[72px]">
                  <img v-if="item.image" :src="imageUrl(item.image)" :alt="titleText(item.title)" class="h-full w-full object-cover" />
                </div>
                <div class="min-w-0">
                  <div class="line-clamp-1 text-sm font-semibold leading-5 text-gray-950 dark:text-white sm:line-clamp-2 sm:leading-6">{{ titleText(item.title) }}</div>
                  <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1">{{ itemFulfillmentLabel(item) }}</div>
                </div>
              </div>

              <div class="grid grid-cols-[minmax(0,1fr)_48px_auto] items-center gap-2 rounded-xl bg-[#f8f5f0] px-2.5 py-2 text-xs ring-1 ring-black/[0.03] dark:bg-white/[0.04] dark:ring-white/10 lg:hidden">
                <div class="min-w-0">
                  <div class="text-[11px] font-semibold text-gray-400">{{ productAttributeLabel }}</div>
                  <div class="mt-0.5 truncate font-bold text-gray-700 dark:text-gray-200">{{ skuText(item) || t('productDetail.skuFallback') }}</div>
                </div>
                <div class="text-center">
                  <div class="text-[11px] font-semibold text-gray-400">{{ t('checkout.quantityLabel') }}</div>
                  <div class="mt-0.5 font-black text-gray-950 dark:text-white">{{ item.quantity }}</div>
                </div>
                <div class="text-right">
                  <div class="text-[11px] font-semibold text-gray-400">{{ priceLabel }}</div>
                  <div class="mt-0.5 font-black" style="color: var(--ui-accent);">{{ itemSubtotal(item) }}</div>
                </div>
              </div>

              <div class="hidden text-sm text-gray-600 dark:text-gray-300 lg:flex lg:min-h-20 lg:items-center lg:justify-center lg:text-center">
                <div class="mt-1 lg:mt-0">{{ skuText(item) || t('productDetail.skuFallback') }}</div>
              </div>

              <div class="hidden items-center justify-between text-sm lg:flex lg:min-h-20 lg:justify-center lg:text-center">
                <div class="font-semibold">{{ item.quantity }}</div>
              </div>

              <div class="hidden items-center justify-between lg:flex lg:min-h-20 lg:justify-center">
                <div class="text-center text-sm font-black" style="color: var(--ui-accent);">{{ itemSubtotal(item) }}</div>
              </div>
            </div>
          </div>
        </div>

        <CheckoutManualForm
          :manual-form-products="manualFormProducts"
          v-model="manualFormData"
          :submit-attempted="submitAttempted"
          :get-manual-field-label="manualFieldLabel"
          :get-manual-field-placeholder="manualFieldPlaceholder"
          :manual-field-error="manualFieldError"
        />

        <div v-if="!userAuthStore.isAuthenticated" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-4">
            <h2 class="text-base font-black">{{ t('guestOrders.title') }}</h2>
            <p class="mt-1 text-xs text-gray-500">{{ t('checkout.guestInstructions.title') }}</p>
          </div>
          <div class="p-3 sm:p-5">
            <div class="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              <input v-model="guestEmail" type="email" class="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900 sm:h-11" :placeholder="t('guestOrders.emailPlaceholder')" />
              <input v-model="guestPassword" type="password" class="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900 sm:h-11" :placeholder="t('guestOrders.passwordPlaceholder')" />
            </div>
            <div v-if="guestCaptchaEnabled" class="mt-4 rounded-lg border border-orange-100 /30 px-3 py-2 shadow-sm dark:border-orange-500/20" style="background-color: var(--ui-accent-soft);">
              <div class="flex flex-wrap items-center gap-3">
                <div class="shrink-0 text-xs font-black text-orange-600 dark:text-orange-300">{{ t('auth.common.captchaLabel') }}</div>
                <div class="min-w-0 flex-1">
                  <ImageCaptcha
                    v-if="captchaProvider === 'image'"
                    ref="imageCaptchaRef"
                    v-model="guestCaptchaPayload"
                    :disabled="submitting"
                    @config-stale="handleCaptchaConfigStale"
                  />
                  <div v-else-if="captchaProvider === 'turnstile'" class="w-[300px] max-w-full overflow-hidden">
                    <TurnstileCaptcha
                      ref="turnstileRef"
                      v-model="turnstileToken"
                      :site-key="turnstileSiteKey"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="border-y border-gray-100 bg-white p-3 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:p-4 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10 lg:sticky lg:top-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-black">{{ paymentDetailLabel }}</h2>
          <span class="text-sm text-gray-500">{{ totalQuantityLabel }}</span>
        </div>

        <div class="mt-3 space-y-2 rounded-xl bg-[#fbfaf8] p-2.5 text-sm ring-1 ring-black/[0.03] dark:bg-white/[0.04] dark:ring-white/10 sm:mt-5 sm:space-y-3 sm:bg-transparent sm:p-0 sm:ring-0">
          <div class="flex items-center justify-between">
            <span class="text-gray-500">{{ t('checkout.previewOriginal') }}</span>
            <span class="font-bold">{{ previewMoneyText(previewOriginal) }}</span>
          </div>
          <div v-if="normalizedCouponCode || hasPositiveAmount(previewCoupon)" class="flex items-center justify-between">
            <span class="text-gray-500">{{ t('checkout.previewCoupon') }}</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-300">{{ discountMoneyText(previewCoupon) }}</span>
          </div>
          <div v-if="hasPositiveAmount(previewPromotion)" class="flex items-center justify-between">
            <span class="text-gray-500">{{ t('checkout.previewPromotion') }}</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-300">{{ discountMoneyText(previewPromotion) }}</span>
          </div>
          <div v-if="hasPositiveAmount(previewMemberDiscount)" class="flex items-center justify-between">
            <span class="text-gray-500">{{ t('checkout.previewMemberDiscount') }}</span>
            <span class="font-bold text-amber-600 dark:text-amber-300">{{ discountMoneyText(previewMemberDiscount) }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-white/10 sm:pt-3">
            <span class="text-gray-500">{{ t('checkout.previewTotal') }}</span>
            <span class="text-lg font-black sm:text-xl" style="color: var(--ui-accent);">{{ previewMoneyText(previewTotal) }}</span>
          </div>
        </div>

        <MallCouponPanel
          v-model="couponCode"
          class="mt-3 sm:mt-5"
          :loading="previewLoading"
          :refreshing="couponRefreshing"
          :status-text="previewStatusText"
          :error="previewError"
          :show-summary="false"
          :original-text="previewMoneyText(previewOriginal)"
          :coupon-text="discountMoneyText(previewCoupon)"
          :promotion-text="discountMoneyText(previewPromotion)"
          :member-text="discountMoneyText(previewMemberDiscount)"
          :total-text="previewMoneyText(previewTotal)"
          :show-coupon-row="showCouponPreviewRow"
          :show-promotion-row="showPromotionPreviewRow"
          :show-member-row="showMemberPreviewRow"
        />

        <div class="mt-3 border-t border-gray-100 pt-3 dark:border-white/10 sm:mt-5 sm:rounded-xl sm:border-0 sm:bg-gray-50 sm:p-4 sm:dark:bg-white/[0.04]">
          <h3 class="text-sm font-bold">{{ t('payment.channelTitle') }}</h3>
          <div v-if="channels.length === 0 && !userAuthStore.isAuthenticated" class="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 sm:mt-3 sm:p-3">
            {{ t('payment.channelEmpty') }}
          </div>
          <div v-else class="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:flex sm:flex-wrap">
            <button
              v-if="userAuthStore.isAuthenticated"
              type="button"
              class="inline-flex min-h-10 min-w-0 items-center justify-center rounded-lg border px-2.5 py-2 text-center text-sm font-semibold transition sm:justify-start sm:px-3"
              :class="useBalance ? 'border-orange-600 text-orange-600 ' : 'border-gray-200 bg-white text-gray-800 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100'" style="background-color: var(--ui-accent-soft);"
              @click="selectBalancePayment"
            >
              <span class="min-w-0 truncate">{{ balancePaymentLabel }}</span>
            </button>
            <button
              v-for="channel in channels"
              :key="channel.id"
              type="button"
              class="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border px-2.5 py-2 text-center text-sm font-semibold transition sm:justify-start sm:px-3"
              :class="Number(selectedChannelId) === Number(channel.id) ? 'border-orange-600 text-orange-600 ' : 'border-gray-200 bg-white text-gray-800 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100'" style="background-color: var(--ui-accent-soft);"
              @click="selectPaymentChannel(channel.id)"
            >
              <img v-if="paymentChannelIcon(channel)" :src="paymentChannelIcon(channel)" :alt="channelName(channel)" loading="lazy" class="h-5 w-5 shrink-0 rounded object-contain" />
              <span class="min-w-0 truncate">{{ channelName(channel) }}</span>
            </button>
          </div>
        </div>

        <div v-if="error" class="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {{ error }}
        </div>

        <button
          class="mt-5 hidden h-12 w-full items-center justify-center rounded-xl text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 lg:flex" style="background-color: var(--ui-accent);"
          :disabled="submitting"
          @click="submitOrder"
        >
          {{ submitting ? t('checkout.submitting') : submitButtonLabel }}
        </button>
      </aside>
    </div>

    <div v-if="items.length > 0" class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden dark:border-white/10 dark:bg-neutral-950/95">
      <div class="mx-auto flex max-w-[1472px] items-center gap-3">
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">{{ t('checkout.previewTotal') }}</div>
          <div class="mt-1 truncate text-lg font-black" style="color: var(--ui-accent);">{{ previewMoneyText(previewTotal) }}</div>
        </div>
        <button
          class="flex h-11 w-[44%] min-w-0 shrink-0 items-center justify-center rounded-xl px-3 text-center text-sm font-black leading-tight text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-auto sm:min-w-[148px] sm:px-5" style="background-color: var(--ui-accent);"
          :disabled="submitting"
          @click="submitOrder"
        >
          {{ submitting ? t('checkout.submitting') : submitButtonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { CartItem } from '../../../stores/cart'
import { useCartStore } from '../../../stores/cart'
import { useBuyNowStore } from '../../../stores/buyNow'
import { useUserAuthStore } from '../../../stores/userAuth'
import { useAppStore } from '../../../stores/app'
import { useLocalized } from '../../../composables/useProduct'
import { amountToCents, centsToAmount } from '../../../utils/money'
import { getImageUrl } from '../../../utils/image'
import { buildSkuDisplayText, normalizeSkuId } from '../../../utils/sku'
import { refreshCartStockSnapshots } from '../../../utils/cartStock'
import { fulfillmentTypeLabel } from '../../../utils/fulfillment'
import CheckoutManualForm from '../../../components/checkout/CheckoutManualForm.vue'
import ImageCaptcha from '../../../components/captcha/ImageCaptcha.vue'
import TurnstileCaptcha from '../../../components/captcha/TurnstileCaptcha.vue'
import MallEmptyState from '../components/MallEmptyState.vue'
import MallCouponPanel from '../components/MallCouponPanel.vue'
import { formatMallMoney, paymentChannelIcon } from '../utils'
import {
  buildMallCartItemsPayload,
  buildMallGroupedManualFormDataPayload,
  buildMallGuestCaptchaPayload,
  buildMallManualErrors,
  buildMallManualFormProducts,
  buildMallOrderPayload,
  buildMallPayPath,
  createAndPayMallOrder,
  isMallGuestEmailValid,
  mallManualFieldLabel,
  mallManualFieldPlaceholder,
  refreshMallCaptchaConfig,
  syncMallGroupedManualFormData,
  useMallOrderPreview,
  useMallPaymentSelection,
  type MallManualFormField,
} from '../composables/useMallCheckoutFlow'
import { useMallWalletBalance } from '../composables/useMallWalletBalance'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const cartStore = useCartStore()
const buyNowStore = useBuyNowStore()
const userAuthStore = useUserAuthStore()
const appStore = useAppStore()
const { getLocalizedText, siteCurrency } = useLocalized()

const submitting = ref(false)
const error = ref('')
const submitAttempted = ref(false)
const manualFormData = ref<Record<string, Record<string, any>>>({})
const guestEmail = ref('')
const guestPassword = ref('')
const couponCode = ref('')
const normalizedCouponCode = computed(() => couponCode.value.trim())
const guestCaptchaPayload = ref<any>({})
const turnstileToken = ref('')
const imageCaptchaRef = ref<InstanceType<typeof ImageCaptcha> | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileCaptcha> | null>(null)
const { selectedChannelId, useBalance, selectPaymentChannel, selectBalancePayment } = useMallPaymentSelection()

const isBuyNowMode = computed(() => route.query.mode === 'buynow')
const items = computed<CartItem[]>(() => {
  if (isBuyNowMode.value) return buyNowStore.item ? [buyNowStore.item] : []
  return cartStore.items
})
const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
const totalAmount = computed(() => {
  let cents = 0
  for (const item of items.value) {
    const amount = amountToCents(item.priceAmount)
    if (amount !== null) cents += amount * item.quantity
  }
  return centsToAmount(cents)
})

const channels = computed(() => {
  const rows = Array.isArray(appStore.config?.payment_channels) ? appStore.config.payment_channels : []
  const allowedSets = items.value
    .map((item) => Array.isArray(item.paymentChannelIds) && item.paymentChannelIds.length > 0 ? new Set(item.paymentChannelIds.map(Number)) : null)
    .filter(Boolean) as Set<number>[]
  if (allowedSets.length === 0) return rows
  return rows.filter((channel: any) => allowedSets.every((set) => set.has(Number(channel?.id))))
})
const captchaConfig = computed(() => appStore.config?.captcha || null)
const captchaProvider = computed(() => String(captchaConfig.value?.provider || 'none'))
const guestCaptchaEnabled = computed(() => !userAuthStore.isAuthenticated && !!captchaConfig.value?.scenes?.guest_create_order && captchaProvider.value !== 'none')
const turnstileSiteKey = computed(() => String(captchaConfig.value?.turnstile?.site_key || ''))

const siteName = computed(() => String(appStore.config?.brand?.site_name || 'Huli-Next').trim() || 'Huli-Next')
const orderProductLabel = computed(() => t('checkout.orderProductLabel'))
const productAttributeLabel = computed(() => t('checkout.productAttributeLabel'))
const priceLabel = computed(() => t('checkout.priceLabel'))
const paymentDetailLabel = computed(() => t('checkout.paymentDetailLabel'))
const totalQuantityLabel = computed(() => t('checkout.totalQuantityLabel', { count: totalQuantity.value }))
const moneyText = (amount: unknown) => formatMallMoney(amount, siteCurrency.value)
const previewCurrency = computed(() => String(preview.value?.currency || siteCurrency.value || 'CNY'))
const previewMoneyText = (amount: unknown) => formatMallMoney(amount, previewCurrency.value)
const hasPositiveAmount = (amount: unknown) => {
  const cents = amountToCents(amount)
  return cents !== null && cents > 0
}
const discountMoneyText = (amount: unknown) => hasPositiveAmount(amount) ? `-${previewMoneyText(amount)}` : previewMoneyText('0.00')
const { balancePaymentLabel } = useMallWalletBalance(siteCurrency)
const previewOriginal = computed(() => preview.value?.original_amount ?? totalAmount.value)
const previewCoupon = computed(() => preview.value?.discount_amount ?? '0')
const previewPromotion = computed(() => preview.value?.promotion_discount_amount ?? '0')
const previewMemberDiscount = computed(() => preview.value?.member_discount_amount ?? '0')
const previewTotal = computed(() => preview.value?.total_amount ?? totalAmount.value)
const previewStatusText = computed(() => couponRefreshing.value ? t('checkout.couponRefreshing') : t('checkout.previewLoading'))
const showCouponPreviewRow = computed(() => Boolean(normalizedCouponCode.value || hasPositiveAmount(previewCoupon.value)))
const showPromotionPreviewRow = computed(() => hasPositiveAmount(previewPromotion.value))
const showMemberPreviewRow = computed(() => hasPositiveAmount(previewMemberDiscount.value))
const submitButtonLabel = computed(() => t('checkout.submitOrderWithAmount', { amount: previewMoneyText(previewTotal.value) }))

const imageUrl = (value: string) => getImageUrl(value)
const titleText = (value: any) => getLocalizedText(value)
const itemFulfillmentLabel = (item: CartItem) => fulfillmentTypeLabel(t, item.fulfillmentType, 'orderDetail')
const itemKey = (item: CartItem) => `${item.productId}:${normalizeSkuId(item.skuId)}`
const skuText = (item: CartItem) => buildSkuDisplayText({
  skuCode: item.skuCode,
  specValues: item.skuSpecValues,
  fallback: '',
  locale: appStore.locale,
})
const itemSubtotal = (item: CartItem) => {
  const amount = amountToCents(item.priceAmount)
  if (amount === null) return '-'
  return moneyText(centsToAmount(amount * item.quantity))
}
const channelName = (channel: any) => String(channel?.name || channel?.channel_name || channel?.channel_type || channel?.provider_type || '-')

const manualFormProducts = computed(() => buildMallManualFormProducts(items.value))
const manualFieldLabel = (field: MallManualFormField) => mallManualFieldLabel(field, getLocalizedText)
const manualFieldPlaceholder = (field: MallManualFormField) => mallManualFieldPlaceholder(field, getLocalizedText)
const manualErrors = computed(() => buildMallManualErrors(manualFormProducts.value, manualFormData.value, t, manualFieldLabel))
const manualFieldError = (itemKey: string, fieldKey: string) => manualErrors.value[`${itemKey}:${fieldKey}`] || ''
const manualFormValid = computed(() => Object.keys(manualErrors.value).length === 0)
const buildManualFormDataPayload = () => buildMallGroupedManualFormDataPayload(manualFormProducts.value, manualFormData.value)
const getGuestCaptchaPayload = () => buildMallGuestCaptchaPayload(guestCaptchaEnabled.value, captchaProvider.value, guestCaptchaPayload.value, turnstileToken.value)
const handleCaptchaConfigStale = async () => refreshMallCaptchaConfig((force?: boolean) => appStore.loadConfig(force), guestCaptchaPayload, turnstileToken)

const buildItemsPayload = () => buildMallCartItemsPayload(items.value)
const buildOrderPayload = () => buildMallOrderPayload({
  couponCode: normalizedCouponCode.value,
  items: buildItemsPayload(),
  manualFormData: buildManualFormDataPayload(),
})
const guestEmailValid = computed(() => isMallGuestEmailValid(guestEmail.value))
const {
  preview,
  previewLoading,
  previewError,
  couponRefreshing,
  debouncedLoadPreview,
  loadPreviewNow,
} = useMallOrderPreview({
  canPreview: () => {
    if (items.value.length === 0 || !manualFormValid.value) return false
    if (!userAuthStore.isAuthenticated && (!guestEmail.value.trim() || !guestPassword.value.trim() || !guestEmailValid.value)) return false
    return true
  },
  isAuthenticated: () => userAuthStore.isAuthenticated,
  buildOrderPayload,
  guestEmail,
  guestPassword,
  fallbackErrorMessage: () => t('checkout.previewFailed'),
})

const validateSubmit = () => {
  submitAttempted.value = true
  error.value = ''
  if (items.value.length === 0) return t('checkout.errors.emptyCart')
  if (!manualFormValid.value) return t('checkout.errors.manualFormInvalid')
  if (!userAuthStore.isAuthenticated) {
    if (!guestEmail.value.trim() || !guestPassword.value.trim()) return t('checkout.errors.missingGuest')
    if (!guestEmailValid.value) return t('error.email_invalid')
    if (guestCaptchaEnabled.value && captchaProvider.value === 'image' && (!guestCaptchaPayload.value.captcha_id || !guestCaptchaPayload.value.captcha_code)) return t('auth.common.captchaRequired')
    if (guestCaptchaEnabled.value && captchaProvider.value === 'turnstile' && !turnstileToken.value) return t('auth.common.captchaRequired')
  }
  if ((channels.value.length > 0 || userAuthStore.isAuthenticated) && !selectedChannelId.value && !useBalance.value) return t('checkout.errors.selectPayment')
  return ''
}

const clearSource = () => {
  if (isBuyNowMode.value) buyNowStore.clear()
  else cartStore.clear()
}

const submitOrder = async () => {
  const message = validateSubmit()
  if (message) {
    error.value = message
    return
  }
  submitting.value = true
  try {
    if (!isBuyNowMode.value) {
      await refreshCartStockSnapshots(cartStore)
    }
    await loadPreviewNow()
    if (previewError.value) {
      error.value = previewError.value
      return
    }
    const responseData = await createAndPayMallOrder({
      isAuthenticated: userAuthStore.isAuthenticated,
      orderPayload: buildOrderPayload(),
      selectedChannelId: selectedChannelId.value,
      useBalance: useBalance.value,
      guestEmail: guestEmail.value,
      guestPassword: guestPassword.value,
      captchaPayload: getGuestCaptchaPayload(),
      submitFailedMessage: t('checkout.errors.submitFailed'),
    })
    clearSource()
    router.push(buildMallPayPath(responseData.order_no, userAuthStore.isAuthenticated))
  } catch (err: any) {
    error.value = err.message || t('checkout.errors.submitFailed')
    imageCaptchaRef.value?.refresh()
    turnstileRef.value?.reset()
    turnstileToken.value = ''
  } finally {
    submitting.value = false
  }
}

watch(manualFormProducts, (products) => {
  manualFormData.value = syncMallGroupedManualFormData(products, manualFormData.value)
}, { immediate: true, deep: true })

watch(
  () => [items.value, JSON.stringify(manualFormData.value), normalizedCouponCode.value, guestEmail.value, guestPassword.value, userAuthStore.isAuthenticated],
  () => {
    debouncedLoadPreview()
  },
  { deep: true },
)

watch(normalizedCouponCode, (value, previous) => {
  if (value === previous) return
  couponRefreshing.value = true
  error.value = ''
  previewError.value = ''
})

watch(channels, (rows) => {
  if (!selectedChannelId.value) return
  if (rows.some((channel: any) => Number(channel.id) === Number(selectedChannelId.value))) return
  selectedChannelId.value = null
}, { immediate: true })

onMounted(() => {
  if (!isBuyNowMode.value) {
    refreshCartStockSnapshots(cartStore)
  }
  debouncedLoadPreview()
})

onUnmounted(() => {
  debouncedLoadPreview.cancel()
})
</script>
