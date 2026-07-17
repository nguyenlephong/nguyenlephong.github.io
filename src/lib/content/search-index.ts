import type { BlogPostMeta } from '@/lib/blog/types'
import type { NoteMeta } from '@/lib/notes/types'

export const SEARCH_INDEX_VERSION = 1 as const

export type BlogSearchItem = Pick<
  BlogPostMeta,
  'slug' | 'category' | 'title' | 'summary' | 'date' | 'readingMinutes' | 'tags'
>

export type NoteSearchItem = Pick<
  NoteMeta,
  | 'slug'
  | 'title'
  | 'summary'
  | 'cardSummary'
  | 'date'
  | 'readingMinutes'
  | 'tags'
  | 'topic'
>

export interface SearchIndex<T> {
  version: typeof SEARCH_INDEX_VERSION
  revision: string
  items: T[]
}

export type BlogSearchIndex = SearchIndex<BlogSearchItem>
export type NotesSearchIndex = SearchIndex<NoteSearchItem>

export function toBlogSearchItem(post: BlogPostMeta): BlogSearchItem {
  return {
    slug: post.slug,
    category: post.category,
    title: post.title,
    summary: post.summary,
    date: post.date,
    readingMinutes: post.readingMinutes,
    tags: post.tags,
  }
}

export function toNoteSearchItem(note: NoteMeta): NoteSearchItem {
  return {
    slug: note.slug,
    title: note.title,
    summary: note.summary,
    ...(note.cardSummary ? { cardSummary: note.cardSummary } : {}),
    date: note.date,
    readingMinutes: note.readingMinutes,
    tags: note.tags,
    ...(note.topic ? { topic: note.topic } : {}),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasString(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === 'string'
}

function hasStringArray(record: Record<string, unknown>, key: string): boolean {
  const value = record[key]
  return Array.isArray(value) && value.every((item: unknown) => typeof item === 'string')
}

function isSharedSearchItem(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false
  return (
    hasString(value, 'slug') &&
    hasString(value, 'title') &&
    hasString(value, 'summary') &&
    hasString(value, 'date') &&
    typeof value['readingMinutes'] === 'number' &&
    hasStringArray(value, 'tags')
  )
}

function isSearchIndex<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
  expectedRevision?: string,
): value is SearchIndex<T> {
  return (
    isRecord(value) &&
    value['version'] === SEARCH_INDEX_VERSION &&
    typeof value['revision'] === 'string' &&
    /^[a-f0-9]{16}$/.test(value['revision']) &&
    (expectedRevision === undefined || value['revision'] === expectedRevision) &&
    Array.isArray(value['items']) &&
    value['items'].every(isItem)
  )
}

export function isBlogSearchIndex(
  value: unknown,
  expectedRevision?: string,
): value is BlogSearchIndex {
  return isSearchIndex(value, (item): item is BlogSearchItem => {
    return isSharedSearchItem(item) && hasString(item, 'category')
  }, expectedRevision)
}

export function isNotesSearchIndex(
  value: unknown,
  expectedRevision?: string,
): value is NotesSearchIndex {
  return isSearchIndex(value, (item): item is NoteSearchItem => {
    if (!isSharedSearchItem(item)) return false
    return (
      (item['topic'] === undefined || typeof item['topic'] === 'string') &&
      (item['cardSummary'] === undefined || typeof item['cardSummary'] === 'string')
    )
  }, expectedRevision)
}

/** Extracts and validates the cache revision embedded in a search-index URL. */
export function searchIndexRevisionFromUrl(url: string): string | null {
  try {
    const revision = new URL(url, 'https://static-search.invalid').searchParams.get('v')
    return revision && /^[a-f0-9]{16}$/.test(revision) ? revision : null
  } catch {
    return null
  }
}

/** Fetches a revisioned static index and rejects stale/malformed responses. */
export async function fetchVersionedSearchIndex<T>(
  url: string,
  validate: (value: unknown, expectedRevision: string) => boolean,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<T | null> {
  const expectedRevision = searchIndexRevisionFromUrl(url)
  if (!expectedRevision) return null

  try {
    const response = await fetcher(url, { cache: 'force-cache', signal })
    if (!response.ok) return null
    const payload: unknown = await response.json()
    return validate(payload, expectedRevision) ? (payload as T) : null
  } catch {
    return null
  }
}
