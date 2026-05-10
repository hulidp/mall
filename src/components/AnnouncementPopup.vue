<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[125] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-4 text-gray-900 backdrop-blur-[2px] dark:text-gray-100 sm:px-5"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <section class="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-neutral-950 dark:ring-white/10">
          <header class="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-4 py-3 dark:border-white/10 sm:px-6 sm:py-4">
            <div class="min-w-0">
              <p class="text-xs font-bold text-orange-600">{{ t('nav.notice') }}</p>
              <h2 class="mt-1 line-clamp-2 text-xl font-black leading-tight sm:text-2xl">{{ noticeTitle }}</h2>
            </div>
            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition dark:border-white/10 dark:bg-neutral-900 dark:text-gray-300"
              :aria-label="t('common.close')"
              @click="close"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <img
              v-if="noticeImage"
              :src="noticeImage"
              :alt="noticeTitle"
              class="mb-4 max-h-56 w-full rounded-xl object-cover"
              loading="lazy"
            />
            <p v-if="noticeSummary" class="rounded-xl border-l-4 border-orange-500 px-4 py-3 text-sm leading-7 text-gray-600 dark:text-gray-300" style="background-color: var(--ui-accent-soft);">
              {{ noticeSummary }}
            </p>
            <div
              v-if="safeNoticeContent"
              class="rich-html prose prose-gray mt-4 max-w-none prose-p:leading-8 prose-img:rounded-xl dark:prose-invert"
              v-html="safeNoticeContent"
            ></div>
            <p v-else-if="!noticeSummary" class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {{ t('common.noContent') }}
            </p>
          </div>

          <footer class="shrink-0 border-t border-gray-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-white/10 sm:px-6 sm:py-4">
            <button
              type="button"
              class="h-11 w-full rounded-xl bg-orange-600 text-sm font-bold text-white transition hover:bg-orange-700"
              @click="close"
            >
              {{ t('common.close') }}
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { postAPI } from '../api'
import { useAppStore } from '../stores/app'
import { useLocalized } from '../composables/useProduct'
import { getImageUrl } from '../utils/image'
import { processHtmlForDisplay } from '../utils/content'

const { t } = useI18n()
const appStore = useAppStore()
const route = useRoute()
const { getLocalizedText } = useLocalized()

const visible = ref(false)
const loading = ref(false)
const latestNotice = ref<any | null>(null)
const dismissedNoticeKey = ref('')
let bodyScrollLocked = false
let previousBodyOverflow = ''

const popupEnabled = computed(() => appStore.config?.announcement_popup?.enabled === true)
const isHomeRoute = computed(() => route.name === 'home' || route.path === '/')
const canShowPopup = computed(() => popupEnabled.value && isHomeRoute.value)
const noticeKey = computed(() => String(latestNotice.value?.slug || latestNotice.value?.id || ''))
const noticeTitle = computed(() => getLocalizedText(latestNotice.value?.title) || t('nav.notice'))
const noticeSummary = computed(() => getLocalizedText(latestNotice.value?.summary))
const noticeImage = computed(() => {
  const thumbnail = String(latestNotice.value?.thumbnail || '').trim()
  return thumbnail ? getImageUrl(thumbnail) : ''
})
const safeNoticeContent = computed(() => processHtmlForDisplay(getLocalizedText(latestNotice.value?.content)))

const listData = (response: any) => {
  const data = response?.data?.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.list)) return data.list
  return []
}

const lockBodyScroll = () => {
  if (typeof document === 'undefined' || bodyScrollLocked) return
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  bodyScrollLocked = true
}

const unlockBodyScroll = () => {
  if (typeof document === 'undefined' || !bodyScrollLocked) return
  document.body.style.overflow = previousBodyOverflow
  previousBodyOverflow = ''
  bodyScrollLocked = false
}

const close = () => {
  dismissedNoticeKey.value = noticeKey.value
  visible.value = false
}

const loadLatestNotice = async () => {
  if (!canShowPopup.value || loading.value) return
  loading.value = true
  try {
    const response = await postAPI.list({ type: 'notice', page: 1, page_size: 1 })
    const rows = listData(response)
    latestNotice.value = rows[0] || null
    if (!canShowPopup.value) return
    if (!latestNotice.value) return
    if (dismissedNoticeKey.value === noticeKey.value) return
    visible.value = true
  } finally {
    loading.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && visible.value) close()
}

watch(
  () => canShowPopup.value,
  (allowed) => {
    if (!allowed) {
      visible.value = false
      if (!popupEnabled.value) {
        latestNotice.value = null
      }
      return
    }
    if (latestNotice.value) {
      if (dismissedNoticeKey.value !== noticeKey.value) {
        visible.value = true
      }
      return
    }
    void loadLatestNotice()
  },
  { immediate: true },
)

watch(
  () => visible.value,
  (nextVisible) => {
    if (nextVisible) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  unlockBodyScroll()
})
</script>
