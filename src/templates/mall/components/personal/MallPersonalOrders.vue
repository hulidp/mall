<template>
  <div class="flex min-h-0 flex-col gap-2 overflow-visible lg:h-full lg:gap-3 lg:overflow-hidden">
    <section class="shrink-0 border-y border-gray-100 bg-white p-2.5 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-4 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
            <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('orders.title') }}</h2>
          <p class="mt-0.5 break-words text-xs leading-5 text-gray-500 dark:text-gray-400">{{ t('orders.subtitle') }}</p>
        </div>
      </div>

      <div class="mt-2 flex rounded-full bg-gray-100 p-1 dark:bg-white/5 sm:mt-3">
        <button
          type="button"
          class="h-7 flex-1 rounded-full text-sm font-bold transition sm:h-8"
          :class="activeTab === 'product' ? ' text-white shadow-sm' : 'text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'" style="background-color: var(--ui-accent);"
          @click="switchTab('product')"
        >
          {{ t('orders.tabs.product') }}
        </button>
        <button
          type="button"
          class="h-7 flex-1 rounded-full text-sm font-bold transition sm:h-8"
          :class="activeTab === 'recharge' ? ' text-white shadow-sm' : 'text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'" style="background-color: var(--ui-accent);"
          @click="switchTab('recharge')"
        >
          {{ t('orders.tabs.recharge') }}
        </button>
      </div>
    </section>

    <section class="shrink-0 border-y border-gray-100 bg-white p-2 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-3 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end lg:gap-3">
        <label class="block">
          <span class="mb-1 block text-xs font-bold text-gray-500">{{ keywordLabel }}</span>
          <input
            v-model.trim="filters.keyword"
            class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus: dark:border-white/10 dark:bg-neutral-900 sm:h-10" style="border-color: var(--ui-accent);"
            :placeholder="keywordPlaceholder"
            @keyup.enter="applyFilters"
          />
        </label>
        <label class="block">
          <span class="mb-1 block text-xs font-bold text-gray-500">{{ t('orders.filters.status') }}</span>
          <select
            v-model="filters.status"
            class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus: dark:border-white/10 dark:bg-neutral-900 sm:h-10" style="border-color: var(--ui-accent);"
          >
            <option v-for="item in statusOptions" :key="item.value || 'all'" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
        <div class="grid grid-cols-2 gap-2 lg:flex">
          <button type="button" class="h-9 rounded-full px-5 text-sm font-black text-white sm:h-10" style="background-color: var(--ui-accent);" @click="applyFilters">
            {{ t('orders.filters.search') }}
          </button>
          <button type="button" class="h-9 rounded-full border border-gray-200 px-4 text-sm font-bold hover: dark:border-white/10 sm:h-10" style="color: var(--ui-accent);" @click="resetFilters">
            {{ t('orders.filters.reset') }}
          </button>
        </div>
      </div>
    </section>

    <section class="flex min-h-0 flex-1 flex-col border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="shrink-0 border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-2.5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-base font-black text-gray-950 dark:text-white">
              {{ activeTab === 'product' ? t('orders.tabs.product') : t('orders.tabs.recharge') }}
            </h3>
            <p class="mt-0.5 break-words text-xs leading-5 text-gray-500">{{ t('orders.subtitle') }}</p>
          </div>
          <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            <span class="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-left">
              {{ t('orders.totalRecords', { total: activePagination.total }) }}
            </span>
            <span class="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-left">
              {{ t('orders.pageInfo', { page: activePagination.page, total: safeActiveTotalPages }) }}
            </span>
            <button
              type="button"
              class="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
              :disabled="loading || activePagination.page <= 1"
              @click="changePage(activePagination.page - 1)"
            >
              {{ t('pagination.previous') }}
            </button>
            <button
              type="button"
              class="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
              :disabled="loading || activePagination.page >= safeActiveTotalPages"
              @click="changePage(activePagination.page + 1)"
            >
              {{ t('pagination.next') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="min-h-0 flex-1 space-y-2 p-4">
        <div v-for="idx in activePageSize" :key="idx" class="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"></div>
      </div>

      <div v-else-if="activeRows.length === 0" class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
          <ShoppingBagIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 class="text-base font-black text-gray-950 dark:text-white">{{ activeTab === 'product' ? t('orders.empty') : t('orders.rechargeEmpty') }}</h3>
      </div>

      <div v-else class="flex min-h-0 flex-1 flex-col">
        <div class="hidden shrink-0 gap-2 grid-cols-[minmax(0,1fr)_150px_150px_110px] border-b border-gray-100 bg-gray-50 px-5 py-2 text-xs font-bold text-gray-500 dark:border-white/10 dark:bg-white/5 lg:grid">
          <div>{{ activeTab === 'product' ? t('orders.orderNo') : t('personalCenter.wallet.rechargeNoLabel') }}</div>
          <div class="text-center">{{ t('orders.filters.status') }}</div>
          <div class="text-right">{{ t('orderDetail.amountTotal') }}</div>
          <div class="text-right">{{ t('common.viewDetails') }}</div>
        </div>
        <div class="min-h-0 flex-1 divide-y divide-gray-100 dark:divide-white/10">
          <router-link
            v-for="row in activeRows"
            :key="row.rowNo"
            :to="row.detailPath"
            class="grid min-h-10 gap-1 px-3 py-1.5 transition hover:bg-gray-50 dark:hover:bg-white/5 sm:px-5 sm:py-2 lg:grid-cols-[minmax(0,1fr)_150px_150px_110px] lg:items-center"
          >
            <div class="min-w-0">
              <div class="break-all font-mono text-sm font-black leading-5 text-gray-950 dark:text-white">{{ row.rowNo }}</div>
              <div class="mt-0.5 text-xs text-gray-500">{{ formatDate(row.created_at) }}</div>
            </div>
            <div class="lg:text-center">
              <span class="inline-flex rounded-full px-3 py-1 text-xs font-bold" :class="row.statusClass">
                {{ row.statusLabel }}
              </span>
            </div>
            <div class="text-base font-black lg:text-right" style="color: var(--ui-accent);">{{ formatMoney(row.amount, row.currency) }}</div>
            <div class="text-xs font-bold text-gray-500 lg:text-right">{{ t('common.viewDetails') }}</div>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
import { userOrderAPI, walletAPI } from '../../../../api'
import { orderStatusLabel } from '../../../../utils/status'
import { formatMallMoney, listData, paginationData } from '../../utils'

const { t } = useI18n()

const activeTab = ref<'product' | 'recharge'>('product')
const loading = ref(false)
const orders = ref<any[]>([])
const rechargeOrders = ref<any[]>([])
const filters = reactive({ keyword: '', status: '' })
const orderPagination = ref({ page: 1, page_size: 9, total: 0, total_page: 1 })
const rechargePagination = ref({ page: 1, page_size: 9, total: 0, total_page: 1 })

const orderStatusOptions = computed(() => [
  { value: '', label: t('orders.filters.statusAll') },
  { value: 'pending_payment', label: t('order.status.pending_payment') },
  { value: 'paid', label: t('order.status.paid') },
  { value: 'fulfilling', label: t('order.status.fulfilling') },
  { value: 'partially_delivered', label: t('order.status.partially_delivered') },
  { value: 'delivered', label: t('order.status.delivered') },
  { value: 'completed', label: t('order.status.completed') },
  { value: 'refunded', label: t('order.status.refunded') },
  { value: 'expired', label: t('order.status.expired') },
  { value: 'canceled', label: t('order.status.canceled') },
])
const rechargeStatusOptions = computed(() => [
  { value: '', label: t('orders.filters.statusAll') },
  { value: 'pending', label: t('personalCenter.wallet.rechargeStatus.pending') },
  { value: 'success', label: t('personalCenter.wallet.rechargeStatus.success') },
  { value: 'failed', label: t('personalCenter.wallet.rechargeStatus.failed') },
  { value: 'expired', label: t('personalCenter.wallet.rechargeStatus.expired') },
])
const statusOptions = computed(() => activeTab.value === 'product' ? orderStatusOptions.value : rechargeStatusOptions.value)
const keywordLabel = computed(() => activeTab.value === 'product' ? t('orders.filters.keyword') : t('orders.rechargeFilters.keyword'))
const keywordPlaceholder = computed(() => activeTab.value === 'product' ? t('orders.filters.orderNoPlaceholder') : t('orders.rechargeFilters.rechargeNoPlaceholder'))
const activePagination = computed(() => activeTab.value === 'product' ? orderPagination.value : rechargePagination.value)
const activePageSize = computed(() => activePagination.value.page_size || 9)
const safeActiveTotalPages = computed(() => Math.max(1, Number(activePagination.value.total_page || 1)))

const badgeClass = (status?: string) => {
  const value = String(status || '').toLowerCase()
  if (['paid', 'delivered', 'completed', 'success'].includes(value)) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  if (['pending_payment', 'pending', 'fulfilling', 'partially_delivered'].includes(value)) return 'bg-orange-50 text-[#ff5000] '
  if (['expired', 'failed', 'refunded', 'canceled'].includes(value)) return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
  return 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
}

const activeRows = computed(() => {
  if (activeTab.value === 'product') {
    return orders.value.map((order) => ({
      rowNo: String(order.order_no || ''),
      detailPath: `/orders/${encodeURIComponent(String(order.order_no || ''))}`,
      amount: order.total_amount,
      currency: order.currency,
      statusLabel: orderStatusLabel(t, order.status),
      statusClass: badgeClass(order.status),
      created_at: order.created_at,
    }))
  }
  return rechargeOrders.value.map((order) => ({
    rowNo: String(order.recharge_no || ''),
    detailPath: `/recharge-orders/${encodeURIComponent(String(order.recharge_no || ''))}`,
    amount: order.payable_amount || order.amount,
    currency: order.currency,
    statusLabel: rechargeStatusOptions.value.find((item) => item.value === order.status)?.label || order.status || '-',
    statusClass: badgeClass(order.status),
    created_at: order.created_at,
  }))
})

const loadOrders = async (page = 1) => {
  loading.value = true
  try {
    const response = await userOrderAPI.list({
      page,
      page_size: orderPagination.value.page_size,
      status: filters.status || undefined,
      order_no: filters.keyword || undefined,
    })
    orders.value = listData(response)
    orderPagination.value = paginationData(response) || orderPagination.value
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

const loadRechargeOrders = async (page = 1) => {
  loading.value = true
  try {
    const response = await walletAPI.rechargeOrders({
      page,
      page_size: rechargePagination.value.page_size,
      status: filters.status || undefined,
      recharge_no: filters.keyword || undefined,
    })
    rechargeOrders.value = listData(response)
    rechargePagination.value = paginationData(response) || rechargePagination.value
  } catch {
    rechargeOrders.value = []
  } finally {
    loading.value = false
  }
}

const loadActive = (page = 1) => activeTab.value === 'product' ? loadOrders(page) : loadRechargeOrders(page)

const switchTab = (tab: 'product' | 'recharge') => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  filters.keyword = ''
  filters.status = ''
  loadActive(1)
}

const applyFilters = () => loadActive(1)
const resetFilters = () => {
  filters.keyword = ''
  filters.status = ''
  loadActive(1)
}
const changePage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), safeActiveTotalPages.value)
  if (nextPage === activePagination.value.page || loading.value) return
  loadActive(nextPage)
}
const formatMoney = (amount?: string, currency?: string) => formatMallMoney(amount, currency)
const formatDate = (raw?: string) => {
  if (!raw) return '-'
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? raw : date.toLocaleString()
}

onMounted(() => loadOrders(1))
</script>
