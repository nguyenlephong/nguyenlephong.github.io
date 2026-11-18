'use client'

import { memo, useDeferredValue, useEffect, useMemo, useRef, type Dispatch } from 'react'
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu'
import type { AdminCategoryRow, AdminPostRow } from '@/lib/admin/insights.mjs'
import {
  PAGE_SIZES,
  filterAndSort,
  pageWindow,
  paginate,
  type TableAction,
  type TableSortKey,
  type TableState,
} from '@/lib/admin/post-table.mjs'
import { PostMeta, PostTitle } from './AdminSections'
import { categoryStyle } from './admin-format'
import { useAdminText } from './admin-i18n'
import { useCategoryFocus } from './category-focus'

const COLUMNS: Array<{ key: TableSortKey; numeric?: boolean }> = [
  { key: 'title' },
  { key: 'category' },
  { key: 'date' },
  { key: 'views', numeric: true },
  { key: 'shares', numeric: true },
  { key: 'reactionTotal', numeric: true },
]
const TEXT_SORTS = new Set<TableSortKey>(['title', 'category'])

interface AdminAllPostsProps {
  posts: AdminPostRow[]
  categories: AdminCategoryRow[]
  categoryTitles: ReadonlyMap<string, string>
  localeById: ReadonlyMap<string, string>
  state: TableState
  dispatch: Dispatch<TableAction>
  /** Row picked from the chart: outlined and scrolled to once per pick. */
  picked: { id: string; at: number } | null
}

const Row = memo(function Row({ post, highlighted, categoryTitles, localeById }: {
  post: AdminPostRow
  highlighted: boolean
  categoryTitles: ReadonlyMap<string, string>
  localeById: ReadonlyMap<string, string>
}) {
  const { t, fmt } = useAdminText()
  return (
    <tr data-cat={post.category} data-highlight={highlighted || undefined} id={highlighted ? 'admin-row-picked' : undefined} style={categoryStyle(post.category)}>
      <td className="admin-table__post">
        <PostTitle post={post} localeById={localeById} />
        <PostMeta post={post} categoryTitles={categoryTitles} />
      </td>
      <td className="admin-col--category">
        <span className="admin-cat">{categoryTitles.get(post.category) ?? post.category}</span>
      </td>
      <td className="admin-col--date admin-mono">{post.date ? fmt.date(post.date) : t.table.noDate}</td>
      <td className="admin-num admin-col--views">{fmt.number(post.views)}</td>
      <td className="admin-num admin-col--shares">{fmt.number(post.shares)}</td>
      <td className="admin-num admin-col--reactionTotal">{fmt.number(post.reactionTotal)}</td>
    </tr>
  )
})

export default function AdminAllPosts({ posts, categories, categoryTitles, localeById, state, dispatch, picked }: AdminAllPostsProps) {
  const highlightId = picked?.id ?? null
  const focus = useCategoryFocus()
  const { t, fmt } = useAdminText()
  // Inputs stay instant; the table follows one beat behind on slow machines.
  const view = useDeferredValue(state)
  const sorted = useMemo(() => filterAndSort(posts, view, categoryTitles), [posts, view, categoryTitles])
  const page = paginate(sorted, view.page, view.size)
  const unlisted = useMemo(() => posts.filter((post) => !post.listed).length, [posts])
  const neverCount = useMemo(() => posts.filter((post) => post.listed && post.views === 0).length, [posts])
  const filtered = state.query !== '' || state.category !== 'all' || state.neverViewed
  const pickedVisible = picked !== null && page.rows.some((post) => post.id === picked.id)
  const scrolledFor = useRef(0)
  useEffect(() => {
    if (!picked || !pickedVisible || scrolledFor.current === picked.at) return
    scrolledFor.current = picked.at
    document.getElementById('admin-row-picked')?.scrollIntoView({ block: 'center' })
  }, [picked, pickedVisible])
  const metric: TableSortKey = state.sort === 'shares' || state.sort === 'reactionTotal' ? state.sort : 'views'

  const header = (key: TableSortKey, label: string, numeric?: boolean) => {
    const sorted = state.sort === key
    return (
      <th
        key={key}
        scope="col"
        className={`${numeric ? 'admin-num ' : ''}admin-col--${key}`}
        aria-sort={sorted ? (state.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <button type="button" className="admin-th" data-active={sorted || undefined} onClick={() => dispatch({ type: 'sort', value: key })}>
          {label}
          <span className="admin-th__arrow" data-dir={sorted ? state.direction : undefined} aria-hidden="true" />
        </button>
      </th>
    )
  }

  return (
    <section id="admin-all" className="admin-section admin-section--all" aria-labelledby="admin-all-title">
      <header className="admin-section__head">
        <h2 id="admin-all-title" className="admin-title">{t.table.title}</h2>
        <p className="admin-section__note">{t.table.note(fmt.number(posts.length - unlisted), unlisted)}</p>
      </header>

      <div className="admin-filters">
        <div className="admin-filters__row" role="search">
          <label className="admin-search">
            <LuSearch aria-hidden="true" className="admin-search__icon" />
            <span className="admin-visually-hidden">{t.table.searchLabel}</span>
            <input
              id="admin-search"
              className="admin-search__input"
              type="search"
              value={state.query}
              placeholder={t.table.searchPlaceholder}
              onChange={(event) => dispatch({ type: 'query', value: event.target.value })}
            />
          </label>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={state.neverViewed}
              onChange={(event) => dispatch({ type: 'neverViewed', value: event.target.checked })}
            />
            <span>
              {t.table.noReads} <span className="admin-mono">{fmt.number(neverCount)}</span>
            </span>
          </label>
          <label className="admin-sort">
            <span className="admin-sort__label">{t.table.sort}</span>
            <select
              className="admin-sort__select"
              value={`${state.sort}:${state.direction}`}
              onChange={(event) => {
                const [key, direction] = event.target.value.split(':') as [TableSortKey, 'asc' | 'desc']
                dispatch({ type: 'replace', value: { ...state, sort: key, direction, page: 1 } })
              }}
            >
              {COLUMNS.flatMap(({ key }) =>
                (['desc', 'asc'] as const).map((direction) => (
                  <option key={`${key}:${direction}`} value={`${key}:${direction}`}>
                    {t.table.sortNames[key]},{' '}
                    {TEXT_SORTS.has(key)
                      ? direction === 'desc' ? t.table.textDesc : t.table.textAsc
                      : direction === 'desc' ? t.table.numberDesc : t.table.numberAsc}
                  </option>
                )),
              )}
            </select>
          </label>
        </div>
        <div className="admin-chips" role="group" aria-label={t.table.category}>
          <button type="button" className="admin-chip" aria-pressed={state.category === 'all'} onClick={() => dispatch({ type: 'category', value: 'all' })}>
            {t.table.all} <span className="admin-mono">{fmt.number(posts.length)}</span>
          </button>
          {categories.map((entry) => (
            <button
              key={entry.category}
              type="button"
              className="admin-chip"
              style={categoryStyle(entry.category)}
              aria-pressed={state.category === entry.category}
              onPointerEnter={() => focus.set(entry.category)}
              onPointerLeave={() => focus.set(null)}
              onClick={() => dispatch({ type: 'category', value: entry.category })}
            >
              <span className="admin-chip__dot" aria-hidden="true" />
              {entry.title} <span className="admin-mono">{entry.posts}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="admin-table__status" aria-live="polite">
        {page.total === 0
          ? t.table.noMatch
          : t.table.status(fmt.number(page.start + 1), fmt.number(page.start + page.rows.length), fmt.number(page.total), filtered)}
      </p>

      {page.total === 0 ? (
        <p className="admin-empty">
          {t.table.nothing}{' '}
          <button
            type="button"
            className="admin-link-button"
            onClick={() => dispatch({ type: 'reset' })}
          >
            {t.table.clear}
          </button>
        </p>
      ) : (
        <div className="admin-glass">
          <table className="admin-table" data-metric={metric}>
            <caption className="admin-visually-hidden">
              {t.table.caption(t.table.sortNames[state.sort].toLocaleLowerCase(), fmt.number(page.page), fmt.number(page.pageCount))}
            </caption>
            <thead>
              <tr>{COLUMNS.map(({ key, numeric }) => header(key, t.table.columns[key], numeric))}</tr>
            </thead>
            <tbody>
              {page.rows.map((post) => (
                <Row key={post.id} post={post} highlighted={post.id === highlightId} categoryTitles={categoryTitles} localeById={localeById} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {page.total > 0 ? (
        <nav className="admin-pager" aria-label={t.table.pages}>
          <button
            type="button"
            className="admin-pager__step"
            disabled={page.page <= 1}
            onClick={() => dispatch({ type: 'page', value: page.page - 1 })}
          >
            <LuChevronLeft aria-hidden="true" />
            <span>{t.table.previous}</span>
          </button>
          <ol className="admin-pager__pages">
            {pageWindow(page.page, page.pageCount).map((number, index) =>
              number === null ? (
                <li key={`gap-${index}`} className="admin-pager__gap" aria-hidden="true">
                  …
                </li>
              ) : (
                <li key={number}>
                  <button
                    type="button"
                    className="admin-pager__page"
                    aria-current={number === page.page ? 'page' : undefined}
                    aria-label={t.table.page(fmt.number(number))}
                    onClick={() => dispatch({ type: 'page', value: number })}
                  >
                    {number}
                  </button>
                </li>
              ),
            )}
          </ol>
          <button
            type="button"
            className="admin-pager__step"
            disabled={page.page >= page.pageCount}
            onClick={() => dispatch({ type: 'page', value: page.page + 1 })}
          >
            <span>{t.table.next}</span>
            <LuChevronRight aria-hidden="true" />
          </button>
          <label className="admin-pager__size">
            <span>{t.table.rows}</span>
            <select value={state.size} onChange={(event) => dispatch({ type: 'size', value: Number(event.target.value) })}>
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </nav>
      ) : null}
    </section>
  )
}
