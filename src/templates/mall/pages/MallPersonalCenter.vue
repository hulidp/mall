<template>
  <div class="flex min-h-screen w-full min-w-0 bg-[#f7f5f2] text-gray-950 dark:bg-black dark:text-white lg:h-screen lg:min-h-0 lg:overflow-hidden">
    <aside class="hidden h-screen w-[260px] shrink-0 flex-col overflow-hidden border-r border-black/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-neutral-950 lg:flex">
      <section class="rounded-3xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-lg font-black text-[#ff5000] dark:bg-orange-500/10">
            {{ displayInitial }}
          </div>
          <div class="min-w-0">
            <div class="truncate text-base font-black">{{ displayName }}</div>
            <div class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{{ accountEmail }}</div>
          </div>
        </div>
      </section>

      <nav class="mt-4 flex-1 space-y-1">
        <router-link
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.path"
          class="group flex h-11 items-center justify-between rounded-2xl px-4 text-sm font-bold transition"
          :class="currentSection === tab.key ? 'bg-orange-50 text-[#ff5000] ring-1 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/20' : 'text-gray-700 hover:bg-gray-50 hover:text-[#ff5000] dark:text-gray-200 dark:hover:bg-white/5'"
        >
          <span class="flex min-w-0 items-center gap-3">
            <component :is="tab.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ t(tab.label) }}</span>
          </span>
        </router-link>
      </nav>

      <div class="mt-4 space-y-2">
        <button
          type="button"
          class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff5000] text-sm font-black text-white transition hover:bg-orange-600"
          @click="goShopping"
        >
          <HomeIcon class="h-4 w-4" aria-hidden="true" />
          {{ t('orders.continueShopping') }}
        </button>
        <button
          type="button"
          class="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:bg-neutral-950 dark:hover:bg-red-500/10"
          @click="handleLogout"
        >
          <ArrowLeftOnRectangleIcon class="h-4 w-4" aria-hidden="true" />
          {{ t('navbar.logout') }}
        </button>
      </div>
    </aside>

    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] lg:hidden"
        @click="closeMobileMenu"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="mobileMenuOpen"
        class="fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-[320px] flex-col overflow-hidden border-r border-black/10 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-neutral-950 lg:hidden"
      >
        <div class="flex items-start justify-between gap-3">
          <section class="min-w-0 flex-1 rounded-3xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-lg font-black text-[#ff5000] dark:bg-orange-500/10">
                {{ displayInitial }}
              </div>
              <div class="min-w-0">
                <div class="truncate text-base font-black">{{ displayName }}</div>
                <div class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{{ accountEmail }}</div>
              </div>
            </div>
          </section>
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-gray-600 dark:border-white/10 dark:text-gray-300"
            aria-label="关闭菜单"
            @click="closeMobileMenu"
          >
            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav class="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
          <router-link
            v-for="tab in tabs"
            :key="tab.key"
            :to="tab.path"
            class="group flex h-11 items-center justify-between rounded-2xl px-4 text-sm font-bold transition"
            :class="currentSection === tab.key ? 'bg-orange-50 text-[#ff5000] ring-1 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/20' : 'text-gray-700 hover:bg-gray-50 hover:text-[#ff5000] dark:text-gray-200 dark:hover:bg-white/5'"
            @click="closeMobileMenu"
          >
            <span class="flex min-w-0 items-center gap-3">
              <component :is="tab.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
              <span class="truncate">{{ t(tab.label) }}</span>
            </span>
          </router-link>
        </nav>

        <div class="mt-4 space-y-2">
          <button
            type="button"
            class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff5000] text-sm font-black text-white transition hover:bg-orange-600"
            @click="goShopping"
          >
            <HomeIcon class="h-4 w-4" aria-hidden="true" />
            {{ t('orders.continueShopping') }}
          </button>
          <button
            type="button"
            class="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:bg-neutral-950 dark:hover:bg-red-500/10"
            @click="handleLogout"
          >
            <ArrowLeftOnRectangleIcon class="h-4 w-4" aria-hidden="true" />
            {{ t('navbar.logout') }}
          </button>
        </div>
      </aside>
    </Transition>

    <main class="min-w-0 flex-1 px-0 py-1.5 pb-4 sm:px-6 sm:py-3 lg:h-screen lg:overflow-y-auto lg:overscroll-contain 2xl:px-8">
      <!-- Mobile drawer trigger -->
      <header class="sticky top-0 z-20 mb-1.5 flex items-center gap-2.5 border-b border-gray-200 bg-white/95 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-neutral-950/95 sm:-mx-6 sm:mb-4 sm:px-6 sm:py-2.5 lg:hidden">
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-gray-700 dark:border-white/10 dark:text-gray-200"
          aria-label="打开菜单"
          @click="openMobileMenu"
        >
          <Bars3Icon class="h-5 w-5" aria-hidden="true" />
        </button>
        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">{{ t('personalCenter.title') }}</p>
          <h1 class="mt-0.5 truncate text-base font-black text-gray-950 dark:text-white">{{ currentTabLabel }}</h1>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff5000] text-white"
          :aria-label="t('orders.continueShopping')"
          @click="goShopping"
        >
          <HomeIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

        <div v-if="currentSection === 'overview'" class="w-full">
          <section class="grid gap-1.5 sm:gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
            <div class="overflow-hidden border-y border-black/10 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-950 sm:rounded-3xl sm:border sm:shadow-sm">
              <div class="p-2.5 sm:p-8">
                <div>
                  <p class="hidden text-[11px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400 sm:block sm:tracking-[0.35em]">{{ t('personalCenter.title') }}</p>
                  <h1 class="break-words text-lg font-black leading-tight sm:mt-4 sm:text-4xl">
                    {{ t('personalCenter.overview.welcomeBack') }}，{{ displayName }}
                  </h1>
                  <p class="mt-1 break-words text-xs leading-5 text-gray-500 dark:text-gray-400 sm:mt-3 sm:text-sm sm:leading-6">{{ t('personalCenter.subtitle') }}</p>
                  <div class="mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-black/10 dark:bg-white/10 sm:mt-8 sm:gap-3 sm:overflow-visible sm:rounded-none sm:bg-transparent sm:dark:bg-transparent">
                    <div class="min-w-0 bg-[#fbfaf8] px-2 py-2 dark:bg-white/[0.04] sm:rounded-2xl sm:border sm:border-black/10 sm:bg-white/70 sm:p-4 sm:dark:border-white/10">
                      <div class="text-xs font-bold text-gray-500">{{ t('personalCenter.overview.accountLabel') }}</div>
                      <div class="mt-1 truncate font-black sm:mt-2 sm:break-all">{{ displayName }}</div>
                    </div>
                    <div class="min-w-0 bg-[#fbfaf8] px-2 py-2 dark:bg-white/[0.04] sm:rounded-2xl sm:border sm:border-black/10 sm:bg-white/70 sm:p-4 sm:dark:border-white/10">
                      <div class="text-xs font-bold text-gray-500">{{ t('personalCenter.wallet.balanceLabel') }}</div>
                      <div class="mt-1 truncate text-lg font-black text-[#ff5000] sm:mt-2 sm:break-all sm:text-xl">{{ walletBalanceDisplay }}</div>
                    </div>
                    <div class="min-w-0 bg-[#fbfaf8] px-2 py-2 dark:bg-white/[0.04] sm:rounded-2xl sm:border sm:border-black/10 sm:bg-white/70 sm:p-4 sm:dark:border-white/10">
                      <div class="text-xs font-bold text-gray-500">{{ t('personalCenter.overview.recentOrdersTitle') }}</div>
                      <div class="mt-1 text-lg font-black sm:mt-2 sm:text-xl">{{ recentOrderTotal }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-y border-black/10 bg-white/95 p-2.5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-950 sm:rounded-3xl sm:border sm:p-6 sm:shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 sm:text-[11px] sm:tracking-[0.35em]">{{ t('personalCenter.memberLevel.currentLevel') }}</p>
                  <div class="mt-1.5 flex min-w-0 items-center gap-2 text-lg font-black sm:mt-4 sm:text-2xl">
                    <SparklesIcon class="h-5 w-5 text-[#ff5000] sm:h-6 sm:w-6" aria-hidden="true" />
                    <span class="min-w-0 break-words">{{ memberLevelName }}</span>
                  </div>
                </div>
                <span class="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#ff5000] dark:bg-orange-500/10">{{ memberDiscountText }}</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10 sm:mt-8">
                <div class="h-full w-1/2 rounded-full bg-[#ff5000]"></div>
              </div>
              <div class="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-black/10 dark:bg-white/10 sm:mt-4 sm:gap-3 sm:overflow-visible sm:rounded-none sm:bg-transparent sm:dark:bg-transparent">
                <div class="bg-[#fbfaf8] px-2 py-2 dark:bg-white/[0.04] sm:rounded-2xl sm:border sm:border-black/10 sm:bg-transparent sm:p-4 sm:dark:border-white/10">
                  <div class="text-xs text-gray-500">{{ t('personalCenter.overview.emailVerified') }}</div>
                  <div class="mt-2 font-black" :class="emailVerified ? 'text-emerald-600 dark:text-emerald-300' : 'text-gray-500'">
                    {{ emailVerified ? t('common.success') : t('personalCenter.overview.emailUnverified') }}
                  </div>
                </div>
                <div class="bg-[#fbfaf8] px-2 py-2 dark:bg-white/[0.04] sm:rounded-2xl sm:border sm:border-black/10 sm:bg-transparent sm:p-4 sm:dark:border-white/10">
                  <div class="text-xs text-gray-500">{{ t('personalCenter.memberLevel.discountRate') }}</div>
                  <div class="mt-2 font-black">{{ memberDiscountText }}</div>
                </div>
              </div>
              <router-link
                to="/me/wallet"
                class="mt-2 flex h-9 items-center justify-center gap-2 rounded-xl bg-[#ff5000] text-sm font-black text-white transition hover:bg-orange-600 sm:mt-5 sm:h-11"
              >
                <BoltIcon class="h-4 w-4" aria-hidden="true" />
                {{ t('personalCenter.tabs.wallet') }}
              </router-link>
            </div>
          </section>

          <section class="mt-1.5 grid gap-1.5 sm:mt-5 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
            <div class="border-y border-black/10 bg-white p-2.5 shadow-none dark:border-white/10 dark:bg-neutral-950 sm:rounded-3xl sm:border sm:p-6 sm:shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 sm:text-[11px] sm:tracking-[0.35em]">{{ t('personalCenter.tabs.profile') }}</p>
                  <h2 class="mt-1 break-words text-lg font-black sm:mt-3 sm:text-2xl">{{ t('personalCenter.overview.accountLabel') }}</h2>
                </div>
                <router-link to="/me/wallet" class="hidden rounded-xl border border-black/10 px-4 py-2 text-sm font-bold hover:text-[#ff5000] dark:border-white/10 sm:inline-flex">
                  {{ t('personalCenter.tabs.wallet') }}
                </router-link>
              </div>

              <div class="mt-2 divide-y divide-black/10 border-y border-black/10 dark:divide-white/10 dark:border-white/10 sm:mt-5">
                <div class="grid gap-1 py-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-2 sm:py-4">
                  <div class="text-sm font-bold text-gray-500">{{ t('personalCenter.profile.emailLabel') }}</div>
                  <div class="min-w-0 break-all font-mono font-bold sm:text-right">{{ accountEmail }}</div>
                </div>
                <div class="grid gap-1 py-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-2 sm:py-4">
                  <div class="text-sm font-bold text-gray-500">{{ t('personalCenter.wallet.balanceLabel') }}</div>
                  <div class="break-all font-black text-[#ff5000] sm:text-right">{{ walletBalanceDisplay }}</div>
                </div>
              </div>

              <div v-if="!emailVerified" class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                <div class="flex min-w-0 items-center gap-2">
                  <ExclamationTriangleIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{{ t('personalCenter.overview.emailUnverified') }}</span>
                </div>
                <router-link to="/me/security" class="font-black hover:underline">{{ t('personalCenter.tabs.security') }}</router-link>
              </div>
            </div>

            <div class="border-y border-black/10 bg-white p-2.5 shadow-none dark:border-white/10 dark:bg-neutral-950 sm:rounded-3xl sm:border sm:p-6 sm:shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 sm:text-[11px] sm:tracking-[0.35em]">{{ t('nav.products') }}</p>
                  <h2 class="mt-1 text-lg font-black sm:mt-3 sm:text-2xl">{{ t('common.viewDetails') }}</h2>
                </div>
                <ArrowRightIcon class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
              <div class="mt-2 space-y-1.5 sm:mt-5 sm:space-y-3">
                <router-link
                  v-for="action in quickActions"
                  :key="action.path"
                  :to="action.path"
                  class="flex items-center gap-2.5 rounded-xl border border-black/10 p-2.5 transition hover:border-orange-200 hover:bg-orange-50 dark:border-white/10 dark:hover:border-orange-500/20 dark:hover:bg-orange-500/10 sm:gap-4 sm:rounded-2xl sm:p-4"
                >
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl" :class="action.iconClass">
                    <component :is="action.icon" class="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block break-words font-black leading-5">{{ action.title }}</span>
                    <span class="mt-1 hidden break-words text-sm leading-5 text-gray-500 dark:text-gray-400 sm:block">{{ action.description }}</span>
                  </span>
                  <ArrowRightIcon class="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                </router-link>
              </div>
            </div>
          </section>
        </div>

        <div v-else class="w-full lg:h-[calc(100vh-3.25rem)] lg:min-h-0 lg:[&>*]:h-full">
          <MallPersonalProfile v-if="currentSection === 'profile'" />
          <MallPersonalSecurity v-else-if="currentSection === 'security'" />
          <MallPersonalOrders v-else-if="currentSection === 'orders'" />
          <MallPersonalWallet v-else-if="currentSection === 'wallet'" />
          <MallPersonalAffiliate v-else-if="currentSection === 'affiliate'" />
          <MallPersonalGiftCard v-else-if="currentSection === 'giftCard'" />
          <MallPersonalApi v-else-if="currentSection === 'api'" />
        </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightIcon,
  Bars3Icon,
  BoltIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  HomeIcon,
  ShareIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UserIcon,
  WalletIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { walletAPI } from '../../../api'
import { useAppStore } from '../../../stores/app'
import { useUserAuthStore } from '../../../stores/userAuth'
import { useUserProfileStore } from '../../../stores/userProfile'
import { formatMallMoney } from '../utils'
import MallPersonalAffiliate from '../components/personal/MallPersonalAffiliate.vue'
import MallPersonalApi from '../components/personal/MallPersonalApi.vue'
import MallPersonalGiftCard from '../components/personal/MallPersonalGiftCard.vue'
import MallPersonalOrders from '../components/personal/MallPersonalOrders.vue'
import MallPersonalProfile from '../components/personal/MallPersonalProfile.vue'
import MallPersonalSecurity from '../components/personal/MallPersonalSecurity.vue'
import MallPersonalWallet from '../components/personal/MallPersonalWallet.vue'

type PersonalSection = 'overview' | 'profile' | 'security' | 'orders' | 'wallet' | 'giftCard' | 'affiliate' | 'api'

const props = withDefaults(defineProps<{ section?: PersonalSection }>(), {
  section: 'overview',
})

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const userAuthStore = useUserAuthStore()
const userProfileStore = useUserProfileStore()
const walletBalance = ref('0.00')
const mobileMenuOpen = ref(false)
const mallHomeResetEvent = 'dujiao.mall.home-reset'

const tabs: Array<{ key: PersonalSection; label: string; path: string; icon: Component }> = [
  { key: 'overview', label: 'personalCenter.tabs.overview', path: '/me', icon: UserIcon },
  { key: 'profile', label: 'personalCenter.tabs.profile', path: '/me/profile', icon: Cog6ToothIcon },
  { key: 'security', label: 'personalCenter.tabs.security', path: '/me/security', icon: ShieldCheckIcon },
  { key: 'orders', label: 'personalCenter.tabs.orders', path: '/me/orders', icon: ShoppingBagIcon },
  { key: 'wallet', label: 'personalCenter.tabs.wallet', path: '/me/wallet', icon: WalletIcon },
  { key: 'giftCard', label: 'personalCenter.tabs.giftCard', path: '/me/gift-cards', icon: GiftIcon },
  { key: 'affiliate', label: 'personalCenter.tabs.affiliate', path: '/me/affiliate', icon: ShareIcon },
  { key: 'api', label: 'personalCenter.tabs.api', path: '/me/api', icon: CodeBracketIcon },
]

const currentSection = computed<PersonalSection>(() => props.section || 'overview')
const currentTabLabel = computed(() => {
  const tab = tabs.find((item) => item.key === currentSection.value)
  return t(tab?.label || 'personalCenter.tabs.overview')
})

const profile = computed(() => userProfileStore.profile)
const recentOrders = computed(() => userProfileStore.recentOrders || [])
const recentOrderTotal = computed(() => recentOrders.value.length)
const accountEmail = computed(() => profile.value?.email || userAuthStore.user?.email || '-')
const emailVerified = computed(() => Boolean(profile.value?.email_verified_at))
const displayName = computed(() => userProfileStore.displayName || userAuthStore.user?.nickname || userAuthStore.user?.email || '-')
const displayInitial = computed(() => {
  const value = String(displayName.value || '').trim()
  return value ? value.slice(0, 1).toUpperCase() : 'U'
})
const memberLevelName = computed(() => {
  const level = userProfileStore.currentLevel
  if (!level) return t('personalCenter.memberLevel.defaultLevel')
  const name = level.name || {}
  return name[appStore.locale] || name['zh-CN'] || name['zh-TW'] || name['en-US'] || level.slug || t('personalCenter.memberLevel.defaultLevel')
})
const memberDiscountText = computed(() => {
  const level = userProfileStore.currentLevel
  if (!level || !Number.isFinite(Number(level.discount_rate))) return t('personalCenter.memberLevel.noDiscount')
  const discount = Number(level.discount_rate)
  if (discount <= 0 || discount >= 1) return t('personalCenter.memberLevel.noDiscount')
  return t('personalCenter.memberLevel.discountOff', { n: Math.round(discount * 100) })
})
const currency = computed(() => String(appStore.config?.currency || 'CNY'))
const walletBalanceDisplay = computed(() => formatMoney(walletBalance.value, currency.value))
const quickActions = computed(() => [
  {
    title: t('personalCenter.tabs.orders'),
    description: t('orders.subtitle'),
    path: '/me/orders',
    icon: ShoppingBagIcon,
    iconClass: 'bg-orange-50 text-[#ff5000] dark:bg-orange-500/10',
  },
  {
    title: t('personalCenter.tabs.wallet'),
    description: t('personalCenter.wallet.subtitle'),
    path: '/me/wallet',
    icon: WalletIcon,
    iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  {
    title: t('personalCenter.tabs.giftCard'),
    description: t('personalCenter.giftCard.subtitle'),
    path: '/me/gift-cards',
    icon: GiftIcon,
    iconClass: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
  },
])

const formatMoney = (amount?: unknown, currencyValue?: string) => formatMallMoney(amount || '0.00', currencyValue || currency.value)

const clearMallReturnState = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem('dujiao.mall.productReturnPath')
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const openMobileMenu = () => {
  mobileMenuOpen.value = true
}

const scrollPageToTop = () => {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

const resetMallHome = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(mallHomeResetEvent))
  scrollPageToTop()
  window.requestAnimationFrame(() => {
    scrollPageToTop()
    window.requestAnimationFrame(scrollPageToTop)
  })
}

const goShopping = async () => {
  closeMobileMenu()
  clearMallReturnState()
  if (router.currentRoute.value.name !== 'home') {
    await router.replace({ name: 'home' }).catch(async () => {
      await router.push({ name: 'home' }).catch(() => undefined)
    })
  }
  await nextTick()
  resetMallHome()
}

const handleLogout = async () => {
  closeMobileMenu()
  clearMallReturnState()
  await userAuthStore.logout('/').catch(() => undefined)
  if (router.currentRoute.value.name !== 'home') {
    await router.replace({ name: 'home' }).catch(async () => {
      await router.push({ name: 'home' }).catch(() => undefined)
    })
  }
  await nextTick()
  resetMallHome()
}

const loadWalletBalance = async () => {
  try {
    const response = await walletAPI.account()
    walletBalance.value = String(response.data.data?.balance || '0.00')
  } catch {
    walletBalance.value = '0.00'
  }
}

const loadBaseData = async () => {
  await Promise.all([
    userProfileStore.loadProfile(),
    userProfileStore.loadMemberLevels(),
    userProfileStore.loadRecentOrders(5),
    loadWalletBalance(),
    appStore.config ? Promise.resolve() : appStore.loadConfig(),
  ])
}

watch(
  () => currentSection.value,
  (section) => {
    closeMobileMenu()
    if (section === 'overview') {
      void Promise.all([userProfileStore.loadRecentOrders(5), loadWalletBalance()])
    }
  },
)

watch(mobileMenuOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(loadBaseData)
onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>
