<template>
  <Transition name="mall-card-picker" appear>
    <div
      v-if="readyToShow"
      class="border-y border-orange-100 bg-orange-50/35 px-0 py-3 dark:border-orange-400/20 dark:bg-orange-400/10 sm:rounded-2xl sm:border sm:p-3 sm:shadow-sm"
    >
      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
        <div class="flex min-w-0 items-center gap-2">
          <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm ring-1 ring-orange-100 dark:bg-white/10 dark:ring-orange-400/20">
            <ListBulletIcon class="h-3.5 w-3.5" />
          </span>
          <div class="min-w-0">
            <div class="text-sm font-black text-gray-900 dark:text-white">{{ titleText }}</div>
            <div class="truncate text-xs text-gray-500 dark:text-gray-400">{{ helperText }}</div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 sm:justify-end">
          <button
            type="button"
            class="h-8 min-w-[64px] rounded-lg border border-orange-100 bg-white px-2.5 text-xs font-bold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-orange-200 dark:hover:border-orange-300/40 dark:hover:bg-orange-400/10"
            :disabled="disabled || loading || page <= 1"
            @click="changePage(page - 1)"
          >
            上一组
          </button>
          <div class="min-w-[58px] text-center text-xs font-bold text-gray-500 dark:text-gray-400">
            第 {{ page }} / {{ totalPages }} 组
          </div>
          <button
            type="button"
            class="h-8 min-w-[64px] rounded-lg border border-orange-100 bg-white px-2.5 text-xs font-bold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-orange-200 dark:hover:border-orange-300/40 dark:hover:bg-orange-400/10"
            :disabled="disabled || loading || page >= totalPages"
            @click="changePage(page + 1)"
          >
            下一组
          </button>
        </div>

        <button
          v-if="modelValueText"
          type="button"
          class="h-8 shrink-0 rounded-full border border-orange-100 bg-white px-3 text-xs font-bold text-orange-600 hover:border-orange-300 dark:border-white/10 dark:bg-white/10 dark:text-orange-200"
          :disabled="disabled"
          @click="clearSelection"
        >
          随机发货
        </button>
        <div v-else class="shrink-0 text-right text-xs font-bold text-orange-600 dark:text-orange-200">
          加价 {{ formatDelta('0') }}
        </div>
      </div>

      <div class="mt-3">
        <div
          v-if="error && !cards.length"
          class="rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200"
        >
          {{ error }}
        </div>
        <div
          v-else-if="loading"
          class="grid gap-2 sm:grid-cols-2"
          aria-hidden="true"
        >
          <div
            v-for="index in skeletonCount"
            :key="index"
            class="h-[42px] rounded-lg border border-orange-100/80 bg-gradient-to-r from-orange-50 via-white to-orange-50 animate-pulse dark:border-orange-400/15 dark:from-orange-400/10 dark:via-white/5 dark:to-orange-400/10"
          ></div>
        </div>
        <div
          v-else-if="!cards.length"
          class="rounded-lg border border-orange-100/80 bg-white px-3 py-4 text-center text-sm text-gray-500 dark:border-orange-400/15 dark:bg-white/10 dark:text-gray-300"
        >
          暂无可选卡密，将随机发货
        </div>
        <div v-else class="grid gap-2 sm:grid-cols-2">
          <button
            v-for="card in cards"
            :key="card.id"
            type="button"
            class="flex min-h-[42px] w-full items-center gap-2 rounded-lg border bg-white px-2.5 py-2 text-left transition dark:bg-neutral-900/80"
            :class="isSelected(card) ? 'border-orange-400 ring-2 ring-orange-100 dark:border-orange-300 dark:ring-orange-300/20' : 'border-gray-200 hover:border-orange-200 dark:border-white/10 dark:hover:border-orange-300/40'"
            :disabled="disabled"
            :title="card.label"
            @click="selectCard(card)"
          >
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
              :class="isSelected(card) ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-white/20'"
            >
              <span v-if="isSelected(card)" class="h-2 w-2 rounded-full bg-white"></span>
            </span>
            <span class="min-w-0 flex-1 break-all text-xs font-bold leading-4 text-gray-800 dark:text-gray-100">{{ card.label }}</span>
            <span
              v-if="hasDelta(card)"
              class="shrink-0 rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-600 dark:bg-orange-400/10 dark:text-orange-200"
            >
              +{{ formatDelta(card.price_delta) }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ListBulletIcon } from '@heroicons/vue/24/outline'
import { productAPI } from '../../../api'
import { useLocalized } from '../../../composables/useProduct'
import { formatMallMoney } from '../utils'
import type { MallManualFormField } from '../composables/useMallCheckoutFlow'

type SelectableCard = {
  id: string
  label: string
  price_delta: string
}

const props = defineProps<{
  modelValue?: string | number | null
  productSlug?: string
  skuId?: string | number | null
  field?: MallManualFormField
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const { getLocalizedText, siteCurrency } = useLocalized()

const cards = ref<SelectableCard[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const total = ref(0)

const pageSize = computed(() => {
  const size = Number(props.field?.page_size || 6)
  if (!Number.isFinite(size) || size <= 0) return 6
  return Math.min(50, Math.max(1, Math.floor(size)))
})
const modelValueText = computed(() => String(props.modelValue ?? '').trim())
const titleText = computed(() => getLocalizedText(props.field?.label) || '自选卡密')
const helperText = computed(() => getLocalizedText(props.field?.placeholder) || '不选择则随机发货')
const totalPages = computed(() => Math.max(1, Math.ceil(Math.max(total.value, cards.value.length) / pageSize.value)))
const skeletonCount = computed(() => Math.min(6, Math.max(1, pageSize.value)))
const readyToShow = computed(() => Boolean(props.field && props.productSlug))

const formatDelta = (value: unknown) => formatMallMoney(value || '0', siteCurrency.value)
const hasDelta = (card: SelectableCard) => Number(card.price_delta || 0) > 0
const isSelected = (card: SelectableCard) => modelValueText.value === String(card.id)

const clearSelection = () => emit('update:modelValue', '')
const selectCard = (card: SelectableCard) => emit('update:modelValue', String(card.id))

const loadCards = async () => {
  if (!props.productSlug) {
    cards.value = []
    total.value = 0
    return
  }
  loading.value = true
  error.value = ''
  try {
    const response = await productAPI.selectableCards(props.productSlug, {
      page: page.value,
      page_size: pageSize.value,
      sku_id: props.skuId || undefined,
    })
    const data = response.data?.data || {}
    cards.value = Array.isArray(data.items)
      ? data.items.map((item: any) => ({
        id: String(item?.id || '').trim(),
        label: String(item?.label || '').trim(),
        price_delta: String(item?.price_delta || '0').trim() || '0',
      })).filter((item: SelectableCard) => item.id && item.label)
      : []
    total.value = Number.isFinite(Number(data.total)) ? Number(data.total) : cards.value.length
  } catch (err: any) {
    if (!cards.value.length) {
      total.value = 0
    }
    error.value = err?.message || '加载可选卡密失败'
  } finally {
    loading.value = false
  }
}

const changePage = (nextPage: number) => {
  const normalized = Math.min(totalPages.value, Math.max(1, nextPage))
  if (normalized === page.value) return
  page.value = normalized
}

watch(() => [props.productSlug, props.skuId, pageSize.value], () => {
  page.value = 1
  clearSelection()
  loadCards()
}, { immediate: true })

watch(page, () => {
  loadCards()
})
</script>

<style scoped>
.mall-card-picker-enter-active,
.mall-card-picker-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.mall-card-picker-enter-from,
.mall-card-picker-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
