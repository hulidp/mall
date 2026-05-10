<template>
  <div class="mx-auto max-w-[1536px] px-0 py-2 sm:px-6 sm:py-4 lg:px-8">
    <section class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-lg sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="grid gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-white/10 sm:gap-4 sm:px-5 sm:py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div class="min-w-0">
          <h1 class="text-xl font-black text-gray-950 dark:text-white sm:text-2xl">{{ t('guestOrders.title') }}</h1>
          <p class="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm sm:leading-6">{{ t('guestOrders.subtitle') }}</p>
        </div>
      </div>

      <div class="p-3 sm:p-5">
        <form
          class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px]"
          @submit.prevent="searchOrders"
        >
          <input v-model="email" type="email" class="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900 sm:h-12 sm:px-4" :placeholder="t('guestOrders.emailPlaceholder')" />
          <input v-model="orderPassword" type="password" class="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900 sm:h-12 sm:px-4" :placeholder="t('guestOrders.passwordPlaceholder')" />
          <input v-model="orderNo" class="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-orange-500 dark:border-white/10 dark:bg-neutral-900 sm:h-12 sm:px-4" :placeholder="t('guestOrders.orderNoPlaceholder')" />
          <button class="h-10 rounded-md bg-[#ff5000] px-5 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12" :disabled="loading" type="submit">
            {{ loading ? t('guestOrders.searching') : t('guestOrders.search') }}
          </button>
        </form>

        <div v-if="error" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {{ error }}
        </div>
      </div>
    </section>

    <section class="mt-3 overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:mt-4 sm:rounded-lg sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 dark:border-white/10 sm:px-5 sm:py-4">
        <div>
          <h2 class="text-base font-black text-gray-950 dark:text-white">{{ t('orders.title') }}</h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('guestOrders.tip') }}</p>
        </div>
        <span v-if="orders.length" class="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:bg-orange-500/10">
          {{ orders.length }}
        </span>
      </div>
      <div v-if="orders.length === 0" class="flex min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center sm:min-h-[300px] sm:py-12">
        <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300 sm:mb-3 sm:h-12 sm:w-12">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 13V7a2 2 0 00-2-2h-3.5M4 13V7a2 2 0 012-2h3.5m0 0L12 3l2.5 2M9.5 5h5M4 13l8 4 8-4M4 13v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
          </svg>
        </div>
        <h3 class="text-base font-black text-gray-950 dark:text-white">{{ t('guestOrders.empty') }}</h3>
      </div>
      <div v-else class="divide-y divide-gray-100 dark:divide-white/10">
        <div class="hidden grid-cols-[minmax(0,1fr)_160px_180px_120px] bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500 dark:bg-white/5 lg:grid">
          <div>{{ t('orders.orderNo') }}</div>
          <div class="text-center">{{ t('orders.filters.status') }}</div>
          <div class="text-right">{{ t('orderDetail.amountTotal') }}</div>
          <div class="text-right">{{ t('common.viewDetails') }}</div>
        </div>
        <router-link
          v-for="order in orders"
          :key="order.order_no"
          :to="`/guest/orders/${order.order_no}`"
          class="grid gap-2 px-3 py-2.5 transition hover:bg-gray-50 dark:hover:bg-white/5 sm:gap-4 sm:px-5 sm:py-4 lg:grid-cols-[minmax(0,1fr)_160px_180px_120px] lg:items-center"
        >
          <div class="min-w-0">
            <div class="truncate font-mono text-sm font-black text-gray-950 dark:text-white">{{ order.order_no }}</div>
            <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ formatDate(order.created_at) }}</div>
          </div>
          <div class="flex items-center gap-2 lg:justify-center">
            <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:bg-orange-500/10">{{ statusLabel(order.status) }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 lg:justify-end">
            <span class="text-base font-black text-[#ff5000] sm:text-lg">{{ formatMoney(order.total_amount, order.currency) }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 lg:justify-end">
            <span class="text-xs font-semibold text-gray-400">{{ t('guestOrders.viewDetails') }}</span>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { guestOrderAPI } from '../../../api'
import { orderStatusLabel } from '../../../utils/status'
import { formatMallMoney, listData } from '../utils'

const route = useRoute()
const { t } = useI18n()

const email = ref('')
const orderPassword = ref('')
const orderNo = ref('')
const orders = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const readSavedAuth = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('guest_order_auth') || '{}')
    email.value = String(saved.email || '')
    orderPassword.value = String(saved.order_password || '')
  } catch {
  }
}

const searchOrders = async () => {
  error.value = ''
  if (!email.value.trim() || !orderPassword.value.trim()) {
    error.value = t('guestOrders.errors.missing')
    return
  }
  loading.value = true
  try {
    localStorage.setItem('guest_order_auth', JSON.stringify({
      email: email.value.trim(),
      order_password: orderPassword.value,
    }))
    const response = await guestOrderAPI.list({
      email: email.value.trim(),
      order_password: orderPassword.value,
      order_no: orderNo.value.trim() || undefined,
    })
    orders.value = listData(response)
  } catch (err: any) {
    orders.value = []
    error.value = err.message || t('guestOrders.errors.searchFailed')
  } finally {
    loading.value = false
  }
}

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

onMounted(() => {
  readSavedAuth()
  orderNo.value = typeof route.query.order_no === 'string' ? route.query.order_no : ''
  if (email.value && orderPassword.value) {
    searchOrders()
  }
})
</script>
