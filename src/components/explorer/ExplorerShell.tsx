'use client'

import type { CSSProperties, ReactNode } from 'react'
import { LuListFilter, LuSearch, LuX } from 'react-icons/lu'
import BlogPagination from '@/components/blog/BlogPagination'
import { track } from '@/lib/analytics'
import type { ExplorerApi, ExplorerFilterOption } from './useExplorer'

/** Pre-resolved control strings (shared keys, per-surface namespace). */
export interface ExplorerLabels {
  searchPlaceholder: string
  searchLabel: string
  clearSearch: string
  filtersLabel: string
  clear: string
  /** "All categories" / "All topics". */
  allFilters: string
  popularTags: string
  noResults: string
  results: (count: number) => string
  pagination: { label: string; prev: string; next: string; goToPage: string }
}

interface ExplorerShellProps<T> {
  explorer: ExplorerApi<T>
  filters: ExplorerFilterOption[]
  popularTags: string[]
  labels: ExplorerLabels
  paletteId: string
  /** Extra wrapper class, e.g. `notes-explorer`. */
  className?: string
  trackingSurface?: 'blog' | 'notes'
  renderItem: (item: T) => ReactNode
}

function accentStyle(color?: string): CSSProperties | undefined {
  return color ? ({ '--blog-accent': color } as CSSProperties) : undefined
}

/**
 * Presentational shell for the blog/notes index: command bar, filter palette,
 * no-JS fallback, post list, pagination, and empty state. State lives in
 * {@link useExplorer}; per-option `color` drives `--blog-accent`.
 */
export function ExplorerShell<T>({
  explorer,
  filters,
  popularTags,
  labels,
  paletteId,
  className,
  trackingSurface,
  renderItem,
}: ExplorerShellProps<T>) {
  const {
    view,
    pageItems,
    totalPages,
    safePage,
    count,
    paletteOpen,
    palettePlacement,
    commandRef,
    listTopRef,
    hasFilters,
    activeFilter,
    activeColor,
    onSearch,
    openPalette,
    togglePaletteVisibility,
    clearAll,
    clearTag,
    changePage,
    chooseAllFilters,
    chooseFilter,
    chooseTag,
  } = explorer

  const trackExplorer = (event: string, props?: Record<string, unknown>) => {
    if (!trackingSurface) return
    track(event, {
      surface: trackingSurface,
      result_count: count,
      active_filter: view.filter || null,
      active_tag: view.tag || null,
      page: safePage,
      ...props,
    })
  }

  return (
    <div
      className={['blog-explorer', className].filter(Boolean).join(' ')}
      style={accentStyle(activeColor)}
    >
      <div className="blog-explorer__controls">
        <div
          className={`blog-command is-${palettePlacement}${paletteOpen ? ' is-open' : ''}`}
          ref={commandRef}
        >
          <div className="blog-command__bar">
            <LuSearch className="blog-search__icon" aria-hidden="true" />
            <input
              type="search"
              className="blog-search__input"
              value={view.query}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={openPalette}
              onBlur={() => {
                const query = view.query.trim()
                if (!query) return
                trackExplorer('explorer_search', { query_length: query.length })
              }}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchLabel}
              aria-controls={paletteId}
              autoComplete="off"
            />
            <p className="blog-command__count" aria-live="polite">
              {labels.results(count)}
            </p>
            {view.query && (
              <button
                type="button"
                className="blog-search__clear"
                onClick={() => {
                  trackExplorer('explorer_clear', { clear_kind: 'search' })
                  onSearch('')
                }}
                aria-label={labels.clearSearch}
              >
                <LuX aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="blog-command__toggle"
              onClick={() => {
                trackExplorer('explorer_palette_toggle', { open_next: !paletteOpen })
                togglePaletteVisibility()
              }}
              aria-label={labels.filtersLabel}
              aria-controls={paletteId}
              aria-expanded={paletteOpen}
            >
              <LuListFilter aria-hidden="true" />
            </button>
          </div>

          {hasFilters && (
            <div className="blog-command__tokens">
              {activeFilter && (
                <button
                  type="button"
                  className="blog-command__token"
                  onClick={() => {
                    trackExplorer('explorer_filter_select', {
                      filter_id: 'all',
                      previous_filter: activeFilter.id,
                    })
                    chooseAllFilters()
                  }}
                  aria-label={`${labels.clear} ${activeFilter.label}`}
                >
                  <span>{activeFilter.label}</span>
                  <LuX aria-hidden="true" />
                </button>
              )}
              {view.tag && (
                <button
                  type="button"
                  className="blog-command__token"
                  onClick={() => {
                    trackExplorer('explorer_clear', { clear_kind: 'tag' })
                    clearTag()
                  }}
                  aria-label={`${labels.clear} ${view.tag}`}
                >
                  <span>{view.tag}</span>
                  <LuX aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="blog-command__reset"
                onClick={() => {
                  trackExplorer('explorer_clear', { clear_kind: 'all' })
                  clearAll()
                }}
              >
                {labels.clear}
              </button>
            </div>
          )}

          {paletteOpen && (
            <div
              id={paletteId}
              className="blog-command__palette"
              role="region"
              aria-label={labels.filtersLabel}
            >
              <section className="blog-command__section">
                <p className="blog-command__label">{labels.filtersLabel}</p>
                <div
                  className="blog-command__options"
                  role="group"
                  aria-label={labels.filtersLabel}
                >
                  <button
                    type="button"
                    className={`blog-command__option${!view.filter ? ' is-active' : ''}`}
                    onClick={() => {
                      trackExplorer('explorer_filter_select', { filter_id: 'all' })
                      chooseAllFilters()
                    }}
                    aria-pressed={!view.filter}
                  >
                    {labels.allFilters}
                  </button>
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`blog-command__option${view.filter === f.id ? ' is-active' : ''}`}
                      style={accentStyle(f.color)}
                      onClick={() => {
                        trackExplorer('explorer_filter_select', { filter_id: f.id })
                        chooseFilter(f.id)
                      }}
                      aria-pressed={view.filter === f.id}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </section>

              {popularTags.length > 0 && (
                <section className="blog-command__section">
                  <p className="blog-command__label">{labels.popularTags}</p>
                  <ul className="blog-command__tag-list">
                    {popularTags.map((tg) => (
                      <li key={tg}>
                        <button
                          type="button"
                          className={`blog-command__tag${view.tag === tg ? ' is-active' : ''}`}
                          onClick={() => {
                            trackExplorer('explorer_tag_select', { tag: tg })
                            chooseTag(tg)
                          }}
                          aria-pressed={view.tag === tg}
                        >
                          {tg}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>

        <noscript>
          <div className="blog-filters" role="group" aria-label={labels.filtersLabel}>
            <button type="button" className="blog-chip is-active">
              {labels.allFilters}
            </button>
            {filters.map((f) => (
              <button key={f.id} type="button" className="blog-chip" style={accentStyle(f.color)}>
                {f.label}
              </button>
            ))}
          </div>

          {popularTags.length > 0 && (
            <div className="blog-tags">
              <span className="blog-tags__label">{labels.popularTags}</span>
              <ul className="blog-tags__list">
                {popularTags.map((tg) => (
                  <li key={tg}>
                    <button type="button" className="blog-tag">
                      {tg}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </noscript>
      </div>

      <div ref={listTopRef} className="blog-explorer__scroll-anchor" />

      {pageItems.length > 0 ? (
        <>
          <div className="blog-post-list">{pageItems.map((item) => renderItem(item))}</div>

          <BlogPagination
            current={safePage}
            total={totalPages}
            onChange={(page) => {
              trackExplorer('explorer_page_change', { target_page: page })
              changePage(page)
            }}
            navLabel={labels.pagination.label}
            prevLabel={labels.pagination.prev}
            nextLabel={labels.pagination.next}
            goToPageLabel={labels.pagination.goToPage}
          />
        </>
      ) : (
        <div className="blog-explorer__empty">
          <p className="blog-explorer__empty-title">{labels.noResults}</p>
          <button
            type="button"
            className="blog-explorer__reset"
            onClick={() => {
              trackExplorer('explorer_clear', { clear_kind: 'empty_state' })
              clearAll()
            }}
          >
            {labels.clear}
          </button>
        </div>
      )}
    </div>
  )
}
