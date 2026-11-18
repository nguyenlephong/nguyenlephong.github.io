'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type Dispatch } from 'react'
import { LuRefreshCw, LuSearch } from 'react-icons/lu'
import { buildContentCatalog, buildFirestoreInsights, type AdminInsights } from '@/lib/admin/insights.mjs'
import { fetchAllPostStats, type PostStatsLoad } from '@/lib/admin/post-stats-repository'
import {
  filterAndSort,
  pageOfPost,
  parseTableQuery,
  serializeTableQuery,
  tableReducer,
  type TableAction,
  type TableState,
} from '@/lib/admin/post-table.mjs'
import AdminAllPosts from './AdminAllPosts'
import AdminReadsChart from './AdminReadsChart'
import { AdminLeaderboard, AdminNeedsLove, AdminReactionList } from './AdminSections'
import AdminTopology, { type TopologyBranch } from './AdminTopology'
import { Rich, slot } from './AdminRich'
import { useAdminText } from './admin-i18n'
import { useCountUp, useReveal } from './admin-motion'
import type { AdminCatalogProps } from './catalog-props'
import { CategoryFocusContext } from './category-focus'

interface AdminDashboardProps {
  catalog: AdminCatalogProps
  /** Catalog-only branches, drawn idle until the counters arrive. */
  idleBranches: TopologyBranch[]
}

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; reason: Extract<PostStatsLoad, { status: 'unavailable' }>['reason'] }
  | { phase: 'ready'; docs: Array<{ id: string; data: unknown }>; loadedAt: Date; truncated: boolean }

export default function AdminDashboard({ catalog, idleBranches }: AdminDashboardProps) {
  const { t } = useAdminText()
  const [load, setLoad] = useState<LoadState>({ phase: 'loading' })
  const [refreshing, setRefreshing] = useState(false)
  const [refreshFailed, setRefreshFailed] = useState(false)
  // Table filter, sort and page live in the URL query so a view can be reloaded or shared.
  const [table, dispatch] = useReducer(tableReducer, undefined, () => parseTableQuery(window.location.search))
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const query = serializeTableQuery(table)
    if (query !== window.location.search) window.history.replaceState(window.history.state, '', `${window.location.pathname}${query}${window.location.hash}`)
  }, [table])

  const localeById = useMemo(
    () =>
      new Map(
        [...catalog.blog.posts, ...catalog.notes.posts].flatMap((post) =>
          post.locale ? [[`${post.category}__${post.slug}`, post.locale] as const] : [],
        ),
      ),
    [catalog],
  )

  // Fetching keeps the raw counters; the join with the (localised) catalog is
  // derived, so switching language never refetches.
  const refresh = useCallback(async () => {
    setRefreshing(true)
    const result = await fetchAllPostStats()
    setRefreshFailed(result.status !== 'ok')
    setLoad((previous) => {
      if (result.status === 'ok') return { phase: 'ready', docs: result.docs, loadedAt: new Date(), truncated: result.truncated }
      // A failed refresh keeps the last good numbers on screen.
      return previous.phase === 'ready' ? previous : { phase: 'error', reason: result.reason }
    })
    setRefreshing(false)
  }, [])

  useEffect(() => {
    queueMicrotask(() => void refresh())
  }, [refresh])

  const loaded = load.phase === 'ready' ? load : null
  const insights = useMemo(() => {
    if (!loaded) return null
    // Posts dated after the load day are scheduled, not published yet.
    const today = loaded.loadedAt.toISOString().slice(0, 10)
    return buildFirestoreInsights(loaded.docs, buildContentCatalog(catalog.blog, catalog.notes, today))
  }, [loaded, catalog])
  const ready = loaded && insights ? { ...loaded, insights } : null
  useReveal(rootRef, ready !== null)

  const focus = useMemo(
    () => ({
      set: (category: string | null) => {
        const root = rootRef.current
        if (!root) return
        if (category) root.dataset['focus'] = category
        else delete root.dataset['focus']
      },
    }),
    [],
  )

  const pickCategory = (category: string) => {
    dispatch({ type: 'category', value: category })
    document.getElementById('admin-all')?.scrollIntoView({ block: 'start' })
  }
  const findPost = () => {
    document.getElementById('admin-all')?.scrollIntoView({ block: 'start' })
    document.getElementById('admin-search')?.focus({ preventScroll: true })
  }

  // Live branches keep the locked order (posts, largest first), so unlocking
  // lights the same figure up instead of reshuffling it; reads ride the wires.
  const liveViews = new Map(ready?.insights.categories.map((category) => [category.category, category.views]))
  const branches: TopologyBranch[] = ready
    ? idleBranches.map((branch) => ({ ...branch, views: liveViews.get(branch.category) ?? 0 }))
    : idleBranches

  return (
    <CategoryFocusContext.Provider value={focus}>
      <main
        ref={rootRef}
        className={refreshing && ready ? 'admin-report is-stale' : 'admin-report'}
        data-filter={table.category === 'all' ? undefined : table.category}
        aria-busy={refreshing}
      >
        <section className="admin-hero" aria-labelledby="admin-title">
          <div className="admin-hero__meta">
            {ready ? (
              <HeroText
                insights={ready.insights}
                loadedAt={ready.loadedAt}
                refreshing={refreshing}
                refreshFailed={refreshFailed}
                truncated={ready.truncated}
              />
            ) : load.phase === 'error' ? (
              <>
                <h1 id="admin-title" className="admin-display admin-display--title">
                  {t.hero.errorTitle}
                </h1>
                <p className="admin-claim">{load.reason === 'not_configured' ? t.hero.errorNotConfigured : t.hero.errorRequest}</p>
              </>
            ) : (
              <>
                <h1 id="admin-title" className="admin-display admin-figure admin-skeleton">
                  <span className="admin-visually-hidden">{t.hero.loadingLabel}</span>
                  <span aria-hidden="true">000,000</span>
                </h1>
                <p className="admin-claim">{t.hero.loadingClaim}</p>
                <p className="admin-bio" role="status">
                  {t.hero.loadingStatus}
                </p>
              </>
            )}
            <div className="admin-actions">
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => void refresh()} disabled={refreshing}>
                <LuRefreshCw aria-hidden="true" className={refreshing ? 'is-spinning' : undefined} />
                {load.phase === 'error' ? t.hero.tryAgain : load.phase === 'loading' ? t.hero.loading : refreshing ? t.hero.refreshing : t.hero.refresh}
              </button>
              {ready ? (
                <button type="button" className="admin-btn admin-btn--secondary" onClick={findPost}>
                  <LuSearch aria-hidden="true" />
                  {t.hero.findPost}
                </button>
              ) : null}
            </div>
          </div>
          <AdminTopology branches={branches} totalViews={ready?.insights.totals.views} onPick={pickCategory} />
        </section>

        {ready ? (
          <Report
            insights={ready.insights}
            asOf={ready.loadedAt.getTime()}
            localeById={localeById}
            table={table}
            dispatch={dispatch}
          />
        ) : null}
      </main>
    </CategoryFocusContext.Provider>
  )
}

function HeroText({ insights, loadedAt, refreshing, refreshFailed, truncated }: {
  insights: AdminInsights
  loadedAt: Date
  refreshing: boolean
  refreshFailed: boolean
  truncated: boolean
}) {
  const { t, fmt } = useAdminText()
  const { totals } = insights
  const shown = useCountUp(totals.views)
  const published = insights.posts.filter((post) => post.listed).length
  const never = insights.neverViewed.length
  const lead = insights.categories[0]

  return (
    <>
      {never > 0 ? (
        <a className="admin-pill admin-pill--link" href="#admin-love">
          <span className="admin-pill__dot admin-pill__dot--attention" aria-hidden="true" />
          <span>
            {t.hero.unreadPill(fmt.number(never))} <b>{t.hero.unreadLink}</b>
          </span>
        </a>
      ) : (
        <p className="admin-pill">
          <span className="admin-pill__dot" aria-hidden="true" />
          <span>{t.hero.allRead}</span>
        </p>
      )}
      <h1 id="admin-title" className="admin-display admin-figure">
        <span className="admin-visually-hidden">{t.hero.readsLabel(fmt.number(totals.views))}</span>
        <span aria-hidden="true">{fmt.number(shown)}</span>
      </h1>
      <p className="admin-claim">{t.hero.claim(fmt.number(published))}</p>
      <ul className="admin-facts">
        <li>
          <Rich text={t.hero.shares(slot(0), slot(1))} values={[<b key="s">{fmt.number(totals.shares)}</b>, <b key="r">{fmt.number(totals.reactions)}</b>]} />
        </li>
        {lead && totals.views > 0 ? (
          <li>
            <Rich text={t.hero.lead(slot(0), slot(1))} values={[<b key="c">{lead.title}</b>, <b key="p">{fmt.percent(lead.views / totals.views)}</b>]} />
          </li>
        ) : null}
      </ul>
      <p className="admin-bio" aria-live="polite">
        {t.hero.source}{' '}
        {refreshing ? (
          t.hero.refreshingNow
        ) : (
          <>
            {refreshFailed ? t.hero.lastFailed : t.hero.loadedAt}{' '}
            <time className="admin-mono" dateTime={loadedAt.toISOString()}>
              {fmt.time(loadedAt)}
            </time>
            .
          </>
        )}
        {truncated ? ` ${t.hero.truncated(fmt.number(insights.posts.length))}` : null}
      </p>
    </>
  )
}

function Report({ insights, asOf, localeById, table, dispatch }: {
  insights: AdminInsights
  asOf: number
  localeById: ReadonlyMap<string, string>
  table: TableState
  dispatch: Dispatch<TableAction>
}) {
  const { posts } = insights
  const byId = useMemo(() => new Map(posts.map((post) => [post.id, post])), [posts])
  const categoryTitles = useMemo(
    () => new Map(insights.categories.map((category) => [category.category, category.title])),
    [insights.categories],
  )
  const never = useMemo(() => insights.neverViewed.flatMap((id) => byId.get(id) ?? []), [insights.neverViewed, byId])
  const least = useMemo(() => insights.leastViewed.flatMap((id) => byId.get(id) ?? []), [insights.leastViewed, byId])
  const { t } = useAdminText()
  const [picked, setPicked] = useState<{ id: string; at: number } | null>(null)

  // A dot picked in the chart: show its page (clearing filters that hide it) and outline the row.
  const pickPost = useCallback(
    (postId: string) => {
      let next = table
      if (!filterAndSort(posts, next, categoryTitles).some((post) => post.id === postId)) {
        next = tableReducer(table, { type: 'reset' })
      }
      const page = pageOfPost(filterAndSort(posts, next, categoryTitles), postId, next.size) ?? 1
      dispatch({ type: 'replace', value: { ...next, page } })
      setPicked({ id: postId, at: Date.now() })
    },
    [table, posts, categoryTitles, dispatch],
  )

  return (
    <>
      <section className="admin-section admin-split" aria-labelledby="admin-top" data-reveal>
        <AdminLeaderboard posts={posts} categoryTitles={categoryTitles} localeById={localeById} />
        <AdminReactionList reactions={insights.reactions} total={insights.totals.reactions} />
      </section>

      <section id="admin-chart" className="admin-section" aria-labelledby="admin-chart-title" data-reveal>
        <header className="admin-section__head">
          <h2 id="admin-chart-title" className="admin-title">{t.chart.title}</h2>
          <p className="admin-section__note">{t.chart.note}</p>
        </header>
        <AdminReadsChart posts={posts} categoryTitles={categoryTitles} onPick={pickPost} asOf={asOf} />
      </section>

      <AdminNeedsLove never={never} least={least} categoryTitles={categoryTitles} localeById={localeById} />

      <AdminAllPosts
        posts={posts}
        categories={insights.categories}
        categoryTitles={categoryTitles}
        localeById={localeById}
        state={table}
        dispatch={dispatch}
        picked={picked}
      />
    </>
  )
}
