import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { runPostbuildTransforms } from '../scripts/postbuild.mjs'
import { installRequiredShell, pageVersionForHtml } from '../scripts/postbuild-offline.mjs'

const LOCALES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr']
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

async function createFixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'postbuild-pwa-scale-'))
  const outDir = path.join(root, 'out')
  const nextDir = path.join(root, '.next')
  const chunksDir = path.join(outDir, '_next/static/chunks')
  await Promise.all([
    fs.mkdir(chunksDir, { recursive: true }),
    fs.mkdir(nextDir, { recursive: true }),
  ])
  t.after(() => fs.rm(root, { recursive: true, force: true }))

  await Promise.all([
    fs.writeFile(path.join(outDir, 'favicon.ico'), Buffer.from('ico')),
    fs.writeFile(path.join(outDir, '404.html'), '<main>not found</main>'),
    fs.writeFile(path.join(outDir, '_not-found.html'), '<main>not found</main>'),
    fs.writeFile(path.join(outDir, 'icon.png'), PNG),
    fs.writeFile(path.join(outDir, 'apple-icon.png'), PNG),
    fs.writeFile(path.join(outDir, 'manifest.webmanifest'), '{}'),
    fs.writeFile(path.join(outDir, 'opengraph-image'), PNG),
    fs.mkdir(path.join(outDir, 'en'), { recursive: true }).then(() =>
      fs.writeFile(path.join(outDir, 'en/opengraph-image'), PNG),
    ),
    fs.writeFile(path.join(chunksDir, 'shared.js'), 'globalThis.shared = true'),
    fs.writeFile(path.join(chunksDir, 'offline.js'), 'globalThis.offline = true'),
    fs.writeFile(path.join(chunksDir, 'studio-reactflow.js'), 'ReactFlowProvider'),
    fs.writeFile(path.join(chunksDir, 'studio-recharts.js'), 'const library = "recharts"'),
    fs.writeFile(
      path.join(outDir, 'index.html'),
      '<link rel="preload" href="/_next/static/chunks/shared.js"><meta property="og:image" content="/opengraph-image"><main>home</main>',
    ),
  ])
  await fs.writeFile(
    path.join(nextDir, 'prerender-manifest.json'),
    JSON.stringify({
      version: 4,
      routes: Object.fromEntries(
        ['/opengraph-image', '/en/opengraph-image'].map((route) => [
          route,
          {
            initialHeaders: { 'content-type': 'image/png' },
            srcRoute: route,
          },
        ]),
      ),
      dynamicRoutes: {},
      notFoundRoutes: [],
      preview: {},
    }),
  )

  for (const locale of LOCALES) {
    await fs.mkdir(path.join(outDir, locale, 'notes'), { recursive: true })
    await Promise.all([
      fs.writeFile(
        path.join(outDir, locale, 'offline.html'),
        '<script src="/_next/static/chunks/shared.js"></script><script src="/_next/static/chunks/offline.js"></script><main class="offline-page-shell">offline</main>',
      ),
      fs.writeFile(
        path.join(outDir, `${locale}.html`),
        locale === 'en'
          ? '<meta property="og:image" content="/en/opengraph-image"><main>en home</main>'
          : `<main>${locale} home</main>`,
      ),
      fs.writeFile(path.join(outDir, locale, 'notes/read.html'), `<main>${locale} read</main>`),
      fs.writeFile(
        path.join(outDir, locale, 'studio.html'),
        '<script src="/_next/static/chunks/studio-reactflow.js"></script><script src="/_next/static/chunks/studio-recharts.js"></script>',
      ),
    ])
  }

  return { nextDir, outDir }
}

test('one postbuild inventory produces a minimal install shell and on-demand runtime ownership', async (t) => {
  const { nextDir, outDir } = await createFixture(t)
  const result = await runPostbuildTransforms({ nextDir, outDir })
  const manifest = result.offline.manifest
  const shell = new Set(manifest.shared.shell)

  assert.equal(result.inventory.walks, 1)
  assert.ok(result.inventory.cacheHits > 0, 'offline transform should reuse OG transform reads')
  assert.equal(result.og.deduplicated.length, 1)
  await assert.rejects(fs.access(path.join(outDir, 'en/opengraph-image.png')))
  const finalEnglishHtml = await fs.readFile(path.join(outDir, 'en.html'), 'utf8')
  assert.match(finalEnglishHtml, /content="\/opengraph-image\.png"/)
  assert.equal(manifest.shared.pageVersions['/en.html'], pageVersionForHtml('en.html', finalEnglishHtml))
  assert.equal(JSON.stringify(manifest).includes('/en/opengraph-image'), false)
  for (const entries of [manifest.shared.shell, ...Object.values(manifest.locales)]) {
    assert.deepEqual(entries, [...new Set(entries)].sort())
  }
  assert.ok(shell.has('/index.html'))
  assert.ok(shell.has('/404.html'))
  assert.ok(shell.has('/_not-found.html'))
  assert.ok(shell.has('/en/offline.html'))
  assert.ok(shell.has('/_next/static/chunks/shared.js'))
  assert.ok(shell.has('/_next/static/chunks/offline.js'))
  assert.equal(shell.has('/_next/static/chunks/studio-reactflow.js'), false)
  assert.equal(shell.has('/_next/static/chunks/studio-recharts.js'), false)
  assert.ok(manifest.shared.runtimeAssets.includes('/_next/static/chunks/studio-reactflow.js'))
  assert.ok(manifest.shared.runtimeAssets.includes('/_next/static/chunks/studio-recharts.js'))

  const serviceWorker = await fs.readFile(path.join(outDir, 'sw.js'), 'utf8')
  assert.match(serviceWorker, /studio-reactflow\.js/)
  assert.match(serviceWorker, /studio-recharts\.js/)
  assert.match(serviceWorker, /cacheFirst\(request, CONTENT_CACHE, cacheKey, \[SHELL_CACHE\]\)/)
  assert.match(serviceWorker, /await installRequiredShell\(\{/)
  assert.match(serviceWorker, /const shellCachePreexisted = await caches\.has\(SHELL_CACHE\)/)
  assert.ok(manifest.locales.en.includes('/en/notes/read.html'))
})

test('required shell failures reject install, remove partial cache, and retry cleanly', async (t) => {
  const shell = ['/offline-manifest.json', '/en/offline.html', '/en.html', '/icon.png']
  const manifest = { shared: { shell, pageVersions: {} } }

  for (const failedUrl of ['/en/offline.html', '/en.html', '/icon.png']) {
    await t.test(failedUrl, async () => {
      const caches = new Map()
      let attempt = 0
      let skipWaitingCalls = 0

      const openCache = async (cacheName) => {
        const cache = { entries: new Set() }
        if (!caches.has(cacheName)) caches.set(cacheName, cache)
        return caches.get(cacheName)
      }
      const deleteCache = async (cacheName) => caches.delete(cacheName)
      const cacheFiles = async (cache, urls) => {
        attempt += 1
        const failed = attempt === 1 ? failedUrl : null
        for (const url of urls) {
          if (url !== failed) cache.entries.add(url)
        }
        return {
          requested: urls.length,
          fulfilled: urls.length - (failed ? 1 : 0),
          failed: failed ? 1 : 0,
        }
      }
      const skipWaiting = async () => {
        skipWaitingCalls += 1
      }

      await assert.rejects(
        installRequiredShell({
          manifest,
          shellCacheName: 'offline-shell-test',
          shellCachePreexisted: false,
          openCache,
          deleteCache,
          cacheFiles,
          skipWaiting,
        }),
        /required shell cache incomplete/,
      )
      assert.equal(caches.has('offline-shell-test'), false)
      assert.equal(skipWaitingCalls, 0)

      const retry = await installRequiredShell({
        manifest,
        shellCacheName: 'offline-shell-test',
        shellCachePreexisted: false,
        openCache,
        deleteCache,
        cacheFiles,
        skipWaiting,
      })
      assert.deepEqual(retry, { requested: 4, fulfilled: 4, failed: 0 })
      assert.deepEqual([...caches.get('offline-shell-test').entries], shell)
      assert.equal(skipWaitingCalls, 1)
    })
  }
})

test('failed same-version refill preserves the active shell cache and retries safely', async () => {
  const cacheName = 'offline-shell-active'
  const shell = ['/offline-manifest.json', '/en/offline.html', '/en.html', '/icon.png']
  const manifest = { shared: { shell, pageVersions: {} } }
  const activeEntries = new Map([
    ['/offline-manifest.json', 'active-manifest'],
    ['/en/offline.html', 'active-fallback'],
    ['/en.html', 'active-home'],
  ])
  const caches = new Map([[cacheName, { entries: new Map(activeEntries) }]])
  let attempt = 0
  let deleteCalls = 0
  let skipWaitingCalls = 0

  const openCache = async (name) => caches.get(name)
  const deleteCache = async (name) => {
    deleteCalls += 1
    return caches.delete(name)
  }
  const cacheFiles = async (cache, urls) => {
    attempt += 1
    const stats = { requested: urls.length, fulfilled: 0, failed: 0 }
    for (const url of urls) {
      if (cache.entries.has(url)) {
        stats.fulfilled += 1
      } else if (attempt === 1 && url === '/icon.png') {
        stats.failed += 1
      } else {
        cache.entries.set(url, 'refilled')
        stats.fulfilled += 1
      }
    }
    return stats
  }
  const skipWaiting = async () => {
    skipWaitingCalls += 1
  }

  await assert.rejects(
    installRequiredShell({
      manifest,
      shellCacheName: cacheName,
      shellCachePreexisted: true,
      openCache,
      deleteCache,
      cacheFiles,
      skipWaiting,
    }),
    /required shell cache incomplete/,
  )
  assert.deepEqual(caches.get(cacheName).entries, activeEntries)
  assert.equal(deleteCalls, 0)
  assert.equal(skipWaitingCalls, 0)

  await installRequiredShell({
    manifest,
    shellCacheName: cacheName,
    shellCachePreexisted: true,
    openCache,
    deleteCache,
    cacheFiles,
    skipWaiting,
  })
  assert.equal(caches.get(cacheName).entries.get('/icon.png'), 'refilled')
  assert.equal(deleteCalls, 0)
  assert.equal(skipWaitingCalls, 1)
})
