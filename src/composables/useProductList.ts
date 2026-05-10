import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productAPI, categoryAPI } from '../api'
import { buildCategoryGroups, createCategoryMap, normalizeCategoryParentId, type PublicCategory } from '../utils/category'
import { debounceAsync } from '../utils/debounce'

export interface UseProductListOptions {
  pageSize?: number
  homeRouteName?: string
  categoryRouteName?: string
  updateRouteOnCategorySelect?: boolean
  loadAllPages?: boolean
}

export function useProductList(options: UseProductListOptions = {}) {
  const {
    pageSize: defaultPageSize = 20,
    homeRouteName = 'home',
    categoryRouteName = 'category-products',
    updateRouteOnCategorySelect = true,
    loadAllPages = false,
  } = options

  const router = useRouter()
  const route = useRoute()

  const loading = ref(true)
  const loadingMore = ref(false)
  const error = ref('')
  const products = ref<any[]>([])
  const categories = ref<PublicCategory[]>([])
  const selectedCategory = ref<number | null>(null)
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const totalItems = ref(0)
  const totalPages = ref(0)
  const showFilterDrawer = ref(false)
  const expandedParentIds = ref<number[]>([])

  const categoryGroups = computed(() => buildCategoryGroups(categories.value))
  const categoryMap = computed(() => createCategoryMap(categories.value))

  let initializing = true
  let activeProductRequestKey = ''

  const isParentExpanded = (categoryId: number) => {
    return expandedParentIds.value.includes(categoryId)
  }

  const expandParentCategory = (categoryId: number) => {
    if (!categoryId || isParentExpanded(categoryId)) return
    expandedParentIds.value = [...expandedParentIds.value, categoryId]
  }

  const toggleParentCategory = (categoryId: number) => {
    if (isParentExpanded(categoryId)) {
      expandedParentIds.value = expandedParentIds.value.filter((id) => id !== categoryId)
      return
    }
    expandParentCategory(categoryId)
  }

  const getParentToggleButtonClass = (categoryId: number) => {
    return isParentExpanded(categoryId)
      ? 'theme-btn-primary border-transparent'
      : 'theme-panel-soft theme-text-muted hover:text-gray-900 dark:hover:text-white'
  }

  const syncExpandedCategoryState = () => {
    if (!selectedCategory.value) return

    const matched = categoryMap.value.get(selectedCategory.value)
    if (!matched) return

    const parentId = normalizeCategoryParentId(matched.parent_id)
    if (parentId > 0) {
      expandParentCategory(parentId)
      return
    }

    const selectedGroup = categoryGroups.value.find((group) => group.id === matched.id)
    if (selectedGroup?.children.length) {
      expandParentCategory(selectedGroup.id)
    }
  }

  const selectCategory = (categoryId: number | null, closeDrawer = false) => {
    selectedCategory.value = categoryId
    if (closeDrawer) {
      showFilterDrawer.value = false
    }
  }

  const buildProductParams = (page = currentPage.value) => {
    const params: any = {
      page,
      page_size: pageSize.value,
    }
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }
    const keyword = searchQuery.value.trim()
    if (keyword) {
      params.search = keyword
    }
    return params
  }

  const loadProductPage = async (page = currentPage.value, append = false) => {
    const params = buildProductParams(page)
    const requestKey = JSON.stringify(params)
    if (activeProductRequestKey === requestKey) return
    activeProductRequestKey = requestKey
    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
    }
    error.value = ''
    try {
      const response = await productAPI.list(params)
      const pagination = response.data.pagination
      const rows = [...(response.data.data || [])]
      const pageCount = Number(pagination?.total_page || 0)

      if (loadAllPages && pageCount > 1) {
        for (let page = 2; page <= pageCount; page += 1) {
          const pageResponse = await productAPI.list({ ...params, page })
          rows.push(...(pageResponse.data.data || []))
        }
      }

      products.value = append ? products.value.concat(rows) : rows
      if (pagination) {
        totalItems.value = pagination.total || products.value.length
        totalPages.value = loadAllPages ? 1 : pagination.total_page || 0
      } else {
        totalItems.value = products.value.length
      }
      currentPage.value = page
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      console.error('Failed to load products:', err)
      if (!append) {
        error.value = message
      }
    } finally {
      if (activeProductRequestKey === requestKey) {
        activeProductRequestKey = ''
      }
      loading.value = false
      loadingMore.value = false
    }
  }

  const loadProducts = async () => loadProductPage(currentPage.value, false)

  const loadMoreProducts = async () => {
    if (loading.value || loadingMore.value) return
    if (totalPages.value > 0 && currentPage.value >= totalPages.value) return
    await loadProductPage(currentPage.value + 1, true)
  }

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.list()
      categories.value = response.data.data || []
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const debouncedLoadProducts = debounceAsync(loadProducts, 300)

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    debouncedLoadProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearSearch = () => {
    if (!searchQuery.value) return
    searchQuery.value = ''
    currentPage.value = 1
  }

  const onSearch = () => {
    currentPage.value = 1
    debouncedLoadProducts()
  }

  const syncSelectedCategoryFromRoute = () => {
    if (route.name !== categoryRouteName) {
      if (selectedCategory.value !== null) {
        selectedCategory.value = null
      }
      return false
    }

    const slugParam = route.params.slug as string | undefined
    if (!slugParam || categories.value.length === 0) return false

    const matched = categories.value.find((category) => category.slug === slugParam)
    if (!matched) return false

    if (selectedCategory.value !== matched.id) {
      selectedCategory.value = matched.id
    }

    return true
  }

  watch(selectedCategory, () => {
    if (initializing) return
    currentPage.value = 1
    syncExpandedCategoryState()
    debouncedLoadProducts()

    if (!updateRouteOnCategorySelect) return

    if (selectedCategory.value) {
      const matched = categories.value.find((category) => category.id === selectedCategory.value)
      if (matched?.slug && route.params.slug !== matched.slug) {
        router.replace({ name: categoryRouteName, params: { slug: matched.slug } })
      }
    } else if (route.name === categoryRouteName) {
      router.replace({ name: homeRouteName })
    }
  })

  watch(searchQuery, () => {
    if (initializing) return
    currentPage.value = 1
    debouncedLoadProducts()
  })

  watch(
    () => route.params.slug,
    () => {
      if (initializing) return
      if (categories.value.length === 0) return
      syncSelectedCategoryFromRoute()
    },
  )

  const initialize = async () => {
    await loadCategories()
    if (syncSelectedCategoryFromRoute()) {
      syncExpandedCategoryState()
    }
    await loadProducts()
    initializing = false
  }

  const cleanup = () => {
    debouncedLoadProducts.cancel()
  }

  return {
    loading,
    loadingMore,
    error,
    products,
    categories,
    selectedCategory,
    searchQuery,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    showFilterDrawer,
    expandedParentIds,
    categoryGroups,
    categoryMap,
    isParentExpanded,
    toggleParentCategory,
    getParentToggleButtonClass,
    selectCategory,
    loadProducts,
    loadMoreProducts,
    loadCategories,
    changePage,
    clearSearch,
    onSearch,
    syncSelectedCategoryFromRoute,
    syncExpandedCategoryState,
    initialize,
    cleanup,
  }
}
