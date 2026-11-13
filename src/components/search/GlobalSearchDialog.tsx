'use client'

import {
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { LuSearch, LuX } from 'react-icons/lu'
import { useDebouncedValue } from '@/components/blog/useDebouncedValue'
import IntentPrefetchLink from '@/components/navigation/IntentPrefetchLink'
import { track } from '@/lib/analytics'
import {
  indexSearchFields,
  parseSearchQuery,
  topMatches,
  type SearchFieldIndex,
} from '@/lib/content/search'
import {
  fetchVersionedSearchIndex,
  isBlogSearchIndex,
  isNotesSearchIndex,
  type BlogSearchIndex,
  type GlobalSearchConfig,
  type NotesSearchIndex,
} from '@/lib/content/search-index'
import './global-search.css'

type Surface = 'blog' | 'notes'

interface Entry {
  surface: Surface
  href: string
  title: string
  section: string
  index: SearchFieldIndex
}

const GROUP_LIMIT = 5
// Report a query once the reader pauses, not on every keystroke.
const QUERY_EVENT_DELAY = 800

async function loadEntries(
  config: GlobalSearchConfig,
  signal: AbortSignal,
): Promise<Entry[] | null> {
  const [blog, notes] = await Promise.all([
    fetchVersionedSearchIndex<BlogSearchIndex>(config.blogIndexUrl, isBlogSearchIndex, signal),
    fetchVersionedSearchIndex<NotesSearchIndex>(config.notesIndexUrl, isNotesSearchIndex, signal),
  ])
  if (!blog && !notes) return null
  const blogEntries = (blog?.items ?? []).map((post): Entry => {
    const section = config.blogSections[post.category] ?? post.category
    return {
      surface: 'blog',
      href: `/blog/${post.category}/${post.slug}`,
      title: post.title,
      section,
      index: indexSearchFields({
        title: post.title,
        meta: [section, ...post.tags].join(' '),
        summary: post.summary,
      }),
    }
  })
  const noteEntries = (notes?.items ?? []).map((note): Entry => {
    const section = (note.topic && config.notesSections[note.topic]) || ''
    return {
      surface: 'notes',
      href: `/notes/${note.slug}`,
      title: note.title,
      section,
      index: indexSearchFields({
        title: note.title,
        meta: [section, ...note.tags].join(' '),
        summary: note.cardSummary,
      }),
    }
  })
  return [...blogEntries, ...noteEntries]
}

interface GlobalSearchDialogProps {
  open: boolean
  onClose: () => void
  config: GlobalSearchConfig
}

/**
 * Modal combobox over the blog and notes indexes. Native `<dialog>` gives the
 * modal semantics, the focus trap and Escape; results are one grouped listbox.
 */
export default function GlobalSearchDialog({ open, onClose, config }: GlobalSearchDialogProps) {
  const t = useTranslations('Nav.search')
  const baseId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState({ query: '', index: 0 })
  const settledQuery = useDebouncedValue(query, QUERY_EVENT_DELAY)
  const reportedRef = useRef('')

  useEffect(() => {
    const controller = new AbortController()
    loadEntries(config, controller.signal)
      .catch(() => null)
      .then((loaded) => {
        if (controller.signal.aborted) return
        if (loaded) setEntries(loaded)
        else setFailed(true)
      })
    return () => controller.abort()
  }, [config])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      inputRef.current?.select()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const groups = useMemo(() => {
    const terms = parseSearchQuery(query, config.locale)
    const pick = (surface: Surface) =>
      terms.length && entries
        ? topMatches(entries.filter((entry) => entry.surface === surface), terms, GROUP_LIMIT)
        : []
    const blog = pick('blog')
    return [
      { surface: 'blog' as const, items: blog, offset: 0 },
      { surface: 'notes' as const, items: pick('notes'), offset: blog.length },
    ]
  }, [config.locale, entries, query])

  const options = groups.flatMap((group) => group.items)
  const activeIndex = active.query === query ? Math.min(active.index, options.length - 1) : 0
  const optionId = (index: number) => `${baseId}-option-${index}`
  const listId = `${baseId}-list`
  const hasResults = options.length > 0
  const trimmed = query.trim()

  useEffect(() => {
    if (!hasResults) return
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' })
    // optionId only depends on the stable baseId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, hasResults])

  useEffect(() => {
    const settled = settledQuery.trim()
    if (!entries || !settled || settled !== trimmed || reportedRef.current === settled) return
    reportedRef.current = settled
    track('global_search_query', { query_length: settled.length, result_count: options.length })
    if (!options.length) track('global_search_no_results', { query_length: settled.length })
  }, [entries, settledQuery, trimmed, options.length])

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!hasResults) return
    const last = options.length - 1
    const move = (index: number) => {
      event.preventDefault()
      setActive({ query, index })
    }
    if (event.key === 'ArrowDown') move(activeIndex >= last ? 0 : activeIndex + 1)
    else if (event.key === 'ArrowUp') move(activeIndex <= 0 ? last : activeIndex - 1)
    else if (event.key === 'Home' && event.ctrlKey) move(0)
    else if (event.key === 'End' && event.ctrlKey) move(last)
    else if (event.key === 'Enter') {
      event.preventDefault()
      document.getElementById(optionId(activeIndex))?.click()
    }
  }

  let status: string
  if (failed) status = t('error')
  else if (!entries) status = t('loading')
  else if (!trimmed) status = t('hint')
  else if (!hasResults) status = t('empty', { query: trimmed })
  else status = t('results', { count: options.length })

  return (
    <dialog
      ref={dialogRef}
      className="gsearch"
      aria-label={t('dialogLabel')}
      aria-modal="true"
      onClose={onClose}
      onKeyDown={(event) => {
        // The dialog's own cancel closes it; the open mobile menu beneath must not see this Escape.
        if (event.key === 'Escape') event.stopPropagation()
      }}
      onMouseDown={(event) => {
        // A press on the backdrop lands on the dialog element itself.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="gsearch__bar">
        <LuSearch className="gsearch__icon" aria-hidden="true" />
        <input
          ref={inputRef}
          className="gsearch__input"
          type="text"
          role="combobox"
          aria-label={t('label')}
          aria-expanded={hasResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={hasResults ? optionId(activeIndex) : undefined}
          placeholder={t('placeholder')}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="gsearch__close" onClick={onClose} aria-label={t('close')}>
          <LuX aria-hidden="true" />
        </button>
      </div>
      <p className="gsearch__status" role="status">
        {status}
      </p>
      <div id={listId} role="listbox" aria-label={t('dialogLabel')} className="gsearch__list">
        {groups.map(({ surface, items, offset }) =>
          items.length === 0 ? null : (
            <ul key={surface} role="group" aria-labelledby={`${baseId}-${surface}`} className="gsearch__group">
              <li role="presentation" id={`${baseId}-${surface}`} className="gsearch__group-label">
                {t(surface)}
              </li>
              {items.map((entry, i) => {
                const index = offset + i
                return (
                  <li key={entry.href} role="none">
                    <IntentPrefetchLink
                      id={optionId(index)}
                      href={entry.href}
                      locale={config.locale}
                      role="option"
                      aria-selected={index === activeIndex}
                      tabIndex={-1}
                      className="gsearch__option"
                      onMouseMove={() => {
                        if (index !== activeIndex) setActive({ query, index })
                      }}
                      onClick={() => {
                        track('global_search_result_click', {
                          surface: entry.surface,
                          position: index + 1,
                          query_length: trimmed.length,
                        })
                        onClose()
                      }}
                    >
                      <span className="gsearch__title">{entry.title}</span>
                      {entry.section && <span className="gsearch__section">{entry.section}</span>}
                    </IntentPrefetchLink>
                  </li>
                )
              })}
            </ul>
          ),
        )}
      </div>
    </dialog>
  )
}
