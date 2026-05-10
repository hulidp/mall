<template>
  <div class="flex min-h-0 flex-col gap-3 overflow-visible lg:h-full lg:overflow-hidden">
    <section class="shrink-0 border-y border-gray-100 bg-white p-4 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-5 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-lg font-black text-gray-950 dark:text-white">{{ t('personalCenter.affiliate.title') }}</h2>
          <p class="mt-0.5 break-words text-xs leading-5 text-gray-500 dark:text-gray-400">{{ t('personalCenter.affiliate.subtitle') }}</p>
        </div>
      </div>

      <div v-if="panelAlert" class="mt-3 rounded-xl border px-4 py-2 text-sm" :class="mallAlertClass(panelAlert.level)">
        {{ panelAlert.message }}
      </div>

      <div v-if="loading" class="mt-3 grid gap-3 md:grid-cols-3">
        <div v-for="idx in 3" :key="idx" class="h-[72px] animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5"></div>
      </div>

      <div v-else-if="!dashboard?.opened" class="mt-3 border-y border-dashed border-gray-200 py-4 dark:border-white/10 sm:rounded-2xl sm:border sm:p-4">
        <p class="text-sm text-gray-500">{{ t('personalCenter.affiliate.notOpened') }}</p>
        <button
          type="button"
          :disabled="opening"
          class="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" style="background-color: var(--ui-accent);"
          @click="openAffiliate"
        >
          {{ opening ? t('personalCenter.affiliate.opening') : t('personalCenter.affiliate.openButton') }}
        </button>
      </div>

      <template v-else>
        <div class="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <div class="col-span-2 min-w-0 rounded-2xl bg-gray-50 p-3 dark:bg-white/5 md:col-span-2">
            <div class="text-xs font-bold text-gray-500">{{ t('personalCenter.affiliate.affiliateCode') }}</div>
            <div class="mt-1 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
              <code class="min-w-0 break-all rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-black dark:border-white/10 dark:bg-neutral-900">{{ dashboard.affiliate_code || '-' }}</code>
              <button type="button" class="h-9 w-full rounded-full border border-gray-200 px-3 text-xs font-bold hover: dark:border-white/10 sm:h-auto sm:w-auto sm:py-1.5" style="color: var(--ui-accent);" @click="copyPromotionUrl">
                {{ t('personalCenter.affiliate.copyPromotionUrl') }}
              </button>
            </div>
            <div class="mt-2 break-all text-xs leading-5 text-gray-500">{{ promotionUrl }}</div>
          </div>
          <StatCard :label="t('personalCenter.affiliate.conversionRate')" :value="conversionRateText" />
          <StatCard :label="t('personalCenter.affiliate.pendingCommission')" :value="formatMoney(dashboard.pending_commission)" />
          <StatCard :label="t('personalCenter.affiliate.availableCommission')" :value="formatMoney(dashboard.available_commission)" />
          <StatCard :label="t('personalCenter.affiliate.withdrawnCommission')" :value="formatMoney(dashboard.withdrawn_commission)" />
          <StatCard :label="t('personalCenter.affiliate.conversionDetail', { clicks: dashboard.click_count || 0, orders: dashboard.valid_order_count || 0 })" :value="String(dashboard.valid_order_count || 0)" />
        </div>
      </template>
    </section>

    <section v-if="dashboard?.opened" class="shrink-0 border-y border-gray-100 bg-white p-4 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-5 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <h3 class="text-base font-black text-gray-950 dark:text-white">{{ t('personalCenter.affiliate.withdrawTitle') }}</h3>
      <form class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" @submit.prevent="handleApplyWithdraw">
        <input v-model.trim="withdrawForm.amount" class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus: dark:border-white/10 dark:bg-neutral-900" style="border-color: var(--ui-accent);" :placeholder="t('personalCenter.affiliate.withdrawAmountPlaceholder')" />
        <select v-if="channelOptions.length > 0" v-model="withdrawForm.channel" class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus: dark:border-white/10 dark:bg-neutral-900" style="border-color: var(--ui-accent);">
          <option value="">{{ t('personalCenter.affiliate.withdrawChannelPlaceholder') }}</option>
          <option v-for="channel in channelOptions" :key="channel" :value="channel">{{ channel }}</option>
        </select>
        <input v-else v-model.trim="withdrawForm.channel" class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus: dark:border-white/10 dark:bg-neutral-900" style="border-color: var(--ui-accent);" :placeholder="t('personalCenter.affiliate.withdrawChannelPlaceholder')" />
        <input v-model.trim="withdrawForm.account" class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus: dark:border-white/10 dark:bg-neutral-900" style="border-color: var(--ui-accent);" :placeholder="t('personalCenter.affiliate.withdrawAccountPlaceholder')" />
        <button type="submit" :disabled="submittingWithdraw" class="h-10 rounded-full px-5 text-sm font-black text-white disabled:opacity-60 sm:col-span-2 xl:col-span-1" style="background-color: var(--ui-accent);">
          {{ submittingWithdraw ? t('personalCenter.affiliate.withdrawing') : t('personalCenter.affiliate.withdrawSubmit') }}
        </button>
      </form>
    </section>

    <section v-if="dashboard?.opened" class="grid gap-3 lg:min-h-0 lg:flex-1 xl:grid-cols-2">
      <RecordList
        :title="t('personalCenter.affiliate.commissionTitle')"
        :loading="commissionsLoading"
        :empty="t('personalCenter.affiliate.commissionEmpty')"
        :rows="commissionRows"
        :pagination="commissionsPagination"
        @change-page="changeCommissionPage"
      />
      <RecordList
        :title="t('personalCenter.affiliate.withdrawRecordTitle')"
        :loading="withdrawsLoading"
        :empty="t('personalCenter.affiliate.withdrawEmpty')"
        :rows="withdrawRows"
        :pagination="withdrawsPagination"
        @change-page="changeWithdrawPage"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { affiliateAPI, type AffiliateCommissionData, type AffiliateDashboardData, type AffiliateWithdrawData } from '../../../../api'
import {
  AFFILIATE_COMMISSION_STATUS_AVAILABLE,
  AFFILIATE_COMMISSION_STATUS_PENDING_CONFIRM,
  AFFILIATE_COMMISSION_STATUS_REJECTED,
  AFFILIATE_COMMISSION_STATUS_WITHDRAWN,
  AFFILIATE_WITHDRAW_STATUS_PAID,
  AFFILIATE_WITHDRAW_STATUS_PENDING_REVIEW,
  AFFILIATE_WITHDRAW_STATUS_REJECTED,
} from '../../../../constants/affiliate'
import { useAppStore } from '../../../../stores/app'
import { formatMallMoney, listData, paginationData } from '../../utils'
import { applyPagination, formatMallDate, mallAlertClass, mallBadgeClass, type MallAlert } from './shared'

const { t } = useI18n()
const appStore = useAppStore()

const loading = ref(false)
const opening = ref(false)
const submittingWithdraw = ref(false)
const commissionsLoading = ref(false)
const withdrawsLoading = ref(false)
const dashboard = ref<AffiliateDashboardData | null>(null)
const panelAlert = ref<MallAlert | null>(null)
const commissions = ref<AffiliateCommissionData[]>([])
const withdraws = ref<AffiliateWithdrawData[]>([])
const commissionsPagination = reactive({ page: 1, page_size: 7, total: 0, total_page: 1 })
const withdrawsPagination = reactive({ page: 1, page_size: 7, total: 0, total_page: 1 })
const withdrawForm = reactive({ amount: '', channel: '', account: '' })

const channelOptions = computed(() => {
  const channels = appStore.config?.affiliate?.withdraw_channels
  return Array.isArray(channels) ? channels.map((item) => String(item || '').trim()).filter(Boolean) : []
})
const promotionUrl = computed(() => {
  if (!dashboard.value?.affiliate_code) return '-'
  const path = dashboard.value.promotion_path || `/?aff=${dashboard.value.affiliate_code}`
  return `${typeof window !== 'undefined' ? window.location.origin : ''}${path}`
})
const conversionRateText = computed(() => {
  const value = Number(dashboard.value?.conversion_rate || 0)
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : '0.00%'
})
const currency = computed(() => String(appStore.config?.currency || 'CNY'))
const formatMoney = (amount?: unknown) => formatMallMoney(amount || '0.00', currency.value)

const commissionStatusLabel = (status?: string) => {
  if (status === AFFILIATE_COMMISSION_STATUS_PENDING_CONFIRM) return t('personalCenter.affiliate.commissionStatus.pendingConfirm')
  if (status === AFFILIATE_COMMISSION_STATUS_AVAILABLE) return t('personalCenter.affiliate.commissionStatus.available')
  if (status === AFFILIATE_COMMISSION_STATUS_REJECTED) return t('personalCenter.affiliate.commissionStatus.rejected')
  if (status === AFFILIATE_COMMISSION_STATUS_WITHDRAWN) return t('personalCenter.affiliate.commissionStatus.withdrawn')
  return status || '-'
}
const withdrawStatusLabel = (status?: string) => {
  if (status === AFFILIATE_WITHDRAW_STATUS_PENDING_REVIEW) return t('personalCenter.affiliate.withdrawStatus.pendingReview')
  if (status === AFFILIATE_WITHDRAW_STATUS_REJECTED) return t('personalCenter.affiliate.withdrawStatus.rejected')
  if (status === AFFILIATE_WITHDRAW_STATUS_PAID) return t('personalCenter.affiliate.withdrawStatus.paid')
  return status || '-'
}

const commissionRows = computed(() => commissions.value.map((item) => ({
  id: item.id,
  title: formatMoney(item.commission_amount),
  subtitle: `${item.order_no || '-'} · ${formatMallDate(item.created_at)}`,
  status: commissionStatusLabel(item.status),
  statusClass: mallBadgeClass(item.status),
})))
const withdrawRows = computed(() => withdraws.value.map((item) => ({
  id: item.id,
  title: `${formatMoney(item.amount)} · ${item.channel || '-'}`,
  subtitle: `${item.account || '-'} · ${formatMallDate(item.created_at)}`,
  status: withdrawStatusLabel(item.status),
  statusClass: mallBadgeClass(item.status),
})))

const loadDashboard = async () => {
  const response = await affiliateAPI.dashboard()
  dashboard.value = response.data.data || null
}
const loadCommissions = async (page = 1) => {
  commissionsLoading.value = true
  try {
    const response = await affiliateAPI.commissions({ page, page_size: commissionsPagination.page_size })
    commissions.value = listData(response)
    applyPagination(commissionsPagination, paginationData(response))
  } finally {
    commissionsLoading.value = false
  }
}
const loadWithdraws = async (page = 1) => {
  withdrawsLoading.value = true
  try {
    const response = await affiliateAPI.withdraws({ page, page_size: withdrawsPagination.page_size })
    withdraws.value = listData(response)
    applyPagination(withdrawsPagination, paginationData(response))
  } finally {
    withdrawsLoading.value = false
  }
}
const initialize = async () => {
  loading.value = true
  panelAlert.value = null
  try {
    if (!appStore.config) await appStore.loadConfig()
    await loadDashboard()
    if (dashboard.value?.opened) {
      await Promise.all([loadCommissions(1), loadWithdraws(1)])
    }
  } catch (err: any) {
    panelAlert.value = { level: 'error', message: err?.message || t('personalCenter.affiliate.errors.loadFailed') }
  } finally {
    loading.value = false
  }
}
const openAffiliate = async () => {
  opening.value = true
  panelAlert.value = null
  try {
    await affiliateAPI.open()
    await initialize()
    panelAlert.value = { level: 'success', message: t('personalCenter.affiliate.openSuccess') }
  } catch (err: any) {
    panelAlert.value = { level: 'error', message: err?.message || t('personalCenter.affiliate.errors.openFailed') }
  } finally {
    opening.value = false
  }
}
const handleApplyWithdraw = async () => {
  panelAlert.value = null
  if (!withdrawForm.amount.trim() || !withdrawForm.channel.trim() || !withdrawForm.account.trim()) {
    panelAlert.value = { level: 'warning', message: t('personalCenter.affiliate.errors.withdrawAccountRequired') }
    return
  }
  submittingWithdraw.value = true
  try {
    await affiliateAPI.applyWithdraw({
      amount: withdrawForm.amount.trim(),
      channel: withdrawForm.channel.trim(),
      account: withdrawForm.account.trim(),
    })
    withdrawForm.amount = ''
    withdrawForm.account = ''
    panelAlert.value = { level: 'success', message: t('personalCenter.affiliate.withdrawSuccess') }
    await Promise.all([loadDashboard(), loadWithdraws(1)])
  } catch (err: any) {
    panelAlert.value = { level: 'error', message: err?.message || t('personalCenter.affiliate.errors.withdrawFailed') }
  } finally {
    submittingWithdraw.value = false
  }
}
const safeCommissionTotalPages = computed(() => Math.max(1, Number(commissionsPagination.total_page || 1)))
const safeWithdrawTotalPages = computed(() => Math.max(1, Number(withdrawsPagination.total_page || 1)))
const changeCommissionPage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), safeCommissionTotalPages.value)
  if (nextPage === commissionsPagination.page || commissionsLoading.value) return
  void loadCommissions(nextPage)
}
const changeWithdrawPage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), safeWithdrawTotalPages.value)
  if (nextPage === withdrawsPagination.page || withdrawsLoading.value) return
  void loadWithdraws(nextPage)
}
const copyPromotionUrl = async () => {
  if (!promotionUrl.value || promotionUrl.value === '-') return
  try {
    await navigator.clipboard.writeText(promotionUrl.value)
    panelAlert.value = { level: 'success', message: t('personalCenter.affiliate.copySuccess') }
  } catch {
    panelAlert.value = { level: 'error', message: t('personalCenter.affiliate.errors.copyFailed') }
  }
}

const StatCard = defineComponent({
  props: { label: { type: String, required: true }, value: { type: String, required: true } },
  setup(props) {
    return () => h('div', { class: 'min-w-0 rounded-2xl bg-gray-50 p-3 dark:bg-white/5' }, [
      h('div', { class: 'break-words text-xs font-bold leading-4 text-gray-500' }, props.label),
      h('div', { class: 'mt-1 break-words text-lg font-black text-gray-950 dark:text-white' }, props.value),
    ])
  },
})

const RecordList = defineComponent({
  props: {
    title: { type: String, required: true },
    loading: { type: Boolean, required: true },
    empty: { type: String, required: true },
    rows: { type: Array as any, required: true },
    pagination: { type: Object as any, required: true },
  },
  emits: ['change-page'],
  setup(props, { emit }) {
    const safeTotalPages = computed(() => Math.max(1, Number(props.pagination?.total_page || 1)))
    const pageSize = computed(() => Math.max(1, Number(props.pagination?.page_size || 7)))
    const changePage = (page: number) => {
      const nextPage = Math.min(Math.max(1, page), safeTotalPages.value)
      if (nextPage === props.pagination?.page || props.loading) return
      emit('change-page', nextPage)
    }
    return () => h('section', { class: 'flex flex-col border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10 lg:h-full lg:min-h-0 lg:overflow-hidden' }, [
      h('div', { class: 'shrink-0 border-b border-gray-100 px-4 py-3 dark:border-white/10 sm:px-5 sm:py-2.5' }, [
        h('div', { class: 'flex flex-wrap items-center justify-between gap-3' }, [
          h('h3', { class: 'text-base font-black text-gray-950 dark:text-white' }, props.title),
          h('div', { class: 'grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end' }, [
            h('span', { class: 'text-center text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-left' }, t('orders.totalRecords', { total: props.pagination?.total || 0 })),
            h('span', { class: 'text-center text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-left' }, t('orders.pageInfo', { page: props.pagination?.page || 1, total: safeTotalPages.value })),
            h('button', {
              type: 'button',
              class: 'inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10',
              disabled: props.loading || (props.pagination?.page || 1) <= 1,
              onClick: () => changePage((props.pagination?.page || 1) - 1),
            }, t('pagination.previous')),
            h('button', {
              type: 'button',
              class: 'inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10',
              disabled: props.loading || (props.pagination?.page || 1) >= safeTotalPages.value,
              onClick: () => changePage((props.pagination?.page || 1) + 1),
            }, t('pagination.next')),
          ]),
        ]),
      ]),
      props.loading
        ? h('div', { class: 'min-h-0 flex-1 space-y-2 p-4' }, Array.from({ length: pageSize.value }, (_, idx) => h('div', { key: idx, class: 'h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5' })))
        : props.rows.length === 0
          ? h('div', { class: 'flex min-h-0 flex-1 items-center justify-center px-5 py-8 text-center text-sm text-gray-500' }, props.empty)
          : h('div', { class: 'min-h-0 flex-1 divide-y divide-gray-100 dark:divide-white/10' }, props.rows.map((row: any) => h('div', { key: row.id, class: 'flex min-h-12 flex-col items-start gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-2' }, [
            h('div', { class: 'min-w-0' }, [
              h('div', { class: 'break-all font-black text-gray-950 dark:text-white' }, row.title),
              h('div', { class: 'mt-1 break-all text-xs leading-5 text-gray-500' }, row.subtitle),
            ]),
            h('span', { class: `shrink-0 rounded-full px-3 py-1 text-xs font-bold ${row.statusClass}` }, row.status),
          ]))),
    ])
  },
})

onMounted(initialize)
</script>
