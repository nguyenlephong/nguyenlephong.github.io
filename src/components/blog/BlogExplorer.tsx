'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getPostStatsByIds, postStatsId } from '@/lib/firebase/postStats'
import BlogPostCard from './BlogPostCard'
import {
  useExplorer,
  type ExplorerFilterOption,
} from '@/components/explorer/useExplorer'
import { ExplorerShell, type ExplorerLabels } from '@/components/explorer/ExplorerShell'
import type { BlogAccent } from '@/lib/blog/types'
import { CONTENT_PAGE_SIZE } from '@/lib/content/pagination'
import {
  fetchVersionedSearchIndex,
  isBlogSearchIndex,
  type BlogSearchIndex,
  type BlogSearchItem,
} from '@/lib/content/search-index'

interface CardMeta {
  post: BlogSearchItem
  accent: BlogAccent
  categoryTitle: string
  readingLabel: string
}

interface CategoryOption {
  slug: string
  title: string
  accent: BlogAccent
}

interface BlogExplorerProps {
  cards: CardMeta[]
  categories: CategoryOption[]
  popularTags: string[]
  locale: string
  currentPage: number
  totalPages: number
  totalItems: number
  searchIndexUrl: string
  /** Threshold below which the view badge is hidden (default 100). */
  viewThreshold?: number
}

/**
 * Progressive blog explorer. The initial payload contains one static page;
 * full-corpus card metadata is fetched only after search/filter intent.
 */
export default function BlogExplorer({
  cards,
  categories,
  popularTags,
  locale,
  currentPage,
  totalPages,
  totalItems,
  searchIndexUrl,
  viewThreshold = 100,
}: BlogExplorerProps) {
  const t = useTranslations('Pages.blog')
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})
  const [loadedSearch, setLoadedSearch] = useState<{
    cards: CardMeta[]
    url: string
  } | null>(null)
  const searchCards = loadedSearch?.url === searchIndexUrl ? loadedSearch.cards : null
  const [searchStatus, setSearchStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle')
  const searchLoadRef = useRef<{
    controller: AbortController
    promise: Promise<void>
    url: string
  } | null>(null)

  const filters: ExplorerFilterOption[] = useMemo(
    () => categories.map((c) => ({ id: c.slug, label: c.title })),
    [categories],
  )

  const categoryBySlug = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories],
  )

  const loadSearchIndex = useCallback(() => {
    if (searchCards) return Promise.resolve()
    if (searchLoadRef.current?.url === searchIndexUrl) {
      return searchLoadRef.current.promise
    }

    searchLoadRef.current?.controller.abort()
    const controller = new AbortController()

    setSearchStatus('loading')
    const pending = (async () => {
      try {
        const payload = await fetchVersionedSearchIndex<BlogSearchIndex>(
          searchIndexUrl,
          isBlogSearchIndex,
          controller.signal,
        )
        if (!payload) {
          throw new Error('Invalid or stale blog search index')
        }
        if (controller.signal.aborted || searchLoadRef.current?.controller !== controller) {
          return
        }

        setLoadedSearch({
          url: searchIndexUrl,
          cards: payload.items.map((post) => {
            const category = categoryBySlug.get(post.category)
            return {
              post,
              accent: category?.accent ?? 'ocean',
              categoryTitle: category?.title ?? post.category,
              readingLabel: t('readingTime', { minutes: post.readingMinutes }),
            }
          }),
        })
        setSearchStatus('ready')
      } catch {
        if (controller.signal.aborted || searchLoadRef.current?.controller !== controller) {
          return
        }
        setSearchStatus('error')
      }
    })().finally(() => {
      if (searchLoadRef.current?.controller === controller) {
        searchLoadRef.current = null
      }
    })

    searchLoadRef.current = { controller, promise: pending, url: searchIndexUrl }
    return pending
  }, [categoryBySlug, searchCards, searchIndexUrl, t])

  useEffect(() => () => {
    searchLoadRef.current?.controller.abort()
    searchLoadRef.current = null
  }, [])

  // A bookmarked query/filter is explicit search intent, so restore it without
  // making every ordinary archive visit download the index.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('q') || params.has('cat') || params.has('tag')) {
      void loadSearchIndex()
    }
  }, [loadSearchIndex])

  const explorer = useExplorer<CardMeta>(
    cards,
    filters,
    popularTags,
    {
      key: (c) => c.post.slug,
      filterId: (c) => c.post.category,
      tags: (c) => c.post.tags,
      searchText: (c) =>
        [c.post.title, c.post.summary, c.categoryTitle, c.post.tags.join(' ')].join(' '),
    },
    {
      filterParam: 'cat',
      pageSize: CONTENT_PAGE_SIZE,
      staticPagination: {
        current: currentPage,
        total: totalPages,
        totalItems,
        basePath: '/blog',
      },
      searchItems: searchCards,
      searchFailed: searchStatus === 'error',
    },
  )

  const visibleStatsKey = explorer.pageItems
    .map((card) => postStatsId(card.post.category, card.post.slug))
    .join('\u0000')

  // Read only the currently rendered page and make the provider budget explicit.
  useEffect(() => {
    let cancelled = false
    async function fetchVisible() {
      const ids = visibleStatsKey ? visibleStatsKey.split('\u0000') : []
      const visible = await getPostStatsByIds(ids, CONTENT_PAGE_SIZE)
      if (cancelled) return
      const counts: Record<string, number> = {}
      for (const [id, stats] of visible) {
        if (stats.views >= viewThreshold) counts[id] = stats.views
      }
      setViewCounts(counts)
    }
    void fetchVisible()
    return () => {
      cancelled = true
    }
  }, [viewThreshold, visibleStatsKey])

  const labels: ExplorerLabels = {
    searchPlaceholder: t('controls.searchPlaceholder'),
    searchLabel: t('controls.searchLabel'),
    clearSearch: t('controls.clearSearch'),
    filtersLabel: t('controls.filtersLabel'),
    clear: t('controls.clear'),
    allFilters: t('controls.allCategories'),
    popularTags: t('controls.popularTags'),
    noResults: t('controls.noResults'),
    results: (count) => t('controls.results', { count }),
    pagination: {
      label: t('controls.pagination.label'),
      prev: t('controls.pagination.prev'),
      next: t('controls.pagination.next'),
      goToPage: t('controls.pagination.goToPage', { page: '{page}' }),
    },
  }

  return (
    <ExplorerShell<CardMeta>
      explorer={explorer}
      filters={filters}
      popularTags={popularTags}
      labels={labels}
      paletteId="blog-command-palette"
      trackingSurface="blog"
      searchStatus={searchStatus}
      searchUnavailableLabel={t('controls.searchUnavailable')}
      onSearchIntent={() => {
        void loadSearchIndex()
      }}
      renderItem={(c) => (
        <BlogPostCard
          key={c.post.slug}
          post={c.post}
          accent={c.accent}
          categoryTitle={c.categoryTitle}
          locale={locale}
          readingLabel={c.readingLabel}
          viewCount={viewCounts[postStatsId(c.post.category, c.post.slug)]}
          viewsLabel={t('engagement.views')}
          source="blog_explorer"
          contentLocale={locale}
        />
      )}
    />
  )
}
