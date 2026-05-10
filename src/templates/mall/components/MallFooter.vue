<template>
  <footer class="shrink-0 border-t border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-neutral-950 dark:text-gray-400">
    <div class="mx-auto flex min-h-[64px] max-w-[1536px] items-center px-4 py-2 sm:px-6 lg:px-8">
      <div class="flex w-full flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2.5">
            <img v-if="siteIcon" :src="siteIcon" alt="" class="h-8 w-8 shrink-0 rounded-lg object-cover" />
            <span v-else class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-sm font-black text-white">
              {{ brandInitial }}
            </span>
            <div class="min-w-0">
              <h3 class="truncate text-sm font-black text-gray-950 dark:text-white">{{ siteName }}</h3>
              <p class="line-clamp-1 max-w-xl text-xs leading-4 text-gray-500 dark:text-gray-400">
                {{ description || t('footer.description') }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
          <router-link v-if="hasTerms" to="/terms" class="shrink-0 hover:text-orange-600">{{ t('footer.terms') }}</router-link>
          <router-link v-if="hasPrivacy" to="/privacy" class="shrink-0 hover:text-orange-600">{{ t('footer.privacy') }}</router-link>
          <a
            v-for="link in footerLinks"
            :key="link.key"
            :href="link.url || 'javascript:void(0)'"
            :target="link.url ? '_blank' : undefined"
            rel="noopener noreferrer"
            class="shrink-0 hover:text-orange-600"
          >
            {{ link.label }}
          </a>

          <!-- 联系方式图标 -->
          <div v-if="contactInfo.telegram || contactInfo.whatsapp || contactInfo.qq || contactInfo.wechat" class="ml-2 flex items-center gap-1.5">
            <a v-if="contactInfo.telegram" :href="contactInfo.telegram" target="_blank" rel="noopener noreferrer" class="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#229ED9] shadow-sm transition hover:scale-105 hover:bg-orange-50 dark:bg-neutral-900 dark:hover:bg-white/5">
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            </a>
            <a v-if="contactInfo.whatsapp" :href="contactInfo.whatsapp" target="_blank" rel="noopener noreferrer" class="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#25D366] shadow-sm transition hover:scale-105 hover:bg-orange-50 dark:bg-neutral-900 dark:hover:bg-white/5">
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <a v-if="contactInfo.qq" :href="contactInfo.qq" target="_blank" rel="noopener noreferrer" class="flex h-6 w-6 items-center justify-center rounded-full bg-white p-1 shadow-sm transition hover:scale-105 hover:bg-orange-50 dark:bg-neutral-900 dark:hover:bg-white/5" title="QQ">
              <QQIcon class="h-4 w-4" />
            </a>
            <a v-if="contactInfo.wechat" :href="contactInfo.wechat" target="_blank" rel="noopener noreferrer" class="flex h-6 w-6 items-center justify-center rounded-full bg-white p-1 shadow-sm transition hover:scale-105 hover:bg-orange-50 dark:bg-neutral-900 dark:hover:bg-white/5" title="企业微信">
              <WechatWorkIcon class="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 bg-gray-100 py-1.5 dark:border-white/10 dark:bg-neutral-900/50">
      <div class="mx-auto flex max-w-[1536px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-center text-xs text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8">
        <p class="shrink-0">{{ copyright }}</p>
        <span aria-hidden="true">&middot;</span>
        <a
          href="https://github.com/dujiao-next"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-1.5 whitespace-nowrap hover:text-orange-600"
        >
          <span>&copy; 2026 Dujiao-Next</span>
          <span aria-hidden="true">&middot;</span>
          <svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.799 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          <span>https://github.com/dujiao-next</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../../stores/app'
import { useLocalized } from '../../../composables/useProduct'
import { getImageUrl } from '../../../utils/image'
import { getWechatContactUrl } from '../../../utils/contact'
import QQIcon from '../../../components/icons/QQIcon.vue'
import WechatWorkIcon from '../../../components/icons/WechatWorkIcon.vue'

const appStore = useAppStore()
const { t } = useI18n()
const { getLocalizedText } = useLocalized()

const siteName = computed(() => String(appStore.config?.brand?.site_name || 'Huli-Next'))
const brandInitial = computed(() => siteName.value.slice(0, 1).toUpperCase())
const siteIcon = computed(() => {
  const icon = String(appStore.config?.brand?.site_icon || '').trim()
  return icon ? getImageUrl(icon) : ''
})
const description = computed(() => {
  return getLocalizedText(appStore.config?.brand?.site_description) || getLocalizedText(appStore.config?.seo?.description)
})
const copyright = computed(() => String(appStore.config?.brand?.copyright || `Copyright ${new Date().getFullYear()} ${siteName.value}`))
const legal = computed(() => appStore.config?.legal || {})
const hasTerms = computed(() => Boolean(String(legal.value?.terms?.[appStore.locale] || '').trim()))
const hasPrivacy = computed(() => Boolean(String(legal.value?.privacy?.[appStore.locale] || '').trim()))

const footerLinks = computed(() => {
  const rows = appStore.config?.footer_links
  if (!Array.isArray(rows)) return []
  return rows
    .map((item: any, index) => {
      const label = getLocalizedText(item?.name) || String(item?.name || '').trim()
      const url = String(item?.url || '').trim()
      return { key: `${index}-${label}-${url}`, label, url }
    })
    .filter((item) => item.label)
})

const contactInfo = computed(() => {
  const contact = appStore.config?.contact as Record<string, unknown> | undefined
  return {
    telegram: String(contact?.telegram || '').trim(),
    whatsapp: String(contact?.whatsapp || '').trim(),
    qq: String(contact?.qq || '').trim(),
    wechat: getWechatContactUrl(contact),
  }
})

</script>
