import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  collectionPagePath,
  pageCount,
  paginate,
  parsePageNumber,
} from '../src/lib/content/pagination.ts'
import {
  fetchVersionedSearchIndex,
  isBlogSearchIndex,
  isNotesSearchIndex,
  searchIndexRevisionFromUrl,
} from '../src/lib/content/search-index.ts'
import { boundPostStatsIds } from '../src/lib/engagement/post-stats-ids.ts'
import { createDeferredPostStatsStore } from '../src/lib/engagement/deferred-post-stats-store.ts'

test('static pagination arithmetic is bounded and keeps page one canonical', () => {
  const items = Array.from({ length: 20 }, (_, index) => index + 1)

  assert.equal(pageCount(0, 9), 1)
  assert.equal(pageCount(items.length, 9), 3)
  assert.deepEqual(paginate(items, 2, 9), {
    items: [10, 11, 12, 13, 14, 15, 16, 17, 18],
    page: 2,
    totalItems: 20,
    totalPages: 3,
    startIndex: 9,
  })
  assert.equal(paginate(items, 4, 9), null)
  assert.equal(parsePageNumber('02'), 2)
  assert.equal(parsePageNumber('2x'), null)
  assert.equal(collectionPagePath('/blog', 1), '/blog')
  assert.equal(collectionPagePath('/blog/', 3), '/blog/page/3')
})

test('archive stats ids are deduplicated and bounded without provider code', () => {
  assert.deepEqual(
    boundPostStatsIds(['blog__a', '', 'blog__a', 'blog__b'], 2),
    ['blog__a', 'blog__b'],
  )
  assert.deepEqual(boundPostStatsIds(['blog__a'], 0), [])
  assert.deepEqual(boundPostStatsIds(['blog__a'], Number.NaN), [])
})

function deferredStatsRead() {
  let resolve
  let reject
  const promise = new Promise((next, fail) => {
    resolve = next
    reject = fail
  })
  return { promise, reject, resolve }
}

async function flushPromiseQueue() {
  for (let index = 0; index < 8; index += 1) await Promise.resolve()
}

test('overlapping deferred stats reads use one active batch and read each id once', async () => {
  const calls = []
  const reads = []
  const store = createDeferredPostStatsStore(async (ids) => {
    calls.push([...ids])
    const read = deferredStatsRead()
    reads.push(read)
    return read.promise
  }, { batchSize: 2, cacheLimit: 8 })

  store.request(['blog__a', 'blog__b'])
  await flushPromiseQueue()
  store.request(['blog__b', 'blog__c'])
  store.request(['blog__b', 'blog__c'])

  assert.equal(store.activeBatchCount(), 1)
  assert.deepEqual(store.activeIds(), ['blog__a', 'blog__b'])
  assert.deepEqual(store.queuedIds(), ['blog__c'])
  assert.deepEqual(calls, [['blog__a', 'blog__b']])

  reads[0].resolve(new Map([['blog__a', { views: 100 }], ['blog__b', { views: 200 }]]))
  await flushPromiseQueue()
  assert.deepEqual(calls, [['blog__a', 'blog__b'], ['blog__c']])
  assert.deepEqual(store.activeIds(), ['blog__c'])

  reads[1].resolve(new Map([['blog__c', { views: 300 }]]))
  await store.whenIdle()
  assert.deepEqual(
    calls.flat().reduce((counts, id) => counts.set(id, (counts.get(id) ?? 0) + 1), new Map()),
    new Map([
      ['blog__a', 1],
      ['blog__b', 1],
      ['blog__c', 1],
    ]),
  )
  assert.equal(store.get('blog__c'), 300)
  assert.equal(store.get('blog__a'), 100)
  assert.equal(store.get('blog__b'), 200)
  assert.deepEqual(store.pendingIds(), [])
  assert.deepEqual(store.queuedIds(), [])
})

test('rapid archive churn keeps one page active, one latest page queued, and loads the final view', async () => {
  const calls = []
  const reads = []
  const store = createDeferredPostStatsStore(async (ids) => {
    calls.push([...ids])
    const read = deferredStatsRead()
    reads.push(read)
    return read.promise
  }, { batchSize: 3, cacheLimit: 12 })

  const pageIds = (page) => Array.from({ length: 3 }, (_, index) => `page-${page}__${index}`)
  store.request(pageIds(0))
  await flushPromiseQueue()

  for (let page = 1; page <= 100; page += 1) {
    store.request(pageIds(page))
    assert.equal(store.activeBatchCount(), 1)
    assert.ok(store.pendingIds().length <= 3)
    assert.ok(store.queuedIds().length <= 3)
    assert.ok(store.outstandingIds().length <= 6)
  }
  assert.deepEqual(calls, [pageIds(0)])
  assert.deepEqual(store.queuedIds(), pageIds(100))

  reads[0].resolve(new Map(pageIds(0).map((id) => [id, { views: 1 }])))
  await flushPromiseQueue()
  assert.deepEqual(calls, [pageIds(0), pageIds(100)])

  reads[1].resolve(new Map(pageIds(100).map((id) => [id, { views: 100 }])))
  await store.whenIdle()
  for (const id of pageIds(100)) assert.equal(store.get(id), 100)
  assert.equal(store.activeBatchCount(), 0)
  assert.deepEqual(store.pendingIds(), [])
  assert.deepEqual(store.queuedIds(), [])
  assert.ok(store.resolvedSize() <= 12)
})

test('failed active stats reads release pending ids and continue with the latest view', async () => {
  const calls = []
  const reads = []
  const store = createDeferredPostStatsStore(async (ids) => {
    calls.push([...ids])
    const read = deferredStatsRead()
    reads.push(read)
    return read.promise
  }, { batchSize: 2, cacheLimit: 8 })

  store.request(['old__a', 'old__b'])
  await flushPromiseQueue()
  store.request(['latest__a', 'latest__b'])
  reads[0].reject(new Error('provider unavailable'))
  await flushPromiseQueue()

  assert.deepEqual(calls, [
    ['old__a', 'old__b'],
    ['latest__a', 'latest__b'],
  ])
  assert.deepEqual(store.pendingIds(), ['latest__a', 'latest__b'])
  assert.deepEqual(store.queuedIds(), [])

  reads[1].resolve(new Map([['latest__a', { views: 5 }], ['latest__b', { views: 6 }]]))
  await store.whenIdle()
  assert.equal(store.get('latest__a'), 5)
  assert.equal(store.get('latest__b'), 6)
  assert.deepEqual(store.outstandingIds(), [])

})

test('search index guards reject malformed or oversized-card contracts', () => {
  const revision = '0123456789abcdef'
  const blogItem = {
    slug: 'ports-and-adapters',
    category: 'architecture',
    title: 'Ports and Adapters',
    summary: 'A practical introduction.',
    date: '2026-01-01',
    readingMinutes: 8,
    tags: ['architecture'],
  }
  const noteItem = {
    slug: 'steady-work',
    title: 'Steady work',
    summary: 'A note about patient progress.',
    date: '2026-01-02',
    readingMinutes: 4,
    tags: ['work'],
    topic: 'work',
  }

  assert.equal(isBlogSearchIndex({ version: 1, revision, items: [blogItem] }), true)
  assert.equal(isNotesSearchIndex({ version: 1, revision, items: [noteItem] }), true)
  assert.equal(
    isBlogSearchIndex({ version: 1, revision, items: [blogItem] }, 'fedcba9876543210'),
    false,
  )
  assert.equal(isBlogSearchIndex({ version: 2, revision, items: [blogItem] }), false)
  assert.equal(isBlogSearchIndex({ version: 1, items: [blogItem] }), false)
  assert.equal(
    isBlogSearchIndex({ version: 1, revision, items: [{ ...blogItem, tags: 'bad' }] }),
    false,
  )
  assert.equal(
    isNotesSearchIndex({
      version: 1,
      revision,
      items: [{ ...noteItem, readingMinutes: '4' }],
    }),
    false,
  )
})

test('runtime archive search probes derive a deterministic strict-subset query from the index', async () => {
  const { deriveArchiveSearchQuery } = await import('../scripts/verify-runtime-boundaries.mjs')
  const index = {
    items: [
      { title: 'Alpha Boundary', summary: 'First item', tags: ['Systems'] },
      { title: 'Beta Queue', summary: 'Second item', tags: ['Delivery'] },
      { title: 'Gamma Boundary', summary: 'Third item', tags: ['Systems'] },
    ],
  }

  assert.deepEqual(deriveArchiveSearchQuery(index), {
    matchCount: 1,
    query: 'alpha',
    totalItems: 3,
  })
  assert.throws(
    () => deriveArchiveSearchQuery({ items: [{ title: 'Same' }] }),
    /strict-subset query/,
  )
})

test('revisioned search fetch rejects stale data, aborts cleanly, and fails soft', async () => {
  const revision = '0123456789abcdef'
  const url = `/en/search/blog.json?v=${revision}`
  const item = {
    slug: 'ports-and-adapters',
    category: 'architecture',
    title: 'Ports and Adapters',
    summary: 'A practical introduction.',
    date: '2026-01-01',
    readingMinutes: 8,
    tags: ['architecture'],
  }

  assert.equal(searchIndexRevisionFromUrl(url), revision)
  assert.equal(searchIndexRevisionFromUrl('/en/search/blog.json'), null)

  const stale = await fetchVersionedSearchIndex(
    url,
    isBlogSearchIndex,
    undefined,
    async () => new Response(JSON.stringify({
      version: 1,
      revision: 'fedcba9876543210',
      items: [item],
    })),
  )
  assert.equal(stale, null)

  const networkFailure = await fetchVersionedSearchIndex(
    url,
    isBlogSearchIndex,
    undefined,
    async () => { throw new Error('offline') },
  )
  assert.equal(networkFailure, null)

  const controller = new AbortController()
  const aborted = fetchVersionedSearchIndex(
    url,
    isBlogSearchIndex,
    controller.signal,
    async (_input, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    }),
  )
  controller.abort()
  assert.equal(await aborted, null)
})

test('archive routes and explorers keep pagination crawlable and search progressive', async () => {
  const [
    blogRoute,
    notesRoute,
    blogCollection,
    notesCollection,
    pagination,
    blogExplorer,
    notesExplorer,
    blogSearchRoute,
    notesSearchRoute,
    explorerShell,
    explorerEngine,
    deferredPostStats,
    deferredPostStatsStore,
    postStatsIds,
    firebaseRepository,
    paginationVerifier,
    frontendWorkflow,
    pagesWorkflow,
  ] = await Promise.all([
    readFile('src/app/[locale]/(site)/blog/page/[page]/page.tsx', 'utf8'),
    readFile('src/app/[locale]/(site)/notes/page/[page]/page.tsx', 'utf8'),
    readFile('src/components/blog/BlogCollectionPage.tsx', 'utf8'),
    readFile('src/components/notes/NotesCollectionPage.tsx', 'utf8'),
    readFile('src/components/blog/BlogPagination.tsx', 'utf8'),
    readFile('src/components/blog/BlogExplorer.tsx', 'utf8'),
    readFile('src/components/notes/NotesExplorer.tsx', 'utf8'),
    readFile('src/app/[locale]/(site)/search/blog.json/route.ts', 'utf8'),
    readFile('src/app/[locale]/(site)/search/notes.json/route.ts', 'utf8'),
    readFile('src/components/explorer/ExplorerShell.tsx', 'utf8'),
    readFile('src/components/explorer/useExplorer.ts', 'utf8'),
    readFile('src/components/explorer/useDeferredPostStats.ts', 'utf8'),
    readFile('src/lib/engagement/deferred-post-stats-store.ts', 'utf8'),
    readFile('src/lib/engagement/post-stats-ids.ts', 'utf8'),
    readFile('src/lib/engagement/firebase-repository.ts', 'utf8'),
    readFile('scripts/verify-content-pagination.mjs', 'utf8'),
    readFile('.github/workflows/ci-frontend.yml', 'utf8'),
    readFile('.github/workflows/nextjs.yml', 'utf8'),
  ])

  for (const route of [blogRoute, notesRoute]) {
    assert.match(
      route,
      /generateStaticParams\(\) \{\s+if \(process\.env\.NODE_ENV === ["']development["']\) return \[\]/,
    )
    assert.doesNotMatch(route, /export const dynamicParams = false/)
    assert.match(route, /parsePageNumber/)
  }

  for (const route of [blogSearchRoute, notesSearchRoute]) {
    assert.match(
      route,
      /generateStaticParams\(\) \{\s+if \(process\.env\.NODE_ENV === ["']development["']\) return \[\]/,
    )
    assert.doesNotMatch(route, /export const dynamicParams = false/)
  }

  assert.match(blogSearchRoute, /return routing\.locales\.map/)
  assert.match(notesSearchRoute, /return NOTE_CONTENT_LOCALES\.map/)
  assert.match(notesSearchRoute, /listNotes\(locale\)/)
  assert.doesNotMatch(notesSearchRoute, /return routing\.locales\.map/)

  for (const collection of [blogCollection, notesCollection]) {
    assert.match(collection, /mainEntity:\s*\{/)
    assert.match(collection, /'@type': 'ItemList'/)
    assert.match(collection, /pageData\.items\.map/)
    assert.match(collection, /currentPage=\{page\}/)
    assert.match(collection, /totalItems=\{pageData\.totalItems\}/)
  }

  assert.match(pagination, /<Link/)
  assert.match(pagination, /href=\{pageHref\(page\)\}/)
  assert.match(pagination, /locale=\{linkLocale\}/)
  assert.match(pagination, /aria-current=\{page === current \? "page"/)

  assert.match(notesCollection, /const archiveLocale = NOTE_CONTENT_LOCALES\.includes/)
  assert.match(notesCollection, /archiveLocale=\{archiveLocale\}/)
  assert.match(notesCollection, /versionedSearchIndexUrl\(\s*archiveLocale,\s*'notes'/)
  assert.match(notesExplorer, /linkLocale: archiveLocale/)
  assert.match(notesExplorer, /contentLocale=\{archiveLocale\}/)

  assert.match(paginationVerifier, /const NOTE_ARCHIVE_LOCALES = new Set\(\['en', 'vi'\]\)/)
  assert.match(paginationVerifier, /const expectedSearchArtifacts = \{ blog: locales, notes: \['en', 'vi'\] \}/)
  assert.match(paginationVerifier, /unexpected search artifact/)
  assert.match(
    paginationVerifier,
    /const fullArchive = surface === 'blog' \|\| NOTE_ARCHIVE_LOCALES\.has\(locale\)/,
  )
  assert.match(paginationVerifier, /pagination href \$\{pagerLink\} has no exported HTML/)
  assert.match(paginationVerifier, /policy: fullArchive \? 'full' : 'landing-only'/)
  assert.match(paginationVerifier, /\{ locale: 'fr', expectsHub: false \}/)
  assert.match(paginationVerifier, /\{ locale: 'ja', expectsHub: false \}/)
  assert.match(paginationVerifier, /\{ locale: 'en', expectsHub: true \}/)
  assert.match(paginationVerifier, /\{ locale: 'vi', expectsHub: true \}/)
  assert.match(paginationVerifier, /Article isPartOf must remain the localized Blog/)
  assert.match(paginationVerifier, /Article isPartOf must reference its localized series hub/)

  for (const workflow of [frontendWorkflow, pagesWorkflow]) {
    const artifactGate = workflow.indexOf('run: npm run verify:artifact')
    const paginationGate = workflow.indexOf('run: npm run verify:pagination')
    const offlineGate = workflow.indexOf('run: npm run verify:offline')
    assert.ok(artifactGate >= 0)
    assert.ok(paginationGate > artifactGate)
    assert.ok(offlineGate > paginationGate)
    assert.equal(workflow.match(/run: npm run verify:pagination/g)?.length, 1)
  }

  for (const explorer of [blogExplorer, notesExplorer]) {
    assert.match(explorer, /fetchVersionedSearchIndex/)
    assert.match(explorer, /searchLoadRef/)
    assert.match(explorer, /AbortController/)
    assert.match(explorer, /useDeferredPostStats/)
    assert.match(explorer, /signalBrowsingIntent/)
    assert.doesNotMatch(explorer, /getAllPostStats/)
    assert.match(explorer, /explorer\.initialSearchIntent/)
    assert.doesNotMatch(explorer, /new URLSearchParams\(window\.location\.search\)/)
    assert.match(explorer, /searchFailed: searchStatus === 'error'/)
  }

  assert.match(explorerShell, /onFocus=\{\(\) => \{\s*onSearchIntent\(\)/)
  assert.match(explorerShell, /onChange=\{\(e\) => \{\s*onSearchIntent\(\)/)
  assert.match(explorerShell, /data-explorer-result-count=\{count\}/)
  assert.match(explorerShell, /data-search-status=\{searchStatus\}/)
  assert.match(explorerEngine, /setUrlStateRestored\(true\)/)
  assert.match(explorerEngine, /!urlStateRestored \|\| debouncedQuery !== view\.query/)
  assert.match(explorerEngine, /initialSearchIntent/)
  assert.doesNotMatch(explorerEngine, /restoredSearchIntent/)
  assert.doesNotMatch(explorerEngine, /hydratedFromUrl/)
  assert.match(deferredPostStats, /createDeferredPostStatsStore/)
  assert.match(deferredPostStats, /store\.request\(boundedIds\)/)
  assert.match(deferredPostStats, /batchSize: CONTENT_PAGE_SIZE/)
  assert.match(deferredPostStats, /cacheLimit: RESOLVED_STATS_CACHE_LIMIT/)
  assert.doesNotMatch(deferredPostStats, /store\.prune/)
  assert.match(deferredPostStats, /boundPostStatsIds\(ids, CONTENT_PAGE_SIZE\)/)
  assert.match(deferredPostStatsStore, /let activeBatch: ActiveBatch \| null = null/)
  assert.match(deferredPostStatsStore, /let queuedIds: readonly string\[\] = \[\]/)
  assert.match(deferredPostStatsStore, /queuedIds = latestVisibleIds\.filter/)
  assert.match(deferredPostStatsStore, /\.catch\(\(\) => new Map<string, DeferredPostStatsValue>\(\)\)/)
  assert.doesNotMatch(deferredPostStatsStore, /const pending = new Map/)
  assert.match(postStatsIds, /\.slice\(0, limit\)/)
  assert.match(postStatsIds, /Number\.isSafeInteger\(limit\)/)
  assert.match(firebaseRepository, /Promise\.allSettled/)
  assert.doesNotMatch(firebaseRepository, /getDocs\(collection/)

  for (const route of [blogSearchRoute, notesSearchRoute]) {
    assert.match(route, /export async function GET/)
    assert.match(route, /Response\.json\(index/)
    assert.match(route, /generateStaticParams/)
    assert.match(route, /createSearchIndex/)
  }
})

test('all locales carry page-aware metadata and search failure copy', async () => {
  for (const locale of ['en', 'vi', 'zh', 'ja', 'ko', 'fr']) {
    const messages = JSON.parse(await readFile(`messages/${locale}.json`, 'utf8'))
    for (const surface of ['blog', 'notes']) {
      const controls = messages.Pages[surface].controls
      assert.equal(typeof controls.searchUnavailable, 'string')
      assert.ok(controls.searchUnavailable.length > 20)
      assert.match(controls.pagination.pageLabel, /\{page\}/)
      assert.match(controls.pagination.pageLabel, /\{total\}/)
      assert.match(controls.pagination.pageDescription, /\{page\}/)
      assert.match(controls.pagination.pageDescription, /\{total\}/)
    }
  }
})
