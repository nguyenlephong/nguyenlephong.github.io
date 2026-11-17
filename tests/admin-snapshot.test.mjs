import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  LEAST_VIEWED_LIMIT,
  POSTHOG_QUERIES,
  assertSnapshotFits,
  buildContentCatalog,
  buildFirestoreInsights,
  buildPostHogInsights,
  mergeSnapshot,
  normalisePostStats,
  runPostHogQueries,
  snapshotBytes,
} from '../scripts/lib/admin-snapshot.mjs'

const blogIndex = {
  categories: [
    { slug: 'architecture', title: 'Source & Architecture' },
    { slug: 'culture', title: 'Engineering Culture' },
  ],
  posts: [
    { slug: 'ports', category: 'architecture', title: 'Ports', date: '2026-01-02' },
    { slug: 'layers', category: 'architecture', title: 'Layers', date: '2026-03-01' },
    { slug: 'kind-review', category: 'culture', title: 'Kind review', date: '2026-02-01' },
    { slug: 'quiet', category: 'culture', title: 'Quiet', date: '2026-04-01' },
    { slug: 'scheduled', category: 'culture', title: 'Scheduled', date: '2026-12-31' },
  ],
}
const notesIndex = { posts: [{ slug: 'wisdom', title: 'Wisdom', date: '2026-05-01' }] }
const AS_OF = '2026-11-18'

const statsDocs = [
  { id: 'architecture__ports', data: { views: 40, shares: 2, reactions: { like: 3, love: 1 } } },
  { id: 'culture__kind-review', data: { views: 40, shares: 5, reactions: { clap: 2 } } },
  { id: 'architecture__layers', data: { views: 3, shares: 0, reactions: {} } },
  { id: 'notes__wisdom', data: { views: 7, reactions: { insightful: 4 } } },
  // Not in any index (thoughts share counter, or a removed post): kept, unlisted.
  { id: 'thoughts__a-thought', data: { shares: 1 } },
  // Garbage counters are coerced, never trusted.
  { id: 'culture__scheduled', data: { views: -5, shares: 1.5, reactions: { like: 'x', angry: 9 } } },
]

test('normalisePostStats keeps only non-negative integer counters for the four reactions', () => {
  assert.deepEqual(normalisePostStats({ views: 2, shares: -1, reactions: { like: 1, angry: 3 } }), {
    views: 2,
    shares: 0,
    reactions: { like: 1, love: 0, insightful: 0, clap: 0 },
  })
  assert.deepEqual(normalisePostStats(null).reactions, { like: 0, love: 0, insightful: 0, clap: 0 })
})

test('the catalog joins blog and notes ids as category__slug and skips scheduled posts', () => {
  const catalog = buildContentCatalog(blogIndex, notesIndex, AS_OF)
  assert.deepEqual([...catalog.keys()].sort(), [
    'architecture__layers',
    'architecture__ports',
    'culture__kind-review',
    'culture__quiet',
    'notes__wisdom',
  ])
  assert.deepEqual(catalog.get('architecture__ports'), {
    title: 'Ports',
    category: 'architecture',
    categoryTitle: 'Source & Architecture',
    date: '2026-01-02',
  })
  assert.equal(catalog.get('notes__wisdom').categoryTitle, 'Notes')
})

test('rankings sort by views, then shares, and keep unlisted stats ids', () => {
  const insights = buildFirestoreInsights(statsDocs, buildContentCatalog(blogIndex, notesIndex, AS_OF))
  assert.deepEqual(
    insights.posts.map((post) => post.id),
    [
      'culture__kind-review',
      'architecture__ports',
      'notes__wisdom',
      'architecture__layers',
      'thoughts__a-thought',
      // Both 0/0/0 after coercion, so the id breaks the tie.
      'culture__quiet',
      'culture__scheduled',
    ],
  )
  const ports = insights.posts.find((post) => post.id === 'architecture__ports')
  assert.equal(ports.title, 'Ports')
  assert.equal(ports.reactionTotal, 4)
  const thought = insights.posts.find((post) => post.id === 'thoughts__a-thought')
  assert.equal(thought.listed, false)
  assert.equal(thought.category, 'thoughts')
  assert.equal(thought.title, 'thoughts__a-thought')
  assert.equal('categoryTitle' in thought, false)
})

test('least-viewed lists viewed posts ascending; never-viewed lists published zero-view posts', () => {
  const insights = buildFirestoreInsights(statsDocs, buildContentCatalog(blogIndex, notesIndex, AS_OF))
  assert.deepEqual(insights.leastViewed, [
    'architecture__layers',
    'notes__wisdom',
    'architecture__ports',
    'culture__kind-review',
  ])
  // Unlisted ids (thoughts, scheduled) never count as "never viewed".
  assert.deepEqual(insights.neverViewed, ['culture__quiet'])

  const many = Array.from({ length: LEAST_VIEWED_LIMIT + 5 }, (_, index) => ({
    slug: `p${index}`,
    category: 'culture',
    title: `P${index}`,
    date: '2026-01-01',
  }))
  const big = buildFirestoreInsights(
    many.map((post, index) => ({ id: `culture__${post.slug}`, data: { views: index + 1 } })),
    buildContentCatalog({ categories: [], posts: many }, null, AS_OF),
  )
  assert.equal(big.leastViewed.length, LEAST_VIEWED_LIMIT)
  assert.equal(big.leastViewed[0], 'culture__p0')
})

test('category totals and the reaction breakdown add up', () => {
  const insights = buildFirestoreInsights(statsDocs, buildContentCatalog(blogIndex, notesIndex, AS_OF))
  assert.deepEqual(insights.reactions, { like: 3, love: 1, insightful: 4, clap: 2 })
  assert.deepEqual(insights.totals, { posts: 7, views: 90, shares: 8, reactions: 10 })
  const culture = insights.categories.find((category) => category.category === 'culture')
  assert.deepEqual(culture, {
    category: 'culture',
    title: 'Engineering Culture',
    posts: 3,
    views: 40,
    shares: 5,
    reactions: 2,
  })
  assert.equal(insights.categories[0].views >= insights.categories.at(-1).views, true)
})

test('PostHog results become labelled rows, a completion rate and web vitals p75', () => {
  const insights = buildPostHogInsights({
    pageviewsByDay: [['2026-11-17', 12], ['2026-11-18', '5']],
    sources: [['$direct', 9], ['www.google.com', 4]],
    countries: [['VN', 10]],
    devices: [['Desktop', 7], ['Mobile', 6]],
    locales: [['en', 8], ['vi', 5]],
    readCompletion: [[40, 10]],
    webVitals: [['LCP', 2310.456789, 120], ['CLS', 0.0412, 118]],
  })
  assert.deepEqual(insights.pageviewsByDay, [
    { day: '2026-11-17', count: 12 },
    { day: '2026-11-18', count: 5 },
  ])
  assert.deepEqual(insights.sources[0], { label: '$direct', count: 9 })
  assert.deepEqual(insights.readCompletion, { views: 40, completes: 10, rate: 0.25 })
  assert.deepEqual(insights.webVitals[0], { name: 'LCP', p75: 2310.457, samples: 120 })
  assert.equal(buildPostHogInsights({}).readCompletion.rate, null)
})

test('the HogQL queries read the events the site actually sends', () => {
  const analytics = readFileSync('src/lib/analytics.ts', 'utf8')
  for (const event of ['blog_article_view', 'blog_read_complete', 'notes_article_view', 'notes_read_complete', 'web_vital']) {
    assert.match(analytics, new RegExp(`'${event}'`))
  }
  assert.match(POSTHOG_QUERIES.readCompletion, /blog_read_complete/)
  assert.match(POSTHOG_QUERIES.webVitals, /quantile\(0\.75\)/)
  assert.match(POSTHOG_QUERIES.readCompletion, /\) AND timestamp/)
})

test('runPostHogQueries posts HogQL with a bearer key and fails loudly on HTTP errors', async () => {
  const calls = []
  const okFetch = async (url, init) => {
    calls.push({ url, init })
    return { ok: true, status: 200, json: async () => ({ results: [[1, 2]] }) }
  }
  const results = await runPostHogQueries({
    fetch: okFetch,
    host: 'https://us.posthog.com',
    projectId: '12345',
    apiKey: 'phx_test',
  })
  assert.equal(Object.keys(results).length, Object.keys(POSTHOG_QUERIES).length)
  assert.equal(calls[0].url, 'https://us.posthog.com/api/projects/12345/query/')
  assert.equal(calls[0].init.headers.Authorization, 'Bearer phx_test')
  assert.equal(JSON.parse(calls[0].init.body).query.kind, 'HogQLQuery')

  await assert.rejects(
    runPostHogQueries({
      fetch: async () => ({ ok: false, status: 401 }),
      host: 'https://us.posthog.com',
      projectId: '12345',
      apiKey: 'phx_test',
    }),
    (error) => /HTTP 401/.test(error.message) && !error.message.includes('phx_test'),
  )
  await assert.rejects(runPostHogQueries({ fetch: okFetch, host: 'https://x', projectId: '', apiKey: 'k' }), /not configured/)
  await assert.rejects(runPostHogQueries({ fetch: okFetch, host: 'https://x', projectId: '1/../2', apiKey: 'k' }), /numeric/)
})

test('a PostHog failure keeps the previous PostHog block, marked stale', () => {
  const firestore = buildFirestoreInsights(statsDocs, buildContentCatalog(blogIndex, notesIndex, AS_OF))
  const first = mergeSnapshot({
    previous: null,
    firestore,
    posthog: buildPostHogInsights({ countries: [['VN', 3]] }),
    posthogError: null,
    now: new Date('2026-11-18T00:00:00Z'),
  })
  assert.equal(first.posthog.status, 'ok')
  assert.equal(first.posthog.updatedAt, '2026-11-18T00:00:00.000Z')

  const second = mergeSnapshot({
    previous: first,
    firestore,
    posthog: null,
    posthogError: new Error('PostHog query sources failed with HTTP 503'),
    now: new Date('2026-11-18T06:00:00Z'),
  })
  assert.equal(second.posthog.status, 'stale')
  assert.equal(second.posthog.updatedAt, '2026-11-18T00:00:00.000Z')
  assert.deepEqual(second.posthog.countries, [{ label: 'VN', count: 3 }])
  assert.match(second.posthog.error, /HTTP 503/)
  assert.equal(second.firestore.updatedAt, '2026-11-18T06:00:00.000Z')
  assert.equal(second.generatedAt, '2026-11-18T06:00:00.000Z')

  const recovered = mergeSnapshot({
    previous: second,
    firestore,
    posthog: buildPostHogInsights({}),
    posthogError: null,
    now: new Date('2026-11-18T12:00:00Z'),
  })
  assert.equal(recovered.posthog.status, 'ok')
  assert.equal('error' in recovered.posthog, false)

  const none = mergeSnapshot({ previous: null, firestore, posthog: null, posthogError: 'down', now: new Date() })
  assert.equal(none.posthog.status, 'unavailable')
})

test('a snapshot of the real content catalog stays well under the Firestore document limit', () => {
  const blog = JSON.parse(readFileSync('content/blog-data/_index.json', 'utf8'))
  const notes = JSON.parse(readFileSync('content/notes-data/_index.json', 'utf8'))
  const catalog = buildContentCatalog(blog, notes, '2999-12-31')
  const docs = [...catalog.keys()].map((id) => ({
    id,
    data: { views: 123456, shares: 1234, reactions: { like: 99, love: 99, insightful: 99, clap: 99 } },
  }))
  const snapshot = mergeSnapshot({
    previous: null,
    firestore: buildFirestoreInsights(docs, catalog),
    posthog: buildPostHogInsights({
      pageviewsByDay: Array.from({ length: 31 }, (_, day) => [`2026-10-${day}`, 1000]),
    }),
    posthogError: null,
    now: new Date(),
  })
  const bytes = assertSnapshotFits(snapshot)
  assert.ok(bytes < 256 * 1024, `snapshot is ${bytes} bytes`)
  assert.throws(() => assertSnapshotFits(snapshot, 10), /over the 10 byte budget/)
  assert.equal(snapshotBytes({}), 2)
})
