<template>
  <header class="border-b border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100">
    <div class="border-b border-gray-100 bg-gray-50 text-sm text-gray-600 dark:border-white/10 dark:bg-neutral-900 dark:text-gray-300">
      <div class="mx-auto flex h-9 max-w-[1536px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div class="flex min-w-0 items-center gap-4">
          <button
            type="button"
            class="max-w-[120px] shrink-0 truncate font-semibold text-gray-700 hover:text-orange-600 dark:text-gray-200 sm:max-w-[180px]"
            :title="t('nav.home')"
            @click="goHome"
          >
            {{ siteName }}
          </button>
          <router-link
            v-if="userAuthStore.isAuthenticated"
            to="/me"
            class="max-w-[180px] truncate hover:text-orange-600"
          >
            {{ currentUserLabel }}
          </router-link>
          <button v-else type="button" class="shrink-0 hover:text-orange-600" @click="openMallAuthModal('login')">
            {{ t('navbar.login') }}
          </button>
          <button type="button" class="hidden shrink-0 hover:text-orange-600 sm:inline" @click="toggleTheme">
            {{ themeToggleLabel }}
          </button>
          <div
            class="relative hidden h-9 shrink-0 items-center whitespace-nowrap text-sm leading-9 md:flex"
            @mouseenter="languageOpen = true; contactOpen = false"
            @mouseleave="languageOpen = false"
          >
            <button
              type="button"
              class="flex h-9 shrink-0 items-center gap-1 px-1 text-gray-600 hover:text-orange-600 dark:text-gray-300"
              :class="languageOpen ? 'text-orange-600' : ''"
              @click="languageOpen = !languageOpen; contactOpen = false"
            >
              <span class="inline-block">{{ currentLocaleLabel }}</span>
              <ChevronUpIcon v-if="languageOpen" class="h-3 w-3 stroke-[1.8]" aria-hidden="true" />
              <ChevronDownIcon v-else class="h-3 w-3 stroke-[1.8]" aria-hidden="true" />
            </button>
            <div
              v-if="languageOpen"
              class="absolute left-0 top-full z-50 w-32 overflow-hidden rounded-lg bg-white py-1 text-sm text-gray-700 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:text-gray-200 dark:ring-white/10"
            >
              <button
                v-for="lang in mallLocales"
                :key="lang.code"
                type="button"
                class="block w-full px-4 py-2 text-left hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10"
                :class="appStore.locale === lang.code ? 'font-semibold text-orange-600' : ''"
                @click="selectLocale(lang.code)"
              >
                {{ lang.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 移动端：购物车图标 + 汉堡按钮 -->
        <div class="flex items-center gap-1.5 lg:hidden">
          <router-link
            to="/cart"
            class="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-500/10"
          >
            <ShoppingBagIcon class="h-5 w-5" aria-hidden="true" />
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5000] text-[10px] font-black leading-none text-white"
            >
              {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
            </span>
          </router-link>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            @click="mobileMenuOpen = true"
          >
            <Bars3Icon class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav class="hidden lg:flex shrink-0 items-center gap-4 overflow-visible">
          <button
            v-for="item in topContentItems"
            :key="item.key"
            type="button"
            class="whitespace-nowrap hover:text-orange-600"
            @click="openTopNavItem(item)"
          >
            {{ item.label }}
          </button>
          <div
            v-if="contactNavItems.length"
            class="relative flex h-9 shrink-0 items-center whitespace-nowrap"
            @mouseenter="contactOpen = true; languageOpen = false"
            @mouseleave="contactOpen = false"
          >
            <button
              type="button"
              class="flex h-9 shrink-0 items-center gap-1 hover:text-orange-600"
              :class="contactOpen ? 'text-orange-600' : ''"
              @click="contactOpen = !contactOpen; languageOpen = false"
            >
              <span>{{ contactDropdownLabel }}</span>
              <ChevronUpIcon v-if="contactOpen" class="h-3 w-3 stroke-[1.8]" aria-hidden="true" />
              <ChevronDownIcon v-else class="h-3 w-3 stroke-[1.8]" aria-hidden="true" />
            </button>
            <div
              v-if="contactOpen"
              class="absolute right-0 top-full z-50 w-36 overflow-hidden rounded-lg bg-white py-1 text-sm text-gray-700 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:text-gray-200 dark:ring-white/10"
            >
              <a
                v-for="item in contactNavItems"
                :key="item.key"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block px-4 py-2 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10"
                @click="openContactNavItem"
              >
                {{ item.label }}
              </a>
            </div>
          </div>
          <button
            v-for="item in customItems"
            :key="item.key"
            type="button"
            class="whitespace-nowrap hover:text-orange-600"
            @click="openTopNavItem(item)"
          >
            {{ item.label }}
          </button>
          <router-link
            v-if="!userAuthStore.isAuthenticated"
            to="/guest/orders"
            class="whitespace-nowrap hover:text-orange-600"
          >
            {{ t('navbar.guestOrders') }}
          </router-link>
          <router-link
            v-if="userAuthStore.isAuthenticated"
            to="/me/orders"
            class="whitespace-nowrap hover:text-orange-600"
          >
            {{ t('orders.title') }}
          </router-link>
          <router-link to="/cart" class="whitespace-nowrap hover:text-orange-600">
            {{ t('navbar.cart') }} {{ cartStore.totalItems }}
          </router-link>
          <router-link
            v-if="userAuthStore.isAuthenticated"
            to="/me"
            class="whitespace-nowrap hover:text-orange-600"
          >
            {{ t('navbar.personalCenter') }}
          </router-link>
          <button
            v-if="userAuthStore.isAuthenticated"
            type="button"
            class="whitespace-nowrap text-red-600 hover:text-red-700"
            @click="handleLogout"
          >
            {{ t('navbar.logout') }}
          </button>
        </nav>
      </div>
    </div>

    <div
      v-if="showBrandSearch"
      class="mx-auto grid max-w-[1536px] gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-center lg:px-8"
    >
      <button type="button" class="inline-flex min-w-0 items-center gap-3 text-left" @click="goHome">
        <img
          v-if="siteIcon"
          :src="siteIcon"
          alt=""
          class="h-10 w-10 shrink-0 rounded-lg object-cover sm:h-11 sm:w-11"
        />
        <span
          v-else
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-base font-black text-white sm:h-11 sm:w-11 sm:text-lg"
        >
          {{ siteInitial }}
        </span>
        <span class="truncate text-lg font-black text-orange-600 sm:text-2xl">{{ siteName }}</span>
      </button>

      <form
        class="flex h-10 min-w-0 overflow-hidden rounded-full border-2 border-orange-600 bg-white dark:bg-neutral-900 sm:h-11"
        @submit.prevent="submitSearch"
      >
        <input
          v-model="keyword"
          class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none sm:px-4"
          :placeholder="searchPlaceholder"
        />
        <button class="w-20 bg-orange-600 text-sm font-bold text-white hover:bg-orange-700 sm:w-24" type="submit">
          {{ t('products.searchLabel') }}
        </button>
      </form>

    </div>
  </header>

  <div
    v-if="showBrandSearch"
    class="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white text-gray-900 shadow-sm transition-all duration-200 ease-out dark:border-white/10 dark:bg-neutral-950 dark:text-gray-100"
    :class="isScrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'"
    :aria-hidden="!isScrolled"
  >
    <div class="mx-auto grid max-w-[1536px] gap-2 px-4 py-2 sm:gap-3 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-center lg:px-8">
      <button type="button" class="inline-flex min-w-0 items-center gap-3 text-left" @click="goHome">
        <img v-if="siteIcon" :src="siteIcon" alt="" class="h-7 w-7 shrink-0 rounded-lg object-cover sm:h-8 sm:w-8" />
        <span v-else class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-xs font-black text-white sm:h-8 sm:w-8 sm:text-sm">
          {{ siteInitial }}
        </span>
        <span class="truncate text-base font-black text-orange-600 sm:text-xl">{{ siteName }}</span>
      </button>

      <form class="flex h-9 min-w-0 overflow-hidden rounded-full border-2 border-orange-600 bg-white dark:bg-neutral-900 sm:h-10" @submit.prevent="submitSearch">
        <input
          v-model="keyword"
          class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none sm:px-4"
          :placeholder="searchPlaceholder"
        />
        <button class="w-20 bg-orange-600 text-sm font-bold text-white hover:bg-orange-700 sm:w-24" type="submit">
          {{ t('products.searchLabel') }}
        </button>
      </form>
    </div>
  </div>
<!-- 移动端抽屉导航 -->
<div
  v-if="mobileMenuOpen"
  class="fixed inset-0 z-[200] flex lg:hidden"
  role="dialog"
  aria-modal="true"
>
  <!-- 遮罩 -->
  <div class="fixed inset-0 bg-black/50" @click="mobileMenuOpen = false" />
  <!-- 抽屉面板 -->
  <div class="relative ml-auto flex h-full w-[80vw] max-w-[300px] flex-col overflow-y-auto bg-white shadow-2xl dark:bg-neutral-950">
    <!-- 顶部 -->
    <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
      <span class="text-base font-black text-gray-950 dark:text-white">{{ siteName }}</span>
      <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10" @click="mobileMenuOpen = false">
        <XMarkIcon class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    <!-- 用户信息 -->
    <div class="border-b border-gray-100 px-4 py-3 dark:border-white/10">
      <template v-if="userAuthStore.isAuthenticated">
        <router-link to="/me" class="flex items-center gap-3" @click="mobileMenuOpen = false">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-black text-[#ff5000] dark:bg-orange-500/10">
            {{ currentUserLabel.slice(0, 1).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="truncate text-sm font-black text-gray-950 dark:text-white">{{ currentUserLabel }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('navbar.personalCenter') }}</div>
          </div>
        </router-link>
      </template>
      <button
        v-else
        type="button"
        class="flex h-10 w-full items-center justify-center rounded-xl bg-[#ff5000] text-sm font-black text-white"
        @click="openMallAuthModal('login'); mobileMenuOpen = false"
      >
        {{ t('navbar.login') }}
      </button>
    </div>

    <!-- 导航链接 -->
    <nav class="flex-1 space-y-0.5 px-3 py-3">
      <button
        v-for="item in topContentItems"
        :key="item.key"
        type="button"
        class="flex h-11 w-full items-center rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-orange-500/10"
        @click="openTopNavItem(item); mobileMenuOpen = false"
      >
        {{ item.label }}
      </button>

      <div class="py-1"><div class="border-t border-gray-100 dark:border-white/10" /></div>

      <template v-if="userAuthStore.isAuthenticated">
        <router-link to="/me/orders" class="flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-orange-500/10" @click="mobileMenuOpen = false">
          {{ t('orders.title') }}
        </router-link>
        <router-link to="/me" class="flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-orange-500/10" @click="mobileMenuOpen = false">
          {{ t('navbar.personalCenter') }}
        </router-link>
      </template>
      <router-link v-else to="/guest/orders" class="flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-orange-500/10" @click="mobileMenuOpen = false">
        {{ t('navbar.guestOrders') }}
      </router-link>

      <template v-if="contactNavItems.length">
        <div class="py-1"><div class="border-t border-gray-100 dark:border-white/10" /></div>
        <a
          v-for="item in contactNavItems"
          :key="item.key"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-orange-500/10"
          @click="openContactNavItem"
        >
          {{ item.label }}
        </a>
      </template>

      <template v-if="customItems.length">
        <div class="py-1"><div class="border-t border-gray-100 dark:border-white/10" /></div>
        <button
          v-for="item in customItems"
          :key="item.key"
          type="button"
          class="flex h-11 w-full items-center rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-orange-500/10"
          @click="openTopNavItem(item); mobileMenuOpen = false"
        >
          {{ item.label }}
        </button>
      </template>

      <div class="py-1"><div class="border-t border-gray-100 dark:border-white/10" /></div>

      <!-- 语言切换 -->
      <div class="px-3 py-2">
        <div class="mb-2 text-xs font-bold text-gray-400 dark:text-gray-500">{{ currentLocaleLabel }}</div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="lang in mallLocales"
            :key="lang.code"
            type="button"
            class="rounded-full px-3 py-1 text-xs font-semibold transition"
            :class="appStore.locale === lang.code ? 'bg-[#ff5000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 dark:bg-white/10 dark:text-gray-300'"
            @click="selectLocale(lang.code)"
          >
            {{ lang.label }}
          </button>
        </div>
      </div>

      <!-- 主题切换 -->
      <button
        type="button"
        class="flex h-11 w-full items-center rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-orange-500/10"
        @click="toggleTheme"
      >
        {{ themeToggleLabel }}
      </button>
    </nav>

    <!-- 退出 -->
    <div v-if="userAuthStore.isAuthenticated" class="border-t border-gray-100 px-3 py-3 dark:border-white/10">
      <button
        type="button"
        class="flex h-11 w-full items-center rounded-xl px-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
        @click="handleLogout(); mobileMenuOpen = false"
      >
        {{ t('navbar.logout') }}
      </button>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../../stores/app'
import { useCartStore } from '../../../stores/cart'
import { useUserAuthStore } from '../../../stores/userAuth'
import { useLocalized } from '../../../composables/useProduct'
import { useTheme } from '../../../utils/theme'
import { getImageUrl } from '../../../utils/image'
import { getWechatContactUrl } from '../../../utils/contact'
import { Bars3Icon, ChevronDownIcon, ChevronUpIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { MallContentModalCustomItem, MallContentModalMode } from '../utils'
import { openMallAuthModal, openMallContentModal } from '../utils'

interface NavItem {
  key: string
  label: string
  mode: MallContentModalMode
  customItem?: MallContentModalCustomItem
}

interface ContactNavItem {
  key: string
  label: string
  url: string
}

const appStore = useAppStore()
const cartStore = useCartStore()
const userAuthStore = useUserAuthStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { getLocalizedText } = useLocalized()
const { theme, toggleTheme } = useTheme()

const mallHomeResetEvent = 'dujiao.mall.home-reset'
const keyword = ref('')
const languageOpen = ref(false)
const contactOpen = ref(false)
const isScrolled = ref(typeof window !== 'undefined' ? window.scrollY > 80 : false)
const mobileMenuOpen = ref(false)
let scrollFrame: number | null = null
const mallLocales = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en-US', label: 'English' },
] as const

const siteName = computed(() => String(appStore.config?.brand?.site_name || 'Huli-Next'))
const siteInitial = computed(() => siteName.value.slice(0, 1).toUpperCase())
const siteIcon = computed(() => {
  const icon = String(appStore.config?.brand?.site_icon || '').trim()
  return icon ? getImageUrl(icon) : ''
})
const searchPlaceholder = computed(() => t('products.searchPlaceholder'))
const currentUserLabel = computed(() => {
  const user = userAuthStore.user || {}
  return String(user.nickname || user.email || t('navbar.personalCenter'))
})
const currentLocaleLabel = computed(() => {
  return mallLocales.find((lang) => lang.code === appStore.locale)?.label || mallLocales[0].label
})
const themeToggleLabel = computed(() => {
  const nextTheme = theme.value === 'dark' ? 'light' : 'dark'
  return nextTheme === 'light' ? t('navbar.themeLight') : t('navbar.themeDark')
})
const contactDropdownLabel = computed(() => {
  if (appStore.locale === 'zh-TW') return '聯絡客服'
  if (appStore.locale === 'en-US') return 'Contact Support'
  return '联系客服'
})

const navConfig = computed(() => appStore.config?.nav_config as {
  builtin?: Record<string, boolean>
  custom_items?: MallContentModalCustomItem[]
} | undefined)

const isBuiltinEnabled = (key: string) => navConfig.value?.builtin?.[key] === true

const topContentItems = computed<NavItem[]>(() => {
  const rows: NavItem[] = []
  if (isBuiltinEnabled('blog')) rows.push({ key: 'blog', label: t('nav.blog'), mode: 'blog' })
  if (isBuiltinEnabled('notice')) rows.push({ key: 'notice', label: t('nav.notice'), mode: 'notice' })
  if (isBuiltinEnabled('about')) rows.push({ key: 'about', label: t('nav.about'), mode: 'about' })
  return rows
})

const customItems = computed<NavItem[]>(() => {
  const rows = navConfig.value?.custom_items
  if (!Array.isArray(rows)) return []
  return rows
    .filter((item) => item.enabled)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((item) => {
      const url = String(item.url || '').trim()
      return {
        key: `custom-${item.id}`,
        label: getLocalizedText(item.title) || url,
        mode: 'custom',
        customItem: item,
      } as NavItem
    })
    .filter((item) => item.label)
})

const contactNavItems = computed<ContactNavItem[]>(() => {
  const contact = appStore.config?.contact as Record<string, unknown> | undefined
  const rows: ContactNavItem[] = []
  const telegram = String(contact?.telegram || '').trim()
  const whatsapp = String(contact?.whatsapp || '').trim()
  const qq = String(contact?.qq || '').trim()
  const wechat = getWechatContactUrl(contact)
  if (telegram) rows.push({ key: 'contact-telegram', label: 'Telegram', url: telegram })
  if (whatsapp) rows.push({ key: 'contact-whatsapp', label: 'WhatsApp', url: whatsapp })
  if (qq) rows.push({ key: 'contact-qq', label: 'QQ', url: qq })
  if (wechat) rows.push({ key: 'contact-wechat', label: appStore.locale === 'en-US' ? 'WeCom' : '企业微信', url: wechat })
  return rows
})

const showBrandSearch = computed(() => {
  return route.name === 'home' || route.name === 'products' || route.name === 'category-products'
})

const openTopNavItem = (item: NavItem) => {
  contactOpen.value = false
  openMallContentModal({
    mode: item.mode,
    customItem: item.customItem || null,
  })
}

const openContactNavItem = () => {
  contactOpen.value = false
  mobileMenuOpen.value = false
}

const handleLogout = () => {
  contactOpen.value = false
  userAuthStore.logout('/')
}

const selectLocale = (locale: string) => {
  appStore.setLocale(locale)
  languageOpen.value = false
  contactOpen.value = false
}

const syncScrollState = () => {
  scrollFrame = null
  const nextScrolled = window.scrollY > 80
  if (isScrolled.value !== nextScrolled) {
    isScrolled.value = nextScrolled
  }
  if (nextScrolled && languageOpen.value) {
    languageOpen.value = false
  }
  if (nextScrolled && contactOpen.value) {
    contactOpen.value = false
  }
}

const updateScrollState = () => {
  if (scrollFrame !== null) return
  scrollFrame = window.requestAnimationFrame(syncScrollState)
}

const submitSearch = () => {
  const text = keyword.value.trim()
  router.push({ name: 'home', query: text ? { keyword: text } : {} })
}

const scrollPageToTop = () => {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  isScrolled.value = false
}

const goHome = async () => {
  languageOpen.value = false
  contactOpen.value = false
  keyword.value = ''
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem('dujiao.mall.productReturnPath')
  }
  if (router.currentRoute.value.name !== 'home' || router.currentRoute.value.query.keyword !== undefined) {
    await router.replace({ name: 'home' }).catch(async () => {
      await router.push({ name: 'home' }).catch(() => undefined)
    })
  }
  await nextTick()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(mallHomeResetEvent))
    scrollPageToTop()
    window.requestAnimationFrame(() => {
      scrollPageToTop()
      window.requestAnimationFrame(scrollPageToTop)
    })
  }
}

watch(
  () => route.query.keyword,
  (value) => {
    if (route.name === 'home' || route.name === 'products' || route.name === 'category-products') {
      keyword.value = typeof value === 'string' ? value : ''
    }
  },
  { immediate: true },
)

onMounted(() => {
  syncScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollState)
  if (scrollFrame !== null) {
    window.cancelAnimationFrame(scrollFrame)
  }
})
</script>
