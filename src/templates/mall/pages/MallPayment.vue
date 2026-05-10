<template>
  <div class="mx-auto max-w-[1472px] px-0 pb-20 pt-1.5 sm:px-6 sm:pt-3 lg:px-8 lg:pb-8">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-3 px-3 sm:mb-4 sm:px-0">
      <div>
        <h1 class="text-xl font-black leading-tight text-gray-950 dark:text-white sm:text-[26px]">{{ t('payment.title') }}</h1>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{{ t('payment.subtitle') }}</p>
      </div>
    </div>

    <div v-if="showGuestAuth" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-4">
        <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('payment.guestAuthTitle') }}</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('payment.guestAuthHint') }}</p>
      </div>
      <div class="p-3 sm:p-5">
        <div class="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          <input v-model="guestAuth.email" type="email" class="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900 sm:h-11" :placeholder="t('guestOrders.emailPlaceholder')" />
          <input v-model="guestAuth.order_password" type="password" class="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900 sm:h-11" :placeholder="t('guestOrders.passwordPlaceholder')" />
        </div>
        <button class="mt-4 h-11 rounded-xl bg-[#ff5000] px-6 text-sm font-black text-white hover:bg-orange-600" @click="saveGuestAuth">
          {{ t('payment.guestAuthSubmit') }}
        </button>
      </div>
    </div>

    <MallEmptyState v-else-if="!loading && !order" :title="t('payment.orderNotFound')" action-to="/products" :action-label="t('emptyState.goProducts')" />

    <div v-else class="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_368px] lg:gap-4">
      <section class="space-y-2 sm:space-y-4">
        <div class="overflow-hidden border-y border-gray-100 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.04)] ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="px-3 py-2 sm:px-5 sm:py-4">
            <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('payment.title') }}</h2>
          </div>

          <div v-if="loading" class="p-5">
            <div class="h-28 rounded-xl bg-gray-100 dark:bg-white/10"></div>
          </div>
          <template v-else-if="order">
            <div class="border-t border-gray-100 bg-gray-50/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03] sm:px-5 sm:py-3">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('payment.orderNo') }}</div>
                  <div class="mt-1 font-mono text-sm font-bold text-gray-950 dark:text-white">{{ order.order_no }}</div>
                </div>
                <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:bg-orange-500/10">
                  {{ statusLabel(order.status) }}
                </span>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-px bg-gray-100 px-3 py-2 text-sm dark:bg-white/10 sm:gap-3 sm:bg-transparent sm:p-5 sm:dark:bg-transparent">
              <div class="bg-[#fbfaf8] px-2 py-2 first:rounded-l-xl dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountTotal') }}</div>
                <div class="mt-1 break-all text-sm font-black text-[#ff5000] sm:text-base">{{ formatMoney(order.total_amount, order.currency) }}</div>
              </div>
              <div class="bg-[#fbfaf8] px-2 py-2 dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountOnlinePaid') }}</div>
                <div class="mt-1 break-all text-sm font-bold text-gray-950 dark:text-white sm:text-base">{{ formatMoney(order.online_paid_amount, order.currency) }}</div>
              </div>
              <div class="bg-[#fbfaf8] px-2 py-2 last:rounded-r-xl dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('orderDetail.createdAtLabel') }}</div>
                <div class="mt-1 line-clamp-2 break-all text-xs font-bold text-gray-950 dark:text-white sm:text-base">{{ formatDate(order.created_at) }}</div>
              </div>
            </div>
          </template>
        </div>

        <div v-if="paymentResult" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-4">
            <div>
              <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ interactionMode === 'redirect' ? t('payment.resultRedirectTitle') : t('payment.resultTitle') }}</h2>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm">{{ interactionMode === 'redirect' ? t('payment.redirectTip') : t('payment.qrTip') }}</p>
            </div>
            <button class="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold hover:border-orange-500 hover:text-orange-600 dark:border-white/10" @click="resetPayment">
              {{ t('payment.changeMethod') }}
            </button>
          </div>
          <div v-if="showQRCode" class="flex flex-col items-center bg-gray-50 p-3 dark:bg-white/[0.04] sm:p-6">
            <img :src="qrImageUrl" alt="QR Code" class="h-44 w-44 rounded bg-white p-2 sm:h-60 sm:w-60" />
            <div class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ t('payment.qrTitle') }}</div>
          </div>
          <div v-else-if="payLink" class="bg-gray-50 p-5 dark:bg-white/[0.04]">
            <button type="button" class="inline-flex h-11 items-center justify-center rounded-xl bg-[#ff5000] px-5 text-sm font-black text-white hover:bg-orange-600" @click="openPayLink()">
              {{ t('payment.openPayLink') }}
            </button>
            <div class="mt-3 break-all text-xs text-gray-500 dark:text-gray-400">{{ payLink }}</div>
            <div v-if="showTelegramPayHint" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {{ t('payment.telegramExternalHint') }}
            </div>
          </div>
        </div>

        <div v-if="order && orderItems.length" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="px-3 py-2 sm:px-5 sm:py-4">
            <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('payment.itemsTitle') }}</h2>
          </div>
          <div class="hidden gap-4 grid-cols-[minmax(0,1fr)_110px_128px] border-y border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500 dark:border-white/10 dark:bg-white/[0.04] lg:grid">
            <div>{{ t('checkout.orderProductLabel') }}</div>
            <div class="flex items-center justify-center text-center">{{ t('checkout.quantityLabel') }}</div>
            <div class="flex items-center justify-center text-center">{{ t('checkout.priceLabel') }}</div>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-white/10">
            <div v-for="(item, index) in orderItems" :key="index" class="grid gap-2 px-3 py-2 text-sm sm:gap-4 sm:px-5 sm:py-4 lg:grid-cols-[minmax(0,1fr)_110px_128px] lg:items-center">
              <div class="min-w-0">
                <div class="line-clamp-1 font-semibold leading-5 text-gray-950 dark:text-white sm:line-clamp-2 sm:leading-6">{{ getLocalizedText(item.title) }}</div>
              </div>
              <div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-gray-100 text-xs ring-1 ring-black/[0.03] dark:bg-white/10 dark:ring-white/10 lg:hidden">
                <div class="bg-[#f8f5f0] px-2.5 py-2 dark:bg-white/[0.04]">
                  <div class="text-[11px] font-semibold text-gray-400">{{ t('checkout.quantityLabel') }}</div>
                  <div class="mt-0.5 font-black text-gray-950 dark:text-white">{{ item.quantity }}</div>
                </div>
                <div class="bg-[#f8f5f0] px-2.5 py-2 text-right dark:bg-white/[0.04]">
                  <div class="text-[11px] font-semibold text-gray-400">{{ t('checkout.priceLabel') }}</div>
                  <div class="mt-0.5 font-black text-[#ff5000]">{{ formatMoney(item.total_price, order.currency) }}</div>
                </div>
              </div>
              <div class="hidden items-center justify-between lg:flex lg:justify-center lg:text-center">
                <div class="font-semibold text-gray-950 dark:text-white">{{ item.quantity }}</div>
              </div>
              <div class="hidden items-center justify-between lg:flex lg:justify-center">
                <div class="text-sm font-black text-[#ff5000]">{{ formatMoney(item.total_price, order.currency) }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="h-fit border-y border-gray-100 bg-white p-3 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:p-4 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10 lg:sticky lg:top-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('payment.channelTitle') }}</h2>
          <span v-if="order" class="text-sm text-gray-500 dark:text-gray-400">{{ t('checkout.totalQuantityLabel', { count: orderItems.length }) }}</span>
        </div>

        <div v-if="order" class="mt-3 space-y-2 rounded-xl bg-[#fbfaf8] p-2.5 text-sm ring-1 ring-black/[0.03] dark:bg-white/[0.04] dark:ring-white/10 sm:mt-5 sm:space-y-3 sm:bg-transparent sm:p-0 sm:ring-0">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountTotal') }}</span>
            <span class="font-bold text-gray-950 dark:text-white">{{ formatMoney(order.total_amount, order.currency) }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-white/10 sm:pt-3">
            <span class="text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountOnlinePaid') }}</span>
            <span class="text-lg font-black text-[#ff5000] sm:text-xl">{{ formatMoney(order.online_paid_amount, order.currency) }}</span>
          </div>
        </div>

        <div v-if="orderPaid" class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {{ statusLabel(order?.status || 'paid') }}
        </div>
        <template v-else>
          <div v-if="channels.length || !isGuest" class="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap">
            <button
              v-if="!isGuest"
              type="button"
              class="inline-flex min-h-10 min-w-0 items-center justify-center rounded-lg border px-2.5 py-2 text-center text-sm font-semibold transition sm:justify-start sm:px-3"
              :class="useBalance ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'border-gray-200 bg-white hover:border-orange-400 dark:border-white/10 dark:bg-transparent'"
              @click="selectBalancePayment"
            >
              <span class="min-w-0 truncate">{{ balancePaymentLabel }}</span>
            </button>
            <button
              v-for="channel in channels"
              :key="channel.id"
              type="button"
              class="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border px-2.5 py-2 text-center text-sm font-semibold transition sm:justify-start sm:px-3"
              :class="Number(selectedChannelId) === Number(channel.id) ? 'border-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'border-gray-200 bg-white hover:border-orange-400 dark:border-white/10 dark:bg-transparent'"
              @click="selectPaymentChannel(channel.id)"
            >
              <img v-if="paymentChannelIcon(channel)" :src="paymentChannelIcon(channel)" :alt="channelName(channel)" loading="lazy" class="h-5 w-5 shrink-0 rounded object-contain" />
              <span class="min-w-0 truncate">{{ channelName(channel) }}</span>
            </button>
          </div>
          <div v-if="error" class="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {{ error }}
          </div>
          <button
            class="mt-5 hidden h-12 w-full rounded-xl bg-[#ff5000] text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 lg:block"
            :disabled="submitting || (isGuest && channels.length === 0)"
            @click="createPayment"
          >
            {{ submitting ? t('payment.submitting') : t('payment.submitButton') }}
          </button>
        </template>
        <button class="mt-3 h-11 w-full rounded-xl border border-gray-200 text-sm font-semibold hover:border-orange-500 hover:text-orange-600 dark:border-white/10" @click="loadOrder()">
          {{ t('payment.refreshStatus') }}
        </button>
        <router-link v-if="order" class="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold hover:border-orange-500 hover:text-orange-600 dark:border-white/10" :to="orderDetailLink">
          {{ t('payment.backToOrders') }}
        </router-link>
        <router-link class="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold hover:border-orange-500 hover:text-orange-600 dark:border-white/10" to="/">
          {{ t('notFoundPage.backHome') }}
        </router-link>
      </aside>
    </div>

    <div v-if="!showGuestAuth && order" class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden dark:border-white/10 dark:bg-neutral-950/95">
      <div class="mx-auto flex max-w-[1472px] items-center gap-3">
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">{{ t('orderDetail.amountOnlinePaid') }}</div>
          <div class="mt-1 truncate text-lg font-black text-[#ff5000]">{{ formatMoney(order.online_paid_amount, order.currency) }}</div>
        </div>
        <button
          class="flex h-11 w-[44%] min-w-0 shrink-0 items-center justify-center rounded-xl bg-[#ff5000] px-3 text-center text-sm font-black leading-tight text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-auto sm:min-w-[148px] sm:px-5"
          :disabled="mobilePrimaryDisabled"
          @click="handleMobilePrimaryAction"
        >
          {{ mobilePrimaryLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import { guestOrderAPI, paymentAPI, userOrderAPI } from '../../../api'
import { useAppStore } from '../../../stores/app'
import { useTelegramMiniAppStore } from '../../../stores/telegramMiniApp'
import { orderStatusLabel } from '../../../utils/status'
import { useLocalized } from '../../../composables/useProduct'
import { formatMallMoney, paymentChannelIcon } from '../utils'
import MallEmptyState from '../components/MallEmptyState.vue'
import { useMallWalletBalance } from '../composables/useMallWalletBalance'
import { openMallRedirectPaymentLink } from '../composables/useMallCheckoutFlow'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const telegramMiniAppStore = useTelegramMiniAppStore()
const { getLocalizedText, siteCurrency } = useLocalized()

const loading = ref(true)
const submitting = ref(false)
const capturing = ref(false)
const order = ref<any>(null)
const paymentResult = ref<any>(null)
const selectedChannelId = ref<number | null>(null)
const useBalance = ref(false)
const error = ref('')
const qrImageUrl = ref('')
const guestAuth = ref({ email: '', order_password: '' })
let pollTimer: ReturnType<typeof setInterval> | null = null
let redirectingToOrderDetail = false
let pollingRequestRunning = false
let returnSyncing = false

const PAYMENT_POLL_INTERVAL_MS = 1000

const routeQueryValueToString = (value: unknown): string => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = String(item ?? '').trim()
      if (text !== '') return text
    }
    return ''
  }
  return String(value ?? '').trim()
}

const readRouteQueryValue = (key: string): string => {
  const normalizedKey = String(key || '').trim().toLowerCase()
  if (normalizedKey === '') return ''

  const query = route.query as Record<string, unknown>
  const candidates = [key, normalizedKey, `amp;${key}`, `amp;${normalizedKey}`]
  for (const candidate of candidates) {
    const value = routeQueryValueToString(query[candidate])
    if (value !== '') return value
  }

  for (const [rawKey, rawValue] of Object.entries(query)) {
    const cleanedKey = String(rawKey || '').trim().toLowerCase().replace(/^(amp;)+/, '')
    if (cleanedKey !== normalizedKey) continue
    const value = routeQueryValueToString(rawValue)
    if (value !== '') return value
  }
  return ''
}

const readRouteQueryFlag = (key: string): boolean => {
  const value = readRouteQueryValue(key).toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

const paymentReturnMarkers = ['epay_return', 'alipay_return', 'wechat_return', 'epusdt_return', 'tokenpay_return', 'okpay_return', 'pp_return', 'stripe_return']
const isGuest = computed(() => readRouteQueryFlag('guest'))
const orderNo = computed(() => {
  const orderNoQuery = readRouteQueryValue('order_no')
  if (orderNoQuery) return orderNoQuery
  return readRouteQueryValue('out_trade_no')
})
const hasGuestAuth = computed(() => Boolean(guestAuth.value.email && guestAuth.value.order_password))
const showGuestAuth = computed(() => isGuest.value && !hasGuestAuth.value)
const orderItems = computed(() => Array.isArray(order.value?.items) ? order.value.items : [])
const orderPaid = computed(() => ['paid', 'fulfilling', 'partially_delivered', 'delivered', 'completed'].includes(String(order.value?.status || '')))
const orderDetailLink = computed(() => isGuest.value ? `/guest/orders/${orderNo.value}` : `/orders/${orderNo.value}`)
const channels = computed(() => {
  const rows = Array.isArray(appStore.config?.payment_channels) ? appStore.config.payment_channels : []
  const allowedIds = order.value?.allowed_payment_channel_ids
  if (Array.isArray(allowedIds) && allowedIds.length > 0) {
    const allowed = new Set(allowedIds.map(Number))
    return rows.filter((channel: any) => allowed.has(Number(channel?.id)))
  }
  return rows
})
const interactionMode = computed(() => String(paymentResult.value?.interaction_mode || '').toLowerCase())
const payLink = computed(() => String(paymentResult.value?.pay_url || '').trim())
const qrContent = computed(() => String(paymentResult.value?.qr_code || '').trim() || (interactionMode.value === 'qr' ? payLink.value : ''))
const showQRCode = computed(() => interactionMode.value === 'qr' && Boolean(qrContent.value))
const paymentCurrency = computed(() => order.value?.currency || siteCurrency.value)
const isTelegramMiniApp = computed(() => telegramMiniAppStore.isMiniApp && telegramMiniAppStore.isReady)
const showTelegramPayHint = computed(() => isTelegramMiniApp.value && Boolean(payLink.value))
const { balancePaymentLabel } = useMallWalletBalance(paymentCurrency)
const mobilePrimaryLabel = computed(() => {
  if (orderPaid.value) return t('payment.backToOrders')
  if (paymentResult.value && interactionMode.value === 'redirect' && payLink.value) return t('payment.openPayLink')
  if (paymentResult.value) return t('payment.refreshStatus')
  return submitting.value ? t('payment.submitting') : t('payment.submitButton')
})
const mobilePrimaryDisabled = computed(() => {
  if (orderPaid.value) return false
  if (paymentResult.value) return false
  return submitting.value || (isGuest.value && channels.value.length === 0)
})

const channelName = (channel: any) => String(channel?.name || channel?.channel_name || channel?.channel_type || channel?.provider_type || '-')
const statusLabel = (status: string) => orderStatusLabel(t, status)
const formatMoney = (amount?: string, currency?: string) => {
  return formatMallMoney(amount, currency)
}
const formatDate = (raw?: string) => {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}

const openPayLink = (url = payLink.value) => {
  if (!url) return
  if (isTelegramMiniApp.value) {
    try {
      window.Telegram?.WebApp?.openLink?.(url)
    } catch {
      window.open(url, '_blank')
    }
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

const saveGuestAuth = () => {
  localStorage.setItem('guest_order_auth', JSON.stringify(guestAuth.value))
  loadOrder()
}

const readGuestAuth = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('guest_order_auth') || '{}')
    guestAuth.value = {
      email: String(saved.email || ''),
      order_password: String(saved.order_password || ''),
    }
  } catch {
    guestAuth.value = { email: '', order_password: '' }
  }
}

const buildPayRouteQuery = () => {
  const query: Record<string, string> = {}
  const resolvedOrderNo = String(order.value?.order_no || orderNo.value || '').trim()
  if (resolvedOrderNo) {
    query.order_no = resolvedOrderNo
  }
  if (isGuest.value) {
    query.guest = '1'
  }
  return query
}

const cleanPaymentReturnQuery = async () => {
  if (!orderNo.value) return
  await router.replace({
    path: route.path,
    query: buildPayRouteQuery(),
  })
}

const loadLatestPayment = async (autoOpenRedirect = true) => {
  if (!orderNo.value || orderPaid.value) return
  if (paymentResult.value) return
  if (isGuest.value && !hasGuestAuth.value) return
  try {
    const response = isGuest.value
      ? await guestOrderAPI.latestPayment({ order_no: orderNo.value, ...guestAuth.value })
      : await paymentAPI.latest({ order_no: orderNo.value })
    const data = response.data.data
    if (data?.pay_url || data?.qr_code) {
      paymentResult.value = data
      selectedChannelId.value = data.channel_id || selectedChannelId.value
      startPolling()
      if (autoOpenRedirect) {
        openMallRedirectPaymentLink(data, orderNo.value)
      }
    }
  } catch {
  }
}

const loadOrder = async (silent = false, autoOpenLatestPayment = true) => {
  if (!orderNo.value || showGuestAuth.value) return
  if (!silent) {
    loading.value = true
    error.value = ''
  }
  try {
    const response = isGuest.value
      ? await guestOrderAPI.detail(orderNo.value, guestAuth.value)
      : await userOrderAPI.detail(orderNo.value)
    order.value = response.data.data
    await loadLatestPayment(autoOpenLatestPayment)
    if (orderPaid.value) {
      stopPolling()
    } else if (String(order.value?.status || '') === 'pending_payment') {
      startPolling()
    }
  } catch (err: any) {
    if (!silent) {
      order.value = null
      error.value = err.message || t('payment.orderNotFound')
    }
  } finally {
    if (!silent) {
      loading.value = false
    }
  }
}

const createPayment = async () => {
  if (!orderNo.value) return
  if ((channels.value.length > 0 || !isGuest.value) && !selectedChannelId.value && !useBalance.value) {
    error.value = t('payment.selectChannelError')
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const response = isGuest.value
      ? await guestOrderAPI.createPayment({ order_no: orderNo.value, channel_id: selectedChannelId.value, ...guestAuth.value })
      : await paymentAPI.create({ order_no: orderNo.value, channel_id: selectedChannelId.value || undefined, use_balance: useBalance.value })
    const data = response.data.data || {}
    if (data.order_paid && !data.payment_id) {
      paymentResult.value = null
      await loadOrder()
      return
    }
    paymentResult.value = data
    openMallRedirectPaymentLink(data, orderNo.value)
    startPolling()
  } catch (err: any) {
    error.value = err.message || t('payment.createFailed')
  } finally {
    submitting.value = false
  }
}

const selectPaymentChannel = (channelID: number | string) => {
  selectedChannelId.value = Number(channelID)
  useBalance.value = false
}

const selectBalancePayment = () => {
  useBalance.value = !useBalance.value
  if (useBalance.value) selectedChannelId.value = null
}

const resetPayment = () => {
  paymentResult.value = null
  if (String(order.value?.status || '') !== 'pending_payment') {
    stopPolling()
  }
}

const handleMobilePrimaryAction = () => {
  if (orderPaid.value) {
    router.push(orderDetailLink.value)
    return
  }
  if (paymentResult.value && interactionMode.value === 'redirect' && payLink.value) {
    openPayLink()
    return
  }
  if (paymentResult.value) {
    loadOrder()
    return
  }
  createPayment()
}

const hasPaymentReturnMarker = () => paymentReturnMarkers.some(marker => readRouteQueryValue(marker).toLowerCase() === '1')

const captureOfficialPaymentIfNeeded = async () => {
  if (capturing.value) return false
  if (!paymentResult.value?.payment_id) return false
  if (!orderNo.value || !order.value || String(order.value.status || '') !== 'pending_payment') return false

  const providerType = String(paymentResult.value?.provider_type || '').toLowerCase()
  const channelType = String(paymentResult.value?.channel_type || '').toLowerCase()
  const isPaypalReturn = providerType === 'official' && channelType === 'paypal' && (
    readRouteQueryValue('pp_return').toLowerCase() === '1'
    || readRouteQueryValue('token') !== ''
    || readRouteQueryValue('payer_id') !== ''
    || readRouteQueryValue('PayerID') !== ''
  )
  const isStripeReturn = providerType === 'official' && channelType === 'stripe' && (
    readRouteQueryValue('stripe_return').toLowerCase() === '1'
    || readRouteQueryValue('session_id') !== ''
  )
  if (!isPaypalReturn && !isStripeReturn) return false

  if (isGuest.value && !hasGuestAuth.value) {
    error.value = t('payment.guestAuthRequired')
    return false
  }

  capturing.value = true
  error.value = ''
  try {
    if (isGuest.value) {
      await guestOrderAPI.capturePayment(Number(paymentResult.value.payment_id), {
        email: guestAuth.value.email,
        order_password: guestAuth.value.order_password,
      })
    } else {
      await paymentAPI.capture(Number(paymentResult.value.payment_id))
    }
    await loadOrder(true, false)
    await cleanPaymentReturnQuery()
    return true
  } catch (err: any) {
    error.value = err?.message || t('payment.captureFailed')
    return true
  } finally {
    capturing.value = false
  }
}

const syncPaymentReturnIfNeeded = async () => {
  if (returnSyncing || capturing.value) return
  if (!hasPaymentReturnMarker()) return
  if (!orderNo.value || showGuestAuth.value) return

  returnSyncing = true
  try {
    await loadOrder(true, false)
    await loadLatestPayment(false)
    const captured = await captureOfficialPaymentIfNeeded()
    if (!captured) {
      await cleanPaymentReturnQuery()
    }
  } finally {
    returnSyncing = false
  }
}

const refreshPaymentStatus = async () => {
  if (pollingRequestRunning || !orderNo.value || showGuestAuth.value || redirectingToOrderDetail) return
  pollingRequestRunning = true
  try {
    await loadOrder(true)
  } finally {
    pollingRequestRunning = false
  }
}

const startPolling = () => {
  if (pollTimer) return
  void refreshPaymentStatus()
  pollTimer = setInterval(() => {
    void refreshPaymentStatus()
  }, PAYMENT_POLL_INTERVAL_MS)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const refreshWhenPageActive = () => {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
  if (String(order.value?.status || '') !== 'pending_payment') return
  void refreshPaymentStatus()
}

watch(qrContent, async (content) => {
  if (!content) {
    qrImageUrl.value = ''
    return
  }
  if (content.startsWith('data:image/')) {
    qrImageUrl.value = content
    return
  }
  qrImageUrl.value = await QRCode.toDataURL(content, { width: 240, margin: 1, errorCorrectionLevel: 'M' })
}, { immediate: true })

watch(channels, (rows) => {
  if (!selectedChannelId.value) return
  if (rows.some((channel: any) => Number(channel.id) === Number(selectedChannelId.value))) return
  selectedChannelId.value = null
}, { immediate: true })

watch(orderPaid, (paid) => {
  if (!paid || redirectingToOrderDetail || !order.value) return
  redirectingToOrderDetail = true
  stopPolling()
  router.replace(orderDetailLink.value)
})

watch(
  () => [paymentResult.value?.payment_id, route.fullPath, order.value?.status, hasGuestAuth.value],
  () => {
    void captureOfficialPaymentIfNeeded()
    void syncPaymentReturnIfNeeded()
  },
  { immediate: true }
)

onMounted(() => {
  readGuestAuth()
  window.addEventListener('focus', refreshWhenPageActive)
  document.addEventListener('visibilitychange', refreshWhenPageActive)
  loadOrder()
})

onUnmounted(() => {
  stopPolling()
  window.removeEventListener('focus', refreshWhenPageActive)
  document.removeEventListener('visibilitychange', refreshWhenPageActive)
})
</script>
