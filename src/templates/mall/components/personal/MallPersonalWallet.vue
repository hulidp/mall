<template>
  <div class="flex min-h-0 flex-col gap-2 overflow-visible lg:h-full lg:gap-3 lg:overflow-hidden">
    <section class="grid shrink-0 gap-2 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-3">
      <div class="border-y border-gray-100 bg-white p-2.5 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-5 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-black text-gray-950 dark:text-white sm:text-lg">{{ t('personalCenter.wallet.title') }}</h2>
            <p class="mt-0.5 break-words text-xs leading-5 text-gray-500 dark:text-gray-400">{{ t('personalCenter.wallet.subtitle') }}</p>
          </div>
        </div>
        <div class="mt-2 rounded-xl p-2.5 text-white sm:mt-4 sm:rounded-2xl sm:p-4" style="background-color: var(--ui-accent);">
          <div class="text-xs font-bold opacity-80">{{ t('personalCenter.wallet.balanceLabel') }}</div>
          <div class="mt-0.5 break-all text-xl font-black sm:mt-1 sm:text-3xl">{{ balanceDisplay }}</div>
        </div>
      </div>

      <form class="border-y border-gray-100 bg-white p-2.5 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:p-5 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10" @submit.prevent="handleRecharge">
        <h3 class="text-base font-black text-gray-950 dark:text-white">{{ t('personalCenter.wallet.rechargeTitle') }}</h3>
        <div v-if="walletAlert" class="mt-3 rounded-xl border px-4 py-2 text-sm" :class="mallAlertClass(walletAlert.level)">
          {{ walletAlert.message }}
        </div>

        <div class="mt-2.5 grid gap-2 md:grid-cols-2 md:gap-3">
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">{{ t('personalCenter.wallet.amountLabel') }}</span>
            <input
              v-model.trim="rechargeForm.amount"
              type="text"
              inputmode="decimal"
              class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus: dark:border-white/10 dark:bg-neutral-900 sm:h-10" style="border-color: var(--ui-accent);"
              :placeholder="t('personalCenter.wallet.amountPlaceholder')"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">{{ t('personalCenter.wallet.remarkLabel') }}</span>
            <input
              v-model.trim="rechargeForm.remark"
              type="text"
              class="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus: dark:border-white/10 dark:bg-neutral-900 sm:h-10" style="border-color: var(--ui-accent);"
              :placeholder="t('personalCenter.wallet.remarkPlaceholder')"
            />
          </label>
        </div>

        <div class="mt-2.5">
          <div class="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{{ t('personalCenter.wallet.channelLabel') }}</div>
          <div v-if="channelLoading" class="grid gap-2 sm:grid-cols-2">
            <div v-for="idx in 2" :key="idx" class="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"></div>
          </div>
          <div v-else-if="channels.length > 0" class="grid gap-2 sm:grid-cols-2">
            <button
              v-for="channel in channels"
              :key="channel.id"
              type="button"
              class="flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-1.5 text-center text-sm transition sm:min-h-11 sm:justify-start sm:py-2 sm:text-left"
              :class="rechargeForm.channelId === channel.id ? ' ' : 'border-gray-200 dark:border-white/10'" style="background-color: var(--ui-accent-soft);" style="border-color: var(--ui-accent);" style="color: var(--ui-accent);"
              @click="rechargeForm.channelId = channel.id"
            >
              <img v-if="paymentChannelIcon(channel)" :src="paymentChannelIcon(channel)" class="h-5 w-5 rounded object-cover" alt="" />
              <span class="min-w-0 break-words font-bold leading-5">{{ channel.name || channel.channel_type || channel.id }}</span>
            </button>
          </div>
          <div v-else class="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500 dark:border-white/10">
            {{ t('payment.channelEmpty') }}
          </div>
        </div>

        <button
          type="submit"
          :disabled="recharging"
          class="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" style="background-color: var(--ui-accent);"
        >
          {{ recharging ? t('payment.submitting') : t('personalCenter.wallet.rechargeSubmit') }}
        </button>
      </form>
    </section>

    <section class="flex min-h-0 flex-1 flex-col border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-2xl sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="shrink-0 border-b border-gray-100 px-3 py-2 dark:border-white/10 sm:px-5 sm:py-2.5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-base font-black text-gray-950 dark:text-white">{{ t('personalCenter.wallet.detailTitle') }}</h3>
            <p class="mt-0.5 break-words text-xs leading-5 text-gray-500">{{ t('personalCenter.wallet.subtitle') }}</p>
          </div>
          <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            <span class="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-left">
              {{ t('orders.totalRecords', { total: pagination.total }) }}
            </span>
            <span class="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-left">
              {{ t('orders.pageInfo', { page: pagination.page, total: safeTotalPages }) }}
            </span>
            <button
              type="button"
              class="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
              :disabled="loading || pagination.page <= 1"
              @click="changePage(pagination.page - 1)"
            >
              {{ t('pagination.previous') }}
            </button>
            <button
              type="button"
              class="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
              :disabled="loading || pagination.page >= safeTotalPages"
              @click="changePage(pagination.page + 1)"
            >
              {{ t('pagination.next') }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="loading" class="min-h-0 flex-1 space-y-2 p-4">
        <div v-for="idx in pagination.page_size" :key="idx" class="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"></div>
      </div>
      <div v-else-if="transactions.length === 0" class="flex min-h-0 flex-1 items-center justify-center px-5 py-8 text-center text-sm text-gray-500">
        {{ t('personalCenter.wallet.empty') }}
      </div>
      <div v-else class="min-h-0 flex-1 divide-y divide-gray-100 dark:divide-white/10">
        <div v-for="item in transactions" :key="item.id" class="grid min-h-10 gap-1 px-3 py-1.5 text-sm sm:grid-cols-[minmax(0,1fr)_140px_180px] sm:items-center sm:px-5 sm:py-2">
          <div class="min-w-0">
            <div class="break-words font-bold text-gray-950 dark:text-white">{{ item.remark || item.type || '-' }}</div>
            <div class="mt-0.5 text-xs text-gray-500">{{ formatMallDate(item.created_at) }}</div>
          </div>
          <div class="break-all font-black" :class="String(item.direction || '').toLowerCase() === 'in' ? 'text-emerald-600' : ' '" style="color: var(--ui-accent);">
            {{ formatMoney(item.amount, currency) }}
          </div>
          <div class="break-words text-xs leading-5 text-gray-500 sm:text-right">
            {{ t('personalCenter.wallet.table.balanceAfter') }} {{ formatMoney(item.balance_after, currency) }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { walletAPI } from '../../../../api'
import { useAppStore } from '../../../../stores/app'
import { amountToCents } from '../../../../utils/money'
import { formatMallMoney, listData, paginationData, paymentChannelIcon } from '../../utils'
import { applyPagination, formatMallDate, mallAlertClass, type MallAlert } from './shared'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()

const wallet = ref<any>(null)
const transactions = ref<any[]>([])
const channels = ref<any[]>([])
const loading = ref(false)
const channelLoading = ref(false)
const recharging = ref(false)
const walletAlert = ref<MallAlert | null>(null)
const channelTimer = ref<number | null>(null)
const pagination = reactive({ page: 1, page_size: 9, total: 0, total_page: 1 })
const rechargeForm = reactive({ amount: '', channelId: 0, remark: '' })

const currency = computed(() => String(appStore.config?.currency || 'CNY'))
const balanceDisplay = computed(() => formatMoney(wallet.value?.balance || '0.00', currency.value))
const safeTotalPages = computed(() => Math.max(1, Number(pagination.total_page || 1)))

const formatMoney = (amount?: unknown, currencyValue?: string) => formatMallMoney(amount, currencyValue || currency.value)

const loadWallet = async () => {
  const response = await walletAPI.account()
  wallet.value = response.data.data || null
}

const loadTransactions = async (page = 1) => {
  loading.value = true
  try {
    const response = await walletAPI.transactions({ page, page_size: pagination.page_size })
    transactions.value = listData(response)
    applyPagination(pagination, paginationData(response))
  } catch {
    transactions.value = []
  } finally {
    loading.value = false
  }
}

const loadChannels = async () => {
  const amount = rechargeForm.amount.trim()
  const amountCents = amount ? amountToCents(amount) : null
  if (amount && (amountCents === null || amountCents <= 0)) {
    return
  }
  channelLoading.value = true
  try {
    const response = await walletAPI.getPaymentChannels(amount || undefined)
    channels.value = Array.isArray(response.data.data) ? response.data.data : []
    if (!channels.value.some((item) => Number(item.id) === rechargeForm.channelId)) {
      rechargeForm.channelId = Number(channels.value[0]?.id || 0)
    }
  } catch {
    channels.value = []
    rechargeForm.channelId = 0
  } finally {
    channelLoading.value = false
  }
}

const scheduleChannels = () => {
  if (channelTimer.value !== null) {
    window.clearTimeout(channelTimer.value)
  }
  channelTimer.value = window.setTimeout(() => {
    channelTimer.value = null
    void loadChannels()
  }, 300)
}

const handleRecharge = async () => {
  walletAlert.value = null
  const amount = rechargeForm.amount.trim()
  const amountCents = amountToCents(amount)
  if (!amount || amountCents === null || amountCents <= 0) {
    walletAlert.value = { level: 'warning', message: t('personalCenter.wallet.errors.invalidAmount') }
    return
  }
  if (!rechargeForm.channelId) {
    walletAlert.value = { level: 'warning', message: t('personalCenter.wallet.errors.channelRequired') }
    return
  }

  recharging.value = true
  try {
    const response = await walletAPI.recharge({
      amount,
      channel_id: rechargeForm.channelId,
      remark: rechargeForm.remark.trim() || undefined,
    })
    const payload = response.data.data || {}
    const rechargeNo = payload?.recharge?.recharge_no || payload?.recharge_no || ''
    rechargeForm.amount = ''
    rechargeForm.remark = ''
    if (rechargeNo) {
      router.push(`/recharge-orders/${encodeURIComponent(rechargeNo)}`)
      return
    }
    walletAlert.value = { level: 'success', message: t('personalCenter.wallet.createPaymentSuccess') }
    await Promise.all([loadWallet(), loadTransactions(1)])
  } catch (err: any) {
    walletAlert.value = { level: 'error', message: err?.message || t('personalCenter.wallet.errors.rechargeFailed') }
  } finally {
    recharging.value = false
  }
}

const changePage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), safeTotalPages.value)
  if (nextPage === pagination.page || loading.value) return
  void loadTransactions(nextPage)
}

const refreshCurrentPage = async () => {
  await Promise.all([loadWallet(), loadTransactions(pagination.page)])
}

watch(() => rechargeForm.amount, scheduleChannels)

onMounted(async () => {
  if (!appStore.config) await appStore.loadConfig()
  await Promise.all([refreshCurrentPage(), loadChannels()])
})

onUnmounted(() => {
  if (channelTimer.value !== null) {
    window.clearTimeout(channelTimer.value)
  }
})
</script>
