import { promises as fs } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

import { extractDocumentAssetReferences } from '../postbuild-offline.mjs'

/**
 * Gzip bytes the service worker downloads on a first visit to the locale home:
 * sw.js, the offline manifest and every install-shell file, except hashed
 * /_next/static files the home page itself already loaded (the worker reuses
 * them from the HTTP cache). Icons are counted even though the page may have
 * fetched them, so the figure is an upper bound.
 */
export async function measureOfflineShell(outDir, locale) {
  const read = (relativePath) => fs.readFile(path.join(outDir, relativePath))
  const manifestRaw = await read('offline-manifest.json')
  const manifest = JSON.parse(manifestRaw.toString('utf8'))
  const localeShell = manifest.localeShells?.[locale]
  if (!Array.isArray(localeShell)) throw new Error(`offline manifest has no locale shell for ${locale}`)

  const homeHtml = (await read(`${locale}.html`)).toString('utf8')
  const pageLoaded = new Set(
    extractDocumentAssetReferences(homeHtml)
      .filter((relativePath) => relativePath.startsWith('_next/static/'))
      .map((relativePath) => `/${relativePath}`),
  )

  const files = [{ url: '/sw.js', gzipBytes: gzipSync(await read('sw.js')).length }]
  files.push({ url: '/offline-manifest.json', gzipBytes: gzipSync(manifestRaw).length })
  for (const url of new Set([...(manifest.shared?.shell ?? []), ...localeShell])) {
    if (url === '/offline-manifest.json' || pageLoaded.has(url)) continue
    files.push({ url, gzipBytes: gzipSync(await read(url.slice(1))).length })
  }

  return {
    gzipBytes: files.reduce((total, file) => total + file.gzipBytes, 0),
    files: files.sort((a, b) => b.gzipBytes - a.gzipBytes),
  }
}
