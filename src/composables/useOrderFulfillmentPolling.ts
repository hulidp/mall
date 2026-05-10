import type { Ref } from 'vue'

const FULFILLMENT_POLL_INTERVAL_MS = 3000
const FULFILLMENT_POLL_MAX_ATTEMPTS = 120

const activeStatuses = new Set(['paid', 'fulfilling', 'partially_delivered', 'delivered', 'completed'])

const isAutoFulfillmentType = (type: unknown) => {
  const value = String(type || '').trim()
  return value === 'auto' || value === 'upstream'
}

const hasFulfillmentContent = (fulfillment: any) => {
  if (!fulfillment || typeof fulfillment !== 'object') return false
  if (String(fulfillment.payload || '').trim() !== '') return true
  if (Number(fulfillment.payload_line_count || 0) > 0) return true
  const deliveryData = fulfillment.delivery_data || fulfillment.logistics
  if (!deliveryData || typeof deliveryData !== 'object') return false
  if (String(deliveryData.note || '').trim() !== '') return true
  return Array.isArray(deliveryData.entries) && deliveryData.entries.length > 0
}

const isFulfillmentReady = (fulfillment: any) => {
  return String(fulfillment?.status || '').trim() === 'delivered' && hasFulfillmentContent(fulfillment)
}

const nodeHasAutoFulfillmentItem = (node: any) => {
  const items = Array.isArray(node?.items) ? node.items : []
  return items.some((item: any) => isAutoFulfillmentType(item?.fulfillment_type))
}

const nodeNeedsFulfillmentRefresh = (node: any): boolean => {
  if (!node || typeof node !== 'object') return false
  const status = String(node.status || '').trim()
  if (!activeStatuses.has(status)) return false
  if (nodeHasAutoFulfillmentItem(node) && !isFulfillmentReady(node.fulfillment)) {
    return true
  }
  const children = Array.isArray(node.children) ? node.children : []
  return children.some(nodeNeedsFulfillmentRefresh)
}

export const useOrderFulfillmentPolling = (
  order: Ref<any>,
  refreshOrder: () => Promise<void>,
) => {
  let pollTimer: number | null = null
  let pollAttempts = 0
  let refreshing = false

  const stopFulfillmentPolling = () => {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer)
      pollTimer = null
    }
    pollAttempts = 0
    refreshing = false
  }

  const startFulfillmentPolling = () => {
    if (pollTimer !== null) return
    pollTimer = window.setInterval(async () => {
      if (refreshing) return
      if (!nodeNeedsFulfillmentRefresh(order.value)) {
        stopFulfillmentPolling()
        return
      }
      if (pollAttempts >= FULFILLMENT_POLL_MAX_ATTEMPTS) {
        stopFulfillmentPolling()
        return
      }
      pollAttempts += 1
      refreshing = true
      try {
        await refreshOrder()
      } finally {
        refreshing = false
      }
    }, FULFILLMENT_POLL_INTERVAL_MS)
  }

  const syncFulfillmentPolling = () => {
    if (nodeNeedsFulfillmentRefresh(order.value)) {
      startFulfillmentPolling()
    } else {
      stopFulfillmentPolling()
    }
  }

  return {
    syncFulfillmentPolling,
    stopFulfillmentPolling,
  }
}
