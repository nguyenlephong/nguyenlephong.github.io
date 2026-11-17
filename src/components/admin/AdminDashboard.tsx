'use client'

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import type {
  AdminLabelledCount,
  AdminPostHogBlock,
  AdminPostRow,
  AdminReactionKey,
  AdminSnapshot,
} from '@/lib/admin/snapshot-types'

interface AdminDashboardProps {
  snapshot: AdminSnapshot
  onSignOut: () => void
}

type SortKey = 'views' | 'shares' | 'reactionTotal'

const TOP_LIMIT = 20
const NEVER_VIEWED_PREVIEW = 12
const REACTION_LABELS: Record<AdminReactionKey, string> = {
  like: 'Like',
  love: 'Love',
  insightful: 'Insightful',
  clap: 'Clap',
}
const SORT_LABELS: Record<SortKey, string> = {
  views: 'Views',
  shares: 'Shares',
  reactionTotal: 'Reactions',
}
// web.dev "good" / "poor" boundaries for p75.
const VITAL_THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
}

const numberFormat = new Intl.NumberFormat('en-US')
const formatNumber = (value: number) => numberFormat.format(value)
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return 'never'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const hours = Math.round((Date.now() - date.getTime()) / 3_600_000)
  const age = hours < 1 ? 'under an hour ago' : hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} days ago`
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC, ${age}`
}

function postHref(post: AdminPostRow): string | null {
  if (!post.listed) return null
  const slug = post.id.slice(post.id.indexOf('__') + 2)
  return post.category === 'notes' ? `/en/notes/${slug}` : `/en/blog/${post.category}/${slug}`
}

const ratioStyle = (value: number, max: number): CSSProperties =>
  ({ '--ratio': max > 0 ? Math.max(value / max, value > 0 ? 0.01 : 0) : 0 }) as CSSProperties

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="admin-bar" aria-hidden="true">
      <span className="admin-bar__fill" style={ratioStyle(value, max)} />
    </span>
  )
}

function PostTitle({ post }: { post: AdminPostRow }) {
  const href = postHref(post)
  return href ? (
    <a className="admin-link" href={href} target="_blank" rel="noopener">
      {post.title}
    </a>
  ) : (
    <span className="admin-unlisted" title="Not in the current content index">
      {post.title}
    </span>
  )
}

function Section({ id, title, meta, children }: { id: string; title: string; meta?: string; children: ReactNode }) {
  return (
    <section className="admin-section" aria-labelledby={id}>
      <header className="admin-section__head">
        <h2 id={id}>{title}</h2>
        {meta ? <p className="admin-meta">{meta}</p> : null}
      </header>
      {children}
    </section>
  )
}

function RankingTable({ posts, categories }: { posts: AdminPostRow[]; categories: AdminSnapshot['firestore']['categories'] }) {
  const [sortKey, setSortKey] = useState<SortKey>('views')
  const [category, setCategory] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const filtered = useMemo(
    () =>
      posts
        .filter((post) => category === 'all' || post.category === category)
        .sort((left, right) => right[sortKey] - left[sortKey] || right.views - left.views || left.id.localeCompare(right.id)),
    [posts, category, sortKey],
  )
  const rows = showAll ? filtered : filtered.slice(0, TOP_LIMIT)
  const max = filtered[0]?.[sortKey] ?? 0

  return (
    <>
      <div className="admin-controls">
        <label className="admin-field">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((entry) => (
              <option key={entry.category} value={entry.category}>
                {entry.title}
              </option>
            ))}
          </select>
        </label>
        <p className="admin-meta">
          {showAll ? `All ${filtered.length}` : `Top ${Math.min(TOP_LIMIT, filtered.length)} of ${filtered.length}`} by{' '}
          {SORT_LABELS[sortKey].toLowerCase()}
        </p>
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table admin-table--ranking">
          <thead>
            <tr>
              <th scope="col" className="admin-num admin-rank">#</th>
              <th scope="col">Post</th>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <th key={key} scope="col" className="admin-num" aria-sort={sortKey === key ? 'descending' : 'none'}>
                  <button
                    type="button"
                    className="admin-sort"
                    aria-pressed={sortKey === key}
                    onClick={() => setSortKey(key)}
                  >
                    {SORT_LABELS[key]}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((post, index) => (
              <tr key={post.id}>
                <td className="admin-num admin-rank">{index + 1}</td>
                <td>
                  <PostTitle post={post} />
                  <span className="admin-row-meta">
                    {post.category}
                    {post.date ? ` · ${post.date}` : ''}
                  </span>
                  <Bar value={post[sortKey]} max={max} />
                </td>
                <td className="admin-num">{formatNumber(post.views)}</td>
                <td className="admin-num">{formatNumber(post.shares)}</td>
                <td className="admin-num">{formatNumber(post.reactionTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > TOP_LIMIT ? (
        <button type="button" className="admin-button" onClick={() => setShowAll((value) => !value)}>
          {showAll ? `Show top ${TOP_LIMIT}` : `Show all ${filtered.length}`}
        </button>
      ) : null}
    </>
  )
}

function BarList({ title, rows, total, format = (label) => label }: { title: string; rows: AdminLabelledCount[]; total?: number; format?: (label: string) => string }) {
  const max = Math.max(0, ...rows.map((row) => row.count))
  const sum = total ?? rows.reduce((acc, row) => acc + row.count, 0)
  return (
    <div className="admin-barlist">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="admin-empty">No data in this window.</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.label}>
              <span className="admin-barlist__label">{format(row.label)}</span>
              <span className="admin-barlist__value">
                {formatNumber(row.count)}
                {sum > 0 ? <span className="admin-barlist__share"> {formatPercent(row.count / sum)}</span> : null}
              </span>
              <Bar value={row.count} max={max} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PageviewColumns({ days }: { days: Array<{ day: string; count: number }> }) {
  if (days.length === 0) return <p className="admin-empty">No pageviews in this window.</p>
  const max = Math.max(...days.map((entry) => entry.count))
  const total = days.reduce((acc, entry) => acc + entry.count, 0)
  return (
    <figure className="admin-columns">
      <ol aria-label={`Pageviews per day, ${formatNumber(total)} in total`}>
        {days.map((entry) => (
          <li key={entry.day} title={`${entry.day}: ${formatNumber(entry.count)}`}>
            <span className="admin-columns__bar" style={ratioStyle(entry.count, max)} aria-hidden="true" />
            <span className="admin-visually-hidden">
              {entry.day}: {formatNumber(entry.count)}
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="admin-meta">
        <span>{days[0]?.day}</span>
        <span>
          {formatNumber(total)} pageviews, peak {formatNumber(max)}
        </span>
        <span>{days.at(-1)?.day}</span>
      </figcaption>
    </figure>
  )
}

function vitalRating(name: string, p75: number): 'good' | 'needs-improvement' | 'poor' | null {
  const thresholds = VITAL_THRESHOLDS[name]
  if (!thresholds) return null
  return p75 <= thresholds[0] ? 'good' : p75 <= thresholds[1] ? 'needs-improvement' : 'poor'
}

const formatVital = (name: string, value: number) =>
  name === 'CLS' ? value.toFixed(3) : `${formatNumber(Math.round(value))} ms`

const sourceLabel = (label: string) => (label === '$direct' ? 'Direct / none' : label)

function PostHogSection({ block }: { block: AdminPostHogBlock }) {
  const hasData = block.status !== 'unavailable'
  const windowDays = block.windowDays ?? 30
  const statusText =
    block.status === 'ok'
      ? `Last ${windowDays} days · updated ${formatTimestamp(block.updatedAt)}`
      : block.status === 'stale'
        ? `Stale: showing data from ${formatTimestamp(block.updatedAt)}`
        : 'Unavailable'
  return (
    <Section id="admin-posthog" title="Traffic from PostHog" meta={statusText}>
      {block.status !== 'ok' ? (
        <p className={`admin-notice admin-notice--${block.status}`} role="status">
          The last PostHog refresh failed{block.lastAttemptAt ? ` (${formatTimestamp(block.lastAttemptAt)})` : ''}
          {block.error ? `: ${block.error}` : '.'}
        </p>
      ) : null}
      {hasData ? (
        <>
          <h3 className="admin-subhead">Pageviews per day</h3>
          <PageviewColumns days={block.pageviewsByDay ?? []} />
          <div className="admin-grid">
            <BarList title="Traffic sources" rows={block.sources ?? []} format={sourceLabel} />
            <BarList title="Countries" rows={block.countries ?? []} />
            <BarList title="Devices" rows={block.devices ?? []} />
            <BarList title="Locales" rows={block.locales ?? []} />
          </div>
          <div className="admin-grid">
            <div className="admin-barlist">
              <h3>Read completion</h3>
              {block.readCompletion?.rate == null ? (
                <p className="admin-empty">No article views in this window.</p>
              ) : (
                <>
                  <p className="admin-figure">{formatPercent(block.readCompletion.rate)}</p>
                  <p className="admin-meta">
                    {formatNumber(block.readCompletion.completes)} of {formatNumber(block.readCompletion.views)} article
                    views reached the end
                  </p>
                  <Bar value={block.readCompletion.rate} max={1} />
                </>
              )}
            </div>
            <div className="admin-barlist">
              <h3>Web Vitals, p75</h3>
              {(block.webVitals ?? []).length === 0 ? (
                <p className="admin-empty">No web_vital events in this window.</p>
              ) : (
                <table className="admin-table admin-table--compact">
                  <tbody>
                    {(block.webVitals ?? []).map((vital) => {
                      const rating = vitalRating(vital.name, vital.p75)
                      return (
                        <tr key={vital.name}>
                          <th scope="row">{vital.name}</th>
                          <td className="admin-num">{formatVital(vital.name, vital.p75)}</td>
                          <td className="admin-num admin-row-meta">{formatNumber(vital.samples)} samples</td>
                          <td>{rating ? <span className={`admin-rating admin-rating--${rating}`}>{rating.replace('-', ' ')}</span> : null}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : null}
    </Section>
  )
}

export default function AdminDashboard({ snapshot, onSignOut }: AdminDashboardProps) {
  const { firestore, posthog } = snapshot
  const byId = useMemo(() => new Map(firestore.posts.map((post) => [post.id, post])), [firestore.posts])
  const [showAllNever, setShowAllNever] = useState(false)
  const leastViewed = firestore.leastViewed.flatMap((id) => byId.get(id) ?? [])
  const neverViewed = firestore.neverViewed.flatMap((id) => byId.get(id) ?? [])
  const visibleNever = showAllNever ? neverViewed : neverViewed.slice(0, NEVER_VIEWED_PREVIEW)
  const categoryMax = Math.max(0, ...firestore.categories.map((entry) => entry.views))
  const reactionRows = (Object.keys(REACTION_LABELS) as AdminReactionKey[]).map((key) => ({
    label: REACTION_LABELS[key],
    count: firestore.reactions[key] ?? 0,
  }))

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Site insights</h1>
          <p className="admin-meta">Snapshot {formatTimestamp(snapshot.generatedAt)}</p>
          <p className="admin-totals">
            {formatNumber(firestore.totals.posts)} posts · {formatNumber(firestore.totals.views)} views ·{' '}
            {formatNumber(firestore.totals.shares)} shares · {formatNumber(firestore.totals.reactions)} reactions
          </p>
        </div>
        <button type="button" className="admin-button" onClick={onSignOut}>
          Sign out
        </button>
      </header>

      <Section id="admin-ranking" title="Post ranking" meta="Firestore counters, all time">
        <RankingTable posts={firestore.posts} categories={firestore.categories} />
      </Section>

      <div className="admin-grid admin-grid--wide">
        <Section id="admin-least" title="Least viewed" meta={`${leastViewed.length} published posts with at least one view`}>
          <ol className="admin-plain-list">
            {leastViewed.map((post) => (
              <li key={post.id}>
                <PostTitle post={post} />
                <span className="admin-num">{formatNumber(post.views)}</span>
              </li>
            ))}
          </ol>
        </Section>
        <Section id="admin-never" title="Never viewed" meta={`${neverViewed.length} published posts, newest first`}>
          {neverViewed.length === 0 ? (
            <p className="admin-empty">Every published post has a view.</p>
          ) : (
            <>
              <ul className="admin-plain-list">
                {visibleNever.map((post) => (
                  <li key={post.id}>
                    <PostTitle post={post} />
                    <span className="admin-row-meta">{post.date}</span>
                  </li>
                ))}
              </ul>
              {neverViewed.length > NEVER_VIEWED_PREVIEW ? (
                <button type="button" className="admin-button" onClick={() => setShowAllNever((value) => !value)}>
                  {showAllNever ? 'Show fewer' : `Show all ${neverViewed.length}`}
                </button>
              ) : null}
            </>
          )}
        </Section>
      </div>

      <div className="admin-grid admin-grid--wide">
        <Section id="admin-categories" title="By category">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col" className="admin-num">Posts</th>
                  <th scope="col" className="admin-num">Views</th>
                  <th scope="col" className="admin-num">Shares</th>
                  <th scope="col" className="admin-num">Reactions</th>
                </tr>
              </thead>
              <tbody>
                {firestore.categories.map((entry) => (
                  <tr key={entry.category}>
                    <td>
                      {entry.title}
                      <Bar value={entry.views} max={categoryMax} />
                    </td>
                    <td className="admin-num">{formatNumber(entry.posts)}</td>
                    <td className="admin-num">{formatNumber(entry.views)}</td>
                    <td className="admin-num">{formatNumber(entry.shares)}</td>
                    <td className="admin-num">{formatNumber(entry.reactions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section id="admin-reactions" title="Reactions">
          <BarList title="Breakdown" rows={reactionRows} />
        </Section>
      </div>

      <PostHogSection block={posthog} />
    </main>
  )
}
