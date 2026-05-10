<template>
  <div class="mx-auto max-w-[980px] px-0 py-2 sm:px-6 sm:py-8 lg:px-8">
    <article class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-lg sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <header class="border-b border-gray-100 p-3 dark:border-white/10 sm:p-8">
        <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-orange-600" style="background-color: var(--ui-accent-soft);">
          {{ siteName }}
        </span>
        <h1 class="mt-2 text-xl font-black leading-tight text-gray-950 dark:text-white sm:mt-4 sm:text-3xl">{{ title }}</h1>
      </header>

      <div class="p-3 sm:p-8">
        <div
          v-if="content"
          class="mall-rich-text prose prose-gray max-w-none prose-headings:font-black prose-p:leading-8 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:text-orange-700 prose-img:rounded-lg dark:prose-invert"
          v-html="safeContent"
        ></div>
        <MallEmptyState v-else :title="t('common.noContent')" />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../../stores/app'
import { processHtmlForDisplay } from '../../../utils/content'
import { sanitizeMallHtml } from '../utils'
import MallEmptyState from '../components/MallEmptyState.vue'

const props = defineProps<{
  type: 'terms' | 'privacy'
}>()

const { t } = useI18n()
const appStore = useAppStore()

const siteName = computed(() => String(appStore.config?.brand?.site_name || 'Huli-Next').trim() || 'Huli-Next')
const title = computed(() => props.type === 'terms' ? t('footer.terms') : t('footer.privacy'))
const content = computed(() => {
  const legal = appStore.config?.legal
  const locale = appStore.locale
  if (props.type === 'terms') return legal?.terms?.[locale] || ''
  return legal?.privacy?.[locale] || ''
})
const safeContent = computed(() => sanitizeMallHtml(processHtmlForDisplay(content.value)))
</script>
