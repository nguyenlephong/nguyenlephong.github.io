/**
 * Pure state for the /admin "Every post" table: filter, sort, paginate and the
 * URL query that mirrors them. Unit-tested in tests/admin-post-table.test.mjs.
 */

export const PAGE_SIZES = [20, 50, 100]
export const SORT_KEYS = ['title', 'category', 'date', 'views', 'shares', 'reactionTotal']
const TEXT_KEYS = new Set(['title', 'category'])

/** Text columns start A to Z; numbers and dates start with the largest. */
export const defaultDirection = (key) => (TEXT_KEYS.has(key) ? 'asc' : 'desc')

export const DEFAULT_TABLE = Object.freeze({
  query: '',
  category: 'all',
  neverViewed: false,
  sort: 'views',
  direction: 'desc',
  page: 1,
  size: 20,
})

const positiveInt = (value, fallback) => {
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : fallback
}

/** Read the table state from a URL query string; anything unknown falls back to the default. */
export function parseTableQuery(search) {
  const params = new URLSearchParams(search)
  const sort = SORT_KEYS.includes(params.get('sort')) ? params.get('sort') : DEFAULT_TABLE.sort
  const direction = ['asc', 'desc'].includes(params.get('dir')) ? params.get('dir') : defaultDirection(sort)
  const size = PAGE_SIZES.includes(Number(params.get('size'))) ? Number(params.get('size')) : DEFAULT_TABLE.size
  const category = (params.get('cat') ?? '').match(/^[a-z0-9-]{1,64}$/) ? params.get('cat') : 'all'
  return {
    query: (params.get('q') ?? '').slice(0, 120),
    category,
    neverViewed: params.get('never') === '1',
    sort,
    direction,
    page: positiveInt(params.get('page'), 1),
    size,
  }
}

/** Only non-default values reach the URL, so a fresh visit keeps a clean /admin. */
export function serializeTableQuery(state) {
  const params = new URLSearchParams()
  if (state.query) params.set('q', state.query)
  if (state.category !== 'all') params.set('cat', state.category)
  if (state.neverViewed) params.set('never', '1')
  if (state.sort !== DEFAULT_TABLE.sort || state.direction !== defaultDirection(state.sort)) {
    params.set('sort', state.sort)
    params.set('dir', state.direction)
  }
  if (state.size !== DEFAULT_TABLE.size) params.set('size', String(state.size))
  if (state.page > 1) params.set('page', String(state.page))
  const text = params.toString()
  return text ? `?${text}` : ''
}

/** Any filter change goes back to page 1; paging and sorting keep the rest. */
export function tableReducer(state, action) {
  switch (action.type) {
    case 'query':
      return { ...state, query: action.value, page: 1 }
    case 'category':
      return { ...state, category: action.value, page: 1 }
    case 'neverViewed':
      return { ...state, neverViewed: action.value, page: 1 }
    case 'sort':
      return state.sort === action.value
        ? { ...state, direction: state.direction === 'asc' ? 'desc' : 'asc', page: 1 }
        : { ...state, sort: action.value, direction: defaultDirection(action.value), page: 1 }
    case 'size':
      return { ...state, size: PAGE_SIZES.includes(action.value) ? action.value : state.size, page: 1 }
    case 'page':
      return { ...state, page: Math.max(1, action.value) }
    case 'reset':
      return { ...DEFAULT_TABLE, sort: state.sort, direction: state.direction, size: state.size }
    case 'replace':
      return action.value
    default:
      return state
  }
}

const textOf = (post, key, categoryTitles) =>
  key === 'category' ? (categoryTitles.get(post.category) ?? post.category) : post.title

function compareBy(key, direction, categoryTitles) {
  const sign = direction === 'asc' ? 1 : -1
  return (left, right) => {
    let order
    if (TEXT_KEYS.has(key)) {
      order = textOf(left, key, categoryTitles).localeCompare(textOf(right, key, categoryTitles), 'en', { sensitivity: 'base' })
    } else if (key === 'date') {
      // Undated counters (not in the catalog) always sink to the end.
      if (!left.date || !right.date) return (left.date ? -1 : 0) + (right.date ? 1 : 0)
      order = left.date.localeCompare(right.date)
    } else {
      order = left[key] - right[key]
    }
    return sign * order || right.views - left.views || left.id.localeCompare(right.id)
  }
}

/** Filtered and sorted rows, before paging. */
export function filterAndSort(posts, state, categoryTitles = new Map()) {
  const query = state.query.trim().toLocaleLowerCase()
  return posts
    .filter((post) => state.category === 'all' || post.category === state.category)
    .filter((post) => !state.neverViewed || (post.listed && post.views === 0))
    .filter((post) => !query || post.title.toLocaleLowerCase().includes(query) || post.id.includes(query))
    .sort(compareBy(state.sort, state.direction, categoryTitles))
}

/** One page of rows, with the page clamped to what exists. */
export function paginate(rows, page, size) {
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(Math.max(1, page), pageCount)
  const start = (current - 1) * size
  return { rows: rows.slice(start, start + size), page: current, pageCount, start, total: rows.length }
}

/** Page numbers to show, with null for a gap: 1 … 4 5 6 … 18. */
export function pageWindow(page, pageCount) {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1])
  const pages = [...wanted].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b)
  return pages.flatMap((n, index) => (index > 0 && n - pages[index - 1] > 1 ? [null, n] : [n]))
}

/** The page a post lands on under the given state, or null when filtered out. */
export function pageOfPost(sortedRows, postId, size) {
  const index = sortedRows.findIndex((post) => post.id === postId)
  return index < 0 ? null : Math.floor(index / size) + 1
}
