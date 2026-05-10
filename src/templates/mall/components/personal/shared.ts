export type MallAlertLevel = 'success' | 'error' | 'warning' | 'info'

export interface MallAlert {
  level: MallAlertLevel
  message: string
}

export const mallAlertClass = (level: MallAlertLevel) => {
  if (level === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
  }
  if (level === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
  }
  if (level === 'info') {
    return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300'
  }
  return 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
}

export const mallBadgeClass = (status?: string) => {
  const value = String(status || '').toLowerCase()
  if (['paid', 'delivered', 'completed', 'success', 'available', 'active', 'enabled'].includes(value)) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  }
  if (['pending_payment', 'pending', 'pending_review', 'pending_confirm', 'fulfilling', 'partially_delivered'].includes(value)) {
    return 'bg-orange-50 text-[#ff5000] dark:bg-orange-500/10'
  }
  if (['expired', 'failed', 'rejected', 'refunded', 'canceled', 'disabled'].includes(value)) {
    return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
  }
  return 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
}

export const formatMallDate = (raw?: string | null) => {
  if (!raw) return '-'
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? raw : date.toLocaleString()
}

export const applyPagination = (target: any, source: any) => {
  if (!source) return
  Object.assign(target, {
    page: Number(source.page || target.page || 1),
    page_size: Number(source.page_size || target.page_size || 20),
    total: Number(source.total || 0),
    total_page: Number(source.total_page || 1),
  })
}
