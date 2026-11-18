import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LEAST_VIEWED_LIMIT,
  buildContentCatalog,
  buildFirestoreInsights,
  normalisePostStats,
} from '../src/lib/admin/insights.mjs'

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
