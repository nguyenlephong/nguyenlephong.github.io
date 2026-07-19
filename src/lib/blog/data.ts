import path from 'node:path'
import { routing, type Locale } from '@/i18n/routing'
import {
  byDateDesc,
  isDefaultLocale,
  overlayByKey,
  readRequiredJsonValidated,
  readJsonValidated,
} from '@/lib/content/io'
import {
  assertExactSlugSet,
  assertIndexBodyMetadataParity,
  assertKnownKeys,
  assertProvidedMetadataParity,
  listJsonSlugs,
} from '@/lib/content/catalog'
import { pageCount } from '@/lib/content/pagination'
import { getContentVersionTracker } from '@/lib/content/freshness'
import { isContentPublished } from '@/lib/content/publication'
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

const DATA_DIR = path.join(process.cwd(), 'content', 'blog-data')
const contentVersionTracker =
  process.env.NODE_ENV === 'production'
    ? null
    : getContentVersionTracker(DATA_DIR)
const BLOG_METADATA_FIELDS = [
  'slug',
  'category',
  'title',
  'summary',
  'date',
  'updated',
  'publishAt',
  'status',
  'readingMinutes',
  'tags',
  'author',
] as const
const BLOG_CANONICAL_OVERRIDE_FIELDS = [
  'slug',
  'category',
  'date',
  'publishAt',
  'status',
  'author',
  'featured',
  'series',
  'seriesOrder',
] as const

interface BlogCatalog {
  index: BlogIndexFile
  postsBySlug: Map<string, BlogPostMeta>
}

interface BlogCatalogSnapshot {
  version: number
  catalog: BlogCatalog
}

const MAX_STABLE_SNAPSHOT_ATTEMPTS = 3
let baseCatalogCache: BlogCatalogSnapshot | null = null
const localizedIndexCache = new Map<
  string,
  { version: number; index: BlogIndexFile }
>()

function contentVersion(): number {
  return contentVersionTracker?.currentVersion() ?? 0
}

/**
 * Catalog validation scans every authored body, so keep it once per module
 * instance in every environment. A Next.js HMR reload naturally replaces this
 * module state; tests and content tooling can invalidate it explicitly.
 */
export function invalidateBlogContentCatalog(): void {
  baseCatalogCache = null
  localizedIndexCache.clear()
}

/**
 * Returns a base catalog proven to belong to one stable content version.
 * A concurrent edit invalidates the attempted build instead of letting callers
 * associate an old catalog with a newer version.
 */
function baseCatalogSnapshot(): BlogCatalogSnapshot {
  for (let attempt = 1; attempt <= MAX_STABLE_SNAPSHOT_ATTEMPTS; attempt += 1) {
    const version = contentVersion()
    if (baseCatalogCache?.version === version) return baseCatalogCache

    const catalog = buildBaseCatalog()
    if (contentVersion() !== version) continue

    const snapshot = { version, catalog }
    baseCatalogCache = snapshot
    localizedIndexCache.clear()
    return snapshot
  }

  throw new Error('Blog content changed repeatedly while building a stable catalog snapshot')
}

/** Canonical index (English) — used for static-param generation. */
function buildBaseCatalog(): BlogCatalog {
  const indexPath = path.join(DATA_DIR, '_index.json')
  const rawIndex = readRequiredJsonValidated(
    indexPath,
    blogIndexSchema,
    'canonical blog index',
  )
  const expectedSlugs = rawIndex.posts.map((post) => post.slug)
  assertExactSlugSet(
    'Canonical blog',
    expectedSlugs,
    listJsonSlugs(path.join(DATA_DIR, 'posts')),
  )

  for (const entry of rawIndex.posts) {
    const bodyPath = path.join(DATA_DIR, 'posts', `${entry.slug}.json`)
    const body = readRequiredJsonValidated(
      bodyPath,
      blogPostSchema,
      `canonical blog body for "${entry.slug}"`,
    )
    assertIndexBodyMetadataParity(
      'Canonical blog',
      entry as unknown as Record<string, unknown>,
      body as unknown as Record<string, unknown>,
      bodyPath,
      BLOG_METADATA_FIELDS,
    )
  }

  const index = rewriteContentAssetValues(rawIndex)
  const catalog = {
    index,
    postsBySlug: new Map(index.posts.map((post) => [post.slug, post])),
  }
  return catalog
}

function baseCatalog(): BlogCatalog {
  return baseCatalogSnapshot().catalog
}

function baseIndex(): BlogIndexFile {
  return baseCatalog().index
}

/**
 * Loads the blog index and, when a per-locale override exists, swaps in
 * translated category + post metadata (title/tagline/description/summary) on
 * top of the canonical entries. Untranslated fields keep their English value so
 * the index stays complete instead of going blank.
 */
export function loadIndex(locale?: string): BlogIndexFile {
  if (isDefaultLocale(locale)) return baseIndex()

  for (let attempt = 1; attempt <= MAX_STABLE_SNAPSHOT_ATTEMPTS; attempt += 1) {
    const baseSnapshot = baseCatalogSnapshot()
    const { version, catalog } = baseSnapshot
    if (contentVersion() !== version) continue

    const cached = localizedIndexCache.get(locale as string)
    if (cached?.version === version) return cached.index

    const overridePath = path.join(DATA_DIR, locale as string, '_index.json')
    const override = readJsonValidated(
      overridePath,
      blogIndexOverrideSchema,
    )
    if (!override) {
      if (contentVersion() === version) return catalog.index
      continue
    }

    assertKnownKeys(
      `Localized blog categories (${locale})`,
      catalog.index.categories.map((category) => category.slug),
      override.categories?.map((category) => category.slug) ?? [],
    )
    assertKnownKeys(
      `Localized blog posts (${locale})`,
      catalog.index.posts.map((post) => post.slug),
      override.posts?.map((post) => post.slug) ?? [],
    )
    for (const localizedPost of override.posts ?? []) {
      const canonicalPost = catalog.postsBySlug.get(localizedPost.slug)
      if (!canonicalPost) continue
      assertProvidedMetadataParity(
        `Localized blog index (${locale})`,
        canonicalPost as unknown as Record<string, unknown>,
        localizedPost as unknown as Record<string, unknown>,
        overridePath,
        BLOG_CANONICAL_OVERRIDE_FIELDS,
      )
    }

    const index = blogIndexSchema.parse(rewriteContentAssetValues({
      categories: overlayByKey(
        catalog.index.categories,
        override.categories,
        (c) => c.slug,
      ),
      posts: overlayByKey(catalog.index.posts, override.posts, (p) => p.slug),
    }))

    const expectedSlugs = catalog.index.posts
      .filter((post) => post.locales.includes(locale as Locale))
      .map((post) => post.slug)
    const bodyDirectory = path.join(DATA_DIR, locale as string, 'posts')
    assertExactSlugSet(
      `Localized blog (${locale})`,
      expectedSlugs,
      listJsonSlugs(bodyDirectory),
    )
    const indexBySlug = new Map(index.posts.map((post) => [post.slug, post]))
    for (const slug of expectedSlugs) {
      const bodyPath = path.join(bodyDirectory, `${slug}.json`)
      const baseEntry = catalog.postsBySlug.get(slug)
      const body = baseEntry ? loadPostBody(slug, baseEntry, locale) : null
      const indexedPost = indexBySlug.get(slug)
      if (!body || !indexedPost) {
        throw new Error(`Localized blog (${locale}) could not resolve "${slug}"`)
      }
      assertIndexBodyMetadataParity(
        `Localized blog (${locale})`,
        indexedPost as unknown as Record<string, unknown>,
        body as unknown as Record<string, unknown>,
        bodyPath,
        BLOG_METADATA_FIELDS,
      )
    }

    if (contentVersion() !== version) continue
    localizedIndexCache.set(locale as string, { version, index })
    return index
  }

  throw new Error(
    `Blog content (${locale}) changed repeatedly while building a stable localized catalog`,
  )
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
        isContentPublished(post) &&
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
    .posts.filter(
      (post) =>
        isContentPublished(post) && post.locales.includes(contentLocale),
    )
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
  const indexedPost = baseCatalog().postsBySlug.get(slug)
  if (!indexedPost || !isContentPublished(indexedPost)) return null

  return loadPostBody(slug, indexedPost, locale)
}

function loadPostBody(
  slug: string,
  indexedPost: BlogPostMeta,
  locale?: string,
): BlogPost | null {
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

  assertProvidedMetadataParity(
    `Localized blog body (${locale})`,
    base as unknown as Record<string, unknown>,
    override as unknown as Record<string, unknown>,
    path.join(DATA_DIR, locale as string, 'posts', `${slug}.json`),
    BLOG_CANONICAL_OVERRIDE_FIELDS,
  )

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
  return post && isContentPublished(post) ? [...post.locales] : []
}

/** Authored article routes only; untranslated locale paths must not be exported. */
export function listBlogPostParams(): Array<{
  locale: Locale
  category: string
  slug: string
}> {
  return baseIndex().posts
    .filter((post) => isContentPublished(post))
    .flatMap((post) =>
      post.locales.map((locale) => ({
        locale,
        category: post.category,
        slug: post.slug,
      })),
    )
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
  return baseIndex()
    .posts.filter((post) => isContentPublished(post))
    .map((post) => ({ category: post.category, slug: post.slug }))
}
