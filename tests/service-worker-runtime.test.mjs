import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'

import { measureOfflineShell } from '../scripts/lib/offline-shell-budget.mjs'
import { generateOfflineArtifacts, installRequiredShell } from '../scripts/postbuild-offline.mjs'

const ORIGIN = 'https://site.test'
const LOCALES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr']

async function buildFixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'sw-runtime-'))
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  const outDir = path.join(root, 'out')
  const files = {
    'index.html': '<main>root</main>',
    '404.html': '<main>not found</main>',
    '_not-found.html': '<main>not found</main>',
    'favicon.ico': 'ico',
    'icon.png': 'png',
    'apple-icon.png': 'png',
    'manifest.webmanifest': '{}',
    '_next/static/chunks/app.js': 'app',
    '_next/static/chunks/offline.js': 'offline',
  }
  for (const locale of LOCALES) {
    files[`${locale}.html`] =
      `<a href="/resume.pdf">cv</a><script src="/_next/static/chunks/app.js"></script><main>${locale} home</main>`
    files[`${locale}/offline.html`] = '<script src="/_next/static/chunks/offline.js"></script><main>offline</main>'
    files[`${locale}/about.html`] = `<main>${locale} about</main>`
  }
  files['resume.pdf'] = 'pdf'
  for (const [relativePath, body] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(outDir, relativePath)), { recursive: true })
    await fs.writeFile(path.join(outDir, relativePath), body)
  }
  const { manifest } = await generateOfflineArtifacts({ outDir })
  const source = await fs.readFile(path.join(outDir, 'sw.js'), 'utf8')
  return { manifest, outDir, source }
}

class FakeCache {
  entries = new Map()
  key(request) {
    return new URL(typeof request === 'string' ? request : request.url, ORIGIN).href
  }
  async match(request) {
    return this.entries.get(this.key(request))?.clone()
  }
  async put(request, response) {
    this.entries.set(this.key(request), response.clone())
  }
  async delete(request) {
    return this.entries.delete(this.key(request))
  }
}

function createWorker({ source, outDir, clientUrls = [], store = new Map(), stallNetwork = false }) {
  const handlers = {}
  const fetchLog = []
  const caches = {
    open: async (name) => {
      if (!store.has(name)) store.set(name, new FakeCache())
      return store.get(name)
    },
    has: async (name) => store.has(name),
    delete: async (name) => store.delete(name),
    keys: async () => [...store.keys()],
    match: async (request) => {
      for (const cache of store.values()) {
        const hit = await cache.match(request)
        if (hit) return hit
      }
      return undefined
    },
  }
  const fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, ORIGIN)
    fetchLog.push({ path: url.pathname + url.search, cache: options.cache ?? null })
    if (stallNetwork) return new Promise(() => {})
    try {
      const body = await fs.readFile(path.join(outDir, decodeURIComponent(url.pathname).slice(1)))
      return new Response(body, { status: 200 })
    } catch {
      return new Response('missing', { status: 404 })
    }
  }
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type, handler) => {
      handlers[type] = handler
    },
    skipWaiting: async () => {},
    clients: {
      matchAll: async () => clientUrls.map((url) => ({ url: `${ORIGIN}${url}`, postMessage() {} })),
      claim: async () => {},
    },
  }
  vm.runInNewContext(source, {
    self,
    caches,
    fetch,
    Response,
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    encodeURIComponent,
    decodeURIComponent,
  })

  const dispatch = async (type, event) => {
    let pending = null
    handlers[type]({
      ...event,
      waitUntil: (promise) => {
        pending = promise
      },
      respondWith: (promise) => {
        pending = promise
      },
    })
    return pending
  }
  return { dispatch, fetchLog, store }
}

const navigate = (pathname) => ({ request: { method: 'GET', mode: 'navigate', url: `${ORIGIN}${pathname}` } })

test('installRequiredShell adds only the requested locale shells to the required set', async () => {
  const manifest = {
    shared: { shell: ['/offline-manifest.json', '/404.html'], pageVersions: {} },
    localeShells: { en: ['/en.html', '/en/offline.html'], vi: ['/vi.html', '/vi/offline.html'] },
  }
  let requested = []
  await installRequiredShell({
    manifest,
    locales: ['vi'],
    shellCacheName: 'shell',
    shellCachePreexisted: false,
    openCache: async () => ({}),
    deleteCache: async () => {},
    cacheFiles: async (_cache, urls) => {
      requested = urls
      return { requested: urls.length, fulfilled: urls.length, failed: 0 }
    },
    skipWaiting: async () => {},
  })
  assert.deepEqual(requested, ['/offline-manifest.json', '/404.html', '/vi.html', '/vi/offline.html'])
})

test('first install caches only the open locale and reuses the HTTP cache', async (t) => {
  const { manifest, outDir, source } = await buildFixture(t)
  assert.equal(manifest.shared.shell.includes('/resume.pdf'), false, '<a href> targets are not shell assets')
  const worker = createWorker({ source, outDir, clientUrls: ['/vi/about'] })
  await worker.dispatch('install', {})

  const fetched = worker.fetchLog.map((entry) => entry.path.split('?')[0])
  assert.ok(fetched.includes('/vi.html'))
  assert.ok(fetched.includes('/vi/offline.html'))
  for (const locale of LOCALES.filter((value) => value !== 'vi')) {
    assert.equal(fetched.includes(`/${locale}.html`), false, `${locale} home must not be precached`)
  }
  assert.equal(new Set(fetched).size, fetched.length, 'no same-origin path is fetched twice')
  for (const entry of worker.fetchLog) {
    // Only the manifest bypasses the HTTP cache; shell files reuse what the page loaded.
    assert.equal(entry.cache, entry.path === '/offline-manifest.json' ? 'no-store' : null, entry.path)
  }

  // Warming the page the visitor is on reuses the install shell copy.
  await worker.dispatch('message', { data: { type: 'OFFLINE_WARM_PATH', pathname: '/vi' } })
  const afterWarm = worker.fetchLog.map((entry) => entry.path.split('?')[0])
  assert.equal(afterWarm.filter((value) => value === '/vi.html').length, 1)

  // A later visit to another locale warms that locale's shell lazily.
  await worker.dispatch('message', { data: { type: 'OFFLINE_WARM_PATH', pathname: '/ja/about' } })
  assert.ok(worker.fetchLog.some((entry) => entry.path.startsWith('/ja/offline.html')))
})

test('cached navigations return without waiting for a stalled network', async (t) => {
  const { outDir, source } = await buildFixture(t)
  const online = createWorker({ source, outDir, clientUrls: ['/en'] })
  await online.dispatch('install', {})
  await online.dispatch('activate', {})

  const stalled = createWorker({ source, outDir, store: online.store, stallNetwork: true })
  const started = performance.now()
  const response = await stalled.dispatch('fetch', navigate('/en'))
  const elapsed = performance.now() - started
  assert.match(await response.text(), /en home/)
  assert.ok(elapsed < 100, `cached navigation took ${elapsed.toFixed(1)} ms`)
  assert.equal(stalled.fetchLog.length, 0, 'a cache hit must not touch the network')
})

test('activation keeps exactly one previous generation for open tabs on the old build', async (t) => {
  const { outDir, source } = await buildFixture(t)
  const store = new Map()
  const oldChunk = new FakeCache()
  await oldChunk.put('/_next/static/chunks/old-lazy.js', new Response('old lazy chunk'))
  store.set('offline-content-gen1', oldChunk)
  store.set('offline-shell-gen0', new FakeCache())
  const generation = new FakeCache()
  await generation.put(
    '/__offline-generation',
    new Response(JSON.stringify({ current: 'gen1', previous: 'gen0' })),
  )
  store.set('offline-generation', generation)
  store.set('offline-content', new FakeCache())

  const worker = createWorker({ source, outDir, store, clientUrls: ['/en'] })
  await worker.dispatch('install', {})
  await worker.dispatch('activate', {})

  const names = [...store.keys()]
  assert.ok(names.includes('offline-content-gen1'), 'previous generation is kept')
  assert.equal(names.includes('offline-shell-gen0'), false, 'older generations are removed')
  assert.equal(names.includes('offline-content'), false, 'legacy caches are removed')

  const response = await worker.dispatch('fetch', {
    request: { method: 'GET', mode: 'no-cors', url: `${ORIGIN}/_next/static/chunks/old-lazy.js` },
  })
  assert.equal(await response.text(), 'old lazy chunk')
})

test('offline shell budget counts what the worker downloads beyond the home page', async (t) => {
  const { outDir } = await buildFixture(t)
  const measured = await measureOfflineShell(outDir, 'en')
  const urls = measured.files.map((file) => file.url)
  assert.ok(urls.includes('/sw.js'))
  assert.ok(urls.includes('/offline-manifest.json'))
  assert.ok(urls.includes('/en/offline.html'))
  assert.ok(urls.includes('/_next/static/chunks/offline.js'), 'chunks only the offline page uses are downloaded')
  assert.equal(urls.includes('/_next/static/chunks/app.js'), false, 'chunks the home page loaded come from the HTTP cache')
  assert.equal(urls.includes('/vi.html'), false)
  assert.equal(measured.gzipBytes, measured.files.reduce((total, file) => total + file.gzipBytes, 0))
  await assert.rejects(measureOfflineShell(outDir, 'xx'), /no locale shell for xx/)
})

test('a navigation is cached only when the page carries this build manifest version', async (t) => {
  const { manifest, outDir, source } = await buildFixture(t)
  const cachedAboutKeys = (store) =>
    [...store.values()].flatMap((cache) => [...cache.entries.keys()]).filter((key) => key.includes('/about'))
  const page = (version) => `<head><meta name="offline-manifest-version" content="${version}"></head><main>about</main>`

  await fs.writeFile(path.join(outDir, 'en/about.html'), page('an-older-deploy'))
  const stale = createWorker({ source, outDir, clientUrls: ['/en'] })
  await stale.dispatch('install', {})
  await stale.dispatch('activate', {})
  const staleResponse = await stale.dispatch('fetch', navigate('/en/about.html'))
  assert.match(await staleResponse.text(), /about/, 'the fresh page is still served')
  assert.deepEqual(cachedAboutKeys(stale.store), [], 'a page from another deploy is not cached')

  await fs.writeFile(path.join(outDir, 'en/about.html'), page(manifest.version))
  const current = createWorker({ source, outDir, clientUrls: ['/en'] })
  await current.dispatch('install', {})
  await current.dispatch('activate', {})
  await current.dispatch('fetch', navigate('/en/about.html'))
  assert.ok(cachedAboutKeys(current.store).length > 0, 'a page from this build is cached')
})
