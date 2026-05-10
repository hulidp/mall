import { api } from './client'
import { buildApiCacheKey, cachedApiRequest, clearApiCacheByPrefix, getApiCache } from '../utils/apiCache'

type CacheRequestOptions = {
    force?: boolean
}

const productListCacheTtl = 30_000
const productDetailCacheTtl = 20_000
const categoryCacheTtl = 60_000
const bannerCacheTtl = 60_000
const postCacheTtl = 30_000
const memberLevelCacheTtl = 60_000

const productListKey = (params?: any) => buildApiCacheKey('products:list', params)
const productDetailKey = (slug: string) => buildApiCacheKey('products:detail', { slug })
const categoryListKey = (params?: any) => buildApiCacheKey('categories:list', params)
const bannerListKey = (params?: any) => buildApiCacheKey('banners:list', params)
const postListKey = (params?: any) => buildApiCacheKey('posts:list', params)
const postDetailKey = (slug: string) => buildApiCacheKey('posts:detail', { slug })

export const productAPI = {
    list: (params?: any, options: CacheRequestOptions = {}) =>
        cachedApiRequest(productListKey(params), productListCacheTtl, () => api.get('/public/products', { params }), options),
    listFresh: (params?: any) => api.get('/public/products', { params }),
    getCachedList: (params?: any) => getApiCache<any>(productListKey(params)),
    detail: (slug: string, options: CacheRequestOptions = {}) =>
        cachedApiRequest(productDetailKey(slug), productDetailCacheTtl, () => api.get(`/public/products/${slug}`), options),
    detailFresh: (slug: string) => api.get(`/public/products/${slug}`),
    getCachedDetail: (slug: string) => getApiCache<any>(productDetailKey(slug)),
    selectableCards: (slug: string, params?: any) => api.get(`/public/products/${slug}/selectable-cards`, { params }),
    invalidateCache: () => {
        clearApiCacheByPrefix('products:list')
        clearApiCacheByPrefix('products:detail')
    },
}

export const postAPI = {
    list: (params?: any, options: CacheRequestOptions = {}) =>
        cachedApiRequest(postListKey(params), postCacheTtl, () => api.get('/public/posts', { params }), options),
    detail: (slug: string, options: CacheRequestOptions = {}) =>
        cachedApiRequest(postDetailKey(slug), postCacheTtl, () => api.get(`/public/posts/${slug}`), options),
}

export const bannerAPI = {
    list: (params?: any, options: CacheRequestOptions = {}) =>
        cachedApiRequest(bannerListKey(params), bannerCacheTtl, () => api.get('/public/banners', { params }), options),
}

export const categoryAPI = {
    list: (params?: any, options: CacheRequestOptions = {}) =>
        cachedApiRequest(categoryListKey(params), categoryCacheTtl, () => api.get('/public/categories', { params }), options),
    getCachedList: (params?: any) => getApiCache<any>(categoryListKey(params)),
    invalidateCache: () => clearApiCacheByPrefix('categories:list'),
}

export const memberLevelAPI = {
    list: (options: CacheRequestOptions = {}) =>
        cachedApiRequest('member-levels:list', memberLevelCacheTtl, () => api.get('/public/member-levels'), options),
}
