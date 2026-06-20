'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getAllPostStats, postStatsId } from '@/lib/firebase/postStats'
import BlogPostCard from './BlogPostCard'
import {
  useExplorer,
  type ExplorerFilterOption,
} from '@/components/explorer/useExplorer'
import { ExplorerShell, type ExplorerLabels } from '@/components/explorer/ExplorerShell'
import type { BlogAccent, BlogPostMeta } from '@/lib/blog/types'

interface CardMeta {
  post: BlogPostMeta
  accent: BlogAccent
  categoryTitle: string
  readingLabel: string
}

interface CategoryOption {
  slug: string
  title: string
}

interface BlogExplorerProps {
  cards: CardMeta[]
  categories: CategoryOption[]
  popularTags: string[]
  locale: string
  pageSize?: number
  /** Threshold below which the view badge is hidden (default 100). */
  viewThreshold?: number
}

/**
 * Client-side blog index: instant search, category + tag filters, and numbered
 * pagination over a pre-rendered post list (all posts ship in the initial HTML;
 * JS only narrows what is shown). Thin wrapper over the shared
 * {@link useExplorer} engine + {@link ExplorerShell}.
 */
export default function BlogExplorer({
  cards,
  categories,
  popularTags,
  locale,
  pageSize = 9,
  viewThreshold = 100,
}: BlogExplorerProps) {
  const t = useTranslations('Pages.blog')
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})

  const filters: ExplorerFilterOption[] = useMemo(
    () => categories.map((c) => ({ id: c.slug, label: c.title })),
    [categories],
  )

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
    { filterParam: 'cat', pageSize },
  )

  // Fetch view counts once after mount in a single batched read, badge popular ones.
  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      const all = await getAllPostStats()
      if (cancelled) return
      const counts: Record<string, number> = {}
      for (const { post } of cards) {
        const views = all.get(postStatsId(post.category, post.slug))?.views ?? 0
        if (views >= viewThreshold) counts[post.slug] = views
      }
      setViewCounts(counts)
    }
    fetchAll()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewThreshold])

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
      renderItem={(c) => (
        <BlogPostCard
          key={c.post.slug}
          post={c.post}
          accent={c.accent}
          categoryTitle={c.categoryTitle}
          locale={locale}
          readingLabel={c.readingLabel}
          viewCount={viewCounts[c.post.slug]}
          viewsLabel={t('engagement.views')}
        />
      )}
    />
  )
}
