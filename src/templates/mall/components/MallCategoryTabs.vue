<template>
  <div v-if="categories.length">
    <div class="sm:hidden">
      <div class="pointer-events-none fixed left-4 z-[70]" :style="mobileFloatingStyle">
        <button
          type="button"
          class="pointer-events-auto relative inline-flex h-12 w-12 shrink-0 touch-none items-center justify-center rounded-full border border-white/10 bg-neutral-900/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur transition hover:bg-neutral-800 dark:border-white/10 dark:bg-neutral-900/95 dark:hover:bg-neutral-800"
          :aria-label="`${t('products.categoryMenu')} - ${mobileActiveLabel}`"
          @click="handleFloatingButtonClick"
          @pointerdown="handleFloatingButtonPointerDown"
        >
          <Bars3Icon class="h-5 w-5" />
          <span
            v-if="activeCategory"
            class="absolute right-2 top-2 h-2 w-2 rounded-full border border-neutral-900 0" style="background-color: var(--ui-accent-soft);"
            aria-hidden="true"
          ></span>
        </button>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileDrawerOpen"
          class="fixed inset-0 z-[90]"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            class="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            :aria-label="t('common.close')"
            @click="closeMobileDrawer"
          ></button>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
          >
            <aside
              v-if="mobileDrawerOpen"
              class="absolute inset-y-0 left-0 flex w-[min(82vw,320px)] max-w-[320px] flex-col bg-white shadow-2xl dark:bg-neutral-950"
            >
              <div class="border-b border-gray-200 px-4 py-4 dark:border-white/10">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-xs font-medium uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">
                      {{ t('products.categoryMenu') }}
                    </div>
                    <div class="mt-1 truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                      {{ mobileActiveLabel }}
                    </div>
                  </div>
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition dark:border-white/10 dark:text-gray-300 dark:"
                    :aria-label="t('common.close')"
                    @click="closeMobileDrawer"
                  >
                    <XMarkIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto px-3 py-3">
                <div class="space-y-2">
                  <button
                    v-for="item in mobileTabs"
                    :key="item.key"
                    type="button"
                    :class="mobileDrawerItemClass(item.id)"
                    @click="handleSelect(item.id)"
                  >
                    <div class="flex min-w-0 items-center gap-3">
                      <img
                        v-if="item.icon"
                        :src="item.icon"
                        :alt="item.label"
                        class="h-5 w-5 shrink-0 rounded object-cover"
                        loading="lazy"
                      />
                      <span class="min-w-0 truncate">{{ item.label }}</span>
                    </div>
                    <span
                      v-if="isActive(item.id)"
                      class="ml-3 shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold dark:bg-white/10"
                    >
                      {{ t('common.current') }}
                    </span>
                  </button>
                </div>
              </div>
            </aside>
          </Transition>
        </div>
      </Transition>
    </div>

    <nav class="mb-5 hidden border-b border-gray-200 pb-3 dark:border-white/10 sm:block">
      <div class="flex items-center gap-2">
      <button
        v-if="hasOverflow"
        type="button"
        class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition hover:ring-orange-200 sm:flex dark:bg-neutral-950 dark:text-gray-300 dark:ring-white/10 dark:"
        :aria-label="t('common.previousBanner')"
        @click="scrollTabs(-1)"
      >
        <ChevronLeftIcon class="h-4 w-4" />
      </button>

      <div ref="scrollContainer" class="mall-category-scroll min-w-0 flex-1 overflow-x-auto">
        <div class="flex min-w-max items-center gap-2">
          <button type="button" :class="tabClass(null)" @click="handleSelect(null)">
            <span>{{ allLabel }}</span>
          </button>

          <template v-for="category in categories" :key="category.id">
            <button type="button" :class="tabClass(category.id)" @click="handleSelect(category.id)">
              <img
                v-if="categoryIcon(category)"
                :src="categoryIcon(category)"
                :alt="categoryName(category)"
                class="h-5 w-5 shrink-0 rounded object-cover"
                loading="lazy"
              />
              <span>{{ categoryName(category) }}</span>
            </button>
          </template>
        </div>
      </div>

      <button
        v-if="hasOverflow"
        type="button"
        class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition hover:ring-orange-200 sm:flex dark:bg-neutral-950 dark:text-gray-300 dark:ring-white/10 dark:"
        :aria-label="t('common.nextBanner')"
        @click="scrollTabs(1)"
      >
        <ChevronRightIcon class="h-4 w-4" />
      </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useLocalized } from '../../../composables/useProduct'
import { getImageUrl } from '../../../utils/image'
import { Bars3Icon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import { lockMallBodyScroll, unlockMallBodyScroll } from '../utils'

const props = withDefaults(defineProps<{
  categories: any[]
  allLabel: string
  total: number
  activeCategoryId?: number | null
}>(), {
  activeCategoryId: null,
})

const emit = defineEmits<{
  select: [categoryId: number | null]
}>()

const { t } = useI18n()
const { getLocalizedText } = useLocalized()
const scrollContainer = ref<HTMLElement | null>(null)
const hasOverflow = ref(false)
const mobileDrawerOpen = ref(false)
const mobileButtonTop = ref(0)
const baseClass = 'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out will-change-transform'
const activeClass = 'bg-orange-600 text-white shadow-[0_8px_18px_rgba(255,80,0,0.22)] ring-1 ring-orange-500/20'
const inactiveClass = 'bg-white text-gray-700 ring-1 ring-gray-200 hover:-translate-y-0.5 hover:ring-orange-200 dark:bg-neutral-950 dark:text-gray-200 dark:ring-white/10 dark: dark:hover:ring-orange-500/30'
const mobileDrawerActiveClass = 'flex w-full items-center justify-between rounded-2xl bg-orange-600 px-3 py-3 text-left text-sm font-semibold text-white shadow-sm'
const mobileDrawerInactiveClass = 'flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-3 text-left text-sm font-medium text-gray-700 transition dark:border-white/10 dark:bg-neutral-900 dark:text-gray-200 dark:/30 dark:'
let resizeObserver: ResizeObserver | null = null
let dragPointerId: number | null = null
let dragStartY = 0
let dragStartTop = 0
let dragMoved = false
let ignoreNextButtonClick = false
let mobileDrawerScrollLocked = false
const mobileButtonSize = 48
const mobileButtonTopPadding = 96
const mobileButtonBottomPadding = 96
const mobileButtonStorageKey = 'dujiao.mall.categoryButtonTop'

const isActive = (categoryId: number | null) => {
  if (categoryId === null) return props.activeCategoryId === null || props.activeCategoryId === undefined
  return Number(props.activeCategoryId) === Number(categoryId)
}

const tabClass = (categoryId: number | null) => [
  baseClass,
  isActive(categoryId) ? activeClass : inactiveClass,
]
const mobileDrawerItemClass = (categoryId: number | null) => [
  isActive(categoryId) ? mobileDrawerActiveClass : mobileDrawerInactiveClass,
]

const categoryName = (category: any) => getLocalizedText(category?.name)
const categoryIcon = (category: any) => {
  const icon = String(category?.icon || '').trim()
  return icon ? getImageUrl(icon) : ''
}
const activeCategory = computed(() => props.categories.find((category) => Number(category?.id) === Number(props.activeCategoryId)))
const mobileActiveLabel = computed(() => activeCategory.value ? categoryName(activeCategory.value) : props.allLabel)
const orderedMobileCategories = computed(() => {
  if (!activeCategory.value) return props.categories
  return [
    activeCategory.value,
    ...props.categories.filter((category) => Number(category?.id) !== Number(activeCategory.value?.id)),
  ]
})
const mobileTabs = computed(() => [
  { key: 'all', id: null as number | null, label: props.allLabel, icon: '' },
  ...orderedMobileCategories.value.map((category) => ({
    key: String(category.id),
    id: Number(category.id),
    label: categoryName(category),
    icon: categoryIcon(category),
  })),
])
const mobileFloatingStyle = computed(() => ({
  top: `${mobileButtonTop.value}px`,
}))

const scrollTabs = (direction: -1 | 1) => {
  const el = scrollContainer.value
  if (!el) return
  el.scrollBy({ left: direction * Math.max(260, Math.floor(el.clientWidth * 0.75)), behavior: 'smooth' })
}

const mobileButtonMinTop = () => mobileButtonTopPadding

const mobileButtonMaxTop = () => {
  if (typeof window === 'undefined') return mobileButtonTopPadding
  const maxTop = window.innerHeight - mobileButtonBottomPadding - mobileButtonSize
  return Math.max(mobileButtonTopPadding, maxTop)
}

const clampMobileButtonTop = (value: number) => {
  return Math.min(Math.max(value, mobileButtonMinTop()), mobileButtonMaxTop())
}

const persistMobileButtonTop = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(mobileButtonStorageKey, String(mobileButtonTop.value))
}

const syncMobileButtonTop = () => {
  if (typeof window === 'undefined') return
  if (!mobileButtonTop.value) {
    const defaultTop = Math.round(window.innerHeight * 0.62)
    mobileButtonTop.value = clampMobileButtonTop(defaultTop)
    return
  }
  mobileButtonTop.value = clampMobileButtonTop(mobileButtonTop.value)
}

const restoreMobileButtonTop = () => {
  if (typeof window === 'undefined') return
  const stored = Number(window.sessionStorage.getItem(mobileButtonStorageKey) || '')
  if (Number.isFinite(stored) && stored > 0) {
    mobileButtonTop.value = clampMobileButtonTop(stored)
    return
  }
  const defaultTop = Math.round(window.innerHeight * 0.62)
  mobileButtonTop.value = clampMobileButtonTop(defaultTop)
}

const stopFloatingButtonDrag = () => {
  if (typeof window === 'undefined') return
  window.removeEventListener('pointermove', handleFloatingButtonPointerMove)
  window.removeEventListener('pointerup', handleFloatingButtonPointerUp)
  window.removeEventListener('pointercancel', handleFloatingButtonPointerUp)
  dragPointerId = null
}

const handleFloatingButtonPointerMove = (event: PointerEvent) => {
  if (dragPointerId !== event.pointerId) return
  const nextTop = clampMobileButtonTop(dragStartTop + (event.clientY - dragStartY))
  if (Math.abs(event.clientY - dragStartY) > 4) {
    dragMoved = true
  }
  mobileButtonTop.value = nextTop
}

const handleFloatingButtonPointerUp = (event: PointerEvent) => {
  if (dragPointerId !== event.pointerId) return
  ignoreNextButtonClick = dragMoved
  if (dragMoved) {
    persistMobileButtonTop()
  }
  stopFloatingButtonDrag()
}

const handleFloatingButtonPointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  dragPointerId = event.pointerId
  dragStartY = event.clientY
  dragStartTop = mobileButtonTop.value
  dragMoved = false
  if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', handleFloatingButtonPointerMove)
    window.addEventListener('pointerup', handleFloatingButtonPointerUp)
    window.addEventListener('pointercancel', handleFloatingButtonPointerUp)
  }
}

const handleFloatingButtonClick = () => {
  if (ignoreNextButtonClick) {
    ignoreNextButtonClick = false
    return
  }
  mobileDrawerOpen.value = true
}

const closeMobileDrawer = () => {
  mobileDrawerOpen.value = false
}

const handleSelect = (categoryId: number | null) => {
  mobileDrawerOpen.value = false
  emit('select', categoryId)
}

const updateOverflow = () => {
  const el = scrollContainer.value
  if (!el) {
    hasOverflow.value = false
    return
  }
  hasOverflow.value = el.scrollWidth > el.clientWidth + 1
}

const scheduleOverflowCheck = async () => {
  await nextTick()
  updateOverflow()
}

const syncMobileDrawerScrollLock = (open: boolean) => {
  if (open && !mobileDrawerScrollLocked) {
    lockMallBodyScroll()
    mobileDrawerScrollLocked = true
    return
  }
  if (!open && mobileDrawerScrollLocked) {
    unlockMallBodyScroll()
    mobileDrawerScrollLocked = false
  }
}

watch(() => [props.categories.length, props.allLabel], scheduleOverflowCheck)
watch(() => props.activeCategoryId, () => {
  mobileDrawerOpen.value = false
})
watch(mobileDrawerOpen, (open) => {
  syncMobileDrawerScrollLock(open)
})

onMounted(() => {
  restoreMobileButtonTop()
  void scheduleOverflowCheck()
  if ('ResizeObserver' in window && scrollContainer.value) {
    resizeObserver = new ResizeObserver(updateOverflow)
    resizeObserver.observe(scrollContainer.value)
  } else {
    window.addEventListener('resize', updateOverflow)
  }
  window.addEventListener('resize', syncMobileButtonTop)
})

onUnmounted(() => {
  stopFloatingButtonDrag()
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', updateOverflow)
  window.removeEventListener('resize', syncMobileButtonTop)
  syncMobileDrawerScrollLock(false)
})
</script>

<style scoped>
.mall-category-scroll {
  scrollbar-width: none;
}

.mall-category-scroll::-webkit-scrollbar {
  display: none;
}
</style>
