import { decodeHTML } from 'entities'

export interface ArticleOutlineItem {
  id: string
  text: string
  level: 2 | 3
}

export interface ArticleOutline {
  /** Article HTML with an id on every titled `h2`/`h3`. */
  html: string
  items: ArticleOutlineItem[]
}

// Ids the article page shell already uses; a heading slug must never take one.
// 'article-toc' is BlogToc's ARTICLE_TOC_ID (a client module, so not imported here).
const PAGE_IDS = [
  'article-toc',
  'main-content',
  'mobile-nav',
  'article-author-heading',
  'article-related-heading',
  'blog-faq-heading',
  'notes-faq-heading',
  'blog-reader-tools-panel',
]

const HEADING = /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi
const ID_ATTRIBUTE = /\sid=(["'])(.*?)\1/i

function slugifyHeading(text: string, fallback: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base
  for (let suffix = 2; used.has(id); suffix += 1) id = `${base}-${suffix}`
  used.add(id)
  return id
}

/**
 * Reads the article's `h2`/`h3` outline at build time so the table of contents
 * ships in the static HTML (no layout shift, no client scan). Headings without
 * an authored id get a stable slug id, written back into the returned HTML.
 */
export function buildArticleOutline(html: string): ArticleOutline {
  const used = new Set([
    ...PAGE_IDS,
    ...Array.from(html.matchAll(/\sid=(["'])(.*?)\1/gi), (match) => match[2]),
  ])
  const items: ArticleOutlineItem[] = []
  let index = 0

  const output = html.replace(
    HEADING,
    (match, level: string, attrs: string | undefined, inner: string) => {
      index += 1
      const text = decodeHTML(inner.replace(/<[^>]*>/g, ''))
        .replace(/\s+/g, ' ')
        .trim()
      if (!text) return match

      const authoredId = attrs?.match(ID_ATTRIBUTE)?.[2]
      const id =
        authoredId || uniqueId(slugifyHeading(text, `section-${index}`), used)
      items.push({ id, text, level: level === '3' ? 3 : 2 })

      return authoredId
        ? match
        : `<h${level} id="${id}"${attrs ?? ''}>${inner}</h${level}>`
    },
  )

  return { html: output, items }
}

/** A table of contents earns its space only with two or more sections. */
export const MIN_OUTLINE_ITEMS = 2

/**
 * True when the first paragraph opens with punctuation (a quote mark, a
 * bracket). `::first-letter` would swallow that mark into the drop cap.
 */
export function opensWithPunctuation(html: string): boolean {
  const firstParagraph = html.match(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i)?.[1]
  if (!firstParagraph) return false
  const text = decodeHTML(firstParagraph.replace(/<[^>]*>/g, '')).trimStart()
  return text.length > 0 && !/^[\p{L}\p{N}]/u.test(text)
}
