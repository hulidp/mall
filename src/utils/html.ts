import DOMPurify from 'dompurify'

const allowedStyleProperties = new Set([
  'color',
  'background-color',
  'text-align',
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-decoration-line',
  'line-height',
  'letter-spacing',
  'text-indent',
  'width',
  'height',
  'max-width',
])

const safeKeywordValues = new Set([
  'left',
  'right',
  'center',
  'justify',
  'normal',
  'bold',
  'bolder',
  'lighter',
  'italic',
  'oblique',
  'underline',
  'line-through',
  'none',
  'auto',
])

const dangerousStyleValuePattern = /(url\s*\(|expression\s*\(|javascript\s*:|vbscript\s*:|data\s*:|@import|behavior\s*:|-moz-binding|<|>)/i
const cssLengthPattern = /^-?\d+(\.\d+)?(px|em|rem|%|pt|pc|vh|vw|vmin|vmax)?$/i
const cssColorPattern = /^(#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla)\([0-9.\s,%/deg+-]+\)|[a-z]+)$/i
const safeLinkProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const richTextInheritingSelector = 'p,div,li,blockquote,h1,h2,h3,h4,h5,h6,strong,b,em,i,u,s,a,code,span,th,td'
const richTextInheritedStyleProperties = ['color', 'background-color'] as const

function isSafeStyleValue(property: string, value: string): boolean {
  const normalizedValue = value.trim()
  if (!normalizedValue || normalizedValue.length > 160) return false
  if (dangerousStyleValuePattern.test(normalizedValue)) return false

  const lowerValue = normalizedValue.toLowerCase()
  if (property === 'color' || property === 'background-color') {
    return cssColorPattern.test(normalizedValue)
  }
  if (property === 'text-align') {
    return ['left', 'right', 'center', 'justify', 'start', 'end'].includes(lowerValue)
  }
  if (property === 'font-size' || property === 'line-height' || property === 'letter-spacing' || property === 'text-indent' || property === 'width' || property === 'height' || property === 'max-width') {
    return cssLengthPattern.test(normalizedValue) || safeKeywordValues.has(lowerValue)
  }
  if (property === 'font-weight') {
    return /^(normal|bold|bolder|lighter|[1-9]00)$/.test(lowerValue)
  }
  if (property === 'font-style') {
    return ['normal', 'italic', 'oblique'].includes(lowerValue)
  }
  if (property === 'text-decoration' || property === 'text-decoration-line') {
    return normalizedValue
      .split(/\s+/)
      .every((item) => ['none', 'underline', 'line-through', 'overline'].includes(item.toLowerCase()))
  }
  return false
}

function sanitizeInlineStyle(styleText: string): string {
  return styleText
    .split(';')
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(':')
      if (separatorIndex <= 0) return ''
      const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
      const value = declaration.slice(separatorIndex + 1).trim().replace(/\s*!important\s*$/i, '').trim()
      if (!allowedStyleProperties.has(property) || !isSafeStyleValue(property, value)) return ''
      return `${property}: ${value} !important`
    })
    .filter(Boolean)
    .join('; ')
}

function readStyleDeclarations(styleText: string): Map<string, string> {
  const declarations = new Map<string, string>()
  styleText.split(';').forEach((declaration) => {
    const separatorIndex = declaration.indexOf(':')
    if (separatorIndex <= 0) return
    const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
    const value = declaration.slice(separatorIndex + 1).trim()
    if (!property || !value) return
    declarations.set(property, value)
  })
  return declarations
}

function appendMissingStyleDeclarations(styleText: string, declarations: Array<[string, string]>): string {
  const nextDeclarations = readStyleDeclarations(styleText)
  for (const [property, value] of declarations) {
    if (!nextDeclarations.has(property)) {
      nextDeclarations.set(property, value)
    }
  }
  return Array.from(nextDeclarations.entries())
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ')
}

function propagateRichTextInlineStyles(root: DocumentFragment) {
  root.querySelectorAll<HTMLElement>('[style]').forEach((node) => {
    const parentDeclarations = readStyleDeclarations(node.getAttribute('style') || '')
    const inheritedDeclarations = richTextInheritedStyleProperties
      .map((property) => [property, parentDeclarations.get(property)] as const)
      .filter((entry): entry is readonly [typeof richTextInheritedStyleProperties[number], string] => Boolean(entry[1]))

    if (!inheritedDeclarations.length) return

    node.querySelectorAll<HTMLElement>(richTextInheritingSelector).forEach((child) => {
      const childStyle = child.getAttribute('style') || ''
      const nextStyle = appendMissingStyleDeclarations(childStyle, inheritedDeclarations.map(([property, value]) => [property, value]))
      if (nextStyle !== childStyle) {
        child.setAttribute('style', nextStyle)
      }
    })
  })
}

function sanitizeAllowedInlineStyles(html: string): string {
  if (typeof document === 'undefined') return html
  const template = document.createElement('template')
  template.innerHTML = html
  template.content.querySelectorAll<HTMLElement>('[style]').forEach((node) => {
    const nextStyle = sanitizeInlineStyle(node.getAttribute('style') || '')
    if (nextStyle) {
      node.setAttribute('style', nextStyle)
    } else {
      node.removeAttribute('style')
    }
  })
  template.content.querySelectorAll<HTMLAnchorElement>('a').forEach((node) => {
    const href = node.getAttribute('href') || ''
    if (href && !isSafeHref(href)) {
      node.removeAttribute('href')
      node.removeAttribute('target')
    }

    const target = (node.getAttribute('target') || '').trim().toLowerCase()
    if (target && !['_blank', '_self', '_parent', '_top'].includes(target)) {
      node.removeAttribute('target')
    }
    if (target === '_blank') {
      const relTokens = new Set((node.getAttribute('rel') || '').split(/\s+/).filter(Boolean))
      relTokens.add('noopener')
      relTokens.add('noreferrer')
      node.setAttribute('rel', Array.from(relTokens).join(' '))
    }
  })
  propagateRichTextInlineStyles(template.content)
  return template.innerHTML
}

function isSafeHref(href: string): boolean {
  const normalizedHref = href.trim()
  const hasControlChar = Array.from(normalizedHref).some((char) => {
    const code = char.charCodeAt(0)
    return code <= 31 || code === 127
  })
  if (!normalizedHref || hasControlChar) return false
  if (normalizedHref.startsWith('#')) return true
  if (/^\/(?!\/)/.test(normalizedHref)) return true
  if (/^\.\.?\//.test(normalizedHref)) return true
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.href : 'https://example.invalid/'
    const url = new URL(normalizedHref, baseUrl)
    return safeLinkProtocols.has(url.protocol)
  } catch {
    return false
  }
}

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'colspan', 'rowspan', 'class', 'style'],
  })
  return sanitizeAllowedInlineStyles(cleanHtml)
}
