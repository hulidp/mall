<template>
  <header class="border-b" style="background-color: var(--ui-bg-elevated); border-color: var(--ui-border); color: var(--ui-text-primary);">
    <div class="border-b text-sm" style="background-color: var(--ui-bg-soft); border-color: var(--ui-border); color: var(--ui-text-secondary);">
      <div class="mx-auto flex h-9 max-w-[1536px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div class="flex min-w-0 items-center gap-4">
          <button
            type="button"
            class="max-w-[120px] shrink-0 truncate font-semibold transition-colors sm:max-w-[180px]"
            style="color: var(--ui-text-primary);"
            :title="t('nav.home')"
            @click="goHome"
          >
            {{ siteName }}
          </button>
          <router-link
            v-if="userAuthStore.isAuthenticated"
            to="/me"
            class="max-w-[180px] truncate transition-colors hover:opacity-80"
            style="color: var(--ui-accent);"
          >
            {{ currentUserLabel }}
          </router-link>
          <button v-else type="button" class="shrink-0 transition-colors hover:opacity-80" style="color: var(--ui-accent);" @click="openMallAuthModal('login')">
            {{ t('navbar.login') }}
          </button>
          <button type="button" class="hidden shrink-0 transition-colors hover:opacity-80 sm:inline" @click="toggleTheme">
            {{ themeToggleLabel }}
          </button>
          <div
            class="relative hidden h-9 shrink-0 items-center whitespace-nowrap text-sm leading-9 md:flex"
            @mouseenter="languageOpen = true; contactOpen = false"
            @mouseleave="languageOpen = false"
          >
            <button
              type="button"
              class="flex h-9 shrink-0 items-center gap-1 px-1 transition-colors"
              :style="languageOpen ? 'color: var(--ui-accent);' : ''"
              @click="languageOpen = !languageOpen; contactOpen = false"
            >
              <span class="inline-block">{{ currentLocaleLabel }}</span>
              <ChevronUpIcon v-if="languageOpen" class="h-3 w-3 stroke-[1.8]" aria-hidden="true" />
              <ChevronDownIcon v-else class="h-3 w-3 stroke-[1.8]" aria-hidden="true" />
            </button>
            <div
              v-if="languageOpen"
              class="absolute left-0 top-full z-50 w-32 overflow-hidden rounded-lg border py-1 text-sm shadow-lg"
              style="background-color: var(--ui-bg-elevated); border-color: var(--ui-border); color: var(--ui-text-secondary);"
            >
              <button
                v-for="lang in mallLocales"
                :key="lang.code"
                type="button"
                class="block w-full px-4 py-2 text-left transition-colors"
                :style="appStore.locale === lang.code ? 'color: var(--ui-accent); font-weight: 600; background-color: var(--ui-accent-soft);' : ''"
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
            class="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style="color: var(--ui-text-secondary);"
          >
            <ShoppingBagIcon class="h-5 w-5" aria-hidden="true" />
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none"
              style="background-color: var(--ui-accent); color: var(--ui-text-on-accent);"
            >
              {{ cartStore.totalItems > 9 ? '9+' : cartStore.totalItems }}
            </span>
          </router-link>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style="color: var(--ui-text-secondary);"
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
            class="whitespace-nowrap transition-colors hover:opacity-80"
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
              class="flex h-9 shrink-0 items-center gap-1 transition-colors"
              :style="contactOpen ? 'color: var(--ui-accent);' : ''"
              @click="contactOpen = !contactOpen; languageOpen = false"
            >
              <span>{{ contactDropdownLabel }}</span>
              <ChevronUpIcon v-if="contactOpen" class="h-3 w-3 stroke-[1.8]" aria-hidden="true" />
              <ChevronDownIcon v-else class="h-3 w-3 stroke-[1.8]" aria-hidden="true" />
            </button>
            <div
              v-if="contactOpen"
              class="absolute right-0 top-full z-50 w-36 overflow-hidden rounded-lg border py-1 text-sm shadow-lg"
              style="background-color: var(--ui-bg-elevated); border-color: var(--ui-border); color: var(--ui-text-secondary);"
            >
              <a
                v-for="item in contactNavItems"
                :key="item.key"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block px-4 py-2 transition-colors"
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
            class="whitespace-nowrap transition-colors hover:opacity-80"
            @click="openTopNavItem(item)"
          >
            {{ item.label }}
          </button>
          <router-link
            v-if="!userAuthStore.isAuthenticated"
            to="/guest/orders"
            class="whitespace-nowrap transition-colors hover:opacity-80"
          >
            {{ t('navbar.guestOrders') }}
          </router-link>
          <router-link
            v-if="userAuthStore.isAuthenticated"
            to="/me/orders"
            class="whitespace-nowrap transition-colors hover:opacity-80"
          >
            {{ t('orders.title') }}
          </router-link>
          <router-link to="/cart" class="whitespace-nowrap transition-colors hover:opacity-80">
            {{ t('navbar.cart') }} {{ cartStore.totalItems }}
          </router-link>
          <router-link
            v-if="userAuthStore.isAuthenticated"
            to="/me"
            class="whitespace-nowrap transition-colors hover:opacity-80"
          >
            {{ t('navbar.personalCenter') }}
          </router-link>
          <button
            v-if="userAuthStore.isAuthenticated"
            type="button"
            class="whitespace-nowrap transition-colors"
            style="color: var(--ui-danger);"
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
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold sm:h-11 sm:w-11 sm:text-lg"
          style="background-color: var(--ui-accent); color: var(--ui-text-on-accent);"
        >
          {{ siteInitial }}
        </span>
        <span class="truncate text-lg font-bold sm:text-2xl" style="color: var(--ui-accent);">{{ siteName }}</span>
      </button>

      <form
        class="flex h-10 min-w-0 overflow-hidden rounded-xl border-2 sm:h-11"
        style="border-color: var(--ui-accent); background-color: var(--ui-bg-elevated);"
        @submit.prevent="submitSearch"
      >
        <input
          v-model="keyword"
          class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none sm:px-4"
          style="color: var(--ui-text-primary);"
          :placeholder="searchPlaceholder"
        />
        <button class="w-20 text-sm font-semibold transition-colors sm:w-24" style="background-color: var(--ui-accent); color: var(--ui-text-on-accent);" type="submit">
          {{ t('products.searchLabel') }}
        </button>
      </form>

    </div>
  </header>

  <div
    v-if="showBrandSearch"
    class="fixed left-0 right-0 top-0 z-50 border-b shadow-sm transition-all duration-200 ease-out"
    style="background-color: var(--ui-bg-elevated); border-color: var(--ui-border); color: var(--ui-text-primary);"
    :class="isScrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'"
    :aria-hidden="!isScrolled"
  >
    <div class="mx-auto grid max-w-[1536px] gap-2 px-4 py-2 sm:gap-3 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-center lg:px-8">
      <button type="button" class="inline-flex min-w-0 items-center gap-3 text-left" @click="goHome">
        <img v-if="siteIcon" :src="siteIcon" alt="" class="h-7 w-7 shrink-0 rounded-lg object-cover sm:h-8 sm:w-8" />
        <span v-else class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold sm:h-8 sm:w-8 sm:text-sm" style="background-color: var(--ui-accent); color: var(--ui-text-on-accent);">
          {{ siteInitial }}
        </span>
        <span class="truncate text-base font-bold sm:text-xl" style="color: var(--ui-accent);">{{ siteName }}</span>
      </button>

      <form class="flex h-9 min-w-0 overflow-hidden rounded-xl border-2 sm:h-10" style="border-color: var(--ui-accent); background-color: var(--ui-bg-elevated);" @submit.prevent="submitSearch">
        <input
          v-model="keyword"
          class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none sm:px-4"
          style="color: var(--ui-text-primary);"
          :placeholder="searchPlaceholder"
        />
        <button class="w-20 text-sm font-semibold sm:w-24" style="background-color: var(--ui-accent); color: var(--ui-text-on-accent);" type="submit">
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
  <div class="fixed inset-0 bg-black/40" @click="mobileMenuOpen = false" />
  <!-- 抽屉面板 -->
  <div class="relative ml-auto flex h-full w-[80vw] max-w-[300px] flex-col overflow-y-auto shadow-2xl" style="background-color: var(--ui-bg-elevated);">
    <!-- 顶部 -->
    <div class="flex items-center justify-between border-b px-4 py-3" style="border-color: var(--ui-border);">
      <span class="text-base font-bold" style="color: var(--ui-text-primary);">{{ siteName }}</span>
      <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full transition-colors" style="color: var(--ui-text-muted);" @click="mobileMenuOpen = false">
        <XMarkIcon class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    <!-- 用户信息 -->
    <div class="border-b px-4 py-3" style="border-color: var(--ui-border);">
      <template v-if="userAuthStore.isAuthenticated">
        <router-link to="/me" class="flex items-center gap-3" @click="mobileMenuOpen = false">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style="background-color: var(--ui-accent-soft); color: var(--ui-accent);">
            {{ currentUserLabel.slice(0, 1).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold" style="color: var(--ui-text-primary);">{{ currentUserLabel }}</div>
            <div class="text-xs" style="color: var(--ui-text-muted);">{{ t('navbar.personalCenter') }}</div>
          </div>
        </router-link>
      </template>
      <button
        v-else
        type="button"
        class="theme-btn-primary flex h-10 w-full items-center justify-center rounded-xl border text-sm font-semibold"
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
        class="flex h-11 w-full items-center rounded-xl px-3 text-sm font-medium transition-colors"
        style="color: var(--ui-text-secondary);"
        @click="openTopNavItem(item); mobileMenuOpen = false"
      >
        {{ item.label }}
      </button>

      <div class="py-1"><div class="border-t" style="border-color: var(--ui-border);" /></div>

      <template v-if="userAuthStore.isAuthenticated">
        <router-link to="/me/orders" class="flex h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors" style="color: var(--ui-text-secondary);" @click="mobileMenuOpen = false">
          {{ t('orders.title') }}
        </router-link>
        <router-link to="/me" class="flex h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors" style="color: var(--ui-text-secondary);" @click="mobileMenuOpen = false">
          {{ t('navbar.personalCenter') }}
        </router-link>
      </template>
      <router-link v-else to="/guest/orders" class="flex h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors" style="color: var(--ui-text-secondary);" @click="mobileMenuOpen = false">
        {{ t('navbar.guestOrders') }}
      </router-link>

      <template v-if="contactNavItems.length">
        <div class="py-1"><div class="border-t" style="border-color: var(--ui-border);" /></div>
        <a
          v-for="item in contactNavItems"
          :key="item.key"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors"
          style="color: var(--ui-text-secondary);"
          @click="openContactNavItem"
        >
          {{ item.label }}
        </a>
      </template>

      <template v-if="customItems.length">
        <div class="py-1"><div class="border-t" style="border-color: var(--ui-border);" /></div>
        <button
          v-for="item in customItems"
          :key="item.key"
          type="button"
          class="flex h-11 w-full items-center rounded-xl px-3 text-sm font-medium transition-colors"
          style="color: var(--ui-text-secondary);"
          @click="openTopNavItem(item); mobileMenuOpen = false"
        >
          {{ item.label }}
        </button>
      </template>

      <div class="py-1"><div class="border-t" style="border-color: var(--ui-border);" /></div>

      <!-- 语言切换 -->
      <div class="px-3 py-2">
        <div class="mb-2 text-xs font-medium" style="color: var(--ui-text-muted);">{{ currentLocaleLabel }}</div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="lang in mallLocales"
            :key="lang.code"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :style="appStore.locale === lang.code ? 'background-color: var(--ui-accent); color: var(--ui-text-on-accent);' : 'background-color: var(--ui-bg-soft); color: var(--ui-text-secondary);'"
            @click="selectLocale(lang.code)"
          >
            {{ lang.label }}
          </button>
        </div>
      </div>

      <!-- 主题切换 -->
      <button
        type="button"
        class="flex h-11 w-full items-center rounded-xl px-3 text-sm font-medium transition-colors"
        style="color: var(--ui-text-secondary);"
        @click="toggleTheme"
      >
        {{ themeToggleLabel }}
      </button>
    </nav>

    <!-- 退出 -->
    <div v-if="userAuthStore.isAuthenticated" class="border-t px-3 py-3" style="border-color: var(--ui-border);">
      <button
        type="button"
        class="flex h-11 w-full items-center rounded-xl px-3 text-sm font-medium"
        style="color: var(--ui-danger);"
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
