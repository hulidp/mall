<template>
  <div class="mx-auto max-w-[1536px] px-4 py-4 sm:px-6 lg:px-8">
    <section v-if="showTopShowcase">
      <div class="min-w-0">
        <div
          v-if="heroBanner"
          class="group relative block h-[168px] w-full overflow-hidden rounded-xl text-left sm:h-[320px] lg:h-[400px]"
          style="background-color: var(--ui-bg-muted);"
          :class="hasHeroLink ? 'cursor-pointer' : 'cursor-default'"
          :role="hasHeroLink ? 'button' : undefined"
          :tabindex="hasHeroLink ? 0 : undefined"
          @click="handleHeroClick"
          @keydown.enter.prevent="handleHeroClick"
          @keydown.space.prevent="handleHeroClick"
          @touchstart="onBannerTouchStart"
          @touchend="onBannerTouchEnd"
        >
          <img v-if="heroImage" :src="heroImage" :alt="heroTitle" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-black/50"></div>
          <div class="absolute left-4 top-1/2 max-w-[min(760px,calc(100%-2rem))] -translate-y-1/2 text-white sm:left-6 sm:max-w-[min(760px,calc(100%-3rem))]">
            <div v-if="heroBadge" class="theme-badge theme-badge-xs mb-2 inline-flex sm:mb-3" style="background-color: var(--ui-accent); color: var(--ui-text-on-accent); border-color: transparent;">{{ heroBadge }}</div>
            <h1 class="line-clamp-2 text-xl font-bold leading-tight sm:text-3xl">{{ heroTitle }}</h1>
            <p v-if="heroSubtitle" class="mt-2 line-clamp-2 break-words text-xs leading-5 text-white/85 sm:mt-3 sm:text-sm sm:leading-6">{{ heroSubtitle }}</p>
          </div>

          <!-- 前后切换按钮 (大屏悬浮显示) -->
          <button
            v-if="bannerCount > 1"
            type="button"
            class="absolute left-4 top-1/2 -translate-y-1/2 hidden h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white opacity-0 backdrop-blur transition hover:bg-black/40 group-hover:opacity-100 sm:flex"
            @click.stop="handlePrevHeroBanner"
          >
            <ChevronLeftIcon class="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            v-if="bannerCount > 1"
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 hidden h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white opacity-0 backdrop-blur transition hover:bg-black/40 group-hover:opacity-100 sm:flex"
            @click.stop="handleNextHeroBanner"
          >
            <ChevronRightIcon class="h-6 w-6" aria-hidden="true" />
          </button>

          <!-- 底部指示点 -->
          <div v-if="bannerCount > 1" class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            <button
              v-for="(_, index) in bannerCount"
              :key="index"
              type="button"
              class="h-1.5 rounded-full transition-all"
              :class="index === currentBannerIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'"
              @click.stop="selectHeroBanner(index)"
            />
          </div>
        </div>

      </div>
    </section>

    <section class="pt-1" :class="showTopShowcase ? 'mt-4' : ''">
      <MallCategoryTabs
        v-if="categories.length"
        :categories="categories"
        :all-label="allProductsLabel"
        :total="productTotal"
        :active-category-id="selectedCategory"
        @select="handleCategorySelect"
      />

      <div
        v-if="productError && !productLoading"
        class="theme-alert-danger flex min-h-[220px] flex-col items-center justify-center rounded-xl border px-6 py-10 text-center"
      >
        <h2 class="text-base font-semibold">{{ t('emptyState.error') }}</h2>
        <p class="mt-2 max-w-md text-sm leading-relaxed opacity-80">{{ productError }}</p>
        <button
          type="button"
          class="theme-btn-primary theme-btn-inline-md mt-5 rounded-lg border text-sm font-medium"
          @click="loadProducts(1, false)"
        >
          {{ t('emptyState.retry') }}
        </button>
      </div>
      <div v-else-if="productLoading && (!visibleProducts.length || productSkeletonVisible)" class="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div v-for="index in 10" :key="index" class="animate-pulse rounded-xl">
          <div class="aspect-square rounded-xl" style="background-color: var(--ui-bg-muted);"></div>
          <div class="pt-2">
            <div class="h-4 w-11/12 rounded" style="background-color: var(--ui-bg-muted);"></div>
            <div class="mt-2 flex items-end justify-between gap-2">
              <div class="h-6 w-20 rounded" style="background-color: var(--ui-accent-soft);"></div>
              <div class="h-8 w-8 rounded-lg" style="background-color: var(--ui-bg-muted);"></div>
            </div>
            <div class="mt-2 flex justify-between gap-2">
              <div class="h-5 w-16 rounded-full" style="background-color: var(--ui-bg-muted);"></div>
              <div class="h-5 w-20 rounded-full" style="background-color: var(--ui-bg-muted);"></div>
            </div>
          </div>
        </div>
      </div>
      <TransitionGroup
        v-else-if="visibleProducts.length"
        :key="loadedCategory ?? 'all'"
        tag="div"
        name="mall-product-grid"
        appear
        class="grid grid-cols-2 gap-x-3 gap-y-4 transition-opacity duration-150 ease-out sm:gap-x-4 sm:gap-y-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        :class="productGridVisible ? 'opacity-100' : 'opacity-0'"
      >
        <MallProductCard
          v-for="(product, index) in visibleProducts"
          :key="`${loadedCategory ?? 'all'}-${product.id}`"
          :product="product"
          :image-loading="index < 6 ? 'eager' : 'lazy'"
          show-category
        />
      </TransitionGroup>
      <MallCatalogEmptyState v-else-if="catalogEmptyVisible" />
      <MallEmptyState
        v-else
        :title="searchQuery ? t('products.emptyFiltered') : t('products.empty')"
        :description="searchQuery ? t('emptyState.clearFilters') : undefined"
      />

      <div
        v-if="visibleProducts.length && currentProductPage < totalProductPages"
        ref="loadMoreTrigger"
        class="h-px"
        aria-hidden="true"
      ></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { categoryAPI, productAPI } from '../../../api'
import { useBannerCarousel } from '../../../composables/useBannerCarousel'
import { listData } from '../utils'
import MallProductCard from '../components/MallProductCard.vue'
import MallEmptyState from '../components/MallEmptyState.vue'
import MallCatalogEmptyState from '../components/MallCatalogEmptyState.vue'
import MallCategoryTabs from '../components/MallCategoryTabs.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
defineOptions({ name: 'MallHome' })

const categories = ref<any[]>([])
const products = ref<any[]>([])
const productLoading = ref(true)
const categoryLoading = ref(true)
const loadingMoreProducts = ref(false)
const productGridVisible = ref(true)
const productSkeletonVisible = ref(false)
const productError = ref('')
const productTotal = ref(0)
const selectedCategory = ref<number | null>(null)
const searchQuery = ref('')
const loadedCategory = ref<number | null>(null)
const currentProductPage = ref(1)
const totalProductPages = ref(1)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let productObserver: IntersectionObserver | null = null
let productLoadVersion = 0
let activeProductRequestKey = ''
let productSkeletonTimer: number | null = null

type ProductPageCacheEntry = {
  rows: any[]
  total: number
  totalPages: number
  cachedAt: number
}

const productPageCache = new Map<string, ProductPageCacheEntry>()

const {
  heroBanner,
  heroImage,
  heroBadge,
  heroTitle,
  heroSubtitle,
  bannerCount,
  currentBannerIndex,
  hasHeroLink,
  loadBanners,
  handleNextHeroBanner,
  handlePrevHeroBanner,
  selectHeroBanner,
  goToHeroLink,
  onBannerTouchStart,
  onBannerTouchEnd,
  stopHeroAutoPlay,
} = useBannerCarousel()

const showTopShowcase = computed(() => Boolean(heroBanner.value))

const allProductsLabel = computed(() => t('products.allCategories'))
const homeProductPageSize = 200
const productPageCacheMaxAge = 30 * 1000
const productSkeletonDelay = 180
const mallHomeResetEvent = 'dujiao.mall.home-reset'
const visibleProducts = computed(() => products.value)
const catalogEmptyVisible = computed(() => (
  !productLoading.value
  && !categoryLoading.value
  && !productError.value
  && !searchQuery.value.trim()
  && !selectedCategory.value
  && categories.value.length === 0
  && visibleProducts.value.length === 0
  && Number(productTotal.value || 0) === 0
))

const routeKeyword = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const removeRouteKeyword = async () => {
  if (route.name !== 'home' || route.query.keyword === undefined) return
  const nextQuery = { ...route.query }
  delete nextQuery.keyword
  await router.replace({ name: 'home', query: nextQuery }).catch(() => undefined)
}

const productPageCacheKey = (categoryId: number | null, page: number) => `${categoryId || 0}:${page}:${searchQuery.value.trim()}`

const getCachedProductPage = (categoryId: number | null, page: number) => {
  const entry = productPageCache.get(productPageCacheKey(categoryId, page))
  if (!entry) return null
  if (Date.now() - entry.cachedAt > productPageCacheMaxAge) {
    productPageCache.delete(productPageCacheKey(categoryId, page))
    return null
  }
  return entry
}

const cacheProductPage = (categoryId: number | null, page: number, entry: Omit<ProductPageCacheEntry, 'cachedAt'>) => {
  productPageCache.set(productPageCacheKey(categoryId, page), {
    ...entry,
    cachedAt: Date.now(),
  })
}

const fadeProductGrid = async () => {
  if (!products.value.length || typeof window === 'undefined') return
  productGridVisible.value = false
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 180)
  })
}

const clearProductSkeletonTimer = () => {
  if (typeof window !== 'undefined' && productSkeletonTimer !== null) {
    window.clearTimeout(productSkeletonTimer)
  }
  productSkeletonTimer = null
}

const scheduleProductSkeleton = () => {
  clearProductSkeletonTimer()
  productSkeletonVisible.value = false
  if (!products.value.length || typeof window === 'undefined') return
  productSkeletonTimer = window.setTimeout(() => {
    if (productLoading.value) {
      productSkeletonVisible.value = true
      productGridVisible.value = true
    }
    productSkeletonTimer = null
  }, productSkeletonDelay)
}

const hideProductSkeleton = () => {
  clearProductSkeletonTimer()
  productSkeletonVisible.value = false
}

const showProductGrid = () => {
  if (typeof window === 'undefined') {
    productGridVisible.value = true
    return
  }
  window.requestAnimationFrame(() => {
    productGridVisible.value = true
  })
}

const applyProductPage = (rows: any[], page: number, total: number, totalPages: number) => {
  products.value = rows
  productTotal.value = total
  totalProductPages.value = totalPages
  currentProductPage.value = page
  loadedCategory.value = selectedCategory.value
  productError.value = ''
  showProductGrid()
}

const setupInfiniteLoader = async () => {
  if (typeof window === 'undefined') return
  await nextTick()
  productObserver?.disconnect()
  productObserver = null
  const target = loadMoreTrigger.value
  if (!target) return
  productObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      loadMoreProducts()
    }
  }, { rootMargin: '900px 0px' })
  productObserver.observe(target)
}

const loadProducts = async (page = 1, append = false, options: { prefaded?: boolean } = {}) => {
  const requestKey = JSON.stringify({
    page,
    page_size: homeProductPageSize,
    category_id: selectedCategory.value || 0,
    search: searchQuery.value.trim(),
  })
  if (activeProductRequestKey === requestKey) return
  activeProductRequestKey = requestKey
  const loadVersion = ++productLoadVersion
  if (append) {
    loadingMoreProducts.value = true
  } else {
    productLoading.value = true
    productError.value = ''
    scheduleProductSkeleton()
  }
  try {
    const params: Record<string, unknown> = { page, page_size: homeProductPageSize }
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }
    const keyword = searchQuery.value.trim()
    if (keyword) {
      params.search = keyword
    }
    const response = await productAPI.list(params)
    const rows = listData(response)
    if (loadVersion !== productLoadVersion) return
    const pagination = response.data?.pagination
    const total = Number(pagination?.total || (append ? products.value.length + rows.length : rows.length) || 0)
    const totalPages = Math.max(1, Number(pagination?.total_page || Math.ceil(total / homeProductPageSize) || 1))
    if (append) {
      products.value = products.value.concat(rows)
      productTotal.value = total
      totalProductPages.value = totalPages
      currentProductPage.value = page
      loadedCategory.value = selectedCategory.value
      productError.value = ''
    } else {
      if (!options.prefaded && products.value.length && !productSkeletonVisible.value) {
        await fadeProductGrid()
      }
      applyProductPage(rows, page, total, totalPages)
      hideProductSkeleton()
      cacheProductPage(selectedCategory.value, page, { rows, total, totalPages })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    console.error('Failed to load products:', error)
    if (loadVersion === productLoadVersion && !append) {
      hideProductSkeleton()
      productError.value = message || t('emptyState.error')
      showProductGrid()
    }
  } finally {
    if (activeProductRequestKey === requestKey) {
      activeProductRequestKey = ''
    }
    if (loadVersion === productLoadVersion) {
      productLoading.value = false
      loadingMoreProducts.value = false
      void setupInfiniteLoader()
    }
  }
}

const switchCategory = async (categoryId: number | null) => {
  if (selectedCategory.value === categoryId) return
  productLoadVersion += 1
  selectedCategory.value = categoryId
  currentProductPage.value = 1
  productError.value = ''
  productObserver?.disconnect()
  const hadProducts = products.value.length > 0
  if (hadProducts) {
    await fadeProductGrid()
  }
  const cached = getCachedProductPage(categoryId, 1)
  if (cached) {
    productLoading.value = true
    hideProductSkeleton()
    productLoading.value = false
    loadingMoreProducts.value = false
    applyProductPage(cached.rows, 1, cached.total, cached.totalPages)
    void setupInfiniteLoader()
    return
  }
  await loadProducts(1, false, { prefaded: hadProducts })
}

const handleCategorySelect = (categoryId: number | null) => {
  void (async () => {
    if (searchQuery.value || route.query.keyword !== undefined) {
      searchQuery.value = ''
      await removeRouteKeyword()
    }
    await switchCategory(categoryId)
  })()
}

const handleHeroClick = () => {
  if (!hasHeroLink.value) return
  goToHeroLink()
}

const loadMoreProducts = () => {
  if (loadingMoreProducts.value || currentProductPage.value >= totalProductPages.value) return
  void loadProducts(currentProductPage.value + 1, true)
}

const scrollPageToTop = () => {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

const loadCategories = async () => {
  categoryLoading.value = true
  try {
    const response = await categoryAPI.list()
    categories.value = listData(response)
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    categoryLoading.value = false
  }
}

const loadHomeData = async () => {
  void loadProducts(1, false)
  void loadCategories()
}

const applyRouteSearch = () => {
  if (route.name !== 'home') return
  const nextKeyword = routeKeyword(route.query.keyword)
  if (searchQuery.value === nextKeyword) return
  productLoadVersion += 1
  searchQuery.value = nextKeyword
  if (nextKeyword) {
    selectedCategory.value = null
    loadedCategory.value = null
  }
  currentProductPage.value = 1
  productError.value = ''
  productObserver?.disconnect()
  void loadProducts(1, false)
}

const resetHomeView = () => {
  const hadSearch = searchQuery.value.trim() !== ''
  const needsReload = hadSearch || selectedCategory.value !== null || loadedCategory.value !== null || currentProductPage.value !== 1
  searchQuery.value = ''
  selectedCategory.value = null
  loadedCategory.value = null
  currentProductPage.value = 1
  if (needsReload) {
    void loadProducts(1, false)
  }
  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => {
      scrollPageToTop()
      window.requestAnimationFrame(scrollPageToTop)
    })
  }
}

onMounted(() => {
  window.addEventListener(mallHomeResetEvent, resetHomeView)
  searchQuery.value = routeKeyword(route.query.keyword)
  loadBanners()
  loadHomeData()
})

watch(
  () => route.query.keyword,
  () => {
    applyRouteSearch()
  },
)

onUnmounted(() => {
  window.removeEventListener(mallHomeResetEvent, resetHomeView)
  productObserver?.disconnect()
  clearProductSkeletonTimer()
  stopHeroAutoPlay()
})
</script>

<style scoped>
.mall-product-grid-enter-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.mall-product-grid-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.mall-product-grid-move {
  transition: transform 220ms ease;
}

.mall-product-grid-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
}

.mall-product-grid-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.985);
}
</style>
