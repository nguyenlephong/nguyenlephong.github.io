#!/usr/bin/env node
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')
const HOST = '127.0.0.1'
const PORT = Number(process.env.OFFLINE_VERIFY_PORT ?? '4173')
const LOCALE = process.env.OFFLINE_VERIFY_LOCALE ?? 'en'

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

function routeCandidates(requestPath) {
  const clean = decodeURIComponent(requestPath.split('?')[0] || '/')

  if (clean === '/') return ['/index.html']
  if (hasExtension(clean)) return [clean]

  const normalized = clean.replace(/\/+$/, '')
  return [`${normalized}.html`, `${normalized}/index.html`]
}

async function resolveFile(requestPath) {
  for (const candidate of routeCandidates(requestPath)) {
    const relative = candidate.replace(/^\/+/, '')
    const fullPath = path.join(OUT_DIR, relative)
    try {
      const stats = await fs.stat(fullPath)
      if (stats.isFile()) return fullPath
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
  const server = createServer(async (req, res) => {
    const method = req.method ?? 'GET'
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405)
      res.end()
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
      'Cache-Control': 'no-cache',
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

  return server
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

  assert.equal(typeof manifest.version, 'string')
  assert.ok(Array.isArray(manifest.locales?.[LOCALE]), `missing locale pack for ${LOCALE}`)
  assert.ok(
    manifest.locales[LOCALE].includes(`/${LOCALE}.html`),
    `locale pack for ${LOCALE} should include the locale home html`,
  )
  assert.ok(
    manifest.shared?.shell?.includes('/offline-manifest.json'),
    'shell cache should include offline-manifest.json',
  )
  assert.equal(typeof manifest.shared?.pageVersions?.[`/${LOCALE}.html`], 'string')
  assert.match(swSource, /offline-shell-/)
  assert.match(swSource, /OFFLINE_CACHE_READY/)
  assert.match(swSource, /offline-content/)
  assert.match(swSource, /offline-remote/)
  assert.match(swSource, /pageVersions/)
  assert.match(swSource, /__offlineVersion/)
  assert.match(homeHtml, new RegExp(`<meta\\s+name="offline-manifest-version"\\s+content="${manifest.version}"`))
  assert.equal(webManifest.start_url, '/en')
}

async function verifyBrowserFlow() {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  const baseUrl = `http://${HOST}:${PORT}`
  const startPath = `/${LOCALE}/blog`
  const warmPath = `/${LOCALE}/notes`
  const probePath = `/${LOCALE}/offline-probe`
  const storageKey = `offline-locale-state:v2:${LOCALE}`

  try {
    await page.goto(`${baseUrl}${startPath}`, { waitUntil: 'domcontentloaded' })
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
    await page.waitForFunction(
      (key) => {
        const raw = window.localStorage.getItem(key)
        if (!raw) return false
        try {
          const parsed = JSON.parse(raw)
          return (
            (parsed.phase === 'reading' || parsed.phase === 'extended') &&
            parsed.completeness === 'complete'
          )
        } catch {
          return false
        }
      },
      storageKey,
      { timeout: 60000 },
    )

    await context.setOffline(true)

    await page.goto(`${baseUrl}${startPath}`, { waitUntil: 'domcontentloaded' })
    assert.equal(
      await page.title(),
      onlineTitle,
      'expected a previously opened page to render from offline cache',
    )

    await Promise.all([
      page.waitForURL(`${baseUrl}${warmPath}`, { timeout: 30000 }),
      page.locator(`a[href="/${LOCALE}/notes"]`).first().click(),
    ])
    const warmedTitle = await page.title()
    assert.ok(
      !/offline|ngoại tuyến|hors ligne/i.test(warmedTitle),
      'expected an offline internal link to fall back to the warmed HTML route',
    )

    await page.goto(`${baseUrl}${probePath}`, { waitUntil: 'domcontentloaded' })
    assert.equal(
      await page.locator('.offline-page-shell').isVisible(),
      true,
      'expected an unknown page to fall back to the offline route when offline',
    )
    assert.match(await page.title(), /offline|ngoại tuyến|hors ligne/i)
  } finally {
    await context.close()
    await browser.close()
  }
}

async function main() {
  await fs.access(OUT_DIR)
  await assertArtifacts()

  const server = await startStaticServer()
  try {
    await verifyBrowserFlow()
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

main().catch((error) => {
  console.error('[verify-offline] failed:', error)
  process.exit(1)
})
