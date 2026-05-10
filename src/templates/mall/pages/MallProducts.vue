<template>
  <div class="mx-auto max-w-[1536px] px-4 py-4 sm:px-6 lg:px-8">
    <MallCategoryTabs
      v-if="categories.length"
      :categories="categories"
      :all-label="allProductsLabel"
      :total="totalItems || products.length"
      :active-category-id="selectedCategory"
      @select="selectCategory"
    />

    <div
      v-if="error && !loading"
      class="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-orange-200 bg-orange-50/60 px-6 py-10 text-center text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200"
    >
      <h2 class="text-base font-bold">{{ t('emptyState.error') }}</h2>
      <p v-if="error" class="mt-2 max-w-md text-sm leading-6">{{ error }}</p>
      <button
        type="button"
        class="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
        @click="loadProducts"
      >
        {{ t('emptyState.retry') }}
      </button>
    </div>
    <div v-else-if="loading" class="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <div v-for="index in 10" :key="index" class="aspect-square rounded-lg bg-gray-100 dark:bg-white/10"></div>
    </div>
    <template v-else-if="products.length">
      <div class="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <MallProductCard
          v-for="(product, index) in products"
          :key="product.id"
          :product="product"
          :image-loading="index < 12 ? 'eager' : 'lazy'"
          show-category
        />
      </div>
      <div
        v-if="currentPage < totalPages"
        ref="loadMoreTrigger"
        class="h-px"
        aria-hidden="true"
      ></div>
      <div v-if="loadingMore" class="py-5 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
        {{ t('common.loading') }}
      </div>
    </template>
    <MallCatalogEmptyState v-else-if="catalogEmptyVisible" />
    <MallEmptyState
      v-else
      :title="searchQuery || selectedCategory ? t('products.emptyFiltered') : t('products.empty')"
      :description="searchQuery || selectedCategory ? t('emptyState.clearFilters') : undefined"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProductList } from '../../../composables/useProductList'
import MallProductCard from '../components/MallProductCard.vue'
import MallEmptyState from '../components/MallEmptyState.vue'
import MallCatalogEmptyState from '../components/MallCatalogEmptyState.vue'
import MallCategoryTabs from '../components/MallCategoryTabs.vue'

const route = useRoute()
const { t } = useI18n()
defineOptions({ name: 'MallProducts' })

const {
  loading,
  error,
  products,
  categories,
  selectedCategory,
  searchQuery,
  currentPage,
  totalPages,
  totalItems,
  loadingMore,
  selectCategory,
  loadProducts,
  loadMoreProducts,
  initialize,
  cleanup,
} = useProductList({
  pageSize: 24,
  homeRouteName: 'products',
  categoryRouteName: 'category-products',
  updateRouteOnCategorySelect: false,
})

const allProductsLabel = computed(() => t('products.allCategories'))
const loadMoreTrigger = ref<HTMLElement | null>(null)
let productObserver: IntersectionObserver | null = null
const catalogEmptyVisible = computed(() => (
  !loading.value
  && !error.value
  && !String(searchQuery.value || '').trim()
  && !selectedCategory.value
  && categories.value.length === 0
  && products.value.length === 0
  && Number(totalItems.value || 0) === 0
))

watch(
  () => route.query.keyword,
  (value) => {
    if (route.path !== '/products') return
    searchQuery.value = typeof value === 'string' ? value : ''
  },
)

const setupInfiniteLoader = async () => {
  if (typeof window === 'undefined') return
  await nextTick()
  productObserver?.disconnect()
  productObserver = null
  const target = loadMoreTrigger.value
  if (!target) return
  productObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      void loadMoreProducts()
    }
  }, { rootMargin: '900px 0px' })
  productObserver.observe(target)
}

watch(
  () => [products.value.length, currentPage.value, totalPages.value],
  () => {
    void setupInfiniteLoader()
  },
)

onMounted(() => {
  if (typeof route.query.keyword === 'string') {
    searchQuery.value = route.query.keyword
  }
  void initialize().then(() => setupInfiniteLoader())
})

onUnmounted(() => {
  productObserver?.disconnect()
  productObserver = null
  cleanup()
})
</script>
