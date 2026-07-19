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
  assertExactIdentifierSet,
  assertIndexBodyMetadataParity,
  assertKnownKeys,
  assertProvidedMetadataParity,
  listJsonSlugs,
} from '@/lib/content/catalog'
import { pageCount } from '@/lib/content/pagination'
import {
  contentHubPageLocales,
  listContentHubRoutes,
} from '@/lib/content/hub-page'
import {
  BLOG_SERIES_IDS,
  CONTENT_HUB_LOCALES,
} from '@/lib/content/route-contract'
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
  BlogSeriesMeta,
} from './types'
import { compareSeriesPosts } from './series'
import { LEGACY_BLOG_LOCALE_FALLBACKS } from './legacy-locale-fallbacks'

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
  'contentMode',
  'seoTitle',
  'seoDescription',
  'reviewedAt',
] as const
const BLOG_CANONICAL_OVERRIDE_FIELDS = [
  'slug',
  'category',
  'date',
  'publishAt',
  'status',
  'author',
  'contentMode',
  'reviewedAt',
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
  if (rawIndex.posts.some((post) => post.series)) {
    assertExactIdentifierSet(
      'Canonical Blog series catalog',
      BLOG_SERIES_IDS,
      rawIndex.series.map((entry) => entry.id),
    )
  }
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
      `Localized blog series (${locale})`,
      catalog.index.series.map((entry) => entry.id),
      override.series?.map((entry) => entry.id) ?? [],
    )
    if (locale === 'vi' && catalog.index.series.length > 0) {
      assertExactIdentifierSet(
        'Vietnamese Blog series catalog',
        catalog.index.series.map((entry) => entry.id),
        override.series?.map((entry) => entry.id) ?? [],
      )
    }
    for (const localizedSeries of override.series ?? []) {
      const canonicalSeries = catalog.index.series.find(
        (entry) => entry.id === localizedSeries.id,
      )
      if (!canonicalSeries) continue
      assertProvidedMetadataParity(
        `Localized Blog series (${locale})`,
        canonicalSeries as unknown as Record<string, unknown>,
        localizedSeries as unknown as Record<string, unknown>,
        overridePath,
        ['id', 'order'],
      )
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
      series: overlayByKey(
        catalog.index.series,
        override.series,
        (entry) => entry.id,
      ),
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

export function listBlogSeries(locale?: string): BlogSeriesMeta[] {
  return [...loadIndex(locale).series].sort(
    (left, right) => left.order - right.order,
  )
}

export function getBlogSeries(
  id: string,
  locale?: string,
): BlogSeriesMeta | null {
  return loadIndex(locale).series.find((entry) => entry.id === id) ?? null
}

export function getPostsBySeries(
  seriesId: string,
  locale?: string,
): BlogPostMeta[] {
  return listPosts(locale)
    .filter((post) => post.series === seriesId)
    .sort(compareSeriesPosts)
}

export function listBlogSeriesHubPages(): Array<{
  series: string
  page: number
  locales: Array<(typeof CONTENT_HUB_LOCALES)[number]>
}> {
  return listContentHubRoutes({
    locales: CONTENT_HUB_LOCALES,
    listHubIds: (locale) =>
      listBlogSeries(locale).map((entry) => entry.id),
    itemCount: (seriesId, locale) =>
      getPostsBySeries(seriesId, locale).length,
  }).map(({ hubId, page, locales }) => ({
    series: hubId,
    page,
    locales,
  }))
}

export function listBlogSeriesPageLocales(
  seriesId: string,
  page: number,
): Array<(typeof CONTENT_HUB_LOCALES)[number]> {
  const routes = listBlogSeriesHubPages().map(
    ({ series, page: routePage, locales }) => ({
      hubId: series,
      page: routePage,
      locales,
    }),
  )
  return contentHubPageLocales(routes, seriesId, page)
}

export function listBlogSeriesParams(): Array<{
  locale: (typeof CONTENT_HUB_LOCALES)[number]
  series: string
}> {
  return listBlogSeriesHubPages()
    .filter(({ page }) => page === 1)
    .flatMap(({ series, locales }) =>
      locales.map((locale) => ({ locale, series })),
    )
}

export function listBlogSeriesPageParams(): Array<{
  locale: (typeof CONTENT_HUB_LOCALES)[number]
  series: string
  page: string
}> {
  return listBlogSeriesHubPages()
    .filter(({ page }) => page > 1)
    .flatMap(({ series, page, locales }) =>
      locales.map((locale) => ({ locale, series, page: String(page) })),
    )
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
    seoTitle: override.seoTitle ?? base.seoTitle,
    seoDescription: override.seoDescription ?? base.seoDescription,
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

/** Authored routes plus the exact non-indexable compatibility fallback set. */
export function listBlogArticleRouteParams(): Array<{
  locale: Locale
  category: string
  slug: string
}> {
  const authored = listBlogPostParams()
  const authoredKeys = new Set(
    authored.map(
      ({ locale, category, slug }) => `${locale}/${category}/${slug}`,
    ),
  )
  const fallbackKeys = new Set<string>()

  for (const fallback of LEGACY_BLOG_LOCALE_FALLBACKS) {
    const key = `${fallback.locale}/${fallback.category}/${fallback.slug}`
    if (fallbackKeys.has(key) || authoredKeys.has(key)) {
      throw new Error(
        `Legacy Blog locale fallback duplicates a public route: ${key}`,
      )
    }
    fallbackKeys.add(key)

    const post = baseCatalog().postsBySlug.get(fallback.slug)
    if (
      !post ||
      !isContentPublished(post) ||
      post.category !== fallback.category
    ) {
      throw new Error(
        `Legacy Blog locale fallback references an unavailable article: ${key}`,
      )
    }
    if (
      post.locales.includes(fallback.locale) ||
      !post.locales.includes(fallback.targetLocale)
    ) {
      throw new Error(
        `Legacy Blog locale fallback has invalid authored locales: ${key} -> ${fallback.targetLocale}`,
      )
    }
  }

  return [
    ...authored,
    ...LEGACY_BLOG_LOCALE_FALLBACKS.map(({ locale, category, slug }) => ({
      locale,
      category,
      slug,
    })),
  ]
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
