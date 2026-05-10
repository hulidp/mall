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
        class="fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-black/55 px-4 py-4 text-gray-900 backdrop-blur-[2px] dark:text-gray-100 sm:px-5"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <section class="flex max-h-[calc(100dvh-2rem)] w-full max-w-[1080px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-neutral-950 dark:ring-white/10">
          <header class="mall-content-header flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-white/10 sm:gap-4 sm:px-6 sm:py-3.5">
            <div class="min-w-0">
              <p class="text-xs font-bold text-orange-600">{{ eyebrow }}</p>
              <h2 class="mt-1 truncate text-lg font-black tracking-tight sm:text-2xl">{{ modalTitle }}</h2>
            </div>
            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-orange-500 hover:text-orange-600 dark:border-white/10 dark:bg-neutral-900 dark:text-gray-300"
              :aria-label="t('common.cancel')"
              @click="close"
            >
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div class="mall-content-body min-h-0 flex-1 overflow-y-auto px-0 py-3 sm:px-5 sm:py-4">
            <div v-if="isPostMode">
              <div v-if="!loading && posts.length === 0" class="overflow-hidden border-y border-gray-200 bg-white dark:border-white/10 dark:bg-neutral-950 sm:rounded-xl sm:border">
                <div class="border-b border-gray-200 p-3 dark:border-white/10">
                  <form
                    v-if="mode === 'blog'"
                    class="flex h-10 overflow-hidden rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-neutral-900"
                    @submit.prevent="reloadPosts"
                  >
                    <input
                      v-model="searchKeyword"
                      class="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
                      :placeholder="t('blog.searchPlaceholder')"
                    />
                    <button type="submit" class="w-20 bg-orange-600 text-sm font-bold text-white transition hover:bg-orange-700">
                      {{ t('products.searchLabel') }}
                    </button>
                  </form>
                  <div v-else class="px-1 text-sm font-bold text-gray-700 dark:text-gray-200">
                    {{ t('notice.subtitle') }}
                  </div>
                </div>
                <div class="px-4 py-8">
                  <MallEmptyState :title="emptyText" />
                </div>
              </div>

              <div v-else class="mall-content-post-grid grid h-[min(70dvh,560px)] min-h-[360px] grid-rows-[minmax(150px,36%)_minmax(0,1fr)] overflow-hidden border-y border-gray-200 bg-white dark:border-white/10 dark:bg-neutral-950 sm:rounded-xl sm:border sm:h-[min(78dvh,680px)] sm:min-h-[min(520px,calc(100dvh-7rem))] sm:grid-rows-[minmax(190px,42%)_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)] lg:grid-rows-none">
                <aside class="mall-content-post-list flex min-h-0 flex-col border-b border-gray-200 bg-gray-50/80 dark:border-white/10 dark:bg-white/[0.03] lg:border-b-0 lg:border-r">
                  <div class="shrink-0 border-b border-gray-200 p-3 dark:border-white/10">
                    <form
                      v-if="mode === 'blog'"
                      class="flex h-11 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900"
                      @submit.prevent="reloadPosts"
                    >
                      <input
                        v-model="searchKeyword"
                        class="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
                        :placeholder="t('blog.searchPlaceholder')"
                      />
                      <button type="submit" class="w-20 bg-orange-600 text-sm font-bold text-white transition hover:bg-orange-700">
                        {{ t('products.searchLabel') }}
                      </button>
                    </form>
                    <div v-else class="rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm dark:bg-neutral-900 dark:text-gray-200">
                      {{ t('notice.subtitle') }}
                    </div>
                  </div>

                  <div class="min-h-0 flex-1 overflow-y-auto p-2.5">
                    <div v-if="loading" class="space-y-3">
                      <div v-for="index in 6" :key="index" class="h-16 rounded-xl bg-gray-100 dark:bg-white/10 sm:h-24"></div>
                    </div>

                    <div v-else-if="posts.length" class="space-y-2">
                      <button
                        v-for="post in posts"
                        :key="post.id"
                        type="button"
                        class="group flex w-full gap-3 rounded-lg border bg-white p-2.5 text-left shadow-sm transition dark:bg-neutral-900"
                        :class="isSelectedPost(post) ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-transparent hover:border-orange-200 dark:hover:border-orange-500/40'"
                        @click="selectPost(post)"
                      >
                        <div class="h-14 w-[72px] shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-white/10">
                          <img
                            v-if="post.thumbnail"
                            :src="getImageUrl(post.thumbnail)"
                            :alt="getLocalizedText(post.title)"
                            class="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center justify-between gap-2">
                            <span class="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10">
                              {{ post.type === 'notice' ? t('nav.notice') : t('nav.blog') }}
                            </span>
                            <time class="shrink-0 text-[11px] text-gray-400">{{ formatDate(post.published_at) }}</time>
                          </div>
                          <h3 class="mt-1.5 line-clamp-2 text-sm font-black leading-5 group-hover:text-orange-600">{{ getLocalizedText(post.title) }}</h3>
                          <p v-if="getLocalizedText(post.summary)" class="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                            {{ getLocalizedText(post.summary) }}
                          </p>
                        </div>
                      </button>
                    </div>

                    <MallEmptyState v-else :title="emptyText" />
                  </div>

                  <div v-if="totalPages > 1" class="flex shrink-0 items-center justify-center gap-3 border-t border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-neutral-900">
                    <button
                      class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                      :disabled="currentPage <= 1"
                      @click="changePage(currentPage - 1)"
                    >
                      {{ t('pagination.previous') }}
                    </button>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ currentPage }} / {{ totalPages }}</span>
                    <button
                      class="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                      :disabled="currentPage >= totalPages"
                      @click="changePage(currentPage + 1)"
                    >
                      {{ t('pagination.next') }}
                    </button>
                  </div>
                </aside>

                <section class="mall-content-post-detail min-h-0 overflow-y-auto bg-white dark:bg-neutral-950">
                  <div v-if="detailLoading" class="space-y-4">
                    <div class="p-6">
                      <div class="h-7 w-2/3 rounded bg-gray-100 dark:bg-white/10"></div>
                      <div class="mt-5 h-32 rounded-xl bg-gray-100 dark:bg-white/10 sm:h-64"></div>
                    </div>
                  </div>

                  <article v-else-if="selectedPost" class="mx-auto max-w-3xl px-4 py-4 sm:px-7 sm:py-5">
                    <div class="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span class="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-600 dark:bg-orange-500/10">
                        {{ selectedPost.type === 'notice' ? t('nav.notice') : t('nav.blog') }}
                      </span>
                      <time>{{ formatDate(selectedPost.published_at) }}</time>
                    </div>
                    <h3 class="text-xl font-black leading-tight tracking-tight sm:text-2xl">{{ getLocalizedText(selectedPost.title) }}</h3>
                    <p v-if="getLocalizedText(selectedPost.summary)" class="mt-3 border-l-4 border-orange-500 bg-orange-50 px-4 py-3 text-sm leading-7 text-gray-600 dark:bg-orange-500/10 dark:text-gray-300">
                      {{ getLocalizedText(selectedPost.summary) }}
                    </p>
                    <img
                      v-if="selectedPost.thumbnail"
                      :src="getImageUrl(selectedPost.thumbnail)"
                      :alt="getLocalizedText(selectedPost.title)"
                      class="mt-5 max-h-64 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div class="mall-rich-text prose prose-gray mt-6 max-w-none prose-headings:font-black prose-p:leading-8 prose-img:rounded-xl dark:prose-invert" v-html="safeSelectedPostContent"></div>
                  </article>

                  <MallEmptyState v-else :title="emptyText" />
                </section>
              </div>
            </div>

            <div v-else-if="mode === 'about'">
              <div v-if="aboutHasContent" class="border-y border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-neutral-950 sm:rounded-xl sm:border sm:bg-gray-50/80 sm:p-4 sm:dark:bg-white/[0.03]">
                <div class="bg-white py-2 dark:bg-neutral-950 sm:rounded-xl sm:p-5 sm:shadow-sm sm:dark:bg-neutral-900">
                  <p v-if="aboutSubtitle" class="text-base font-semibold leading-7 text-gray-700 dark:text-gray-200">{{ aboutSubtitle }}</p>
                  <p v-if="introductionText" class="mt-4 whitespace-pre-line text-sm leading-8 text-gray-600 dark:text-gray-300">{{ introductionText }}</p>
                </div>

                <section v-if="servicesTitle || serviceItems.length" class="mt-3 border-t border-gray-200 bg-white pt-4 dark:border-white/10 dark:bg-neutral-950 sm:rounded-xl sm:border-0 sm:p-5 sm:shadow-sm sm:dark:bg-neutral-900">
                  <h3 v-if="servicesTitle" class="text-lg font-black">{{ servicesTitle }}</h3>
                  <div v-if="serviceItems.length" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                      v-for="(item, index) in serviceItems"
                      :key="index"
                      class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                    >
                      {{ item }}
                    </div>
                  </div>
                </section>

              </div>

              <MallEmptyState v-else :title="t('common.noContent')" />
            </div>

            <div v-else class="space-y-4">
              <div v-if="customUrl" class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-white/5">
                <span class="min-w-0 truncate text-gray-500 dark:text-gray-400">{{ customUrl }}</span>
                <a
                  :href="customResolvedUrl"
                  :target="customTarget"
                  rel="noopener noreferrer"
                  class="shrink-0 rounded-full bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700"
                >
                  {{ t('mallContentModal.openLink') }}
                </a>
              </div>

              <div v-if="customCanFrame" class="h-[min(62dvh,620px)] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 sm:h-[min(68vh,620px)]">
                <iframe
                  :src="customResolvedUrl"
                  :title="modalTitle"
                  class="h-full w-full bg-white"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
                ></iframe>
              </div>

              <MallEmptyState v-else :title="customUrl ? t('mallContentModal.externalHint') : t('mallContentModal.linkEmpty')" />
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { postAPI } from '../../../api'
import { useAppStore } from '../../../stores/app'
import { useLocalized } from '../../../composables/useProduct'
import { getImageUrl } from '../../../utils/image'
import { processHtmlForDisplay } from '../../../utils/content'
import type { MallContentModalCustomItem, MallContentModalMode } from '../utils'
import { listData, lockMallBodyScroll, paginationData, sanitizeMallHtml, unlockMallBodyScroll } from '../utils'
import MallEmptyState from './MallEmptyState.vue'

const props = defineProps<{
  visible: boolean
  mode: MallContentModalMode
  customItem?: MallContentModalCustomItem | null
  initialSlug?: string
  requestKey?: number
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
}>()

const { t } = useI18n()
const appStore = useAppStore()
const { getLocalizedText } = useLocalized()

const loading = ref(false)
const detailLoading = ref(false)
const posts = ref<any[]>([])
const selectedPost = ref<any>(null)
const currentPage = ref(1)
const totalPages = ref(0)
const searchKeyword = ref('')
const pageSize = 10
let bodyScrollLocked = false

const isPostMode = computed(() => props.mode === 'blog' || props.mode === 'notice')
const eyebrow = computed(() => {
  if (props.mode === 'custom') return t('navbar.more')
  return props.mode === 'notice' ? t('nav.notice') : props.mode === 'blog' ? t('nav.blog') : siteName.value
})
const modalTitle = computed(() => {
  if (props.mode === 'blog') return t('nav.blog')
  if (props.mode === 'notice') return t('nav.notice')
  if (props.mode === 'about') return aboutTitle.value || t('nav.about')
  return customTitle.value || t('navbar.more')
})
const emptyText = computed(() => {
  if (props.mode === 'notice') return t('notice.empty')
  return searchKeyword.value.trim() ? t('blog.noResults') : t('blog.empty')
})

const siteName = computed(() => String(appStore.config?.brand?.site_name || 'Huli-Next').trim() || 'Huli-Next')
const aboutConfig = computed(() => appStore.config?.about || null)
const aboutTitle = computed(() => getLocalizedText(aboutConfig.value?.hero?.title))
const aboutSubtitle = computed(() => getLocalizedText(aboutConfig.value?.hero?.subtitle))
const introductionText = computed(() => getLocalizedText(aboutConfig.value?.introduction))
const servicesTitle = computed(() => getLocalizedText(aboutConfig.value?.services?.title))
const serviceItems = computed(() => {
  const rows = aboutConfig.value?.services?.items
  if (!Array.isArray(rows)) return []
  return rows.map((item) => getLocalizedText(item)).filter(Boolean)
})
const aboutHasContent = computed(() => {
  return aboutSubtitle.value !== ''
    || introductionText.value !== ''
    || servicesTitle.value !== ''
    || serviceItems.value.length > 0
})

const customTitle = computed(() => getLocalizedText(props.customItem?.title) || customUrl.value)
const customUrl = computed(() => String(props.customItem?.url || '').trim())
const customTarget = computed(() => props.customItem?.target === '_blank' ? '_blank' : '_self')
const customResolvedUrl = computed(() => {
  const url = customUrl.value
  if (!url) return ''
  if (/^\/\//.test(url)) {
    return typeof window === 'undefined' ? `https:${url}` : `${window.location.protocol}${url}`
  }
  if (/^(https?:|mailto:|tel:)/i.test(url) || url.startsWith('/')) return url
  return `/${url.replace(/^\/+/, '')}`
})
const customCanFrame = computed(() => {
  const url = customResolvedUrl.value
  return Boolean(url && !/^(mailto:|tel:)/i.test(url))
})
const safeSelectedPostContent = computed(() => {
  if (!selectedPost.value) return ''
  return sanitizeMallHtml(processHtmlForDisplay(getLocalizedText(selectedPost.value.content)))
})

const close = () => {
  emit('update:visible', false)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) close()
}

const syncBodyScrollLock = (visible: boolean) => {
  if (visible && !bodyScrollLocked) {
    lockMallBodyScroll()
    bodyScrollLocked = true
    return
  }
  if (!visible && bodyScrollLocked) {
    unlockMallBodyScroll()
    bodyScrollLocked = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(appStore.locale)
}

const loadPosts = async () => {
  if (!isPostMode.value) return
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      type: props.mode,
      page: currentPage.value,
      page_size: pageSize,
    }
    const keyword = searchKeyword.value.trim()
    if (props.mode === 'blog' && keyword) {
      params.search = keyword
    }
    const response = await postAPI.list(params)
    const rows = listData(response)
    posts.value = rows
    totalPages.value = Number(paginationData(response)?.total_page || 0)
    if (!props.initialSlug && !selectedPost.value && rows.length > 0) {
      const firstPost = rows[0]
      const slug = String(firstPost?.slug || '')
      if (slug) {
        void loadPost(slug, firstPost)
      } else {
        selectedPost.value = firstPost
      }
    }
  } finally {
    loading.value = false
  }
}

const loadPost = async (slug: string, fallback?: any) => {
  const normalizedSlug = String(slug || '').trim()
  if (!normalizedSlug) return
  detailLoading.value = true
  selectedPost.value = fallback || null
  try {
    const response = await postAPI.detail(normalizedSlug)
    selectedPost.value = response.data?.data || fallback || null
  } catch {
    selectedPost.value = fallback || null
  } finally {
    detailLoading.value = false
  }
}

const selectPost = (post: any) => {
  void loadPost(String(post?.slug || ''), post)
}

const isSelectedPost = (post: any) => {
  if (!selectedPost.value) return false
  const selectedId = selectedPost.value?.id
  const postId = post?.id
  if (selectedId && postId) return String(selectedId) === String(postId)
  return String(selectedPost.value?.slug || '') === String(post?.slug || '')
}

const reloadPosts = () => {
  currentPage.value = 1
  selectedPost.value = null
  void loadPosts()
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  void loadPosts()
}

const resetPostState = () => {
  posts.value = []
  selectedPost.value = null
  currentPage.value = 1
  totalPages.value = 0
  searchKeyword.value = ''
}

const prepareContent = () => {
  if (!props.visible) return
  if (!isPostMode.value) {
    resetPostState()
    return
  }
  resetPostState()
  if (props.initialSlug) {
    void loadPost(props.initialSlug)
  }
  void loadPosts()
}

watch(
  () => [props.visible, props.mode, props.initialSlug, props.requestKey],
  prepareContent,
  { immediate: true },
)

watch(
  () => props.visible,
  (visible) => {
    syncBodyScrollLock(visible)
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (bodyScrollLocked) {
    unlockMallBodyScroll()
    bodyScrollLocked = false
  }
})
</script>
