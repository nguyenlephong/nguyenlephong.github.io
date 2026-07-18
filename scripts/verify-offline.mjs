#!/usr/bin/env node
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { promises as fs, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')
const HOST = '127.0.0.1'
const PORT = Number(process.env.OFFLINE_VERIFY_PORT ?? '4173')
const LOCALE = process.env.OFFLINE_VERIFY_LOCALE ?? 'en'
const LOCALES = ['en', 'vi', 'zh', 'ja', 'ko', 'fr']
const SIBLING_ASSET_PATH = '/dom-pub/offline-probe.js'
const SIBLING_ASSET_BODY = 'sibling-project-network-response'

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
}

function hasExtension(value) {
  return path.posix.extname(value) !== ''
}

function isPathInside(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export function routeCandidates(requestPath) {
  let clean
  try {
    clean = decodeURIComponent(requestPath.split('?')[0] || '/')
  } catch {
    return []
  }
  if (clean.includes('\0')) return []

  if (clean === '/') return ['/index.html']
  if (hasExtension(clean)) return [clean]

  const normalized = clean.replace(/\/+$/, '')
  return [`${normalized}.html`, `${normalized}/index.html`]
}

export async function resolveFile(requestPath, outDir = OUT_DIR) {
  const outRealPath = await fs.realpath(outDir)
  for (const candidate of routeCandidates(requestPath)) {
    const relative = candidate.replace(/^\/+/, '')
    const fullPath = path.resolve(outRealPath, relative)
    if (!isPathInside(outRealPath, fullPath)) continue
    try {
      const realPath = await fs.realpath(fullPath)
      if (!isPathInside(outRealPath, realPath)) continue
      const stats = await fs.stat(realPath)
      if (stats.isFile()) return realPath
    } catch {
      // Try the next candidate.
    }
  }
  return null
}

function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream'
}

async function startStaticServer() {
  let originOffline = false
  const server = createServer(async (req, res) => {
    if (originOffline) {
      req.socket.destroy()
      return
    }

    const method = req.method ?? 'GET'
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405)
      res.end()
      return
    }

    if ((req.url ?? '').split('?')[0] === SIBLING_ASSET_PATH) {
      res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Content-Length': String(Buffer.byteLength(SIBLING_ASSET_BODY)),
        'Cache-Control': 'no-store',
      })
      res.end(method === 'HEAD' ? undefined : SIBLING_ASSET_BODY)
      return
    }

    const filePath = await resolveFile(req.url ?? '/')
    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not Found')
      return
    }

    const body = await fs.readFile(filePath)
    res.writeHead(200, {
      'Content-Type': contentTypeFor(filePath),
      'Content-Length': String(body.byteLength),
      // Browser HTTP cache must not mask service-worker cache behavior.
      'Cache-Control': 'no-store',
    })

    if (method === 'HEAD') {
      res.end()
      return
    }

    res.end(body)
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(PORT, HOST, () => resolve(undefined))
  })

  return {
    server,
    setOriginOffline(value) {
      originOffline = value
    },
  }
}

async function assertArtifacts() {
  const [manifestRaw, swSource, manifestRouteRaw] = await Promise.all([
    fs.readFile(path.join(OUT_DIR, 'offline-manifest.json'), 'utf8'),
    fs.readFile(path.join(OUT_DIR, 'sw.js'), 'utf8'),
    fs.readFile(path.join(OUT_DIR, 'manifest.webmanifest'), 'utf8'),
  ])
  const homeHtml = await fs.readFile(path.join(OUT_DIR, `${LOCALE}.html`), 'utf8')

  const manifest = JSON.parse(manifestRaw)
  const webManifest = JSON.parse(manifestRouteRaw)
  const shell = manifest.shared?.shell ?? []
  const runtimeAssets = manifest.shared?.runtimeAssets ?? []

  assert.equal(typeof manifest.version, 'string')
  assert.ok(Array.isArray(manifest.locales?.[LOCALE]), `missing locale pack for ${LOCALE}`)
  assert.ok(
    manifest.locales[LOCALE].includes(`/${LOCALE}.html`),
    `locale pack for ${LOCALE} should include the locale home html`,
  )
  assert.ok(
    shell.includes('/offline-manifest.json'),
    'shell cache should include offline-manifest.json',
  )
  assert.ok(runtimeAssets.length > 0, 'runtime asset ownership must be explicit')
  assert.ok(
    runtimeAssets.some((asset) => !shell.includes(asset)),
    'route runtime assets must be cached on demand instead of all being install-preloaded',
  )

  const shellDocuments = [
    'index.html',
    '404.html',
    '_not-found.html',
    ...LOCALES.map((locale) => `${locale}.html`),
    ...LOCALES.map((locale) => `${locale}/offline.html`),
  ]
  const referencedRuntimeAssets = new Set()
  for (const relativePath of shellDocuments) {
    const html = await fs.readFile(path.join(OUT_DIR, relativePath), 'utf8')
    for (const match of html.matchAll(/\b(?:src|href)=["']([^"'<>]+)["']/gi)) {
      const raw = match[1].replaceAll('&amp;', '&')
      if (!raw.startsWith('/_next/')) continue
      referencedRuntimeAssets.add(new URL(raw, 'https://artifact.invalid').pathname)
    }
  }
  assert.deepEqual(
    shell.filter((asset) => asset.startsWith('/_next/')).sort(),
    [...referencedRuntimeAssets].sort(),
    'install shell must contain exactly the runtime assets referenced by home and fallback documents',
  )

  const heavyweightChunks = { ReactFlow: [], Recharts: [] }
  for (const asset of runtimeAssets.filter((value) => value.endsWith('.js'))) {
    const source = await fs.readFile(path.join(OUT_DIR, asset.slice(1)), 'utf8')
    if (source.includes('ReactFlowProvider')) heavyweightChunks.ReactFlow.push(asset)
    if (source.includes('recharts-responsive-container')) heavyweightChunks.Recharts.push(asset)
  }
  for (const [library, assets] of Object.entries(heavyweightChunks)) {
    assert.ok(assets.length > 0, `expected to identify the ${library} runtime chunk`)
    assert.equal(
      assets.some((asset) => shell.includes(asset)),
      false,
      `${library} chunks must not enter the install precache`,
    )
  }
  assert.equal(typeof manifest.shared?.pageVersions?.[`/${LOCALE}.html`], 'string')
  assert.match(swSource, /offline-shell-/)
  assert.match(swSource, /OFFLINE_CACHE_READY/)
  assert.match(swSource, /offline-content/)
  assert.match(swSource, /offline-remote/)
  assert.match(swSource, /pageVersions/)
  assert.match(swSource, /__offlineVersion/)
  assert.ok(swSource.includes(`const OFFLINE_VERSION = ${JSON.stringify(manifest.version)};`))
  assert.ok(
    swSource.includes('const CONTENT_CACHE = `${CONTENT_CACHE_PREFIX}${OFFLINE_VERSION}`;'),
    'content cache should be isolated by manifest version',
  )
  assert.match(swSource, /key\.startsWith\(CONTENT_CACHE_PREFIX\) && key !== CONTENT_CACHE/)
  assert.match(swSource, /key\.startsWith\(REMOTE_CACHE_PREFIX\) && key !== REMOTE_CACHE/)
  assert.match(swSource, /const REMOTE_CACHE = `\$\{REMOTE_CACHE_PREFIX\}\$\{OFFLINE_VERSION\}`/)
  assert.match(swSource, /isExplicitlyVersionedRemoteUrl/)
  assert.match(swSource, /networkFirst\(request, REMOTE_CACHE, url\.href\)/)
  const remoteAllowlistIndex = swSource.indexOf('if (OWNED_REMOTE_URLS.has(url.href))')
  const genericSameOriginIndex = swSource.indexOf('if (url.origin === self.location.origin)')
  assert.ok(remoteAllowlistIndex >= 0, 'service worker should handle exact remote allowlist entries')
  assert.ok(
    remoteAllowlistIndex < genericSameOriginIndex,
    'exact dom-pub allowlisting must run before the generic same-origin sibling guard',
  )
  assert.ok(manifest.shared.remoteAssets.length > 0, 'offline manifest should include remote asset allowlist entries')
  assert.match(swSource, /assertManifestVersion\(manifest, OFFLINE_VERSION\)/)
  assert.match(swSource, /const cached = await shellCache\.match\('\/offline-manifest\.json'\)/)
  assert.match(swSource, /fetchWithTimeout\('\/offline-manifest\.json'/)
  assert.doesNotMatch(swSource, /OFFLINE_WARM_LOCALE/)
  const ownedPathsMatch = swSource.match(/const OWNED_SAME_ORIGIN_PATHS = new Set\((\[[^;]+\])\);/)
  assert.ok(ownedPathsMatch, 'service worker should embed its exact same-origin ownership list')
  const ownedPaths = JSON.parse(ownedPathsMatch[1])
  assert.equal(
    ownedPaths.some((ownedPath) => ownedPath.startsWith('/dom-pub/')),
    false,
    'sibling-project paths must not be owned by the root-scoped worker',
  )
  assert.match(homeHtml, new RegExp(`<meta\\s+name="offline-manifest-version"\\s+content="${manifest.version}"`))
  assert.equal(webManifest.start_url, '/en')

  const shellRawBytes = shell.reduce((total, asset) => {
    if (asset === '/offline-manifest.json') return total + Buffer.byteLength(manifestRaw)
    return total + statSync(path.join(OUT_DIR, asset.slice(1))).size
  }, 0)
  console.log(
    `[verify-offline] install shell ${shell.length} files / ${(shellRawBytes / 1048576).toFixed(2)} MiB; ` +
      `${runtimeAssets.length} runtime assets owned on demand`,
  )
}

async function verifyBrowserFlow(setOriginOffline) {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  const baseUrl = `http://${HOST}:${PORT}`
  const startPath = `/${LOCALE}/blog`
  const warmPath = `/${LOCALE}/notes`
  const fallbackPath = `/${LOCALE}/apps/english`
  const siblingPath = '/dom-pub/offline-probe'

  const waitForCachedNavigation = (pathname) =>
    page.waitForFunction(
      async (pathToMatch) => {
        const manifest = await fetch('/offline-manifest.json', {
          cache: 'no-store',
        }).then((response) => response.json())
        const clean = pathToMatch.replace(/\/+$/, '')
        const candidates = [`${clean}.html`, `${clean}/index.html`]

        for (const candidate of candidates) {
          const version = manifest.shared?.pageVersions?.[candidate]
          const cacheKey = version ? `${candidate}?__offlineVersion=${encodeURIComponent(version)}` : candidate
          if (await caches.match(cacheKey)) return true
        }
        return false
      },
      pathname,
      { timeout: 30000 },
    )

  try {
    await page.goto(`${baseUrl}${startPath}`, {
      waitUntil: 'domcontentloaded',
    })
    const onlineTitle = await page.title()
    assert.ok(onlineTitle.length > 0, 'expected the online page to render a title')

    await page.waitForFunction(
      async () => {
        if (!('serviceWorker' in navigator)) return false
        await navigator.serviceWorker.ready
        return true
      },
      { timeout: 30000 },
    )

    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), {
      timeout: 30000,
    })
    await waitForCachedNavigation(startPath)

    const allowlistedRemoteUrl = await page.evaluate(async () => {
      const manifest = await fetch('/offline-manifest.json', { cache: 'no-store' }).then((response) => response.json())
      return manifest.shared?.remoteAssets?.[0] ?? null
    })
    assert.equal(typeof allowlistedRemoteUrl, 'string')
    const allowlistedRemoteOnline = await page.evaluate(async (assetUrl) => {
      const response = await fetch(assetUrl, { cache: 'no-store' })
      const body = await response.arrayBuffer()
      return {
        ok: response.ok,
        bytes: body.byteLength,
        cached: Boolean(await caches.match(assetUrl)),
      }
    }, allowlistedRemoteUrl)
    assert.equal(allowlistedRemoteOnline.ok, true)
    assert.ok(allowlistedRemoteOnline.bytes > 0)
    assert.equal(allowlistedRemoteOnline.cached, true, 'exactly allowlisted dom-pub asset should enter remote cache')

    const siblingAssetResult = await page.evaluate(
      async ({ siblingAssetPath, expectedBody }) => {
        const response = await fetch(siblingAssetPath, { cache: 'no-store' })
        const body = await response.text()
        return {
          body,
          cached: Boolean(await caches.match(siblingAssetPath)),
          expectedBody,
        }
      },
      { siblingAssetPath: SIBLING_ASSET_PATH, expectedBody: SIBLING_ASSET_BODY },
    )
    assert.equal(siblingAssetResult.body, siblingAssetResult.expectedBody)
    assert.equal(
      siblingAssetResult.cached,
      false,
      'same-origin sibling assets must pass through without entering offline caches',
    )

    const queryVariantResult = await page.evaluate(async () => {
      const pathWithQuery = '/offline-manifest.json?untrusted-cache-variant=1'
      const response = await fetch(pathWithQuery, { cache: 'no-store' })
      return {
        ok: response.ok,
        cached: Boolean(await caches.match(pathWithQuery)),
      }
    })
    assert.equal(queryVariantResult.ok, true)
    assert.equal(
      queryVariantResult.cached,
      false,
      'arbitrary query variants of owned assets must pass through without multiplying cache keys',
    )

    // Only explicitly visited routes are warmed by default. This keeps the
    // offline footprint bounded instead of downloading an entire locale.
    await page.goto(`${baseUrl}${warmPath}`, { waitUntil: 'domcontentloaded' })
    await waitForCachedNavigation(warmPath)
    await page.goto(`${baseUrl}${startPath}?utm_source=offline-verifier`, {
      waitUntil: 'domcontentloaded',
    })

    const runtimeCacheProbe = await page.evaluate(async () => {
      const manifest = await caches.match('/offline-manifest.json').then((response) => response?.json())
      const shell = new Set(manifest?.shared?.shell ?? [])
      const runtimeOnly = (manifest?.shared?.runtimeAssets ?? []).filter((asset) => !shell.has(asset))
      const cached = []
      for (const asset of runtimeOnly) {
        if (await caches.match(asset)) cached.push(asset)
      }
      return { runtimeOnly: runtimeOnly.length, cached }
    })
    assert.ok(runtimeCacheProbe.runtimeOnly > 0, 'expected runtime-only assets outside install shell')
    assert.ok(
      runtimeCacheProbe.cached.length > 0,
      'visited route chunks must enter the on-demand content cache',
    )

    setOriginOffline(true)
    await context.setOffline(true)

    const gotoOfflineDocument = async (pathname) => {
      await page.goto(`${baseUrl}${pathname}`, {
        waitUntil: 'commit',
        timeout: 15000,
      })
      await page.waitForFunction(() => document.title.length > 0, null, { timeout: 10000 })
    }

    const siblingAssetAvailableOffline = await page.evaluate(async (siblingAssetPath) => {
      try {
        await fetch(siblingAssetPath, { cache: 'no-store' })
        return true
      } catch {
        return false
      }
    }, SIBLING_ASSET_PATH)
    assert.equal(
      siblingAssetAvailableOffline,
      false,
      'same-origin sibling assets must not be served from this site offline cache',
    )

    const allowlistedRemoteOffline = await page.evaluate(async (assetUrl) => {
      const response = await fetch(assetUrl, { cache: 'no-store' })
      const body = await response.arrayBuffer()
      return { ok: response.ok, bytes: body.byteLength }
    }, allowlistedRemoteUrl)
    assert.equal(allowlistedRemoteOffline.ok, true)
    assert.equal(
      allowlistedRemoteOffline.bytes,
      allowlistedRemoteOnline.bytes,
      'exactly allowlisted dom-pub asset should remain available from remote cache offline',
    )

    await gotoOfflineDocument(`/${LOCALE}`)
    assert.ok(
      !/offline|ngoại tuyến|hors ligne/i.test(await page.title()),
      'locale home must remain available from the install shell',
    )

    await gotoOfflineDocument(startPath)
    assert.equal(await page.title(), onlineTitle, 'expected a previously opened page to render from offline cache')

    // Use a document navigation so this assertion isolates service-worker
    // behavior from Next.js client-router prefetch and transition timing.
    await gotoOfflineDocument(warmPath)
    const warmedTitle = await page.title()
    assert.ok(
      !/offline|ngoại tuyến|hors ligne/i.test(warmedTitle),
      'expected an offline internal link to fall back to the warmed HTML route',
    )

    const fallbackCacheProbe = await page.evaluate(async (locale) => {
      const manifest = await caches.match('/offline-manifest.json').then((response) => response?.json())
      const fallbackUrl = `/${locale}/offline.html`
      const version = manifest?.shared?.pageVersions?.[fallbackUrl]
      const cacheKey = version ? `${fallbackUrl}?__offlineVersion=${encodeURIComponent(version)}` : fallbackUrl
      return {
        cacheKey,
        cached: Boolean(await caches.match(cacheKey)),
        controller: navigator.serviceWorker.controller?.scriptURL ?? null,
      }
    }, LOCALE)
    assert.equal(
      fallbackCacheProbe.cached,
      true,
      `offline fallback must be present in the shell cache; received ${JSON.stringify(fallbackCacheProbe)}`,
    )

    const uncachedRouteProbe = await page.evaluate(async (pathname) => {
      const manifest = await caches.match('/offline-manifest.json').then((response) => response?.json())
      const clean = pathname.replace(/\/+$/, '')
      const candidates = [`${clean}.html`, `${clean}/index.html`]
      const keys = await caches.keys()
      for (const candidate of candidates) {
        const version = manifest?.shared?.pageVersions?.[candidate]
        const versioned = version ? `${candidate}?__offlineVersion=${encodeURIComponent(version)}` : candidate
        for (const cacheName of keys) {
          const cache = await caches.open(cacheName)
          await cache.delete(candidate)
          await cache.delete(versioned)
        }
      }
      return Promise.all(
        candidates.map(async (candidate) => {
          const version = manifest?.shared?.pageVersions?.[candidate]
          const versioned = version ? `${candidate}?__offlineVersion=${encodeURIComponent(version)}` : candidate
          return Boolean((await caches.match(candidate)) || (await caches.match(versioned)))
        }),
      )
    }, fallbackPath)
    assert.deepEqual(uncachedRouteProbe, [false, false], 'fallback probe route must be explicitly uncached')

    await gotoOfflineDocument(`${fallbackPath}?offline-probe=${Date.now()}`)
    const fallbackVisible = await page
      .locator('.offline-page-shell')
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false)
    const fallbackState = {
      visible: fallbackVisible,
      url: page.url(),
      title: await page.title(),
      fallbackCacheProbe,
    }
    assert.equal(
      fallbackState.visible,
      true,
      `expected an owned but uncached page to fall back to the offline route; received ${JSON.stringify(fallbackState)}`,
    )
    assert.match(await page.title(), /offline|ngoại tuyến|hors ligne/i)

    const siblingPage = await context.newPage()
    let siblingNavigationFailed = false
    try {
      await siblingPage.goto(`${baseUrl}${siblingPath}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      })
    } catch {
      siblingNavigationFailed = true
    } finally {
      await siblingPage.close()
    }
    assert.equal(
      siblingNavigationFailed,
      true,
      'the root service worker must not return this site fallback for sibling project routes',
    )
  } finally {
    setOriginOffline(false)
    await context.close()
    await browser.close()
  }
}

async function main() {
  await fs.access(OUT_DIR)
  await assertArtifacts()

  const { server, setOriginOffline } = await startStaticServer()
  try {
    await verifyBrowserFlow(setOriginOffline)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(undefined)
      })
    })
  }

  console.log('[verify-offline] artifacts and browser offline flow look good')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[verify-offline] failed:', error)
    process.exit(1)
  })
}
