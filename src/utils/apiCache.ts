type CacheRecord<T> = {
  value: T
  expiresAt: number
}

type CacheOptions = {
  force?: boolean
  persist?: boolean
}

const memoryCache = new Map<string, CacheRecord<any>>()
const pendingRequests = new Map<string, Promise<any>>()
const storagePrefix = 'dujiao.public-cache.'
const maxPersistedValueLength = 1_500_000

const now = () => Date.now()

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]'

export const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }
  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value ?? null)
}

const hashString = (value: string) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export const buildApiCacheKey = (scope: string, params?: unknown) =>
  `${scope}:${hashString(stableStringify(params || {}))}`

const storageKey = (key: string) => `${storagePrefix}${key}`

const readPersistedCache = <T>(key: string): CacheRecord<T> | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(storageKey(key))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheRecord<T>
    if (!parsed || parsed.expiresAt <= now()) {
      window.sessionStorage.removeItem(storageKey(key))
      return null
    }
    return parsed
  } catch {
    window.sessionStorage.removeItem(storageKey(key))
    return null
  }
}

const writePersistedCache = <T>(key: string, record: CacheRecord<T>) => {
  if (typeof window === 'undefined') return
  try {
    const raw = JSON.stringify(record)
    if (raw.length > maxPersistedValueLength) return
    window.sessionStorage.setItem(storageKey(key), raw)
  } catch {
    // Storage can be full or disabled; memory cache still works.
  }
}

export const getApiCache = <T>(key: string): T | null => {
  const memoryRecord = memoryCache.get(key)
  if (memoryRecord) {
    if (memoryRecord.expiresAt > now()) return memoryRecord.value as T
    memoryCache.delete(key)
  }

  const persistedRecord = readPersistedCache<T>(key)
  if (!persistedRecord) return null
  memoryCache.set(key, persistedRecord)
  return persistedRecord.value
}

export const setApiCache = <T>(key: string, value: T, ttlMs: number, persist = true) => {
  const record: CacheRecord<T> = {
    value,
    expiresAt: now() + ttlMs,
  }
  memoryCache.set(key, record)
  if (persist) writePersistedCache(key, record)
}

export const cachedApiRequest = async <T>(
  key: string,
  ttlMs: number,
  request: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> => {
  if (!options.force) {
    const cached = getApiCache<T>(key)
    if (cached) return cached
  }

  const pending = pendingRequests.get(key)
  if (pending && !options.force) return pending as Promise<T>

  const promise = request()
    .then((value) => {
      setApiCache(key, value, ttlMs, options.persist !== false)
      return value
    })
    .finally(() => {
      if (pendingRequests.get(key) === promise) {
        pendingRequests.delete(key)
      }
    })

  pendingRequests.set(key, promise)
  return promise
}

export const clearApiCacheByPrefix = (prefix: string) => {
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) memoryCache.delete(key)
  }
  if (typeof window === 'undefined') return
  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index)
    if (key?.startsWith(`${storagePrefix}${prefix}`)) {
      window.sessionStorage.removeItem(key)
    }
  }
}
