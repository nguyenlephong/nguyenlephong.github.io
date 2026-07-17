import path from 'node:path'
import { routing, type Locale } from '@/i18n/routing'
import {
  byDateDesc,
  isDefaultLocale,
  overlayByKey,
  readJsonValidated,
} from '@/lib/content/io'
import { pageCount } from '@/lib/content/pagination'
import { rewriteContentAssetValues } from '@/lib/assets/icdn'
import {
  blogIndexOverrideSchema,
  blogIndexSchema,
  blogPostOverrideSchema,
  blogPostSchema,
} from './schema'
import type {
  BlogCategoryMeta,
  BlogIndexFile,
  BlogPost,
  BlogPostMeta,
} from './types'
import { compareSeriesPosts } from './series'

const DATA_DIR = path.join(process.cwd(), 'public', 'blog-data')
const EMPTY_INDEX: BlogIndexFile = { categories: [], posts: [] }

/** Canonical index (English) — used for static-param generation. */
function baseIndex(): BlogIndexFile {
  return rewriteContentAssetValues(
    readJsonValidated(path.join(DATA_DIR, '_index.json'), blogIndexSchema) ??
      EMPTY_INDEX,
  )
}

/**
 * Loads the blog index and, when a per-locale override exists, swaps in
 * translated category + post metadata (title/tagline/description/summary) on
 * top of the canonical entries. Untranslated fields keep their English value so
 * the index stays complete instead of going blank.
 */
export function loadIndex(locale?: string): BlogIndexFile {
  const base = baseIndex()
  if (isDefaultLocale(locale)) return base

  const override = readJsonValidated(
    path.join(DATA_DIR, locale as string, '_index.json'),
    blogIndexOverrideSchema,
  )
  if (!override) return base

  return rewriteContentAssetValues({
    categories: overlayByKey(
      base.categories,
      override.categories,
      (c) => c.slug,
    ),
    posts: overlayByKey(base.posts, override.posts, (p) => p.slug),
  })
}

export function listCategories(locale?: string): BlogCategoryMeta[] {
  return [...loadIndex(locale).categories].sort((a, b) => a.order - b.order)
}

export function getCategory(
  slug: string,
  locale?: string,
): BlogCategoryMeta | null {
  return loadIndex(locale).categories.find((c) => c.slug === slug) ?? null
}

export function getPostsByCategory(
  category: string,
  locale?: string,
): BlogPostMeta[] {
  const contentLocale = locale ?? routing.defaultLocale
  return loadIndex(locale)
    .posts.filter(
      (post) =>
        post.category === category &&
        post.locales.includes(contentLocale as Locale),
    )
    .sort(byDateDesc)
}

export interface SeriesContext {
  series: string
  part: number
  total: number
  prev: BlogPostMeta | null
  next: BlogPostMeta | null
}

/**
 * Resolves where a post sits within its series and who its neighbours are, so
 * the article page can render "Part N of M" plus previous/next links. Returns
 * null for standalone posts.
 */
export function getSeriesContext(
  slug: string,
  locale?: string,
): SeriesContext | null {
  const all = listPosts(locale)
  const current = all.find((p) => p.slug === slug)
  if (!current?.series) return null

  const inSeries = all
    .filter((p) => p.series === current.series)
    .sort(compareSeriesPosts)
  const idx = inSeries.findIndex((p) => p.slug === slug)

  return {
    series: current.series,
    part: idx + 1,
    total: inSeries.length,
    prev: idx > 0 ? inSeries[idx - 1] : null,
    next: idx < inSeries.length - 1 ? inSeries[idx + 1] : null,
  }
}

export function listPosts(locale?: string): BlogPostMeta[] {
  const contentLocale = (locale ?? routing.defaultLocale) as Locale
  return loadIndex(locale)
    .posts.filter((post) => post.locales.includes(contentLocale))
    .sort(byDateDesc)
}

/** Locales whose authored corpus reaches a given static archive page. */
export function listBlogArchiveLocales(page: number): Locale[] {
  if (!Number.isInteger(page) || page < 1) return []
  return routing.locales.filter(
    (locale) => page <= pageCount(listPosts(locale).length),
  )
}

export function loadPost(slug: string, locale?: string): BlogPost | null {
  const indexedPost = baseIndex().posts.find((post) => post.slug === slug)
  if (!indexedPost) return null

  const base = readJsonValidated(
    path.join(DATA_DIR, 'posts', `${slug}.json`),
    blogPostSchema,
  )
  if (!base) return null
  if (isDefaultLocale(locale)) {
    return rewriteContentAssetValues({
      ...base,
      locales: [...indexedPost.locales],
    })
  }

  const override = readJsonValidated(
    path.join(DATA_DIR, locale as string, 'posts', `${slug}.json`),
    blogPostOverrideSchema,
  )
  if (!override) {
    return rewriteContentAssetValues({
      ...base,
      locales: [...indexedPost.locales],
    })
  }

  const post = {
    ...base,
    locales: [...indexedPost.locales],
    title: override.title ?? base.title,
    summary: override.summary ?? base.summary,
    readingMinutes: override.readingMinutes ?? base.readingMinutes,
    updated: override.updated ?? base.updated,
    html: override.html ?? base.html,
    tags: override.tags ?? base.tags,
    book: override.book ?? base.book,
    faqs: override.faqs ?? base.faqs,
  }

  return rewriteContentAssetValues(post)
}

export function getPostContentLocales(slug: string): BlogPostMeta['locales'] {
  const post = baseIndex().posts.find((entry) => entry.slug === slug)
  return post ? [...post.locales] : []
}

/** Canonical category slugs — drives static-param generation. */
export function listCategorySlugs(): string[] {
  return baseIndex().categories.map((c) => c.slug)
}

/** Canonical (category, slug) pairs — drives nested static-param generation. */
export function listCategoryPostPairs(): Array<{
  category: string
  slug: string
}> {
  return baseIndex().posts.map((p) => ({ category: p.category, slug: p.slug }))
}
