<template>
  <div class="mx-auto max-w-[1472px] px-0 pb-6 pt-1.5 sm:px-6 sm:pt-3 lg:px-8">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-3 px-3 sm:mb-4 sm:px-0">
      <div>
        <h1 class="text-xl font-black leading-tight text-gray-950 dark:text-white sm:text-[26px]">{{ t('rechargeOrder.title') }}</h1>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm">{{ t('rechargeOrder.subtitle') }}</p>
      </div>
      <router-link
        to="/me/orders"
        class="inline-flex h-9 items-center justify-center rounded-full border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600 dark:border-white/10 dark:bg-neutral-900 dark:text-gray-200 sm:h-10 sm:px-5"
      >
        {{ t('rechargeOrder.backList') }}
      </router-link>
    </div>

    <div v-if="loading" class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_368px]">
      <section class="space-y-3 sm:space-y-4">
        <div class="h-40 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-neutral-900/95 dark:ring-white/10"></div>
        <div class="h-48 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-neutral-900/95 dark:ring-white/10"></div>
      </section>
      <aside class="h-72 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-neutral-900/95 dark:ring-white/10"></aside>
    </div>

    <MallEmptyState
      v-else-if="!recharge"
      :title="t('rechargeOrder.notFound')"
      action-to="/me/orders"
      :action-label="t('rechargeOrder.backList')"
    />

    <div v-else class="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_368px] lg:gap-4">
      <section class="space-y-2 sm:space-y-4">
        <div class="overflow-hidden border-y border-gray-100 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.04)] ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="border-b border-gray-100 px-3 py-2.5 dark:border-white/10 sm:px-5 sm:py-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('personalCenter.wallet.rechargeNoLabel') }}</div>
                <div class="mt-1 font-mono text-sm font-bold text-gray-950 dark:text-white">{{ recharge.recharge_no }}</div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ t('rechargeOrder.createdAtLabel') }}: {{ formatDate(recharge.created_at) }}</div>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-bold" :class="statusBadgeClass(recharge.status)">
                {{ rechargeStatusText(recharge.status) }}
              </span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-px bg-gray-100 p-3 dark:bg-white/10 sm:gap-3 sm:bg-transparent sm:p-5 sm:dark:bg-transparent">
            <div class="bg-[#fbfaf8] px-2 py-2 text-sm first:rounded-l-xl dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('rechargeOrder.rechargeAmount') }}</div>
              <div class="mt-1 break-all text-sm font-bold text-gray-950 dark:text-white sm:text-base">{{ formatMoney(recharge.amount, recharge.currency) }}</div>
            </div>
            <div class="bg-[#fbfaf8] px-2 py-2 text-sm dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('payment.feeAmountLabel') }}</div>
              <div class="mt-1 break-all text-sm font-bold text-gray-950 dark:text-white sm:text-base">{{ formatMoney(recharge.fee_amount, recharge.currency) }}</div>
            </div>
            <div class="bg-[#fbfaf8] px-2 py-2 text-sm last:rounded-r-xl dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountTotal') }}</div>
              <div class="mt-1 break-all text-sm font-black text-[#ff5000] sm:text-base">{{ formatMoney(recharge.payable_amount, recharge.currency) }}</div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-4">
            <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('rechargeOrder.amountTitle') }}</h2>
          </div>
          <div class="grid grid-cols-2 gap-2 p-3 text-sm sm:grid-cols-2 sm:gap-3 sm:p-5 xl:grid-cols-4">
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('rechargeOrder.rechargeAmount') }}</div>
              <div class="mt-1 font-bold text-gray-950 dark:text-white">{{ formatMoney(recharge.amount, recharge.currency) }}</div>
            </div>
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('payment.feeRateLabel') }}</div>
              <div class="mt-1 font-bold text-gray-950 dark:text-white">{{ feeRateDisplay }}</div>
            </div>
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('payment.feeAmountLabel') }}</div>
              <div class="mt-1 font-bold text-gray-950 dark:text-white">{{ formatMoney(recharge.fee_amount, recharge.currency) }}</div>
            </div>
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('personalCenter.wallet.payAmountLabel') }}</div>
              <div class="mt-1 font-black text-[#ff5000]">{{ formatMoney(recharge.payable_amount, recharge.currency) }}</div>
            </div>
          </div>
        </div>

        <div class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-4">
            <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('rechargeOrder.timeTitle') }}</h2>
          </div>
          <div class="grid gap-2 p-3 text-sm sm:grid-cols-2 sm:gap-3 sm:p-5 xl:grid-cols-3">
            <div class="rounded-lg bg-gray-50 p-2 dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('rechargeOrder.createdAtLabel') }}</div>
              <div class="mt-1 font-bold text-gray-950 dark:text-white">{{ formatDate(recharge.created_at) }}</div>
            </div>
            <div v-if="recharge.paid_at" class="rounded-lg bg-gray-50 p-2 dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('rechargeOrder.paidAtLabel') }}</div>
              <div class="mt-1 font-bold text-gray-950 dark:text-white">{{ formatDate(recharge.paid_at) }}</div>
            </div>
            <div v-if="payment?.expires_at" class="rounded-lg bg-gray-50 p-2 dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('payment.expiresAt') }}</div>
              <div class="mt-1 font-bold text-gray-950 dark:text-white">{{ formatDate(payment.expires_at) }}</div>
            </div>
          </div>
        </div>

        <div v-if="recharge.remark" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="border-b border-gray-100 px-4 py-4 dark:border-white/10 sm:px-5">
            <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('rechargeOrder.remarkLabel') }}</h2>
          </div>
          <div class="p-4 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:p-5">
            {{ recharge.remark }}
          </div>
        </div>

        <div v-if="isPending" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-4">
            <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('rechargeOrder.paymentTitle') }}</h2>
          </div>
          <div class="grid gap-3 p-3 sm:p-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            <div v-if="showQRCode" class="border-t border-gray-100 px-0 py-3 first:border-t-0 dark:border-white/10 sm:rounded-xl sm:border-0 sm:bg-gray-50 sm:p-4 sm:dark:bg-white/[0.04]">
              <div class="text-sm font-bold text-gray-950 dark:text-white">{{ t('payment.qrTitle') }}</div>
              <div class="mt-4 flex items-center justify-center">
                <img :src="qrImageUrl" alt="Recharge QR" class="h-44 w-44 rounded-xl bg-white p-2 object-contain sm:h-56 sm:w-56" />
              </div>
              <div v-if="qrUsingPayLinkFallback" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {{ t('payment.qrFallbackHint') }}
              </div>
            </div>
            <div class="border-t border-gray-100 px-0 py-3 first:border-t-0 dark:border-white/10 sm:rounded-xl sm:border-0 sm:bg-gray-50 sm:p-4 sm:dark:bg-white/[0.04]">
              <div class="text-sm font-bold text-gray-950 dark:text-white">{{ rechargeStatusText(recharge.status) }}</div>
              <div class="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                {{ t('personalCenter.wallet.pendingHint') }}
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <button
                  v-if="payLink"
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-xl bg-[#ff5000] px-4 text-sm font-black text-white transition hover:bg-orange-600"
                  @click="handleOpenPayLink"
                >
                  {{ t('payment.openPayLink') }}
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-200"
                  :disabled="checkingPayment"
                  @click="checkPayment"
                >
                  {{ checkingPayment ? t('personalCenter.wallet.checkingPayStatus') : t('personalCenter.wallet.checkPayStatus') }}
                </button>
              </div>
              <div v-if="payLink" class="mt-4 break-all rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-400">
                {{ payLink }}
              </div>
              <div v-if="showTelegramPayHint" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {{ t('payment.telegramExternalHint') }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="h-fit border-y border-gray-100 bg-white/95 p-3 shadow-[0_8px_28px_rgba(15,23,42,0.04)] ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:p-4 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10 lg:sticky lg:top-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('checkout.paymentDetailLabel') }}</h2>
          <span class="rounded-full px-3 py-1 text-xs font-bold" :class="statusBadgeClass(recharge.status)">
            {{ rechargeStatusText(recharge.status) }}
          </span>
        </div>

        <div class="mt-3 space-y-2 rounded-xl bg-[#fbfaf8] p-2.5 text-sm ring-1 ring-black/[0.03] dark:bg-white/[0.04] dark:ring-white/10 sm:mt-5 sm:space-y-3 sm:bg-transparent sm:p-0 sm:ring-0">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">{{ t('rechargeOrder.rechargeAmount') }}</span>
            <span class="font-bold text-gray-950 dark:text-white">{{ formatMoney(recharge.amount, recharge.currency) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">{{ t('payment.feeAmountLabel') }}</span>
            <span class="font-bold text-gray-950 dark:text-white">{{ formatMoney(recharge.fee_amount, recharge.currency) }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
            <span class="text-gray-500 dark:text-gray-400">{{ t('personalCenter.wallet.payAmountLabel') }}</span>
            <span class="text-lg font-black text-[#ff5000] sm:text-xl">{{ formatMoney(recharge.payable_amount, recharge.currency) }}</span>
          </div>
        </div>

        <template v-if="isPending">
          <button
            v-if="payLink"
            type="button"
            class="mt-5 h-12 w-full rounded-xl bg-[#ff5000] text-sm font-black text-white transition hover:bg-orange-600"
            @click="handleOpenPayLink"
          >
            {{ t('payment.openPayLink') }}
          </button>
          <button
            type="button"
            class="mt-3 h-11 w-full rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-200"
            :disabled="checkingPayment"
            @click="checkPayment"
          >
            {{ checkingPayment ? t('personalCenter.wallet.checkingPayStatus') : t('personalCenter.wallet.checkPayStatus') }}
          </button>
        </template>

        <div v-else-if="statusKey === 'success'" class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {{ t('personalCenter.wallet.rechargeSuccess') }}
        </div>

        <router-link
          to="/me/orders"
          class="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600 dark:border-white/10 dark:text-gray-200"
        >
          {{ t('rechargeOrder.backList') }}
        </router-link>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import { walletAPI } from '../../../api'
import { useTelegramMiniAppStore } from '../../../stores/telegramMiniApp'
import { basisPointsToPercent, rateToBasisPoints } from '../../../utils/money'
import { formatMallMoney } from '../utils'
import MallEmptyState from '../components/MallEmptyState.vue'

const { t } = useI18n()
const route = useRoute()
const telegramMiniAppStore = useTelegramMiniAppStore()

const loading = ref(true)
const checkingPayment = ref(false)
const recharge = ref<any>(null)
const payment = ref<any>(null)
const pollTimer = ref<number | null>(null)
const qrImageUrl = ref('')
const qrRenderVersion = ref(0)

const rechargeNo = computed(() => String(route.params.recharge_no || '').trim())
const statusKey = computed(() => String(recharge.value?.status || '').toLowerCase())
const isPending = computed(() => statusKey.value === 'pending' || statusKey.value === 'initiated')
const payLink = computed(() => String(payment.value?.pay_url || '').trim())
const interactionMode = computed(() => String(payment.value?.interaction_mode || '').toLowerCase())
const isTelegramMiniApp = computed(() => telegramMiniAppStore.isMiniApp && telegramMiniAppStore.isReady)
const showTelegramPayHint = computed(() => isTelegramMiniApp.value && Boolean(payLink.value))
const qrCodeContent = computed(() => String(payment.value?.qr_code || '').trim())
const qrFallbackContent = computed(() => {
  if (interactionMode.value === 'redirect') return ''
  if (qrCodeContent.value) return ''
  return payLink.value
})
const qrDisplayContent = computed(() => qrCodeContent.value || qrFallbackContent.value)
const qrUsingPayLinkFallback = computed(() => Boolean(!qrCodeContent.value && qrFallbackContent.value))
const showQRCode = computed(() => interactionMode.value !== 'redirect' && Boolean(qrImageUrl.value))
const feeRateDisplay = computed(() => {
  const rate = rateToBasisPoints(recharge.value?.fee_rate ?? payment.value?.fee_rate)
  if (rate === null) return '0.00%'
  return `${basisPointsToPercent(rate)}%`
})

const rechargeStatusText = (status?: string) => {
  const normalized = String(status || '').toLowerCase()
  const key = `personalCenter.wallet.rechargeStatus.${normalized}`
  const translated = t(key)
  return translated === key ? normalized || '-' : translated
}

const statusBadgeClass = (status?: string) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'success') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  if (normalized === 'failed' || normalized === 'expired') return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
  return 'bg-orange-50 text-[#ff5000] dark:bg-orange-500/10'
}

const formatMoney = (amount?: unknown, currency?: string) => formatMallMoney(amount, currency)

const formatDate = (raw?: string) => {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}

const syncPayload = (payload: any) => {
  recharge.value = payload?.recharge || recharge.value
  const paymentData = payload?.payment || (payload?.payment_id != null ? {
    id: payload.payment_id,
    provider_type: payload.provider_type,
    channel_type: payload.channel_type,
    interaction_mode: payload.interaction_mode,
    pay_url: payload.pay_url,
    qr_code: payload.qr_code,
    expires_at: payload.expires_at,
    status: payload.status,
    fee_rate: payload.fee_rate,
  } : undefined)
  if (paymentData) {
    payment.value = paymentData
  }
}

const stopPolling = () => {
  if (pollTimer.value) {
    window.clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

const startPolling = () => {
  if (!isPending.value || pollTimer.value) return
  pollTimer.value = window.setInterval(() => {
    void refreshStatus(true)
  }, 5000)
}

const loadDetail = async () => {
  if (!rechargeNo.value) return
  loading.value = true
  try {
    const response = await walletAPI.rechargeDetail(rechargeNo.value)
    const payload = response.data.data || {}
    syncPayload(payload)
  } catch {
    recharge.value = null
    payment.value = null
  } finally {
    loading.value = false
  }
}

const refreshStatus = async (silent = false) => {
  if (!rechargeNo.value) return
  try {
    const response = await walletAPI.rechargeDetail(rechargeNo.value)
    const payload = response.data.data || {}
    syncPayload(payload)
    if (statusKey.value === 'success' || statusKey.value === 'failed' || statusKey.value === 'expired') {
      stopPolling()
    } else {
      startPolling()
    }
  } catch (err) {
    if (!silent) {
      console.error('Failed to refresh recharge status:', err)
    }
  }
}

const checkPayment = async () => {
  const paymentID = Number(payment.value?.id || payment.value?.payment_id || 0)
  if (!Number.isFinite(paymentID) || paymentID <= 0) return
  checkingPayment.value = true
  try {
    const response = await walletAPI.captureRechargePayment(paymentID)
    const payload = response.data.data || {}
    syncPayload(payload)
    await refreshStatus(true)
  } catch (err) {
    console.error('Failed to check payment:', err)
  } finally {
    checkingPayment.value = false
  }
}

const handleOpenPayLink = () => {
  if (!payLink.value) return
  if (isTelegramMiniApp.value) {
    try {
      window.Telegram?.WebApp?.openLink?.(payLink.value)
    } catch {
      window.open(payLink.value, '_blank')
    }
    return
  }
  window.open(payLink.value, '_blank')
}

const renderQRCodeImage = async () => {
  const qr = qrDisplayContent.value
  const currentVersion = qrRenderVersion.value + 1
  qrRenderVersion.value = currentVersion
  if (!qr) {
    qrImageUrl.value = ''
    return
  }
  if (qr.startsWith('data:image/')) {
    qrImageUrl.value = qr
    return
  }
  const isImageURL = /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(qr)
  if (isImageURL) {
    qrImageUrl.value = qr
    return
  }
  try {
    const dataURL = await QRCode.toDataURL(qr, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
    if (currentVersion !== qrRenderVersion.value) return
    qrImageUrl.value = dataURL
  } catch {
    if (currentVersion !== qrRenderVersion.value) return
    qrImageUrl.value = ''
  }
}

watch(() => qrDisplayContent.value, () => { void renderQRCodeImage() }, { immediate: true })

onMounted(async () => {
  await loadDetail()
  if (isPending.value) {
    startPolling()
    if (payLink.value && interactionMode.value === 'redirect') {
      handleOpenPayLink()
    }
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>
