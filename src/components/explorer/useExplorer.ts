'use client'

import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useDebouncedValue } from '@/components/blog/useDebouncedValue'
import { normalizeSearch, readUrlParam } from '@/lib/content/search'

/** A selectable filter (blog category / notes topic). `color` drives `--blog-accent`. */
export interface ExplorerFilterOption {
  id: string
  label: string
  color?: string
}

/** How to read filter/search/tag data off an arbitrary card item. */
export interface ExplorerAccessors<T> {
  /** Stable key (slug). */
  key: (item: T) => string
  /** Owning filter id (category slug / topic id), or null/undefined. */
  filterId: (item: T) => string | null | undefined
  /** Tags used by the tag filter. */
  tags: (item: T) => string[]
  /** Raw text joined for search; normalised internally. */
  searchText: (item: T) => string
}

export interface ExplorerView {
  query: string
  filter: string | null
  tag: string | null
  page: number
}

export interface UseExplorerOptions {
  /** URL query key for the active filter (`cat` | `topic`). */
  filterParam: string
  pageSize: number
}

export interface ExplorerApi<T> {
  view: ExplorerView
  filtered: T[]
  pageItems: T[]
  totalPages: number
  safePage: number
  count: number
  paletteOpen: boolean
  palettePlacement: 'dropdown' | 'dropup'
  commandRef: RefObject<HTMLDivElement | null>
  listTopRef: RefObject<HTMLDivElement | null>
  hasFilters: boolean
  activeFilter: ExplorerFilterOption | null
  activeColor: string | undefined
  onSearch: (value: string) => void
  openPalette: () => void
  togglePaletteVisibility: () => void
  clearAll: () => void
  clearTag: () => void
  changePage: (next: number) => void
  chooseAllFilters: () => void
  chooseFilter: (id: string) => void
  chooseTag: (value: string) => void
}

const INITIAL_VIEW: ExplorerView = { query: '', filter: null, tag: null, page: 1 }

/**
 * Headless engine for the blog/notes index: instant search, single-filter +
 * tag narrowing, numbered pagination, and URL mirroring (?q=&<filter>=&tag=&page=).
 * Presentation lives in {@link ExplorerShell}; both surfaces share this so the
 * filtering/URL/palette logic exists in exactly one place.
 */
export function useExplorer<T>(
  items: T[],
  filters: ExplorerFilterOption[],
  popularTags: string[],
  accessors: ExplorerAccessors<T>,
  { filterParam, pageSize }: UseExplorerOptions,
): ExplorerApi<T> {
  const [view, setView] = useState<ExplorerView>(INITIAL_VIEW)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [palettePlacement, setPalettePlacement] = useState<'dropdown' | 'dropup'>(
    'dropdown',
  )

  const debouncedQuery = useDebouncedValue(view.query, 200)
  const commandRef = useRef<HTMLDivElement>(null)
  const listTopRef = useRef<HTMLDivElement>(null)
  const hydratedFromUrl = useRef(false)

  // Precompute a normalised search blob per item once.
  const searchable = useMemo(
    () => items.map((item) => ({ item, blob: normalizeSearch(accessors.searchText(item)) })),
    // accessors are pure/static; recompute only when items change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  )

  // Restore state from the URL on mount so deep links / bookmarks work.
  useEffect(() => {
    const q = readUrlParam('q') ?? ''
    const f = readUrlParam(filterParam)
    const tg = readUrlParam('tag')
    const pg = Number(readUrlParam('page'))
    const next: ExplorerView = {
      query: q,
      filter: f && filters.some((x) => x.id === f) ? f : null,
      tag: tg && popularTags.includes(tg) ? tg : null,
      page: Number.isInteger(pg) && pg > 1 ? pg : 1,
    }
    hydratedFromUrl.current = true
    if (next.query || next.filter || next.tag || next.page > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const queryTerms = useMemo(
    () => normalizeSearch(debouncedQuery).split(/\s+/).filter(Boolean),
    [debouncedQuery],
  )

  const filtered = useMemo(
    () =>
      searchable
        .filter(({ item }) => !view.filter || accessors.filterId(item) === view.filter)
        .filter(({ item }) => !view.tag || accessors.tags(item).includes(view.tag as string))
        .filter(({ blob }) => queryTerms.every((term) => blob.includes(term)))
        .map(({ item }) => item),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchable, view.filter, view.tag, queryTerms],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(view.page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // Keep the URL in sync with the active view (skip first render so we don't
  // clobber an incoming deep link before it's been read).
  useEffect(() => {
    if (!hydratedFromUrl.current) return
    const params = new URLSearchParams()
    if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim())
    if (view.filter) params.set(filterParam, view.filter)
    if (view.tag) params.set('tag', view.tag)
    if (safePage > 1) params.set('page', String(safePage))
    const qs = params.toString()
    window.history.replaceState(
      null,
      '',
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
    )
  }, [debouncedQuery, view.filter, view.tag, safePage, filterParam])

  // Close the palette on outside pointer / Escape.
  useEffect(() => {
    if (!paletteOpen) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && commandRef.current?.contains(target)) return
      setPaletteOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPaletteOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [paletteOpen])

  const scrollToTop = () =>
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const updatePalettePlacement = () => {
    const rect = commandRef.current?.getBoundingClientRect()
    if (!rect) return
    const spaceBelow = window.innerHeight - rect.bottom
    setPalettePlacement(spaceBelow < 300 && rect.top > spaceBelow ? 'dropup' : 'dropdown')
  }

  const onSearch = (value: string) => setView((v) => ({ ...v, query: value, page: 1 }))
  const openPalette = () => {
    updatePalettePlacement()
    setPaletteOpen(true)
  }
  const togglePaletteVisibility = () => {
    if (!paletteOpen) updatePalettePlacement()
    setPaletteOpen((open) => !open)
  }
  const toggleFilter = (id: string) =>
    setView((v) => ({ ...v, filter: v.filter === id ? null : id, page: 1 }))
  const toggleTag = (value: string) =>
    setView((v) => ({ ...v, tag: v.tag === value ? null : value, page: 1 }))
  const clearTag = () => setView((v) => ({ ...v, tag: null, page: 1 }))
  const clearAll = () => setView(INITIAL_VIEW)
  const changePage = (next: number) => {
    setView((v) => ({ ...v, page: next }))
    scrollToTop()
  }
  const chooseAllFilters = () => {
    setView((v) => ({ ...v, filter: null, page: 1 }))
    setPaletteOpen(false)
  }
  const chooseFilter = (id: string) => {
    toggleFilter(id)
    setPaletteOpen(false)
  }
  const chooseTag = (value: string) => {
    toggleTag(value)
    setPaletteOpen(false)
  }

  const hasFilters = Boolean(view.query || view.filter || view.tag)
  const activeFilter = view.filter
    ? (filters.find((f) => f.id === view.filter) ?? null)
    : null

  return {
    view,
    filtered,
    pageItems,
    totalPages,
    safePage,
    count: filtered.length,
    paletteOpen,
    palettePlacement,
    commandRef,
    listTopRef,
    hasFilters,
    activeFilter,
    activeColor: activeFilter?.color,
    onSearch,
    openPalette,
    togglePaletteVisibility,
    clearAll,
    clearTag,
    changePage,
    chooseAllFilters,
    chooseFilter,
    chooseTag,
  }
}
