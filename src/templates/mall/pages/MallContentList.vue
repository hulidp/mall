<template>
  <div class="mx-auto max-w-[1180px] px-0 py-4 sm:px-6 sm:py-8 lg:px-8">
    <div class="mb-3 flex flex-col gap-4 border-y border-gray-100 bg-white px-4 py-4 shadow-none ring-0 dark:border-white/10 dark:bg-neutral-950 sm:mb-6 sm:rounded-lg sm:border-0 sm:p-5 sm:shadow-sm sm:ring-1 sm:ring-gray-100 sm:dark:ring-white/10 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">{{ type === 'notice' ? t('nav.notice') : t('nav.blog') }}</p>
        <h1 class="mt-2 text-3xl font-black text-gray-950 dark:text-white">{{ pageTitle }}</h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ pageSubtitle }}</p>
      </div>
      <form v-if="type === 'blog'" class="flex h-11 overflow-hidden rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-neutral-900" @submit.prevent="reloadFromFirstPage">
        <input v-model="searchKeyword" class="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" :placeholder="t('blog.searchPlaceholder')" />
        <button type="submit" class="w-20 bg-orange-600 text-sm font-bold text-white hover:bg-orange-700">{{ t('products.searchLabel') }}</button>
      </form>
    </div>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="index in 6" :key="index" class="h-56 rounded-lg bg-white shadow-sm ring-1 ring-gray-100 dark:bg-neutral-950 dark:ring-white/10"></div>
    </div>

    <div v-else-if="posts.length" class="divide-y divide-gray-100 border-y border-gray-100 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-neutral-950 md:grid md:grid-cols-2 md:gap-4 md:divide-y-0 md:border-0 md:bg-transparent md:dark:bg-transparent lg:grid-cols-3">
      <button
        v-for="post in posts"
        :key="post.id"
        type="button"
        class="group flex w-full gap-3 px-4 py-3 text-left transition hover:bg-orange-50/50 dark:hover:bg-white/5 md:block md:overflow-hidden md:rounded-lg md:bg-white md:p-0 md:shadow-sm md:ring-1 md:ring-gray-100 md:hover:bg-white md:hover:ring-orange-200 md:dark:bg-neutral-950 md:dark:ring-white/10 md:dark:hover:bg-neutral-950 md:dark:hover:ring-orange-500/40"
        @click="openPost(post)"
      >
        <div v-if="post.thumbnail" class="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-white/10 md:h-auto md:w-auto md:rounded-none md:aspect-[16/9]">
          <img :src="getImageUrl(post.thumbnail)" :alt="getLocalizedText(post.title)" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        </div>
        <div class="min-w-0 flex-1 md:p-5">
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10">{{ post.type === 'notice' ? t('nav.notice') : t('nav.blog') }}</span>
            <time class="text-xs text-gray-400">{{ formatDate(post.published_at) }}</time>
          </div>
          <h2 class="line-clamp-2 text-base font-black text-gray-950 group-hover:text-orange-600 dark:text-white md:text-lg">{{ getLocalizedText(post.title) }}</h2>
          <p class="mt-2 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400 md:mt-3 md:line-clamp-3">{{ getLocalizedText(post.summary) }}</p>
        </div>
      </button>
    </div>

    <MallEmptyState v-else class="rounded-lg bg-white dark:bg-neutral-950" :title="emptyText" />

    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-3">
      <button class="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
        {{ t('pagination.previous') }}
      </button>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ currentPage }} / {{ totalPages }}</span>
      <button class="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
        {{ t('pagination.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { postAPI } from '../../../api'
import { useAppStore } from '../../../stores/app'
import { useLocalized } from '../../../composables/useProduct'
import { debounceAsync } from '../../../utils/debounce'
import { getImageUrl } from '../../../utils/image'
import { listData, openMallContentModal, paginationData } from '../utils'
import MallEmptyState from '../components/MallEmptyState.vue'

const props = defineProps<{
  type: 'blog' | 'notice'
}>()

const { t } = useI18n()
const appStore = useAppStore()
const { getLocalizedText } = useLocalized()
const loading = ref(true)
const posts = ref<any[]>([])
const currentPage = ref(1)
const pageSize = 12
const totalPages = ref(0)
const searchKeyword = ref('')

const type = computed(() => props.type)
const pageTitle = computed(() => type.value === 'notice' ? t('nav.notice') : t('nav.blog'))
const pageSubtitle = computed(() => type.value === 'notice' ? t('notice.subtitle') : t('blog.subtitle'))
const emptyText = computed(() => {
  if (type.value === 'notice') return t('notice.empty')
  return searchKeyword.value.trim() ? t('blog.noResults') : t('blog.empty')
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(appStore.locale)
}

const loadPosts = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      type: type.value,
      page: currentPage.value,
      page_size: pageSize,
    }
    const keyword = searchKeyword.value.trim()
    if (type.value === 'blog' && keyword) {
      params.search = keyword
    }
    const response = await postAPI.list(params)
    posts.value = listData(response)
    totalPages.value = Number(paginationData(response).total_page || 0)
  } finally {
    loading.value = false
  }
}

const debouncedLoadPosts = debounceAsync(loadPosts, 300)

const reloadFromFirstPage = () => {
  currentPage.value = 1
  debouncedLoadPosts()
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  debouncedLoadPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openPost = (post: any) => {
  openMallContentModal({ mode: type.value, slug: String(post?.slug || '') })
}

watch(() => props.type, () => {
  currentPage.value = 1
  searchKeyword.value = ''
  debouncedLoadPosts()
})

watch(searchKeyword, () => {
  if (type.value === 'blog') {
    reloadFromFirstPage()
  }
})

onMounted(() => {
  loadPosts()
})

onUnmounted(() => {
  debouncedLoadPosts.cancel()
})
</script>
