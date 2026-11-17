/**
 * MEP-90: pure builders for the admin insight snapshot stored at
 * adminVault/{vaultId}. No I/O here except the injected `fetch` in
 * runPostHogQueries, so every rule is unit-tested in tests/admin-snapshot.test.mjs.
 */

export const SNAPSHOT_SCHEMA_VERSION = 1
export const REACTION_KEYS = ['like', 'love', 'insightful', 'clap']
export const LEAST_VIEWED_LIMIT = 10
export const POSTHOG_WINDOW_DAYS = 30
export const POSTHOG_TOP_LIMIT = 10
// Firestore caps a document at 1 MiB; leave room for field-name overhead.
export const MAX_SNAPSHOT_BYTES = 900 * 1024

const nonNegativeInt = (value) =>
  Number.isSafeInteger(value) && value > 0 ? value : 0

/** Coerce a raw postStats document to the counters the rules allow. */
export function normalisePostStats(data) {
  const source = data && typeof data === 'object' ? data : {}
  const rawReactions =
    source.reactions && typeof source.reactions === 'object' ? source.reactions : {}
  const reactions = Object.fromEntries(
    REACTION_KEYS.map((key) => [key, nonNegativeInt(rawReactions[key])]),
  )
  return {
    views: nonNegativeInt(source.views),
    shares: nonNegativeInt(source.shares),
    reactions,
  }
}

const reactionTotal = (reactions) =>
  REACTION_KEYS.reduce((sum, key) => sum + reactions[key], 0)

/**
 * Published blog posts and notes keyed by their postStats id (`category__slug`).
 * Entries dated after `asOfDay` (YYYY-MM-DD) are scheduled, not live, and are left out.
 */
export function buildContentCatalog(blogIndex, notesIndex, asOfDay) {
  const catalog = new Map()
  const categoryTitles = new Map(
    (blogIndex?.categories ?? []).map((category) => [category.slug, category.title]),
  )
  const add = (category, entry) => {
    if (!entry?.slug || !entry.date || entry.date > asOfDay) return
    catalog.set(`${category}__${entry.slug}`, {
      title: entry.title ?? entry.slug,
      category,
      categoryTitle: categoryTitles.get(category) ?? (category === 'notes' ? 'Notes' : category),
      date: entry.date,
    })
  }
  for (const post of blogIndex?.posts ?? []) add(post.category, post)
  for (const note of notesIndex?.posts ?? []) add('notes', note)
  return catalog
}

const byRanking = (left, right) =>
  right.views - left.views ||
  right.shares - left.shares ||
  right.reactionTotal - left.reactionTotal ||
  left.id.localeCompare(right.id)

/**
 * Join every postStats document with the content catalog.
 * `statsDocs` is `[{ id, data }]`. Stats ids that are not (or no longer) in the
 * catalog stay in the ranking with `listed: false`, so no counter is dropped.
 */
export function buildFirestoreInsights(statsDocs, catalog) {
  const stats = new Map(statsDocs.map(({ id, data }) => [id, normalisePostStats(data)]))
  const ids = new Set([...catalog.keys(), ...stats.keys()])

  const posts = [...ids].map((id) => {
    const counters = stats.get(id) ?? normalisePostStats(undefined)
    const entry = catalog.get(id)
    const [prefix] = id.split('__')
    return {
      id,
      title: entry?.title ?? id,
      category: entry?.category ?? prefix,
      categoryTitle: entry?.categoryTitle ?? prefix,
      date: entry?.date ?? null,
      listed: Boolean(entry),
      views: counters.views,
      shares: counters.shares,
      reactions: counters.reactions,
      reactionTotal: reactionTotal(counters.reactions),
    }
  })
  posts.sort(byRanking)

  const listed = posts.filter((post) => post.listed)
  const leastViewed = listed
    .filter((post) => post.views > 0)
    .sort((left, right) => left.views - right.views || left.id.localeCompare(right.id))
    .slice(0, LEAST_VIEWED_LIMIT)
    .map((post) => post.id)
  const neverViewed = listed
    .filter((post) => post.views === 0)
    .sort((left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id))
    .map((post) => post.id)

  const categoryTotals = new Map()
  for (const post of posts) {
    const total = categoryTotals.get(post.category) ?? {
      category: post.category,
      title: post.categoryTitle,
      posts: 0,
      views: 0,
      shares: 0,
      reactions: 0,
    }
    categoryTotals.set(post.category, {
      ...total,
      posts: total.posts + 1,
      views: total.views + post.views,
      shares: total.shares + post.shares,
      reactions: total.reactions + post.reactionTotal,
    })
  }
  const categories = [...categoryTotals.values()].sort(
    (left, right) => right.views - left.views || left.category.localeCompare(right.category),
  )

  const reactions = Object.fromEntries(
    REACTION_KEYS.map((key) => [key, posts.reduce((sum, post) => sum + post.reactions[key], 0)]),
  )

  return {
    totals: {
      posts: posts.length,
      views: posts.reduce((sum, post) => sum + post.views, 0),
      shares: posts.reduce((sum, post) => sum + post.shares, 0),
      reactions: reactionTotal(reactions),
    },
    posts: posts.map(({ categoryTitle: _categoryTitle, ...post }) => post),
    leastViewed,
    neverViewed,
    categories,
    reactions,
  }
}

const READ_VIEW_EVENTS = "('blog_article_view', 'notes_article_view')"
const READ_COMPLETE_EVENTS = "('blog_read_complete', 'notes_read_complete')"
const WINDOW = `timestamp >= now() - INTERVAL ${POSTHOG_WINDOW_DAYS} DAY`
const topBy = (expression) =>
  `SELECT ${expression} AS label, count() AS total FROM events ` +
  `WHERE event = '$pageview' AND ${WINDOW} GROUP BY label ORDER BY total DESC LIMIT ${POSTHOG_TOP_LIMIT}`

/** HogQL for every PostHog block on /admin. Event names come from src/lib/analytics.ts. */
export const POSTHOG_QUERIES = Object.freeze({
  pageviewsByDay:
    `SELECT toString(toDate(timestamp)) AS day, count() AS total FROM events ` +
    `WHERE event = '$pageview' AND ${WINDOW} GROUP BY day ORDER BY day`,
  sources: topBy("coalesce(properties.$referring_domain, '$direct')"),
  countries: topBy("coalesce(properties.$geoip_country_code, 'unknown')"),
  devices: topBy("coalesce(properties.$device_type, 'unknown')"),
  locales: topBy("coalesce(properties.locale, 'unknown')"),
  readCompletion:
    `SELECT countIf(event IN ${READ_VIEW_EVENTS}) AS views, ` +
    `countIf(event IN ${READ_COMPLETE_EVENTS}) AS completes FROM events ` +
    `WHERE (event IN ${READ_VIEW_EVENTS} OR event IN ${READ_COMPLETE_EVENTS}) AND ${WINDOW}`,
  webVitals:
    `SELECT toString(properties.name) AS metric, quantile(0.75)(toFloat(properties.value)) AS p75, ` +
    `count() AS samples FROM events WHERE event = 'web_vital' AND ${WINDOW} ` +
    `GROUP BY metric ORDER BY metric`,
})

const toNumber = (value) => {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : 0
}
const labelled = (rows) =>
  (rows ?? []).map(([label, total]) => ({ label: String(label ?? 'unknown'), count: toNumber(total) }))

/** Shape the raw HogQL `results` arrays (keyed like POSTHOG_QUERIES) into the snapshot block. */
export function buildPostHogInsights(results) {
  const [views = 0, completes = 0] = (results.readCompletion ?? [])[0] ?? []
  const readViews = toNumber(views)
  const readCompletes = toNumber(completes)
  return {
    windowDays: POSTHOG_WINDOW_DAYS,
    pageviewsByDay: (results.pageviewsByDay ?? []).map(([day, total]) => ({
      day: String(day),
      count: toNumber(total),
    })),
    sources: labelled(results.sources),
    countries: labelled(results.countries),
    devices: labelled(results.devices),
    locales: labelled(results.locales),
    readCompletion: {
      views: readViews,
      completes: readCompletes,
      rate: readViews > 0 ? Math.round((readCompletes / readViews) * 1000) / 1000 : null,
    },
    webVitals: (results.webVitals ?? []).map(([metric, p75, samples]) => ({
      name: String(metric),
      p75: Math.round(toNumber(p75) * 1000) / 1000,
      samples: toNumber(samples),
    })),
  }
}

/** Run every query against the PostHog Query API; throws on the first failure. */
export async function runPostHogQueries({ fetch, host, projectId, apiKey, timeoutMs = 30_000 }) {
  if (!apiKey || !projectId) throw new Error('PostHog is not configured (key or project id missing)')
  if (!/^\d+$/.test(String(projectId))) throw new Error('POSTHOG_PROJECT_ID must be numeric')
  const endpoint = new URL(`/api/projects/${projectId}/query/`, host).toString()
  const results = {}
  for (const [name, query] of Object.entries(POSTHOG_QUERIES)) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query }, name: `admin_snapshot_${name}` }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) throw new Error(`PostHog query ${name} failed with HTTP ${response.status}`)
    const body = await response.json()
    if (!Array.isArray(body?.results)) throw new Error(`PostHog query ${name} returned no results`)
    results[name] = body.results
  }
  return results
}

const safeErrorMessage = (error) =>
  (error instanceof Error ? error.message : String(error)).slice(0, 200)

/**
 * Combine the fresh Firestore block with the PostHog outcome. A PostHog failure
 * keeps the previous PostHog data (marked stale) instead of wiping it.
 */
export function mergeSnapshot({ previous, firestore, posthog, posthogError, now }) {
  const generatedAt = now.toISOString()
  let posthogBlock
  if (posthog) {
    posthogBlock = { status: 'ok', updatedAt: generatedAt, ...posthog }
  } else if (previous?.posthog?.updatedAt) {
    posthogBlock = {
      ...previous.posthog,
      status: 'stale',
      error: safeErrorMessage(posthogError),
      lastAttemptAt: generatedAt,
    }
  } else {
    posthogBlock = {
      status: 'unavailable',
      error: safeErrorMessage(posthogError),
      lastAttemptAt: generatedAt,
    }
  }
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    generatedAt,
    firestore: { updatedAt: generatedAt, ...firestore },
    posthog: posthogBlock,
  }
}

export function snapshotBytes(snapshot) {
  return Buffer.byteLength(JSON.stringify(snapshot), 'utf8')
}

export function assertSnapshotFits(snapshot, limit = MAX_SNAPSHOT_BYTES) {
  const bytes = snapshotBytes(snapshot)
  if (bytes > limit) throw new Error(`Snapshot is ${bytes} bytes, over the ${limit} byte budget`)
  return bytes
}
