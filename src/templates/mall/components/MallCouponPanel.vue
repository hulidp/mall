<template>
  <section
    :class="compact
      ? 'space-y-2'
      : 'rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.03]'"
  >
    <div :class="compact ? 'space-y-2' : 'flex flex-col gap-2 sm:flex-row sm:items-center'">
      <div
        class="flex shrink-0 items-center gap-2 font-black text-gray-900 dark:text-white"
        :class="compact ? 'w-full' : 'w-full sm:w-[86px]'"
      >
        <span
          class="flex items-center justify-center text-[#ff5000]"
          :class="compact ? 'h-4 w-4' : 'h-6 w-6 rounded-full bg-orange-50 dark:bg-orange-500/10'"
        >
          <TicketIcon :class="compact ? 'h-4 w-4' : 'h-3.5 w-3.5'" aria-hidden="true" />
        </span>
        <span :class="compact ? 'text-sm' : 'text-sm'">{{ t('checkout.couponTitle') }}</span>
      </div>

      <label
        class="flex min-w-0 flex-1 overflow-hidden rounded-lg border bg-white transition dark:border-white/10 dark:bg-neutral-950"
        :class="compact ? 'h-10 border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 dark:focus-within:ring-orange-500/20' : 'h-9 border-orange-100 focus-within:border-[#ff5000]'"
      >
        <input
          :value="modelValue"
          type="text"
          class="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
          :placeholder="t('checkout.couponPlaceholder')"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <div v-if="!compact" class="flex w-9 shrink-0 items-center justify-center border-l border-gray-200 text-[#ff5000] dark:border-white/10">
          <TicketIcon class="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </label>
    </div>

    <div
      v-if="loading || refreshing || error || showSummary"
      class="mt-2"
      :class="compact ? '' : 'sm:pl-[94px]'"
    >
      <div v-if="loading || refreshing" class="text-xs font-medium text-gray-500 dark:text-gray-400">
        {{ statusText }}
      </div>
      <div v-if="error" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
        {{ error }}
      </div>

      <div v-if="showSummary" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span class="text-gray-500 dark:text-gray-400">{{ t('checkout.previewOriginal') }} {{ originalText }}</span>
        <span v-if="showCouponRow" class="font-semibold text-emerald-600 dark:text-emerald-300">{{ t('checkout.previewCoupon') }} {{ couponText }}</span>
        <span v-if="showPromotionRow" class="font-semibold text-emerald-600 dark:text-emerald-300">{{ t('checkout.previewPromotion') }} {{ promotionText }}</span>
        <span v-if="showMemberRow" class="font-semibold text-amber-600 dark:text-amber-300">{{ t('checkout.previewMemberDiscount') }} {{ memberText }}</span>
        <span class="font-black text-[#ff5000]">{{ t('checkout.previewTotal') }} {{ totalText }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { TicketIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

defineProps<{
  modelValue: string
  compact?: boolean
  loading?: boolean
  refreshing?: boolean
  statusText?: string
  error?: string
  showSummary?: boolean
  originalText?: string
  couponText?: string
  promotionText?: string
  memberText?: string
  totalText?: string
  showCouponRow?: boolean
  showPromotionRow?: boolean
  showMemberRow?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
</script>
