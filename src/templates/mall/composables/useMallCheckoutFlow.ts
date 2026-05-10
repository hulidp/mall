import { ref, type Ref } from 'vue'
import { guestOrderAPI, productAPI, userOrderAPI } from '../../../api'
import type { CaptchaPayload } from '../../../api'
import type { CartItem } from '../../../stores/cart'
import { getAffiliateCode, getAffiliateVisitorKey } from '../../../utils/affiliate'
import { debounceAsync } from '../../../utils/debounce'
import { normalizeSkuId } from '../../../utils/sku'

export interface MallManualFormField {
  key: string
  type: string
  required: boolean
  label?: Record<string, string>
  placeholder?: Record<string, string>
  regex?: string
  min?: number
  max?: number
  max_len?: number
  source?: string
  page_size?: number
  options: string[]
}

export interface MallManualFormProduct {
  itemKey: string
  productId: number
  slug?: string
  skuId?: number
  title: any
  fields: MallManualFormField[]
  skuCount: number
}

export interface MallOrderItemPayload {
  product_id: number
  sku_id?: number
  quantity: number
  fulfillment_type?: string
}

type TranslateFn = (key: string, params?: Record<string, unknown>) => string
type LocalizedTextFn = (value: any) => string

const mallPaymentAutoOpenKey = (data: any, fallbackOrderNo = '') => {
  const orderNo = String(data?.order_no || fallbackOrderNo || '').trim()
  const paymentId = String(data?.payment_id || data?.id || '').trim()
  const payUrl = String(data?.pay_url || '').trim()
  return `mall-payment-opened:${orderNo}:${paymentId}:${payUrl}`
}

export const openMallRedirectPaymentLink = (data: any, fallbackOrderNo = '') => {
  const mode = String(data?.interaction_mode || '').toLowerCase()
  const payUrl = String(data?.pay_url || '').trim()
  if (mode !== 'redirect' || !payUrl || typeof window === 'undefined') return false

  const storageKey = mallPaymentAutoOpenKey(data, fallbackOrderNo)
  try {
    if (window.sessionStorage.getItem(storageKey) === '1') return false
  } catch {
  }

  try {
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(payUrl)
      window.sessionStorage.setItem(storageKey, '1')
      return true
    }
  } catch {
  }

  const opened = window.open(payUrl, '_blank', 'noopener,noreferrer')
  if (opened) {
    try {
      window.sessionStorage.setItem(storageKey, '1')
    } catch {
    }
    return true
  }
  return false
}

export const normalizeMallManualFormSchema = (rawSchema: any): MallManualFormField[] => {
  const rawFields = Array.isArray(rawSchema?.fields) ? rawSchema.fields : []
  const allowedTypes = new Set(['text', 'textarea', 'phone', 'email', 'number', 'select', 'radio', 'checkbox', 'card_picker'])
  return rawFields
    .map((rawField: any) => {
      const key = String(rawField?.key || '').trim()
      const type = String(rawField?.type || '').trim()
      if (!key || !allowedTypes.has(type)) return null
      const options = Array.isArray(rawField?.options)
        ? rawField.options.map((item: any) => String(item).trim()).filter(Boolean)
        : []
      return {
        key,
        type,
        required: Boolean(rawField?.required),
        label: rawField?.label,
        placeholder: rawField?.placeholder,
        regex: String(rawField?.regex || '').trim() || undefined,
        min: Number.isFinite(Number(rawField?.min)) ? Number(rawField.min) : undefined,
        max: Number.isFinite(Number(rawField?.max)) ? Number(rawField.max) : undefined,
        max_len: Number.isFinite(Number(rawField?.max_len)) ? Number(rawField.max_len) : undefined,
        source: String(rawField?.source || '').trim() || undefined,
        page_size: Number.isFinite(Number(rawField?.page_size)) ? Number(rawField.page_size) : undefined,
        options,
      } as MallManualFormField
    })
    .filter(Boolean) as MallManualFormField[]
}

export const mallManualFieldLabel = (field: MallManualFormField, getLocalizedText: LocalizedTextFn) => getLocalizedText(field.label) || field.key

export const mallManualFieldPlaceholder = (field: MallManualFormField, getLocalizedText: LocalizedTextFn) => getLocalizedText(field.placeholder)

export const isMallSelectableCardField = (field: MallManualFormField) => field.type === 'card_picker'

export const mallManualDeliveryFields = (fields: MallManualFormField[]) => fields.filter((field) => !isMallSelectableCardField(field))

export const mallSelectableCardFields = (fields: MallManualFormField[]) => fields.filter(isMallSelectableCardField)

export const isMallManualFieldValid = (field: MallManualFormField, value: unknown) => {
  if (field.type === 'checkbox') return !field.required || (Array.isArray(value) && value.length > 0)
  return !field.required || String(value ?? '').trim() !== ''
}

export const isMallManualCheckboxChecked = (data: Record<string, any>, fieldKey: string, option: string) => {
  const value = data[fieldKey]
  return Array.isArray(value) && value.includes(option)
}

export const toggleMallManualCheckbox = (dataRef: Ref<Record<string, any>>, fieldKey: string, option: string, checked: boolean) => {
  const current = dataRef.value[fieldKey]
  const next = Array.isArray(current) ? [...current] : []
  const index = next.indexOf(option)
  if (checked && index === -1) next.push(option)
  if (!checked && index !== -1) next.splice(index, 1)
  dataRef.value = { ...dataRef.value, [fieldKey]: next }
}

export const syncMallSingleManualFormData = (fields: MallManualFormField[], currentData: Record<string, any>) => {
  const nextData: Record<string, any> = {}
  fields.forEach((field) => {
    nextData[field.key] = currentData[field.key] ?? (field.type === 'checkbox' ? [] : '')
  })
  return nextData
}

const buildManualFormRow = (fields: MallManualFormField[], data: Record<string, any>) => {
  const row: Record<string, any> = {}
  fields.forEach((field) => {
    const rawValue = data[field.key]
    if (field.type === 'checkbox') {
      const list = Array.isArray(rawValue) ? rawValue.map((item: any) => String(item).trim()).filter(Boolean) : []
      if (list.length > 0) row[field.key] = list
      return
    }
    const text = rawValue == null ? '' : String(rawValue).trim()
    if (text) row[field.key] = text
  })
  return row
}

export const buildMallSingleManualFormDataPayload = (
  productId: number | string | null | undefined,
  fields: MallManualFormField[],
  data: Record<string, any>,
) => {
  if (!fields.length || !productId) return {}
  return { [String(productId)]: buildManualFormRow(fields, data) }
}

export const buildMallManualFormProducts = (items: CartItem[]) => {
  const grouped = new Map<number, MallManualFormProduct>()
  for (const item of items) {
    const fields = normalizeMallManualFormSchema(item.manualFormSchema)
    const hasSelectableCard = fields.some(isMallSelectableCardField)
    const fulfillmentType = String(item.fulfillmentType || '').trim()
    if (fulfillmentType !== 'manual' && fulfillmentType !== 'upstream' && !(fulfillmentType === 'auto' && hasSelectableCard)) continue
    if (fields.length === 0) continue
    const productId = Number(item.productId)
    if (!Number.isFinite(productId) || productId <= 0) continue
    const existing = grouped.get(productId)
    if (existing) {
      existing.skuCount += 1
      continue
    }
    grouped.set(productId, {
      itemKey: String(productId),
      productId,
      slug: item.slug,
      skuId: normalizeSkuId(item.skuId) || undefined,
      title: item.title,
      fields,
      skuCount: 1,
    })
  }
  return Array.from(grouped.values())
}

export const buildMallManualErrors = (
  products: MallManualFormProduct[],
  data: Record<string, Record<string, any>>,
  t: TranslateFn,
  label: (field: MallManualFormField) => string,
) => {
  const errors: Record<string, string> = {}
  for (const product of products) {
    const values = data[product.itemKey] || {}
    for (const field of product.fields) {
      if (!isMallManualFieldValid(field, values[field.key])) {
        errors[`${product.itemKey}:${field.key}`] = t('checkout.manualFormFieldRequired', { name: label(field) })
      }
    }
  }
  return errors
}

export const buildMallGroupedManualFormDataPayload = (
  products: MallManualFormProduct[],
  data: Record<string, Record<string, any>>,
) => {
  const payload: Record<string, any> = {}
  products.forEach((product) => {
    payload[product.itemKey] = buildManualFormRow(product.fields, data[product.itemKey] || {})
  })
  return payload
}

export const syncMallGroupedManualFormData = (
  products: MallManualFormProduct[],
  currentData: Record<string, Record<string, any>>,
) => {
  const nextData: Record<string, Record<string, any>> = {}
  products.forEach((product) => {
    nextData[product.itemKey] = currentData[product.itemKey] || {}
  })
  return nextData
}

export const buildMallSingleItemPayload = (product: any, sku: any, quantity: number): MallOrderItemPayload[] => [{
  product_id: Number(product?.id || 0),
  sku_id: normalizeSkuId(sku?.id) || undefined,
  quantity,
  fulfillment_type: product?.fulfillment_type || undefined,
}]

export const buildMallCartItemsPayload = (items: CartItem[]): MallOrderItemPayload[] => items.map((item) => ({
  product_id: item.productId,
  sku_id: normalizeSkuId(item.skuId) || undefined,
  quantity: item.quantity,
  fulfillment_type: item.fulfillmentType || undefined,
}))

export const buildMallOrderPayload = (options: {
  couponCode: string
  items: MallOrderItemPayload[]
  manualFormData: Record<string, any>
}) => ({
  coupon_code: options.couponCode.trim() || undefined,
  affiliate_code: getAffiliateCode() || undefined,
  affiliate_visitor_key: getAffiliateVisitorKey() || undefined,
  items: options.items,
  manual_form_data: options.manualFormData,
})

export const buildMallSubmitPayload = (
  orderPayload: Record<string, any>,
  selectedChannelId: number | null,
  useBalance: boolean,
) => ({
  ...orderPayload,
  channel_id: selectedChannelId || undefined,
  use_balance: useBalance,
})

export const isMallGuestEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export const buildMallGuestCaptchaPayload = (
  enabled: boolean,
  provider: string,
  imagePayload: CaptchaPayload,
  turnstileToken: string,
): CaptchaPayload | undefined => {
  if (!enabled) return undefined
  if (provider === 'image') {
    return {
      captcha_id: imagePayload.captcha_id || '',
      captcha_code: imagePayload.captcha_code || '',
    }
  }
  if (provider === 'turnstile') {
    return { turnstile_token: turnstileToken }
  }
  return undefined
}

export const refreshMallCaptchaConfig = async (
  loadConfig: (force?: boolean) => Promise<unknown>,
  imagePayload: Ref<CaptchaPayload>,
  turnstileToken: Ref<string>,
) => {
  await loadConfig(true)
  imagePayload.value = {}
  turnstileToken.value = ''
}

export const useMallPaymentSelection = () => {
  const selectedChannelId = ref<number | null>(null)
  const useBalance = ref(false)
  const selectPaymentChannel = (channelID: number | string) => {
    selectedChannelId.value = Number(channelID)
    useBalance.value = false
  }
  const selectBalancePayment = () => {
    useBalance.value = !useBalance.value
    if (useBalance.value) selectedChannelId.value = null
  }
  return {
    selectedChannelId,
    useBalance,
    selectPaymentChannel,
    selectBalancePayment,
  }
}

export const useMallOrderPreview = (options: {
  canPreview: () => boolean
  isAuthenticated: () => boolean
  buildOrderPayload: () => Record<string, any>
  guestEmail: Ref<string>
  guestPassword: Ref<string>
  fallbackErrorMessage: () => string
}) => {
  const preview = ref<any>(null)
  const previewLoading = ref(false)
  const previewError = ref('')
  const previewRequestId = ref(0)
  const couponRefreshing = ref(false)

  const clearPreview = () => {
    previewRequestId.value += 1
    preview.value = null
    previewLoading.value = false
    previewError.value = ''
    couponRefreshing.value = false
  }

  const loadPreview = async () => {
    if (!options.canPreview()) {
      clearPreview()
      return
    }

    const requestId = ++previewRequestId.value
    previewLoading.value = true
    previewError.value = ''
    try {
      const orderPayload = options.buildOrderPayload()
      const response = options.isAuthenticated()
        ? await userOrderAPI.preview(orderPayload)
        : await guestOrderAPI.preview({
          ...orderPayload,
          email: options.guestEmail.value.trim(),
          order_password: options.guestPassword.value,
        })
      if (requestId !== previewRequestId.value) return
      preview.value = response.data.data
    } catch (err: any) {
      if (requestId !== previewRequestId.value) return
      preview.value = null
      previewError.value = err.message || options.fallbackErrorMessage()
    } finally {
      if (requestId === previewRequestId.value) {
        previewLoading.value = false
        couponRefreshing.value = false
      }
    }
  }

  const debouncedLoadPreview = debounceAsync(loadPreview, 300)

  const loadPreviewNow = async () => {
    debouncedLoadPreview.cancel()
    await loadPreview()
  }

  return {
    preview,
    previewLoading,
    previewError,
    couponRefreshing,
    clearPreview,
    debouncedLoadPreview,
    loadPreviewNow,
  }
}

export const createAndPayMallOrder = async (options: {
  isAuthenticated: boolean
  orderPayload: Record<string, any>
  selectedChannelId: number | null
  useBalance: boolean
  guestEmail: string
  guestPassword: string
  captchaPayload?: CaptchaPayload
  submitFailedMessage: string
}) => {
  const submitPayload = buildMallSubmitPayload(options.orderPayload, options.selectedChannelId, options.useBalance)
  const response = options.isAuthenticated
    ? await userOrderAPI.createAndPay(submitPayload)
    : await guestOrderAPI.createAndPay({
      ...submitPayload,
      email: options.guestEmail.trim(),
      order_password: options.guestPassword,
      captcha_payload: options.captchaPayload,
    })
  const responseData = response.data.data
  if (!responseData?.order_no) throw new Error(options.submitFailedMessage)
  productAPI.invalidateCache()
  if (!options.isAuthenticated) {
    localStorage.setItem('guest_order_auth', JSON.stringify({
      email: options.guestEmail.trim(),
      order_password: options.guestPassword,
    }))
  }
  openMallRedirectPaymentLink(responseData)
  return responseData
}

export const buildMallPayPath = (orderNo: string, isAuthenticated: boolean) => {
  const query = isAuthenticated
    ? `order_no=${encodeURIComponent(orderNo)}`
    : `guest=1&order_no=${encodeURIComponent(orderNo)}`
  return `/pay?${query}`
}
