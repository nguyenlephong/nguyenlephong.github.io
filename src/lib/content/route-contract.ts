/** Static segments that must never be shadowed by authored dynamic routes. */
export const BLOG_RESERVED_CATEGORY_SEGMENTS = new Set([
  'opengraph-image',
  'page',
  'series',
])

export const BLOG_RESERVED_SERIES_SEGMENTS = new Set(['page'])

export const BLOG_RESERVED_ARTICLE_SEGMENTS = new Set(['opengraph-image'])

export const NOTES_RESERVED_ARTICLE_SEGMENTS = new Set(['page', 'topics'])

export const NOTES_RESERVED_HUB_SEGMENTS = new Set(['page'])

export const BLOG_SERIES_IDS = [
  'foundations',
  'ways-of-working',
  'ai-in-practice',
  'kind-engineering',
  'lean-business-analysis',
  'data-eos-operating-system',
  'leadership-and-management',
] as const

export const NOTE_HUB_TOPIC_IDS = [
  'mua-nha',
  'tiet-kiem',
  'su-nghiep',
  'sach',
  'goc-nhin',
  'thoughts',
] as const

export const CONTENT_HUB_LOCALES = ['en', 'vi'] as const
