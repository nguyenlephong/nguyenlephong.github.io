import fs from 'node:fs'
import path from 'node:path'
import { routing } from '@/i18n/routing'
import type {
  BlogCategoryMeta,
  BlogIndexFile,
  BlogPost,
  BlogPostMeta,
} from './types'

const DATA_DIR = path.join(process.cwd(), 'public', 'blog-data')

const EMPTY_INDEX: BlogIndexFile = { categories: [], posts: [] }

function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
}

function isDefault(locale?: string): boolean {
  return !locale || locale === routing.defaultLocale
}

function byDateDesc(a: BlogPostMeta, b: BlogPostMeta): number {
  return b.date.localeCompare(a.date)
}

/** Canonical index (English) — used for static-param generation. */
function baseIndex(): BlogIndexFile {
  return readJson<BlogIndexFile>(path.join(DATA_DIR, '_index.json')) ?? EMPTY_INDEX
}

/**
 * Loads the blog index and, when a per-locale override exists, swaps in
 * translated category + post metadata (title/tagline/description/summary) on
 * top of the canonical entries. Untranslated fields keep their English value so
 * the index stays complete instead of going blank.
 */
export function loadIndex(locale?: string): BlogIndexFile {
  const base = baseIndex()
  if (isDefault(locale)) return base

  const override = readJson<Partial<BlogIndexFile>>(
    path.join(DATA_DIR, locale as string, '_index.json'),
  )
  if (!override) return base

  const catOverrides = new Map(
    (override.categories ?? []).map((c) => [c.slug, c]),
  )
  const postOverrides = new Map((override.posts ?? []).map((p) => [p.slug, p]))

  return {
    categories: base.categories.map((c) => ({
      ...c,
      ...(catOverrides.get(c.slug) ?? {}),
    })),
    posts: base.posts.map((p) => ({ ...p, ...(postOverrides.get(p.slug) ?? {}) })),
  }
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
  return loadIndex(locale)
    .posts.filter((p) => p.category === category)
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
  const all = loadIndex(locale).posts
  const current = all.find((p) => p.slug === slug)
  if (!current?.series) return null

  const inSeries = all
    .filter((p) => p.series === current.series)
    .sort(byDateDesc)
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
  return [...loadIndex(locale).posts].sort(byDateDesc)
}

export function loadPost(slug: string, locale?: string): BlogPost | null {
  const base = readJson<BlogPost>(
    path.join(DATA_DIR, 'posts', `${slug}.json`),
  )
  if (!base) return null
  if (isDefault(locale)) return base

  const override = readJson<Partial<BlogPost>>(
    path.join(DATA_DIR, locale as string, 'posts', `${slug}.json`),
  )
  if (!override) return base

  return {
    ...base,
    title: override.title ?? base.title,
    summary: override.summary ?? base.summary,
    readingMinutes: override.readingMinutes ?? base.readingMinutes,
    updated: override.updated ?? base.updated,
    html: override.html ?? base.html,
    tags: override.tags ?? base.tags,
    faqs: override.faqs ?? base.faqs,
  }
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
