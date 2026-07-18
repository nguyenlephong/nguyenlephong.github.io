import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const PRERENDER_MANIFEST = path.join('.next', 'prerender-manifest.json')
const FRESHNESS_SLOP_MS = 1_000

function isFresh(filePath, startedAt) {
  try {
    return statSync(filePath).mtimeMs + FRESHNESS_SLOP_MS >= startedAt
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function expectedHtmlPath(route) {
  if (route === '/') return 'index.html'
  if (!route.startsWith('/') || route.includes('..')) return null
  return `${route.slice(1)}.html`
}

export function getValidatedExportFallback({ rootDir, startedAt }) {
  const manifestPath = path.join(rootDir, PRERENDER_MANIFEST)
  const outDir = path.join(rootDir, 'out')
  const empty = {
    fallbackSatisfied: false,
    manifestFresh: false,
    expectedPageCount: 0,
    missingPageCount: 0,
    htmlCount: 0,
    latestActivityMtimeMs: 0,
  }

  if (!isFresh(manifestPath, startedAt)) return empty

  let manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    return { ...empty, manifestFresh: true }
  }
  if (!manifest?.routes || typeof manifest.routes !== 'object') {
    return { ...empty, manifestFresh: true }
  }

  const expectedPages = []
  for (const [route, entry] of Object.entries(manifest.routes)) {
    if (route === '/_global-error' || typeof entry?.dataRoute !== 'string') continue
    const relativePath = expectedHtmlPath(route)
    if (!relativePath) {
      return { ...empty, manifestFresh: true }
    }
    expectedPages.push(relativePath)
  }

  if (expectedPages.length === 0) return { ...empty, manifestFresh: true }

  let missingPageCount = 0
  let htmlCount = 0
  let latestActivityMtimeMs = statSync(manifestPath).mtimeMs
  for (const relativePath of expectedPages) {
    const outputPath = path.join(outDir, relativePath)
    if (!isFresh(outputPath, startedAt)) {
      missingPageCount += 1
      continue
    }
    htmlCount += 1
    latestActivityMtimeMs = Math.max(latestActivityMtimeMs, statSync(outputPath).mtimeMs)
  }

  return {
    fallbackSatisfied: missingPageCount === 0,
    manifestFresh: true,
    expectedPageCount: expectedPages.length,
    missingPageCount,
    htmlCount,
    latestActivityMtimeMs,
  }
}
