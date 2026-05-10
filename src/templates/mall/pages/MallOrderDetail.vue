<template>
  <div class="mx-auto max-w-[1472px] px-0 pb-6 pt-2 sm:px-6 sm:pt-3 lg:px-8">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-3 px-3 sm:mb-4 sm:px-0">
      <div>
        <h1 class="text-xl font-black leading-tight text-gray-950 dark:text-white sm:text-[26px]">{{ guest ? t('guestOrderDetail.title') : t('orderDetail.title') }}</h1>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{{ t('orderDetail.subtitle') }}</p>
      </div>
    </div>

    <div v-if="showGuestAuth" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="border-b border-gray-100 px-3 py-2.5 dark:border-white/10 sm:px-5 sm:py-4">
        <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('guestOrderDetail.authTitle') }}</h2>
      </div>
      <div class="p-3 sm:p-5">
        <div class="grid gap-3 sm:grid-cols-2">
          <input v-model="guestAuth.email" type="email" class="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('guestOrders.emailPlaceholder')" />
          <input v-model="guestAuth.order_password" type="password" class="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900" :placeholder="t('guestOrders.passwordPlaceholder')" />
        </div>
        <button class="mt-3 h-10 rounded-xl px-5 text-sm font-black text-white sm:mt-4 sm:h-11 sm:px-6" style="background-color: var(--ui-accent);" @click="saveGuestAuth">
          {{ t('guestOrderDetail.authSubmit') }}
        </button>
      </div>
    </div>

    <MallEmptyState v-else-if="!loading && !order" :title="t('orderDetail.notFound')" action-to="/products" :action-label="t('emptyState.goProducts')" />

    <div v-else-if="order" class="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_368px] lg:gap-4">
      <section class="space-y-2 sm:space-y-4">
        <div class="overflow-hidden border-y border-gray-100 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.04)] ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="border-b border-gray-100 px-3 py-2.5 dark:border-white/10 sm:px-5 sm:py-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('orders.orderNo') }}</div>
                <div class="mt-1 font-mono text-sm font-bold text-gray-950 dark:text-white">{{ order.order_no }}</div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ t('orderDetail.createdAtLabel') }}: {{ formatDate(order.created_at) }}</div>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-bold text-orange-600" style="background-color: var(--ui-accent-soft);">
                {{ statusLabel(order.status) }}
              </span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-px bg-gray-100 px-3 py-2 sm:gap-3 sm:bg-transparent sm:p-5 dark:bg-white/10 sm:dark:bg-transparent">
            <div class="bg-[#fbfaf8] px-2 py-2 text-sm first:rounded-l-xl dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountOriginal') }}</div>
              <div class="mt-1 break-all text-sm font-bold text-gray-950 dark:text-white sm:text-base">{{ formatMoney(order.original_amount, order.currency) }}</div>
            </div>
            <div class="bg-[#fbfaf8] px-2 py-2 text-sm dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountDiscount') }}</div>
              <div class="mt-1 break-all text-sm font-bold text-gray-950 dark:text-white sm:text-base">{{ formatMoney(order.discount_amount, order.currency) }}</div>
            </div>
            <div class="bg-[#fbfaf8] px-2 py-2 text-sm last:rounded-r-xl dark:bg-white/[0.04] sm:rounded-xl sm:p-4">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountTotal') }}</div>
              <div class="mt-1 break-all text-sm font-black sm:text-base" style="color: var(--ui-accent);">{{ formatMoney(order.total_amount, order.currency) }}</div>
            </div>
          </div>
        </div>

        <section v-if="fulfillmentRows.length" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 dark:border-white/10 sm:px-5 sm:py-3">
            <div>
              <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ cardSecretTitle }}</h2>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1">{{ t('orderDetail.fulfillmentStatus') }}: {{ fulfillmentRowsStatusText }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-if="copyableFulfillmentText"
                type="button"
                class="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-bold text-white transition" style="background-color: var(--ui-accent);"
                @click="copyAllFulfillment"
              >
                {{ copiedKey === 'all' ? t('orderDetail.fulfillmentCopied') : copyCardSecretLabel }}
              </button>
            </div>
          </div>
          <div class="space-y-2 p-2.5 sm:space-y-3 sm:p-5">
            <div
              v-for="(row, index) in fulfillmentRows"
              :key="row.key"
              class="rounded-lg border border-orange-100 /30 p-2.5 dark:border-orange-500/20 sm:rounded-xl sm:p-4" style="background-color: var(--ui-accent-soft);"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-black text-gray-950 dark:text-white">{{ fulfillmentRowTitle(index) }}</div>
                  <div class="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{{ t('orderDetail.fulfillmentType') }}: {{ fulfillmentTypeLabelText(row.fulfillment.type) }}</span>
                    <span>{{ t('orderDetail.fulfillmentStatus') }}: {{ fulfillmentStatusLabelText(row.fulfillment.status) }}</span>
                    <span v-if="isFulfillmentTruncated(row.fulfillment)">{{ t('orderDetail.fulfillmentTotalLines', { count: row.fulfillment.payload_line_count }) }}</span>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    v-if="fulfillmentCopyText(row.fulfillment)"
                    type="button"
                    class="inline-flex h-8 items-center rounded-full border border-orange-200 bg-white px-3 text-xs font-bold transition dark:border-orange-500/30 dark:bg-neutral-950" style="color: var(--ui-accent);"
                    @click="copyFulfillmentRow(row)"
                  >
                    {{ copiedKey === row.key ? t('orderDetail.fulfillmentCopied') : copyCardSecretLabel }}
                  </button>
                  <button
                    v-if="isFulfillmentTruncated(row.fulfillment)"
                    type="button"
                    class="inline-flex h-8 items-center rounded-full border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition disabled:opacity-50 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-200"
                    :disabled="downloading"
                    @click="downloadFulfillment(row.orderNo)"
                  >
                    {{ downloading ? t('orderDetail.fulfillmentDownloading') : t('orderDetail.fulfillmentDownload') }}
                  </button>
                </div>
              </div>

              <div v-if="isFulfillmentTruncated(row.fulfillment)" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                {{ t('orderDetail.fulfillmentTruncatedHint') }}
              </div>

              <pre
                v-if="fulfillmentDisplayText(row.fulfillment)"
                class="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-orange-100 bg-white p-2.5 text-xs leading-5 text-gray-800 dark:border-orange-500/20 dark:bg-neutral-950 dark:text-gray-100 sm:mt-3 sm:max-h-72 sm:rounded-xl sm:p-4 sm:text-sm sm:leading-6"
              >{{ fulfillmentDisplayText(row.fulfillment) }}</pre>
              <div v-else class="mt-3 rounded-xl border border-dashed border-orange-100 bg-white px-4 py-5 text-sm text-gray-500 dark:border-orange-500/20 dark:bg-neutral-950 dark:text-gray-400">
                {{ t('orderDetail.childFulfillmentEmpty') }}
              </div>

              <div v-if="row.fulfillment?.status === 'delivered' && instructionBlocks(row.items).length" class="mt-3 space-y-3">
                <div
                  v-for="(block, blockIndex) in instructionBlocks(row.items)"
                  :key="`${row.key}-instructions-${blockIndex}`"
                  class="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                >
                  <div class="text-sm font-black text-emerald-700 dark:text-emerald-300">{{ t('orderDetail.instructionsTitle') }}</div>
                  <div v-if="block.title" class="mt-1 text-xs text-emerald-600/80 dark:text-emerald-200/70">{{ block.title }}</div>
                  <div class="mall-rich-text mt-3 max-w-none break-words text-sm leading-7 text-gray-800 dark:text-gray-100" v-html="block.html"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
          <div class="px-3 py-2 sm:px-5 sm:py-3">
            <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('orderDetail.itemsTitle') }}</h2>
          </div>
          <div class="hidden gap-4 grid-cols-[minmax(0,1fr)_180px_100px_136px_128px] border-y border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500 dark:border-white/10 dark:bg-white/[0.04] lg:grid">
            <div>{{ t('checkout.orderProductLabel') }}</div>
            <div class="flex items-center justify-center text-center">{{ t('orderDetail.itemSkuLabel') }}</div>
            <div class="flex items-center justify-center text-center">{{ t('orderDetail.quantityLabel') }}</div>
            <div class="flex items-center justify-center text-center">{{ t('orderDetail.itemFulfillmentLabel') }}</div>
            <div class="flex items-center justify-center text-center">{{ t('checkout.priceLabel') }}</div>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-white/10">
            <div v-for="(item, index) in orderItems" :key="index" class="grid gap-1.5 px-3 py-2 sm:gap-4 sm:px-5 sm:py-4 lg:grid-cols-[minmax(0,1fr)_180px_100px_136px_128px] lg:items-center">
              <div class="min-w-0">
                <div class="line-clamp-1 text-sm font-bold leading-5 text-gray-950 dark:text-white sm:line-clamp-2 sm:leading-6">{{ getLocalizedText(item.title) }}</div>
              </div>
              <div class="grid grid-cols-[minmax(0,1fr)_44px_74px_auto] items-center gap-1.5 rounded-xl bg-[#f8f5f0] px-2.5 py-2 text-xs ring-1 ring-black/[0.03] dark:bg-white/[0.04] dark:ring-white/10 lg:hidden">
                <div class="min-w-0">
                  <div class="text-[11px] font-semibold text-gray-400">{{ t('orderDetail.itemSkuLabel') }}</div>
                  <div class="mt-0.5 truncate font-bold text-gray-700 dark:text-gray-200">{{ skuText(item) || t('productDetail.skuFallback') }}</div>
                </div>
                <div class="text-center">
                  <div class="text-[11px] font-semibold text-gray-400">{{ t('orderDetail.quantityLabel') }}</div>
                  <div class="mt-0.5 font-black text-gray-950 dark:text-white">{{ item.quantity }}</div>
                </div>
                <div class="text-center">
                  <div class="text-[11px] font-semibold text-gray-400">{{ t('orderDetail.itemFulfillmentLabel') }}</div>
                  <div class="mt-0.5 truncate rounded-full px-1.5 py-0.5 text-[11px] font-semibold" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
                    {{ fulfillmentTypeLabelText(item.fulfillment_type) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-[11px] font-semibold text-gray-400">{{ t('checkout.priceLabel') }}</div>
                  <div class="mt-0.5 font-black" style="color: var(--ui-accent);">{{ formatMoney(item.total_price, order.currency) }}</div>
                </div>
              </div>
              <div class="hidden text-sm text-gray-600 dark:text-gray-300 lg:flex lg:min-h-16 lg:items-center lg:justify-center lg:text-center">
                <div class="leading-6">{{ skuText(item) || t('productDetail.skuFallback') }}</div>
              </div>
              <div class="hidden items-center justify-between text-sm lg:flex lg:min-h-16 lg:justify-center lg:text-center">
                <div class="font-semibold text-gray-950 dark:text-white">{{ item.quantity }}</div>
              </div>
              <div class="hidden items-center justify-between text-sm lg:flex lg:min-h-16 lg:justify-center lg:text-center">
                <div class="rounded-full px-2 py-0.5 text-xs font-semibold" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
                  {{ fulfillmentTypeLabelText(item.fulfillment_type) }}
                </div>
              </div>
              <div class="hidden items-center justify-between lg:flex lg:min-h-16 lg:justify-center">
                <div class="text-sm font-black" style="color: var(--ui-accent);">{{ formatMoney(item.total_price, order.currency) }}</div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <aside class="h-fit border-y border-gray-100 bg-white p-3 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl sm:border-0 sm:p-4 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10 lg:sticky lg:top-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('checkout.paymentDetailLabel') }}</h2>
          <span class="rounded-full px-3 py-1 text-xs font-bold text-orange-600" style="background-color: var(--ui-accent-soft);">
            {{ statusLabel(order.status) }}
          </span>
        </div>

        <div class="mt-3 space-y-2 rounded-xl bg-[#fbfaf8] p-2.5 text-sm ring-1 ring-black/[0.03] dark:bg-white/[0.04] dark:ring-white/10 sm:mt-5 sm:space-y-3 sm:bg-transparent sm:p-0 sm:ring-0">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountOriginal') }}</span>
            <span class="font-bold text-gray-950 dark:text-white">{{ formatMoney(order.original_amount, order.currency) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountDiscount') }}</span>
            <span class="font-bold text-gray-950 dark:text-white">{{ formatMoney(order.discount_amount, order.currency) }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-white/10 sm:pt-3">
            <span class="text-gray-500 dark:text-gray-400">{{ t('orderDetail.amountTotal') }}</span>
            <span class="text-xl font-black" style="color: var(--ui-accent);">{{ formatMoney(order.total_amount, order.currency) }}</span>
          </div>
        </div>

        <router-link
          v-if="order.status === 'pending_payment'"
          class="mt-5 flex h-12 items-center justify-center rounded-xl text-sm font-black text-white transition" style="background-color: var(--ui-accent);"
          :to="payLink"
        >
          {{ t('orderDetail.payNow') }}
        </router-link>
        <router-link
          class="mt-3 flex h-11 items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold dark:border-white/10"
          :to="guest ? '/guest/orders' : '/me/orders'"
        >
          {{ t('payment.backToOrders') }}
        </router-link>
        <router-link
          class="mt-3 flex h-11 items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold dark:border-white/10"
          to="/"
        >
          {{ t('notFoundPage.backHome') }}
        </router-link>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { guestOrderAPI, userOrderAPI } from '../../../api'
import { useAppStore } from '../../../stores/app'
import { orderStatusLabel } from '../../../utils/status'
import { fulfillmentStatusLabel, fulfillmentTypeLabel } from '../../../utils/fulfillment'
import { buildSkuDisplayTextFromSnapshot } from '../../../utils/sku'
import { useOrderFulfillmentPolling } from '../../../composables/useOrderFulfillmentPolling'
import { useLocalized } from '../../../composables/useProduct'
import { copyText } from '../../../utils/clipboard'
import { processHtmlForDisplay } from '../../../utils/content'
import { formatMallMoney } from '../utils'
import MallEmptyState from '../components/MallEmptyState.vue'

const props = defineProps<{
  guest?: boolean
}>()

const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()
const { getLocalizedText } = useLocalized()

const loading = ref(true)
const order = ref<any>(null)
const guestAuth = ref({ email: '', order_password: '' })
const downloading = ref(false)
const copiedKey = ref('')
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const guest = computed(() => Boolean(props.guest))
const orderNo = computed(() => String(route.params.order_no || '').trim())
const hasGuestAuth = computed(() => Boolean(guestAuth.value.email && guestAuth.value.order_password))
const showGuestAuth = computed(() => guest.value && !hasGuestAuth.value)
const orderItems = computed(() => Array.isArray(order.value?.items) ? order.value.items : [])
const payLink = computed(() => `/pay?order_no=${encodeURIComponent(orderNo.value)}${guest.value ? '&guest=1' : ''}`)
const cardSecretTitle = computed(() => {
  return t('orderDetail.cardSecretTitle')
})
const copyCardSecretLabel = computed(() => {
  return t('orderDetail.copyCardSecret')
})
type FulfillmentRow = {
  key: string
  fulfillment: any
  orderNo: string
  items: any[]
}

const fulfillmentRows = computed(() => {
  if (!order.value) return []
  const rows: FulfillmentRow[] = []
  if (order.value.fulfillment) {
    rows.push({
      key: `order-${order.value.order_no || orderNo.value}`,
      fulfillment: order.value.fulfillment,
      orderNo: String(order.value.order_no || orderNo.value),
      items: orderItems.value,
    })
  }
  const children = Array.isArray(order.value.children) ? order.value.children : []
  children.forEach((child: any, index: number) => {
    if (!child?.fulfillment) return
    rows.push({
      key: `delivery-${child.order_no || child.id || index}`,
      fulfillment: child.fulfillment,
      orderNo: String(child.order_no || order.value.order_no || orderNo.value),
      items: Array.isArray(child.items) ? child.items : [],
    })
  })
  return rows
})
const fulfillmentRowsStatusText = computed(() => {
  const statuses = fulfillmentRows.value
    .map((row) => fulfillmentStatusLabelText(row.fulfillment?.status))
    .filter(Boolean)
  return Array.from(new Set(statuses)).join(' / ') || '-'
})
const copyableFulfillmentText = computed(() => fulfillmentRows.value
  .map((row) => fulfillmentCopyText(row.fulfillment))
  .filter(Boolean)
  .join('\n\n'))

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

const saveGuestAuth = () => {
  localStorage.setItem('guest_order_auth', JSON.stringify(guestAuth.value))
  loadOrder()
}

const loadOrder = async (options: { silent?: boolean } = {}) => {
  if (!orderNo.value || showGuestAuth.value) return
  if (!options.silent) loading.value = true
  try {
    const response = guest.value
      ? await guestOrderAPI.detail(orderNo.value, guestAuth.value)
      : await userOrderAPI.detail(orderNo.value)
    order.value = response.data.data
  } catch {
    order.value = null
  } finally {
    if (!options.silent) loading.value = false
    syncFulfillmentPolling()
  }
}

const { syncFulfillmentPolling, stopFulfillmentPolling } = useOrderFulfillmentPolling(order, () => loadOrder({ silent: true }))

const statusLabel = (status: string) => orderStatusLabel(t, status)
const fulfillmentTypeLabelText = (type: string) => fulfillmentTypeLabel(t, type, 'orderDetail')
const fulfillmentStatusLabelText = (status: string) => fulfillmentStatusLabel(t, status, 'orderDetail')
const skuText = (item: any) => buildSkuDisplayTextFromSnapshot(item?.sku_snapshot, {
  locale: appStore.locale,
  fallback: t('productDetail.skuFallback'),
})
const formatMoney = (amount?: string, currency?: string) => {
  return formatMallMoney(amount, currency)
}
const formatDate = (raw?: string) => {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}
const instructionText = (instructions: any) => {
  if (!instructions) return ''
  if (typeof instructions === 'string') return instructions
  return getLocalizedText(instructions)
}
const instructionBlocks = (items: any): Array<{ title: string; html: string }> => {
  if (!Array.isArray(items)) return []
  const seen = new Set<string>()
  const blocks: Array<{ title: string; html: string }> = []
  for (const item of items) {
    const raw = String(instructionText(item?.instructions) || '').trim()
    if (!raw || seen.has(raw)) continue
    const html = processHtmlForDisplay(raw)
    if (!html) continue
    seen.add(raw)
    blocks.push({
      title: getLocalizedText(item?.title),
      html,
    })
  }
  return blocks
}
const isFulfillmentTruncated = (fulfillment: any) => Number(fulfillment?.payload_line_count || 0) > 100
const fulfillmentRowTitle = (index: number) => {
  if (fulfillmentRows.value.length <= 1) return cardSecretTitle.value
  return `${cardSecretTitle.value} ${index + 1}`
}
const fulfillmentDeliveryLines = (fulfillment: any) => {
  const deliveryData = fulfillment?.delivery_data || fulfillment?.logistics
  const lines: string[] = []
  if (deliveryData && typeof deliveryData === 'object') {
    const note = String(deliveryData.note || '').trim()
    if (note) lines.push(note)
    const entries = Array.isArray(deliveryData.entries) ? deliveryData.entries : []
    entries.forEach((entry: any) => {
      const key = String(entry?.key || '').trim()
      const value = String(entry?.value || '').trim()
      if (!key && !value) return
      if (!key) lines.push(value)
      else if (!value) lines.push(key)
      else lines.push(`${key}: ${value}`)
    })
  }
  return lines
}
const fulfillmentDisplayText = (fulfillment: any) => {
  const lines = fulfillmentDeliveryLines(fulfillment)
  if (lines.length > 0) return lines.join('\n')
  return String(fulfillment?.payload || '').trim()
}
const fulfillmentCopyText = (fulfillment: any) => {
  if (isFulfillmentTruncated(fulfillment)) return ''
  return fulfillmentDisplayText(fulfillment)
}
const markCopied = (key: string) => {
  copiedKey.value = key
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copiedKey.value = ''
  }, 1500)
}
const copyFulfillmentRow = async (row: { key: string; fulfillment: any }) => {
  const text = fulfillmentCopyText(row.fulfillment)
  if (!text) return
  await copyText(text)
  markCopied(row.key)
}
const copyAllFulfillment = async () => {
  if (!copyableFulfillmentText.value) return
  await copyText(copyableFulfillmentText.value)
  markCopied('all')
}

const downloadFulfillment = async (targetOrderNo: string) => {
  if (downloading.value) return
  downloading.value = true
  try {
    const response = guest.value
      ? await guestOrderAPI.downloadFulfillment(targetOrderNo, guestAuth.value)
      : await userOrderAPI.downloadFulfillment(targetOrderNo)
    const blob = new Blob([response.data], { type: 'text/plain; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fulfillment-${targetOrderNo}.txt`
    link.click()
    URL.revokeObjectURL(url)
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  readGuestAuth()
  loadOrder()
})

onUnmounted(stopFulfillmentPolling)
onUnmounted(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>
