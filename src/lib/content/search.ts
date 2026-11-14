/** Client-side search helpers shared by the blog/notes explorers. */

/** Reads a query-string param on the client; returns null during SSR. */
export function readUrlParam(key: string): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(key)
}

/** The parts of a card that search looks at, in falling weight order. */
export interface SearchFields {
  title: string
  /** Topic/category label and tags. */
  meta: string
  summary: string
}

/** A word split into its unaccented letters and the marks each letter carries. */
interface SearchWord {
  base: string
  marks: string[]
}

export type SearchTerm = SearchWord & {
  /** Letter-bound marks per letter (â ă ơ ư đ). */
  shapes: string[]
  /** Tone marks anywhere in the term; placement varies ("hoà" / "hòa"). */
  tones: string
  /** Vietnamese reader: a typed tone mark closes the syllable. */
  vietnamese: boolean
}

export type SearchFieldIndex = Record<keyof SearchFields, SearchWord[]>

const COMBINING_MARK = /[̀-ͯ]/
// Vietnamese tones: grave, acute, tilde, hook above, dot below.
const TONE_MARK = /[\u0300\u0301\u0303\u0309\u0323]/g
const WORD_SEPARATOR = /[^\p{L}\p{M}\p{N}]+/u
const FIELD_WEIGHTS: [keyof SearchFields, number][] = [
  ['title', 3],
  ['meta', 2],
  ['summary', 1],
]
const ALL_IN_TITLE_BONUS = 4

function analyzeWord(word: string): SearchWord {
  let base = ''
  const marks: string[] = []
  for (const ch of word.normalize('NFD')) {
    if (COMBINING_MARK.test(ch)) {
      if (marks.length) marks[marks.length - 1] += ch
    } else if (ch === 'đ') {
      base += 'd'
      marks.push('đ')
    } else {
      base += ch
      marks.push('')
    }
  }
  return { base, marks }
}

const tonesOf = (marks: string[]) => marks.join('').match(TONE_MARK)?.join('') ?? ''

function splitWords(value: string): SearchWord[] {
  return value.normalize('NFC').toLowerCase().split(WORD_SEPARATOR).filter(Boolean).map(analyzeWord)
}

/** `locale` is the reader's UI locale; only 'vi' treats a typed tone as a whole syllable. */
export function parseSearchQuery(query: string, locale?: string): SearchTerm[] {
  return splitWords(query).map((word) => ({
    ...word,
    shapes: word.marks.map((mark) => mark.replace(TONE_MARK, '')),
    tones: tonesOf(word.marks),
    vietnamese: locale === 'vi',
  }))
}

export function indexSearchFields(fields: SearchFields): SearchFieldIndex {
  return {
    title: splitWords(fields.title),
    meta: splitWords(fields.meta),
    summary: splitWords(fields.summary),
  }
}

/**
 * A term matches a word it starts (prefix), never a letter run inside it, so
 * "ai" no longer matches "lại". Every mark the reader typed must be in the
 * word, extra marks are fine: "đa" finds "Đà", "tâm" finds "tấm", but "nhà" is
 * not "nhắn". Shape marks stay on their letter; tones may sit on either vowel.
 * Returns 0 for no match, 2 for a prefix, 3 for the whole word.
 */
function matchWord(word: SearchWord, term: SearchTerm): number {
  if (!word.base.startsWith(term.base)) return 0
  // A typed tone mark ends a Vietnamese syllable, so "nhà" must not match "nhàm".
  // French and other Latin accents share these marks and stay prefixes ("dévelop").
  if (term.vietnamese && term.tones.length && word.base.length !== term.base.length) return 0
  const prefix = word.marks.slice(0, term.base.length)
  if (!term.shapes.every((shape, i) => [...shape].every((mark) => prefix[i].includes(mark)))) return 0
  const wordTones = tonesOf(prefix)
  if (![...term.tones].every((tone) => wordTones.includes(tone))) return 0
  return word.base.length === term.base.length ? 3 : 2
}

/**
 * Relevance of one card: every term must match some word, title hits outrank
 * topic/tag hits, which outrank summary hits. 0 means the card is filtered out.
 */
export function scoreSearch(index: SearchFieldIndex, terms: SearchTerm[]): number {
  if (!terms.length) return 0
  let score = 0
  let allInTitle = true
  for (const term of terms) {
    let best = 0
    for (const [field, weight] of FIELD_WEIGHTS) {
      const hit = Math.max(0, ...index[field].map((word) => matchWord(word, term)))
      if (hit) best = Math.max(best, weight * 2 + hit - 2)
      if (field === 'title' && !hit) allInTitle = false
    }
    if (!best) return 0
    score += best
  }
  return allInTitle ? score + ALL_IN_TITLE_BONUS : score
}

/** The `limit` best entries for the terms, best first; ties keep input order. */
export function topMatches<T extends { index: SearchFieldIndex }>(
  entries: readonly T[],
  terms: SearchTerm[],
  limit: number,
): T[] {
  return entries
    .map((entry) => ({ entry, score: scoreSearch(entry.index, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry)
}
