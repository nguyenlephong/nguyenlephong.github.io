/**
 * Pure builders for /admin: join the raw postStats documents with the blog and
 * notes catalogs, then rank. No I/O, so every rule is unit-tested in
 * tests/admin-insights.test.mjs.
 */

export const REACTION_KEYS = ['like', 'love', 'insightful', 'clap']
export const LEAST_VIEWED_LIMIT = 10

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
