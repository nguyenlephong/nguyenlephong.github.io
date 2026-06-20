'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getAllPostStats, postStatsId } from '@/lib/firebase/postStats'
import NoteCard from './NoteCard'
import {
  useExplorer,
  type ExplorerFilterOption,
} from '@/components/explorer/useExplorer'
import { ExplorerShell, type ExplorerLabels } from '@/components/explorer/ExplorerShell'
import type { NoteMeta } from '@/lib/notes/types'

interface NoteCardMeta {
  note: NoteMeta
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
  pageSize?: number
  /** Threshold below which the view badge is hidden (default 100). */
  viewThreshold?: number
}

/**
 * Client-side notes index: instant search, topic + tag filters, and numbered
 * pagination over a pre-rendered note list. Thin wrapper over the shared
 * {@link useExplorer} engine + {@link ExplorerShell}; topic colour drives the
 * `--blog-accent` CSS variable.
 */
export default function NotesExplorer({
  cards,
  topics,
  popularTags,
  locale,
  pageSize = 9,
  viewThreshold = 100,
}: NotesExplorerProps) {
  const t = useTranslations('Pages.notes')
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})

  const filters: ExplorerFilterOption[] = useMemo(
    () => topics.map((tp) => ({ id: tp.id, label: tp.label, color: tp.color })),
    [topics],
  )

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
    { filterParam: 'topic', pageSize },
  )

  // One batched read for all cards instead of a per-card request waterfall.
  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      const all = await getAllPostStats()
      if (cancelled) return
      const counts: Record<string, number> = {}
      for (const { note } of cards) {
        const views = all.get(postStatsId('notes', note.slug))?.views ?? 0
        if (views >= viewThreshold) counts[note.slug] = views
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
      renderItem={(c) => (
        <NoteCard
          key={c.note.slug}
          note={c.note}
          topicLabel={c.topicLabel}
          topicColor={c.topicColor}
          locale={locale}
          readingLabel={c.readingLabel}
          viewCount={viewCounts[c.note.slug]}
          viewsLabel={t('engagement.views')}
        />
      )}
    />
  )
}
