<template>
  <div class="dujiao-mall-scrollbar-hidden flex min-h-screen flex-col bg-[#f5f5f5] text-gray-900 dark:bg-black dark:text-gray-100">
    <MallHeader v-if="!isPersonalCenter" />
    <div v-if="showPageReturn" class="mx-auto w-full max-w-[1536px] px-4 pt-3 sm:px-6 lg:px-8">
      <button
        type="button"
        class="inline-flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition dark:border-white/10 dark:bg-neutral-950 dark:text-gray-300"
        @click="returnHome"
      >
        <ArrowLeftIcon class="h-4 w-4" aria-hidden="true" />
        <span>{{ t('notFoundPage.backHome') }}</span>
      </button>
    </div>
    <main class="min-h-0 flex-1">
      <slot />
    </main>
    <MallFooter v-if="showFooter" />
    <BackToTop />
    <MallAuthPopup
      v-model:visible="authModalVisible"
      v-model:mode="authModalMode"
    />
    <MallContentPopup
      v-model:visible="contentModalVisible"
      :mode="contentModalMode"
      :custom-item="contentModalCustomItem"
      :initial-slug="contentModalSlug"
      :request-key="contentModalRequestKey"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BackToTop from '../../components/BackToTop.vue'
import { useUserAuthStore } from '../../stores/userAuth'
import MallHeader from './components/MallHeader.vue'
import MallFooter from './components/MallFooter.vue'
import MallAuthPopup from './components/MallAuthPopup.vue'
import MallContentPopup from './components/MallContentPopup.vue'
import type { MallAuthModalMode, MallContentModalCustomItem, MallContentModalDetail, MallContentModalMode } from './utils'
import { mallAuthModalModeStorageKey, mallAuthRedirectStorageKey, mallOpenAuthModalEvent, mallOpenContentModalEvent } from './utils'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userAuthStore = useUserAuthStore()
const isPersonalCenter = computed(() => route.path === '/me' || route.path.startsWith('/me/'))
const purchaseFlowRoutes = new Set(['cart', 'checkout', 'payment', 'order-detail', 'guest-order-detail', 'recharge-order-detail'])
const routesWithoutFooter = new Set(['product-detail', 'recharge-redeem', ...purchaseFlowRoutes])
const showFooter = computed(() => {
  const routeName = String(route.name || '')
  return !isPersonalCenter.value && !routesWithoutFooter.has(routeName)
})
const routesWithoutPageReturn = new Set(['home', 'products', 'category-products', 'product-detail', 'wechat-contact', 'recharge-redeem', 'not-found', ...purchaseFlowRoutes])
const showPageReturn = computed(() => {
  const routeName = String(route.name || '')
  return !isPersonalCenter.value && !routesWithoutPageReturn.has(routeName)
})

const contentModalVisible = ref(false)
const contentModalMode = ref<MallContentModalMode>('blog')
const contentModalCustomItem = ref<MallContentModalCustomItem | null>(null)
const contentModalSlug = ref('')
const contentModalRequestKey = ref(0)
const authModalVisible = ref(false)
const authModalMode = ref<MallAuthModalMode>('login')
const scrollbarHiddenClass = 'dujiao-mall-scrollbar-hidden'

const setMallScrollbarHidden = () => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.add(scrollbarHiddenClass)
  document.body.classList.add(scrollbarHiddenClass)
}

const clearMallScrollbarHidden = () => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove(scrollbarHiddenClass)
  document.body.classList.remove(scrollbarHiddenClass)
}

const normalizeInternalPath = (url: string) => {
  const raw = String(url || '').trim()
  if (!raw) return ''
  try {
    const parsed = raw.startsWith('http://') || raw.startsWith('https://')
      ? new URL(raw)
      : new URL(raw, window.location.origin)
    return parsed.pathname.replace(/\/+$/, '') || '/'
  } catch {
    const path = raw.split(/[?#]/)[0] || ''
    return path.replace(/\/+$/, '') || '/'
  }
}

const normalizeModalDetail = (detail: MallContentModalDetail): MallContentModalDetail => {
  if (detail.mode !== 'custom' || !detail.customItem) return detail
  const item = detail.customItem
  const url = String(item.url || '').trim()
  const isInternal = String(item.link_type || '').toLowerCase() === 'internal' || url.startsWith('/')
  if (!url || !isInternal || typeof window === 'undefined') return detail

  const path = normalizeInternalPath(url)
  if (path === '/blog') return { mode: 'blog' }
  if (path === '/notice') return { mode: 'notice' }
  if (path === '/about') return { mode: 'about' }

  const blogMatch = path.match(/^\/blog\/([^/]+)$/)
  if (blogMatch) {
    return { mode: 'blog', slug: decodeURIComponent(blogMatch[1] || '') }
  }

  const noticeMatch = path.match(/^\/notice\/([^/]+)$/)
  if (noticeMatch) {
    return { mode: 'notice', slug: decodeURIComponent(noticeMatch[1] || '') }
  }

  return detail
}

const openContentModal = (detail: MallContentModalDetail) => {
  const normalized = normalizeModalDetail(detail)
  contentModalMode.value = normalized.mode
  contentModalCustomItem.value = normalized.customItem || null
  contentModalSlug.value = normalized.slug || ''
  contentModalRequestKey.value += 1
  contentModalVisible.value = true
}

const returnHome = async () => {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem('dujiao.mall.productReturnPath')
  }
  if (router.currentRoute.value.name !== 'home') {
    await router.replace({ name: 'home' }).catch(async () => {
      await router.push({ name: 'home' }).catch(() => undefined)
    })
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dujiao.mall.home-reset'))
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
}

const handleContentModalEvent = (event: Event) => {
  const detail = (event as CustomEvent<MallContentModalDetail>).detail
  if (!detail || !detail.mode) return
  openContentModal(detail)
}

const handleAuthModalEvent = (event: Event) => {
  if (event.cancelable) event.preventDefault()
  const detail = (event as CustomEvent<{ mode?: MallAuthModalMode; redirect?: string }>).detail
  if (userAuthStore.isAuthenticated) {
    authModalVisible.value = false
    window.sessionStorage.removeItem(mallAuthModalModeStorageKey)
    window.sessionStorage.removeItem(mallAuthRedirectStorageKey)
    return
  }
  if (detail?.redirect?.startsWith('/')) {
    window.sessionStorage.setItem(mallAuthRedirectStorageKey, detail.redirect)
  }
  authModalMode.value = detail?.mode || 'login'
  authModalVisible.value = true
}

const consumePendingAuthModal = () => {
  if (typeof window === 'undefined') return
  const mode = window.sessionStorage.getItem(mallAuthModalModeStorageKey) as MallAuthModalMode | null
  if (mode !== 'login' && mode !== 'register' && mode !== 'forgot') return
  window.sessionStorage.removeItem(mallAuthModalModeStorageKey)
  if (userAuthStore.isAuthenticated) {
    window.sessionStorage.removeItem(mallAuthRedirectStorageKey)
    authModalVisible.value = false
    return
  }
  authModalMode.value = mode
  authModalVisible.value = true
}

watch(
  () => route.fullPath,
  () => consumePendingAuthModal(),
)

watch(
  () => userAuthStore.isAuthenticated,
  (authenticated) => {
    if (!authenticated) return
      authModalVisible.value = false
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(mallAuthModalModeStorageKey)
        window.sessionStorage.removeItem(mallAuthRedirectStorageKey)
      }
    },
  )

onMounted(() => {
  setMallScrollbarHidden()
  window.addEventListener(mallOpenAuthModalEvent, handleAuthModalEvent)
  window.addEventListener(mallOpenContentModalEvent, handleContentModalEvent)
  consumePendingAuthModal()
})

onUnmounted(() => {
  clearMallScrollbarHidden()
  window.removeEventListener(mallOpenAuthModalEvent, handleAuthModalEvent)
  window.removeEventListener(mallOpenContentModalEvent, handleContentModalEvent)
})
</script>

<style>
.dujiao-mall-scrollbar-hidden,
.dujiao-mall-scrollbar-hidden * {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.dujiao-mall-scrollbar-hidden::-webkit-scrollbar,
.dujiao-mall-scrollbar-hidden *::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
