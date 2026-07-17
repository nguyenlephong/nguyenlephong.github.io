'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getPostStatsByIds, postStatsId } from '@/lib/firebase/postStats'
import NoteCard from './NoteCard'
import {
  useExplorer,
  type ExplorerFilterOption,
} from '@/components/explorer/useExplorer'
import { ExplorerShell, type ExplorerLabels } from '@/components/explorer/ExplorerShell'
import { CONTENT_PAGE_SIZE } from '@/lib/content/pagination'
import {
  fetchVersionedSearchIndex,
  isNotesSearchIndex,
  type NotesSearchIndex,
  type NoteSearchItem,
} from '@/lib/content/search-index'

interface NoteCardMeta {
  note: NoteSearchItem
  topicLabel: string
  topicColor: string
  readingLabel: string
}

interface TopicOption {
  id: string
  label: string
  color: string
}

interface NotesExplorerProps {
  cards: NoteCardMeta[]
  topics: TopicOption[]
  popularTags: string[]
  locale: string
  /** Authored locale that owns article and static archive URLs. */
  archiveLocale: 'en' | 'vi'
  currentPage: number
  totalPages: number
  totalItems: number
  searchIndexUrl: string
  fallbackTopicColor: string
  /** Threshold below which the view badge is hidden (default 100). */
  viewThreshold?: number
}

/**
 * Progressive notes explorer. The initial payload contains one static page;
 * full-corpus card metadata is fetched only after search/filter intent.
 */
export default function NotesExplorer({
  cards,
  topics,
  popularTags,
  locale,
  archiveLocale,
  currentPage,
  totalPages,
  totalItems,
  searchIndexUrl,
  fallbackTopicColor,
  viewThreshold = 100,
}: NotesExplorerProps) {
  const t = useTranslations('Pages.notes')
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})
  const [loadedSearch, setLoadedSearch] = useState<{
    cards: NoteCardMeta[]
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
    () => topics.map((tp) => ({ id: tp.id, label: tp.label, color: tp.color })),
    [topics],
  )

  const topicById = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic])),
    [topics],
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
        const payload = await fetchVersionedSearchIndex<NotesSearchIndex>(
          searchIndexUrl,
          isNotesSearchIndex,
          controller.signal,
        )
        if (!payload) {
          throw new Error('Invalid or stale notes search index')
        }
        if (controller.signal.aborted || searchLoadRef.current?.controller !== controller) {
          return
        }

        setLoadedSearch({
          url: searchIndexUrl,
          cards: payload.items.map((note) => {
            const topic = note.topic ? topicById.get(note.topic) : undefined
            return {
              note,
              topicLabel: topic?.label ?? note.topic ?? '',
              topicColor: topic?.color ?? fallbackTopicColor,
              readingLabel: t('readingTime', { minutes: note.readingMinutes }),
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
  }, [fallbackTopicColor, searchCards, searchIndexUrl, t, topicById])

  useEffect(() => () => {
    searchLoadRef.current?.controller.abort()
    searchLoadRef.current = null
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('q') || params.has('topic') || params.has('tag')) {
      void loadSearchIndex()
    }
  }, [loadSearchIndex])

  const explorer = useExplorer<NoteCardMeta>(
    cards,
    filters,
    popularTags,
    {
      key: (c) => c.note.slug,
      filterId: (c) => c.note.topic,
      tags: (c) => c.note.tags,
      searchText: (c) =>
        [c.note.title, c.note.summary, c.topicLabel, c.note.tags.join(' ')].join(' '),
    },
    {
      filterParam: 'topic',
      pageSize: CONTENT_PAGE_SIZE,
      staticPagination: {
        current: currentPage,
        total: totalPages,
        totalItems,
        basePath: '/notes',
        linkLocale: archiveLocale,
      },
      searchItems: searchCards,
      searchFailed: searchStatus === 'error',
    },
  )

  const visibleStatsKey = explorer.pageItems
    .map((card) => postStatsId('notes', card.note.slug))
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
    allFilters: t('controls.allTopics'),
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
    <ExplorerShell<NoteCardMeta>
      explorer={explorer}
      filters={filters}
      popularTags={popularTags}
      labels={labels}
      paletteId="notes-command-palette"
      className="notes-explorer"
      trackingSurface="notes"
      searchStatus={searchStatus}
      searchUnavailableLabel={t('controls.searchUnavailable')}
      onSearchIntent={() => {
        void loadSearchIndex()
      }}
      renderItem={(c) => (
        <NoteCard
          key={c.note.slug}
          note={c.note}
          topicLabel={c.topicLabel}
          topicColor={c.topicColor}
          locale={locale}
          readingLabel={c.readingLabel}
          viewCount={viewCounts[postStatsId('notes', c.note.slug)]}
          viewsLabel={t('engagement.views')}
          contentLocale={archiveLocale}
        />
      )}
    />
  )
}
