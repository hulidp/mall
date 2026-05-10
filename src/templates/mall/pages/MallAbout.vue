<template>
  <div class="mx-auto max-w-[980px] px-0 py-4 sm:px-6 sm:py-8 lg:px-8">
    <section class="border-y border-gray-100 bg-white p-4 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-lg sm:border-0 sm:p-8 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="border-b border-gray-100 pb-6 dark:border-white/10">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">{{ siteName }}</p>
        <h1 class="mt-3 text-3xl font-black text-gray-950 dark:text-white">{{ heroTitle || t('nav.about') }}</h1>
        <p v-if="heroSubtitle" class="mt-3 text-base leading-7 text-gray-500 dark:text-gray-400">{{ heroSubtitle }}</p>
      </div>

      <div v-if="hasContent" class="mt-8 space-y-8">
        <p v-if="introductionText" class="whitespace-pre-line text-base leading-8 text-gray-600 dark:text-gray-300">{{ introductionText }}</p>

        <section v-if="servicesTitle || serviceItems.length">
          <h2 v-if="servicesTitle" class="text-xl font-black text-gray-950 dark:text-white">{{ servicesTitle }}</h2>
          <div v-if="serviceItems.length" class="mt-4 grid gap-3 sm:grid-cols-2">
            <div v-for="(item, index) in serviceItems" :key="index" class="border-t border-gray-100 py-3 text-sm text-gray-600 first:border-t-0 dark:border-white/10 dark:text-gray-300 sm:rounded-md sm:border sm:border-gray-200 sm:px-4 sm:dark:border-white/10">
              {{ item }}
            </div>
          </div>
        </section>

        <section v-if="contactTitle || contactText || contactLinks.length">
          <h2 v-if="contactTitle" class="text-xl font-black text-gray-950 dark:text-white">{{ contactTitle }}</h2>
          <p v-if="contactText" class="mt-3 whitespace-pre-line text-base leading-8 text-gray-600 dark:text-gray-300">{{ contactText }}</p>
          <div v-if="contactLinks.length" class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <a
              v-for="link in contactLinks"
              :key="link.key"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-md border border-gray-200 px-4 py-3 text-center text-sm font-bold text-gray-700 transition hover: dark:border-white/10 dark:text-gray-200 dark:/40 dark:hover:bg-orange-500/10" style="background-color: var(--ui-accent-soft);"
            >
              {{ link.label }}
            </a>
          </div>
        </section>

      </div>

      <MallEmptyState v-else class="mt-8" :title="t('common.noContent')" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../../stores/app'
import { useLocalized } from '../../../composables/useProduct'
import { getWechatContactUrl } from '../../../utils/contact'
import MallEmptyState from '../components/MallEmptyState.vue'

const { t } = useI18n()
const appStore = useAppStore()
const { getLocalizedText } = useLocalized()

const siteName = computed(() => String(appStore.config?.brand?.site_name || 'Huli-Next').trim() || 'Huli-Next')
const aboutConfig = computed(() => appStore.config?.about || null)

const resolveLocalizedText = (raw: unknown): string => getLocalizedText(raw)

const heroTitle = computed(() => resolveLocalizedText(aboutConfig.value?.hero?.title))
const heroSubtitle = computed(() => resolveLocalizedText(aboutConfig.value?.hero?.subtitle))
const introductionText = computed(() => resolveLocalizedText(aboutConfig.value?.introduction))
const servicesTitle = computed(() => resolveLocalizedText(aboutConfig.value?.services?.title))
const contactTitle = computed(() => resolveLocalizedText(aboutConfig.value?.contact?.title))
const contactText = computed(() => resolveLocalizedText(aboutConfig.value?.contact?.text))
const serviceItems = computed(() => {
  const rows = aboutConfig.value?.services?.items
  if (!Array.isArray(rows)) return []
  return rows.map((item) => resolveLocalizedText(item)).filter((item) => item !== '')
})
const contactLinks = computed(() => {
  const contact = appStore.config?.contact as Record<string, unknown> | undefined
  const rows: Array<{ key: string; label: string; url: string }> = []
  const telegram = String(contact?.telegram || '').trim()
  const whatsapp = String(contact?.whatsapp || '').trim()
  const qq = String(contact?.qq || '').trim()
  const wechat = getWechatContactUrl(contact)
  if (telegram) rows.push({ key: 'telegram', label: 'Telegram', url: telegram })
  if (whatsapp) rows.push({ key: 'whatsapp', label: 'WhatsApp', url: whatsapp })
  if (qq) rows.push({ key: 'qq', label: 'QQ', url: qq })
  if (wechat) rows.push({ key: 'wechat', label: appStore.locale === 'en-US' ? 'WeCom' : '企业微信', url: wechat })
  return rows
})
const hasContent = computed(() => {
  return introductionText.value !== '' ||
    servicesTitle.value !== '' ||
    serviceItems.value.length > 0 ||
    contactTitle.value !== '' ||
    contactText.value !== '' ||
    contactLinks.value.length > 0
})
</script>
