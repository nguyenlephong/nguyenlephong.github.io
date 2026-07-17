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
    postStats,
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
    readFile('src/lib/firebase/postStats.ts', 'utf8'),
    readFile('scripts/verify-content-pagination.mjs', 'utf8'),
    readFile('.github/workflows/ci-frontend.yml', 'utf8'),
    readFile('.github/workflows/nextjs.yml', 'utf8'),
  ])

  for (const route of [blogRoute, notesRoute]) {
    assert.match(route, /export const dynamicParams = false/)
    assert.match(route, /generateStaticParams/)
    assert.match(route, /parsePageNumber/)
  }

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
  assert.match(notesCollection, /versionedSearchIndexUrl\(archiveLocale, 'notes'/)
  assert.match(notesExplorer, /linkLocale: archiveLocale/)
  assert.match(notesExplorer, /contentLocale=\{archiveLocale\}/)

  assert.match(paginationVerifier, /const NOTE_ARCHIVE_LOCALES = new Set\(\['en', 'vi'\]\)/)
  assert.match(
    paginationVerifier,
    /const fullArchive = surface === 'blog' \|\| NOTE_ARCHIVE_LOCALES\.has\(locale\)/,
  )
  assert.match(paginationVerifier, /pagination href \$\{pagerLink\} has no exported HTML/)
  assert.match(paginationVerifier, /policy: fullArchive \? 'full' : 'landing-only'/)

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
    assert.match(explorer, /getPostStatsByIds/)
    assert.doesNotMatch(explorer, /getAllPostStats/)
    assert.match(explorer, /params\.has\('q'\)/)
    assert.match(explorer, /searchFailed: searchStatus === 'error'/)
  }

  assert.match(explorerShell, /onFocus=\{\(\) => \{\s*onSearchIntent\(\)/)
  assert.match(explorerShell, /onChange=\{\(e\) => \{\s*onSearchIntent\(\)/)
  assert.match(postStats, /\.slice\(0, CONTENT_PAGE_SIZE\)/)
  assert.match(postStats, /Promise\.allSettled/)
  assert.doesNotMatch(postStats, /getDocs\(collection/)

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
