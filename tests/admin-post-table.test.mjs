import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_TABLE,
  filterAndSort,
  pageOfPost,
  pageWindow,
  paginate,
  parseTableQuery,
  serializeTableQuery,
  tableReducer,
} from '../src/lib/admin/post-table.mjs'

const post = (id, title, views, extra = {}) => ({
  id,
  title,
  category: id.split('__')[0],
  date: '2026-01-01',
  listed: true,
  views,
  shares: 0,
  reactions: { like: 0, love: 0, insightful: 0, clap: 0 },
  reactionTotal: 0,
  ...extra,
})

const posts = [
  post('ai__agents', 'Agents', 30, { date: '2026-03-01', shares: 5 }),
  post('culture__review', 'Kind review', 0, { date: '2026-04-01' }),
  post('ai__context', 'context windows', 12, { date: '2026-02-01', shares: 9 }),
  post('notes__wisdom', 'Wisdom', 0, { date: '2026-05-01' }),
  post('thoughts__x', 'thoughts__x', 3, { date: null, listed: false }),
]
const titles = new Map([
  ['ai', 'AI & The Future'],
  ['culture', 'Engineering Culture'],
  ['notes', 'Notes'],
])

test('filters by category, search and never-viewed (published only)', () => {
  const ids = (state) => filterAndSort(posts, { ...DEFAULT_TABLE, ...state }, titles).map((p) => p.id)
  assert.deepEqual(ids({ category: 'ai' }), ['ai__agents', 'ai__context'])
  assert.deepEqual(ids({ query: 'CONTEXT' }), ['ai__context'])
  assert.deepEqual(ids({ query: 'notes__' }), ['notes__wisdom'])
  assert.deepEqual(ids({ neverViewed: true }).sort(), ['culture__review', 'notes__wisdom'])
})

test('every column sorts both ways and undated counters sink to the end', () => {
  const ids = (sort, direction) => filterAndSort(posts, { ...DEFAULT_TABLE, sort, direction }, titles).map((p) => p.id)
  assert.deepEqual(ids('views', 'desc').slice(0, 3), ['ai__agents', 'ai__context', 'thoughts__x'])
  assert.deepEqual(ids('views', 'asc').slice(-1), ['ai__agents'])
  assert.deepEqual(ids('title', 'asc').slice(0, 2), ['ai__agents', 'ai__context'])
  assert.deepEqual(ids('category', 'desc')[0], 'thoughts__x')
  assert.deepEqual(ids('date', 'desc'), ['notes__wisdom', 'culture__review', 'ai__agents', 'ai__context', 'thoughts__x'])
  assert.deepEqual(ids('date', 'asc').at(-1), 'thoughts__x')
  assert.deepEqual(ids('shares', 'desc').slice(0, 2), ['ai__context', 'ai__agents'])
})

test('the reducer resets to page 1 on any filter change and toggles a repeated sort', () => {
  const onPage3 = { ...DEFAULT_TABLE, page: 3 }
  assert.equal(tableReducer(onPage3, { type: 'query', value: 'x' }).page, 1)
  assert.equal(tableReducer(onPage3, { type: 'category', value: 'ai' }).page, 1)
  assert.equal(tableReducer(onPage3, { type: 'neverViewed', value: true }).page, 1)
  assert.equal(tableReducer(onPage3, { type: 'size', value: 50 }).page, 1)
  assert.equal(tableReducer(onPage3, { type: 'size', value: 7 }).size, 20)
  const toggled = tableReducer(DEFAULT_TABLE, { type: 'sort', value: 'views' })
  assert.equal(toggled.direction, 'asc')
  const title = tableReducer(DEFAULT_TABLE, { type: 'sort', value: 'title' })
  assert.deepEqual([title.sort, title.direction], ['title', 'asc'])
})

test('pagination clamps the page and the window keeps first, last and neighbours', () => {
  const many = Array.from({ length: 45 }, (_, i) => post(`ai__p${i}`, `P${i}`, i))
  assert.deepEqual(
    (({ page, pageCount, start, total }) => ({ page, pageCount, start, total }))(paginate(many, 9, 20)),
    { page: 3, pageCount: 3, start: 40, total: 45 },
  )
  assert.equal(paginate([], 1, 20).pageCount, 1)
  assert.deepEqual(pageWindow(1, 1), [1])
  assert.deepEqual(pageWindow(5, 18), [1, null, 4, 5, 6, null, 18])
  assert.deepEqual(pageWindow(2, 4), [1, 2, 3, 4])
  assert.equal(pageOfPost(many, 'ai__p21', 20), 2)
  assert.equal(pageOfPost(many, 'nope', 20), null)
})

test('the URL query round-trips and ignores junk', () => {
  const state = { ...DEFAULT_TABLE, query: 'agents', category: 'ai', neverViewed: true, sort: 'date', direction: 'asc', page: 2, size: 50 }
  assert.deepEqual(parseTableQuery(serializeTableQuery(state)), state)
  assert.equal(serializeTableQuery(DEFAULT_TABLE), '')
  assert.deepEqual(parseTableQuery('?sort=evil&dir=up&size=7&page=-2&cat=<script>'), DEFAULT_TABLE)
})
