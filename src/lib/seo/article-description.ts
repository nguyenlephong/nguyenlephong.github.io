import { htmlToPlainText } from '@/lib/thoughts/seo'

/** Latin-script snippets get roughly 155 characters in search results. */
const LATIN_MAX = 158
/** CJK glyphs are double width, so the same pixel budget holds about half. */
const CJK_MAX = 88

const SENTENCE_END = /[.!?。！？]["')\]”’」』]?(?=\s|$)|[。！？]/g
const SOFT_BREAK = /[\s、，,;；:：]/

function isCjkDominant(text: string): boolean {
  const sample = text.slice(0, 200)
  if (sample.length === 0) return false
  const cjk = sample.match(/[぀-ヿ㐀-鿿가-힯]/g)?.length ?? 0
  return cjk / sample.length > 0.3
}

/**
 * Builds a meta description that ends on a sentence boundary when one exists
 * in the usable window, falls back to a word boundary, and only then adds an
 * ellipsis. Accepts either HTML or plain text.
 */
export function buildArticleDescription(source: string, max?: number): string {
  const plain = htmlToPlainText(source)
  const limit = max ?? (isCjkDominant(plain) ? CJK_MAX : LATIN_MAX)
  if (plain.length <= limit) return plain

  const window = plain.slice(0, limit + 1)
  let sentenceEnd = -1
  for (const match of window.matchAll(SENTENCE_END)) {
    const end = (match.index ?? 0) + match[0].length
    if (end <= limit) sentenceEnd = end
  }
  if (sentenceEnd >= limit * 0.5) return window.slice(0, sentenceEnd).trim()

  let cut = limit
  for (let index = limit; index > limit * 0.6; index -= 1) {
    if (SOFT_BREAK.test(window[index] ?? '')) {
      cut = index
      break
    }
  }
  return `${plain.slice(0, cut).replace(/[\s、，,;；:：]+$/, '')}…`
}
