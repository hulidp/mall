export const WECHAT_CONTACT_ROUTE = '/contact/wechat'

export interface ContactConfigLike {
  telegram?: unknown
  whatsapp?: unknown
  qq?: unknown
  wechat?: unknown
  wechat_qr_image?: unknown
}

const trimText = (value: unknown) => String(value || '').trim()

export const getWechatQrImage = (contact?: ContactConfigLike | null): string => {
  return trimText(contact?.wechat_qr_image)
}

export const hasWechatQrImage = (contact?: ContactConfigLike | null): boolean => {
  return getWechatQrImage(contact) !== ''
}

export const getWechatContactUrl = (contact?: ContactConfigLike | null): string => {
  if (!hasWechatQrImage(contact)) return ''
  return trimText(contact?.wechat) || WECHAT_CONTACT_ROUTE
}

export const isInternalContactUrl = (url: string): boolean => {
  return trimText(url).startsWith('/')
}
