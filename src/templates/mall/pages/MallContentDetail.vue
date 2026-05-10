<template>
  <div class="mx-auto max-w-[980px] px-0 py-2 sm:px-6 sm:py-8 lg:px-8">
    <div v-if="loading" class="space-y-4 border-y border-gray-100 bg-white p-4 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-lg sm:border-0 sm:p-6 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <div class="h-8 w-1/2 rounded bg-gray-100 dark:bg-white/10"></div>
      <div class="h-64 rounded bg-gray-100 dark:bg-white/10"></div>
    </div>

    <article v-else-if="post" class="overflow-hidden border-y border-gray-100 bg-white shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:rounded-lg sm:border-0 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10">
      <img v-if="post.thumbnail" :src="getImageUrl(post.thumbnail)" :alt="getLocalizedText(post.title)" class="h-36 w-full object-cover sm:h-72" loading="lazy" />
      <div class="p-3 sm:p-8">
        <div class="mb-3 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
          <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10">{{ post.type === 'notice' ? t('nav.notice') : t('nav.blog') }}</span>
          <time class="text-xs text-gray-400 sm:text-sm">{{ formatDate(post.published_at) }}</time>
        </div>
        <h1 class="text-xl font-black leading-tight text-gray-950 dark:text-white sm:text-3xl">{{ getLocalizedText(post.title) }}</h1>
        <p v-if="getLocalizedText(post.summary)" class="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400 sm:mt-4 sm:text-base sm:leading-7">
          {{ getLocalizedText(post.summary) }}
        </p>
        <div class="mall-rich-text prose prose-gray mt-4 max-w-none dark:prose-invert sm:mt-8" v-html="safeContent"></div>
      </div>
    </article>

    <MallEmptyState v-else :title="t('blogDetail.notFound')" action-to="/blog" :action-label="t('blogDetail.backToBlog')" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { postAPI } from '../../../api'
import { useAppStore } from '../../../stores/app'
import { useLocalized } from '../../../composables/useProduct'
import { getImageUrl } from '../../../utils/image'
import { processHtmlForDisplay } from '../../../utils/content'
import { sanitizeMallHtml } from '../utils'
import MallEmptyState from '../components/MallEmptyState.vue'

const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()
const { getLocalizedText } = useLocalized()
const loading = ref(true)
const post = ref<any>(null)
const safeContent = computed(() => {
  if (!post.value) return ''
  return sanitizeMallHtml(processHtmlForDisplay(getLocalizedText(post.value.content)))
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(appStore.locale)
}

const loadPost = async () => {
  loading.value = true
  try {
    const slug = String(route.params.slug || '')
    const response = await postAPI.detail(slug)
    post.value = response.data?.data || null
  } catch {
    post.value = null
  } finally {
    loading.value = false
  }
}

watch(() => route.params.slug, () => {
  loadPost()
})

onMounted(() => {
  loadPost()
})
</script>
