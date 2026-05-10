<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[130] bg-black/50 backdrop-blur-[2px]"
        @click="close"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-full opacity-100 md:translate-y-0 md:scale-95 md:opacity-0"
      enter-to-class="translate-y-0 opacity-100 md:scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 md:scale-100"
      leave-to-class="translate-y-full opacity-100 md:translate-y-0 md:scale-95 md:opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-x-0 bottom-0 z-[130] md:inset-0 md:flex md:items-center md:justify-center md:p-6"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <section class="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl ring-1 ring-black/10 dark:bg-neutral-950 dark:ring-white/10 md:max-h-[88vh] md:max-w-[540px] md:rounded-2xl">
          <div class="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-gray-300/80 dark:bg-white/20 md:hidden" aria-hidden="true"></div>
          <div class="mall-quick-header flex shrink-0 items-start gap-2.5 border-b border-gray-100 p-2.5 dark:border-white/10 sm:gap-3 sm:p-4">
            <div class="mall-quick-image h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-900 sm:h-20 sm:w-20">
              <SmartImage :src="image" :alt="title" img-class="h-full w-full object-cover" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="line-clamp-2 text-sm font-bold leading-5 text-gray-900 dark:text-gray-100">{{ title }}</h2>
              <div class="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] sm:mt-2">
                <span class="rounded-sm bg-orange-50 px-1.5 py-0.5 font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                  {{ fulfillmentLabel }}
                </span>
                <span class="rounded-sm px-1.5 py-0.5 font-medium" :class="stockClass">
                  {{ stockLabel }}
                </span>
              </div>
              <div class="mt-1.5 text-[22px] font-black leading-none text-[#ff5000] sm:mt-2 sm:text-[26px]">{{ priceText }}</div>
            </div>
            <button
              type="button"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              @click="close"
            >
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div class="mall-quick-body min-h-0 flex-1 overflow-y-auto px-3 py-2.5 sm:p-4">
            <div v-if="selectedWholesaleRules.length" class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div class="text-[11px] font-black text-emerald-700 dark:text-emerald-300">{{ t('products.wholesaleRulesTitle') }}</div>
              <div class="mt-1 flex flex-wrap gap-1.5">
                <span
                  v-for="rule in selectedWholesaleRules"
                  :key="rule.id || rule.min_quantity"
                  class="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-neutral-950 dark:text-emerald-300 dark:ring-emerald-500/20"
                >
                  {{ formatWholesaleRule(rule) }}
                </span>
              </div>
            </div>

            <div v-if="activeSkuRows.length > 1" class="mb-3 space-y-2 sm:mb-5">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ t('quickBuy.selectSku') }}</div>
                  <div class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {{ t('productDetail.selectedSkuLabel') }}: {{ selectedSkuSummary }}
                  </div>
                </div>
                <button
                  v-if="showSkuToggle"
                  type="button"
                  class="inline-flex h-8 items-center justify-center rounded-full border border-orange-200 px-3 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 dark:border-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/10"
                  @click="skuExpanded = !skuExpanded"
                >
                  {{ skuExpanded ? t('productDetail.collapseSkuList') : t('productDetail.expandSkuList') }}
                </button>
              </div>
              <div class="rounded-xl border border-gray-200/80 p-2 dark:border-white/10 sm:p-2.5">
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <button
                    v-for="sku in visibleSkuRows"
                    :key="sku.id"
                    type="button"
                    class="min-h-9 rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold transition sm:min-h-10"
                    :class="[
                      normalizeSkuId(sku.id) === selectedSkuId ? 'border-[#ff5000] bg-orange-50 text-[#ff5000] dark:bg-orange-500/10' : 'border-gray-200 bg-white text-gray-800 hover:border-orange-400 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100',
                      isSkuPurchasable(currentProduct, sku) ? '' : 'cursor-not-allowed opacity-50',
                      isLongSkuText(sku) ? 'col-span-full' : '',
                    ]"
                    :disabled="!isSkuPurchasable(currentProduct, sku)"
                    @click="selectSku(sku)"
                    >
                      <div class="flex min-w-0 items-center justify-between gap-2">
                        <span class="min-w-0 truncate leading-snug">{{ skuText(sku) }}</span>
                        <span class="shrink-0 text-[11px] font-medium text-gray-500 dark:text-gray-400">{{ skuStockText(sku) }}</span>
                      </div>
                    </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ t('quickBuy.quantity') }}</span>
              <MallQuantityInput v-model="quantity" :min="minQuantity" :max="quantityLimit" />
            </div>

            <div v-if="!requiresLogin && selectableCardFields.length" class="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
              <MallManualCardPicker
                v-for="field in selectableCardFields"
                :key="field.key"
                v-model="manualFormData[field.key]"
                :product-slug="String(currentProduct?.slug || '')"
                :sku-id="selectedSku?.id"
                :field="field"
                :disabled="submitting"
              />
            </div>

            <div v-if="!requiresLogin && deliveryManualFields.length" class="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
              <div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ t('checkout.manualFormTitle') }}</h3>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('checkout.manualFormTip') }}</p>
              </div>
              <div class="grid gap-3">
                <div v-for="field in deliveryManualFields" :key="field.key" class="space-y-1.5">
                  <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {{ manualFieldLabel(field) }}
                    <span v-if="field.required" class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-if="field.type === 'textarea'"
                    v-model="manualFormData[field.key]"
                    rows="3"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900"
                    :placeholder="manualFieldPlaceholder(field)"
                  ></textarea>
                  <select
                    v-else-if="field.type === 'select'"
                    v-model="manualFormData[field.key]"
                    class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900"
                  >
                    <option value="">{{ t('checkout.manualFormSelectPlaceholder') }}</option>
                    <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
                  </select>
                  <div v-else-if="field.type === 'radio'" class="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-white/10">
                    <label v-for="option in field.options" :key="option" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <input v-model="manualFormData[field.key]" type="radio" :name="`mall-quick-manual-${field.key}`" :value="option" class="h-4 w-4 accent-orange-600" />
                      <span>{{ option }}</span>
                    </label>
                  </div>
                  <div v-else-if="field.type === 'checkbox'" class="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-white/10">
                    <label v-for="option in field.options" :key="option" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <input :checked="isManualCheckboxChecked(field.key, option)" type="checkbox" :value="option" class="h-4 w-4 accent-orange-600" @change="toggleManualCheckbox(field.key, option, ($event.target as HTMLInputElement).checked)" />
                      <span>{{ option }}</span>
                    </label>
                  </div>
                  <input
                    v-else
                    v-model="manualFormData[field.key]"
                    :type="field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'"
                    class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900"
                    :placeholder="manualFieldPlaceholder(field)"
                  />
                </div>
              </div>
            </div>

            <div v-if="showGuestOrderForm" class="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
              <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ t('checkout.guestPurchase') }}</h3>
              <div class="grid gap-3 sm:grid-cols-2">
                <input
                  v-model="guestEmail"
                  type="email"
                  class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900"
                  :placeholder="t('guestOrders.emailPlaceholder')"
                />
                <input
                  v-model="guestPassword"
                  type="password"
                  class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900"
                  :placeholder="t('guestOrders.passwordPlaceholder')"
                />
              </div>
              <div v-if="guestCaptchaEnabled" class="rounded-lg border border-orange-100 bg-orange-50/30 px-3 py-2 shadow-sm dark:border-orange-500/20 dark:bg-orange-500/10">
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

            <MallCouponPanel
              v-if="!requiresLogin"
              v-model="couponCode"
              compact
              class="mt-3 sm:mt-4"
              :loading="couponPanelLoading"
              :refreshing="couponPanelRefreshing"
              :status-text="previewStatusText"
              :error="couponPanelError"
              :show-summary="showPreviewSummary"
              :original-text="previewMoneyText(previewOriginal)"
              :coupon-text="discountMoneyText(previewCoupon)"
              :promotion-text="discountMoneyText(previewPromotion)"
              :member-text="discountMoneyText(previewMemberDiscount)"
              :total-text="previewMoneyText(previewTotal)"
              :show-coupon-row="showCouponPreviewRow"
              :show-promotion-row="showPromotionPreviewRow"
              :show-member-row="showMemberPreviewRow"
            />

            <div v-if="!requiresLogin" class="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
              <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ t('payment.channelTitle') }}</h3>
              <div v-if="channels.length === 0 && !userAuthStore.isAuthenticated" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                {{ t('payment.channelEmpty') }}
              </div>
              <div v-else class="grid grid-cols-2 gap-2">
                <button
                  v-if="userAuthStore.isAuthenticated"
                  type="button"
                  class="inline-flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition"
                  :class="useBalance ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'border-gray-200 bg-white text-gray-800 hover:border-orange-400 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100'"
                  @click="selectBalancePayment"
                >
                  {{ balancePaymentLabel }}
                </button>
                <button
                  v-for="channel in channels"
                  :key="channel.id"
                  type="button"
                  class="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition"
                  :class="Number(selectedChannelId) === Number(channel.id) ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'border-gray-200 bg-white text-gray-800 hover:border-orange-400 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100'"
                  @click="selectPaymentChannel(channel.id)"
                >
                  <img v-if="paymentChannelIcon(channel)" :src="paymentChannelIcon(channel)" :alt="channelName(channel)" loading="lazy" class="h-5 w-5 shrink-0 rounded object-contain" />
                  <span>{{ channelName(channel) }}</span>
                </button>
              </div>
            </div>

            <p v-if="warning" class="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {{ warning }}
            </p>
          </div>

          <div class="mall-quick-footer shrink-0 border-t border-gray-100 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-white/10 sm:p-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div class="mall-quick-total mb-2 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04] sm:mb-3 sm:rounded-xl">
              <div class="min-w-0">
                <div class="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">{{ t('checkout.previewTotal') }}</div>
                <div class="mt-1 text-lg font-black text-[#ff5000]">{{ previewMoneyText(previewTotal) }}</div>
              </div>
              <div v-if="activeSkuRows.length > 1" class="hidden min-w-0 text-right sm:block">
                <div class="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">{{ t('productDetail.selectedSkuLabel') }}</div>
                <div class="mt-1 truncate text-sm font-semibold text-gray-700 dark:text-gray-200">{{ selectedSkuSummary }}</div>
              </div>
            </div>
            <div class="mall-quick-actions grid gap-3" :class="actionMode ? 'grid-cols-1' : 'grid-cols-2'">
            <button
              v-if="requiresLogin"
              type="button"
              class="h-11 rounded-md bg-[#ff5000] text-sm font-black text-white hover:bg-orange-600"
              @click="goLogin"
            >
              {{ t('quickBuy.loginToBuy') }}
            </button>
            <button
              v-else-if="actionMode === 'cart'"
              type="button"
              class="h-11 rounded-md bg-amber-400 text-sm font-black text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="detailLoading || !canPurchase || submitting"
              @click="handleAddToCart"
            >
              {{ t('quickBuy.addToCart') }}
            </button>
            <button
              v-else-if="actionMode === 'buy'"
              type="button"
              class="h-11 rounded-md bg-[#ff5000] text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-white/10 dark:disabled:text-gray-400"
              :disabled="detailLoading || !canPurchase || submitting"
              @click="handleBuyNow"
            >
              {{ submitting ? t('checkout.submitting') : t('quickBuy.buyNow') }}
            </button>
            <template v-else>
              <button
                type="button"
                class="h-11 rounded-md border border-[#ff5000] bg-orange-50 text-sm font-black text-[#ff5000] hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-orange-500/10"
                :disabled="detailLoading || !canPurchase || submitting"
                @click="handleAddToCart"
              >
                {{ t('quickBuy.addToCart') }}
              </button>
              <button
                type="button"
                class="h-11 rounded-md bg-[#ff5000] text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-white/10 dark:disabled:text-gray-400"
                :disabled="detailLoading || !canPurchase || submitting"
                @click="handleBuyNow"
              >
                {{ submitting ? t('checkout.submitting') : t('quickBuy.buyNow') }}
              </button>
            </template>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { productAPI } from '../../../api'
import SmartImage from '../../../components/SmartImage.vue'
import ImageCaptcha from '../../../components/captcha/ImageCaptcha.vue'
import TurnstileCaptcha from '../../../components/captcha/TurnstileCaptcha.vue'
import { useAppStore } from '../../../stores/app'
import { useCartStore } from '../../../stores/cart'
import { useUserAuthStore } from '../../../stores/userAuth'
import { toast } from '../../../composables/useToast'
import { useLocalized } from '../../../composables/useProduct'
import { buildSkuDisplayText, normalizeSkuId } from '../../../utils/sku'
import { fulfillmentTypeLabel } from '../../../utils/fulfillment'
import { amountToCents, centsToAmount } from '../../../utils/money'
import {
  activeSkus,
  buildMallCartItem,
  firstProductImage,
  formatMallMoney,
  isProductSoldOut,
  isSkuPurchasable,
  lockMallBodyScroll,
  mallProductStockCount,
  normalizeLimit,
  openMallAuthModal,
  paymentChannelIcon,
  resolveMallUnitPrice,
  resolveSelectedSku,
  skuWholesaleRules,
  skuAvailableStock,
  unlockMallBodyScroll,
} from '../utils'
import {
  buildMallGuestCaptchaPayload,
  buildMallOrderPayload,
  buildMallPayPath,
  buildMallSingleItemPayload,
  buildMallSingleManualFormDataPayload,
  createAndPayMallOrder,
  isMallGuestEmailValid,
  isMallManualCheckboxChecked,
  isMallManualFieldValid,
  mallManualFieldLabel,
  mallManualFieldPlaceholder,
  mallManualDeliveryFields,
  mallSelectableCardFields,
  normalizeMallManualFormSchema,
  refreshMallCaptchaConfig,
  syncMallSingleManualFormData,
  toggleMallManualCheckbox,
  useMallOrderPreview,
  useMallPaymentSelection,
  type MallManualFormField,
} from '../composables/useMallCheckoutFlow'
import { useMallWalletBalance } from '../composables/useMallWalletBalance'
import MallQuantityInput from './MallQuantityInput.vue'
import MallCouponPanel from './MallCouponPanel.vue'
import MallManualCardPicker from './MallManualCardPicker.vue'

const props = defineProps<{
  product: any
  visible: boolean
  initialAction?: 'cart' | 'buy' | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const cartStore = useCartStore()
const userAuthStore = useUserAuthStore()
const { getLocalizedText, siteCurrency } = useLocalized()

const detailedProduct = ref<any>(null)
const detailLoading = ref(false)
const selectedSkuId = ref(0)
const quantity = ref(1)
const warning = ref('')
const submitting = ref(false)
const skuExpanded = ref(false)
const guestEmail = ref('')
const guestPassword = ref('')
const couponCode = ref('')
const normalizedCouponCode = computed(() => couponCode.value.trim())
const manualFormData = ref<Record<string, any>>({})
const guestCaptchaPayload = ref<any>({})
const turnstileToken = ref('')
const imageCaptchaRef = ref<InstanceType<typeof ImageCaptcha> | null>(null)
const turnstileRef = ref<InstanceType<typeof TurnstileCaptcha> | null>(null)
const { selectedChannelId, useBalance, selectPaymentChannel, selectBalancePayment } = useMallPaymentSelection()
let bodyScrollLocked = false

const currentProduct = computed(() => detailedProduct.value || props.product)
const actionMode = computed(() => (props.initialAction === 'cart' || props.initialAction === 'buy') ? props.initialAction : '')
const activeSkuRows = computed(() => activeSkus(currentProduct.value))
const collapsedSkuVisibleCount = 6
const displaySkuRows = computed(() => [...activeSkuRows.value].sort((left, right) => {
  const leftText = skuText(left)
  const rightText = skuText(right)
  if (leftText.length !== rightText.length) return leftText.length - rightText.length
  return normalizeSkuId(left?.id) - normalizeSkuId(right?.id)
}))
const showSkuToggle = computed(() => displaySkuRows.value.length > collapsedSkuVisibleCount)
const visibleSkuRows = computed(() => {
  if (!showSkuToggle.value || skuExpanded.value) return displaySkuRows.value
  return displaySkuRows.value.slice(0, collapsedSkuVisibleCount)
})
const selectedSku = computed(() => resolveSelectedSku(currentProduct.value, selectedSkuId.value))
const title = computed(() => getLocalizedText(currentProduct.value?.title))
const image = computed(() => firstProductImage(currentProduct.value))
const currency = computed(() => String(currentProduct.value?.currency || siteCurrency.value || 'CNY').trim())
const { balancePaymentLabel } = useMallWalletBalance(currency)
const userMemberLevelId = computed(() => Number(userAuthStore.user?.member_level_id || 0))
const selectedPrice = computed(() => resolveMallUnitPrice(currentProduct.value, selectedSku.value, quantity.value, userMemberLevelId.value))
const orderSubtotal = computed(() => {
  const unit = amountToCents(selectedPrice.value)
  if (unit === null) return selectedPrice.value
  return centsToAmount(unit * quantity.value)
})
const priceText = computed(() => formatMallMoney(selectedPrice.value, currency.value))
const previewCurrency = computed(() => String(preview.value?.currency || currency.value || 'CNY'))
const previewMoneyText = (amount: unknown) => formatMallMoney(amount, previewCurrency.value)
const hasPositiveAmount = (amount: unknown) => {
  const cents = amountToCents(amount)
  return cents !== null && cents > 0
}
const discountMoneyText = (amount: unknown) => hasPositiveAmount(amount) ? `-${previewMoneyText(amount)}` : previewMoneyText('0.00')
const previewOriginal = computed(() => preview.value?.original_amount ?? orderSubtotal.value)
const previewCoupon = computed(() => preview.value?.discount_amount ?? '0')
const previewPromotion = computed(() => preview.value?.promotion_discount_amount ?? '0')
const previewMemberDiscount = computed(() => preview.value?.member_discount_amount ?? '0')
const previewTotal = computed(() => preview.value?.total_amount ?? orderSubtotal.value)
const previewStatusText = computed(() => couponRefreshing.value ? t('checkout.couponRefreshing') : t('checkout.previewLoading'))
const showPreviewSummary = computed(() => Boolean(
  preview.value
  && (normalizedCouponCode.value
    || hasPositiveAmount(previewCoupon.value)
    || hasPositiveAmount(previewPromotion.value)
    || hasPositiveAmount(previewMemberDiscount.value)),
))
const couponPanelActive = computed(() => Boolean(
  normalizedCouponCode.value
  || showPreviewSummary.value
  || previewError.value,
))
const couponPanelLoading = computed(() => couponPanelActive.value && previewLoading.value)
const couponPanelRefreshing = computed(() => couponPanelActive.value && couponRefreshing.value)
const couponPanelError = computed(() => couponPanelActive.value ? previewError.value : '')
const showCouponPreviewRow = computed(() => Boolean(normalizedCouponCode.value || hasPositiveAmount(previewCoupon.value)))
const showPromotionPreviewRow = computed(() => hasPositiveAmount(previewPromotion.value))
const showMemberPreviewRow = computed(() => hasPositiveAmount(previewMemberDiscount.value))
const selectedWholesaleRules = computed(() => skuWholesaleRules(selectedSku.value))
const selectedSkuSummary = computed(() => selectedSku.value ? skuText(selectedSku.value) : t('productDetail.skuRequired'))
const formatWholesaleRule = (rule: any) => t('products.wholesaleRuleHint', {
  quantity: Number(rule?.min_quantity || 0),
  price: formatMallMoney(rule?.unit_price_amount, currency.value),
})
const fulfillmentLabel = computed(() => fulfillmentTypeLabel(t, currentProduct.value?.fulfillment_type, 'orderDetail'))
const stockLabel = computed(() => {
  const stock = mallProductStockCount(currentProduct.value)
  if (stock === null) return t('products.stockStatus.unlimited')
  if (stock <= 0) return t('products.stockStatus.outOfStock')
  return t('products.stockStatus.stockCount', { count: stock })
})
const stockClass = computed(() => {
  const status = String(currentProduct.value?.stock_status || 'in_stock')
  if (status === 'out_of_stock') return 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300'
  if (status === 'low_stock') return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
  return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
})
const minQuantity = computed(() => normalizeLimit(currentProduct.value?.min_purchase_quantity) || 1)
const quantityLimit = computed(() => {
  const productLimit = normalizeLimit(currentProduct.value?.max_purchase_quantity) || null
  const stock = skuAvailableStock(currentProduct.value, selectedSku.value)
  if (stock === null) return productLimit
  return productLimit === null ? stock : Math.min(productLimit, stock)
})
const purchaseTypePending = computed(() => (
  props.visible
  && detailLoading.value
  && !detailedProduct.value
  && !String(props.product?.purchase_type || '').trim()
))
const purchaseType = computed(() => String(currentProduct.value?.purchase_type || 'member'))
const requiresLogin = computed(() => !purchaseTypePending.value && purchaseType.value === 'member' && !userAuthStore.isAuthenticated)
const showGuestOrderForm = computed(() => !purchaseTypePending.value && !userAuthStore.isAuthenticated && !requiresLogin.value)
const captchaConfig = computed(() => appStore.config?.captcha || null)
const captchaProvider = computed(() => String(captchaConfig.value?.provider || 'none'))
const guestCaptchaEnabled = computed(() => showGuestOrderForm.value && !!captchaConfig.value?.scenes?.guest_create_order && captchaProvider.value !== 'none')
const turnstileSiteKey = computed(() => String(captchaConfig.value?.turnstile?.site_key || ''))
const channels = computed(() => {
  const rows = Array.isArray(appStore.config?.payment_channels) ? appStore.config.payment_channels : []
  const allowedIds = Array.isArray(currentProduct.value?.payment_channel_ids) ? currentProduct.value.payment_channel_ids : []
  if (allowedIds.length === 0) return rows
  const allowed = new Set(allowedIds.map(Number))
  return rows.filter((channel: any) => allowed.has(Number(channel?.id)))
})
const manualFormFields = computed<MallManualFormField[]>(() => normalizeMallManualFormSchema(currentProduct.value?.manual_form_schema))
const selectableCardFields = computed(() => mallSelectableCardFields(manualFormFields.value))
const deliveryManualFields = computed(() => mallManualDeliveryFields(manualFormFields.value))
const canPurchase = computed(() => {
  if (!currentProduct.value) return false
  if (isProductSoldOut(currentProduct.value)) return false
  if (activeSkuRows.value.length === 0) return false
  if (!selectedSku.value) return false
  if (!isSkuPurchasable(currentProduct.value, selectedSku.value)) return false
  if (quantityLimit.value !== null && quantityLimit.value < minQuantity.value) return false
  return true
})

const skuText = (sku: any) => buildSkuDisplayText({
  skuCode: sku?.sku_code,
  specValues: sku?.spec_values,
  fallback: t('productDetail.skuFallback'),
  locale: appStore.locale,
})

const skuStockText = (sku: any) => {
  const stock = skuAvailableStock(currentProduct.value, sku)
  if (stock === null) return t('productDetail.skuStockUnlimited')
  if (stock <= 0) return t('productDetail.skuStockOut')
  return t('products.stockStatus.stockCount', { count: stock })
}

const isLongSkuText = (sku: any) => skuText(sku).length > 12
const channelName = (channel: any) => String(channel?.name || channel?.channel_name || channel?.channel_type || channel?.provider_type || '-')

const manualFieldLabel = (field: MallManualFormField) => mallManualFieldLabel(field, getLocalizedText)
const manualFieldPlaceholder = (field: MallManualFormField) => mallManualFieldPlaceholder(field, getLocalizedText)
const manualFieldValid = (field: MallManualFormField) => isMallManualFieldValid(field, manualFormData.value[field.key])
const manualFormValid = computed(() => manualFormFields.value.every((field) => manualFieldValid(field)))
const isManualCheckboxChecked = (fieldKey: string, option: string) => isMallManualCheckboxChecked(manualFormData.value, fieldKey, option)
const toggleManualCheckbox = (fieldKey: string, option: string, checked: boolean) => toggleMallManualCheckbox(manualFormData, fieldKey, option, checked)
const buildManualFormDataPayload = () => buildMallSingleManualFormDataPayload(currentProduct.value?.id, manualFormFields.value, manualFormData.value)
const getGuestCaptchaPayload = () => buildMallGuestCaptchaPayload(guestCaptchaEnabled.value, captchaProvider.value, guestCaptchaPayload.value, turnstileToken.value)
const handleCaptchaConfigStale = async () => refreshMallCaptchaConfig((force?: boolean) => appStore.loadConfig(force), guestCaptchaPayload, turnstileToken)

const syncDefaults = () => {
  const sku = resolveSelectedSku(currentProduct.value, selectedSkuId.value)
  selectedSkuId.value = normalizeSkuId(sku?.id)
  quantity.value = minQuantity.value
  skuExpanded.value = false
  warning.value = ''
}

const close = () => {
  emit('update:visible', false)
  warning.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) close()
}

const syncBodyScrollLock = (visible: boolean) => {
  if (visible && !bodyScrollLocked) {
    lockMallBodyScroll()
    bodyScrollLocked = true
    return
  }
  if (!visible && bodyScrollLocked) {
    unlockMallBodyScroll()
    bodyScrollLocked = false
  }
}

const loadProductDetail = async () => {
  const slug = String(props.product?.slug || '').trim()
  if (!slug) return
  detailLoading.value = true
  try {
    const response = await productAPI.detail(slug)
    detailedProduct.value = response.data.data || props.product
    syncDefaults()
  } catch (error) {
    console.error('Failed to load quick buy product detail:', error)
  } finally {
    detailLoading.value = false
  }
}

const selectSku = (sku: any) => {
  selectedSkuId.value = normalizeSkuId(sku?.id)
  quantity.value = minQuantity.value
  warning.value = ''
}

const selectedCartQuantity = () => {
  const productID = Number(currentProduct.value?.id || 0)
  const skuID = normalizeSkuId(selectedSku.value?.id)
  if (!productID || !skuID) return 0
  const item = cartStore.items.find((row) => row.productId === productID && normalizeSkuId(row.skuId) === skuID)
  return Number(item?.quantity || 0)
}

const requireLoginOrContinue = () => {
  if (!requiresLogin.value) return true
  if (userAuthStore.isAuthenticated) return true
  openMallAuthModal('login')
  return false
}

const validatePurchase = (includeCart: boolean) => {
  warning.value = ''
  if (detailLoading.value) return false
  if (!canPurchase.value) {
    warning.value = t('productDetail.stockUnavailable')
    return false
  }
  const limit = quantityLimit.value
  const nextQuantity = quantity.value + (includeCart ? selectedCartQuantity() : 0)
  if (limit !== null && nextQuantity > limit) {
    warning.value = includeCart && selectedCartQuantity() > 0
      ? t('productDetail.addCartLimitExceededWithCart', { count: limit, cartCount: selectedCartQuantity() })
      : t('productDetail.addCartLimitExceeded', { count: limit })
    return false
  }
  return true
}

const validateDirectOrder = () => {
  if (!validatePurchase(false)) return false
  if (!requireLoginOrContinue()) return false
  const missingManualField = manualFormFields.value.find((field) => !manualFieldValid(field))
  if (missingManualField) {
    warning.value = t('checkout.manualFormFieldRequired', { name: manualFieldLabel(missingManualField) })
    return false
  }
  if (showGuestOrderForm.value) {
    if (!guestEmail.value.trim() || !guestPassword.value.trim()) {
      warning.value = t('checkout.errors.missingGuest')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.value.trim())) {
      warning.value = t('error.email_invalid')
      return false
    }
    if (guestCaptchaEnabled.value && captchaProvider.value === 'image' && (!guestCaptchaPayload.value.captcha_id || !guestCaptchaPayload.value.captcha_code)) {
      warning.value = t('auth.common.captchaRequired')
      return false
    }
    if (guestCaptchaEnabled.value && captchaProvider.value === 'turnstile' && !turnstileToken.value) {
      warning.value = t('auth.common.captchaRequired')
      return false
    }
  }
  if ((channels.value.length > 0 || userAuthStore.isAuthenticated) && !selectedChannelId.value && !useBalance.value) {
    warning.value = t('checkout.errors.selectPayment')
    return false
  }
  return true
}

const buildItemsPayload = () => buildMallSingleItemPayload(currentProduct.value, selectedSku.value, quantity.value)
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
    if (!props.visible || detailLoading.value || purchaseTypePending.value || !currentProduct.value || requiresLogin.value || !canPurchase.value || !manualFormValid.value) return false
    if (showGuestOrderForm.value && (!guestEmail.value.trim() || !guestPassword.value.trim() || !guestEmailValid.value)) return false
    return true
  },
  isAuthenticated: () => userAuthStore.isAuthenticated,
  buildOrderPayload,
  guestEmail,
  guestPassword,
  fallbackErrorMessage: () => t('checkout.previewFailed'),
})

const handleAddToCart = () => {
  if (!validatePurchase(true) || !requireLoginOrContinue()) return
  cartStore.addItem(buildMallCartItem(currentProduct.value, selectedSku.value, quantity.value, userMemberLevelId.value), quantity.value)
  toast.success(t('toast.addedToCart'))
  close()
}

const handleBuyNow = async () => {
  if (!validateDirectOrder()) return
  submitting.value = true
  warning.value = ''
  try {
    await loadPreviewNow()
    if (previewError.value) {
      warning.value = previewError.value
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
    close()
    router.push(buildMallPayPath(responseData.order_no, userAuthStore.isAuthenticated))
  } catch (err: any) {
    warning.value = err.message || t('checkout.errors.submitFailed')
    imageCaptchaRef.value?.refresh()
    turnstileRef.value?.reset()
    turnstileToken.value = ''
  } finally {
    submitting.value = false
  }
}

const goLogin = () => {
  close()
  openMallAuthModal('login')
}

watch(
  () => [props.product?.id, props.visible],
  () => {
    if (!props.visible) return
    detailedProduct.value = null
    syncDefaults()
    void loadProductDetail()
  },
  { immediate: true },
)

watch(
  () => props.visible,
  (visible) => {
    syncBodyScrollLock(visible)
  },
  { immediate: true },
)

watch(channels, (rows) => {
  if (!selectedChannelId.value) return
  if (rows.some((channel: any) => Number(channel.id) === Number(selectedChannelId.value))) return
  selectedChannelId.value = null
}, { immediate: true })

watch(manualFormFields, (fields) => {
  manualFormData.value = syncMallSingleManualFormData(fields, manualFormData.value)
}, { immediate: true })

watch(
  () => [
    props.visible,
    currentProduct.value?.id,
    selectedSkuId.value,
    quantity.value,
    normalizedCouponCode.value,
    JSON.stringify(manualFormData.value),
    guestEmail.value,
    guestPassword.value,
    userAuthStore.isAuthenticated,
  ],
  () => {
    debouncedLoadPreview()
  },
  { deep: true },
)

watch(normalizedCouponCode, (value, previous) => {
  if (value === previous) return
  couponRefreshing.value = true
  warning.value = ''
  previewError.value = ''
})

watch(quantityLimit, (limit) => {
  if (limit !== null && quantity.value > limit) {
    quantity.value = Math.max(minQuantity.value, limit)
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  debouncedLoadPreview.cancel()
  window.removeEventListener('keydown', handleKeydown)
  if (bodyScrollLocked) {
    unlockMallBodyScroll()
    bodyScrollLocked = false
  }
})
</script>
