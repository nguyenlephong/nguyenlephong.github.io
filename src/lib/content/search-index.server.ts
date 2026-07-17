import { createHash } from 'node:crypto'
import {
  SEARCH_INDEX_VERSION,
  type SearchIndex,
} from '@/lib/content/search-index'

/** Builds a deterministic revision so each deployment requests a fresh URL. */
export function createSearchIndex<T>(items: T[]): SearchIndex<T> {
  const revision = createHash('sha256')
    .update(JSON.stringify({ version: SEARCH_INDEX_VERSION, items }))
    .digest('hex')
    .slice(0, 16)

  return { version: SEARCH_INDEX_VERSION, revision, items }
}

export function versionedSearchIndexUrl(
  locale: string,
  surface: 'blog' | 'notes',
  revision: string,
): string {
  return `/${locale}/search/${surface}.json?v=${revision}`
}
