#!/usr/bin/env node
/**
 * Normalize and deduplicate only the social-image routes emitted by Next.js.
 *
 * Candidate ownership comes from `.next/prerender-manifest.json`; filename
 * resemblance alone is deliberately insufficient because public assets can
 * legitimately use names such as `opengraph-image.png`.
 */
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createArtifactIndex } from './lib/artifact-index.mjs'
import { transformConsumerUrls, visitConsumerUrls } from './lib/consumer-url-tokens.mjs'
import {
  applyOgArtifactTransaction,
  createOgTransactionWorkspace,
  recoverStaleOgTransactions,
  withPostbuildTransformLock,
} from './lib/og-artifact-transaction.mjs'

const OUT_DIR = path.resolve(process.env.OG_OUT_DIR ?? path.join(process.cwd(), 'out'))
const NEXT_DIR = path.resolve(process.env.NEXT_BUILD_DIR ?? path.join(process.cwd(), '.next'))
const BUDGET_CONFIG = path.resolve(
  process.env.STATIC_ARTIFACT_CONFIG ??
    path.join(process.cwd(), 'config/static-artifact-budgets.json'),
)
const STATE_FILE = 'postbuild-og-state.json'
const MAX_RENAME_LOGS = 40
const DEFAULT_METADATA_CONCURRENCY = 32
const SOCIAL_ROUTE_BASENAME_PATTERN =
  /^(?:opengraph-image|twitter-image)(?:-[a-z0-9]+)?$/i
const CONSUMER_EXTENSIONS = new Set([
  '.css',
  '.htm',
  '.html',
  '.json',
  '.rsc',
  '.txt',
  '.webmanifest',
])
const ROOT_OPEN_GRAPH_URL = '/opengraph-image.png'

function metadataConcurrency() {
  const value = Number(process.env.POSTBUILD_METADATA_CONCURRENCY ?? DEFAULT_METADATA_CONCURRENCY)
  if (!Number.isFinite(value) || value < 1) return DEFAULT_METADATA_CONCURRENCY
  return Math.trunc(value)
}

async function mapWithConcurrency(items, concurrency, task) {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1))
  let cursor = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (cursor < items.length) {
        const index = cursor
        cursor += 1
        await task(items[index])
      }
    }),
  )
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function encodePathSegment(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

function decodePathSegment(value, context) {
  let decoded
  try {
    decoded = decodeURIComponent(value).normalize('NFC')
  } catch {
    throw new Error(`[postbuild-og] invalid percent encoding in ${context}: ${value}`)
  }
  if (
    decoded.length === 0 ||
    decoded === '.' ||
    decoded === '..' ||
    decoded.includes('/') ||
    decoded.includes('\\') ||
    decoded.includes('\0')
  ) {
    throw new Error(`[postbuild-og] unsafe path segment in ${context}: ${value}`)
  }
  return decoded
}

function canonicalizePathname(value, context = 'URL pathname') {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    throw new Error(`[postbuild-og] expected a root-relative ${context}`)
  }
  if (value === '/') return '/'
  const segments = value.split('/').slice(1)
  return `/${segments
    .map((segment) => encodePathSegment(decodePathSegment(segment, context)))
    .join('/')}`
}

function pathnameToArtifactBase(pathname) {
  return pathname
    .split('/')
    .slice(1)
    .map((segment) => decodePathSegment(segment, 'metadata route'))
    .join('/')
}

function socialRouteBasename(value) {
  try {
    const pathname = new URL(value, 'https://manifest.invalid').pathname
    return decodeURIComponent(path.posix.basename(pathname))
  } catch {
    return ''
  }
}

function contentType(headers) {
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) return ''
  const entry = Object.entries(headers).find(([name]) => name.toLowerCase() === 'content-type')
  return typeof entry?.[1] === 'string' ? entry[1].toLowerCase() : ''
}

function isRootRelativeRoute(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('?') &&
    !value.includes('#')
  )
}

async function readMetadataInventory(nextDir) {
  const manifestPath = path.join(nextDir, 'prerender-manifest.json')
  let raw
  try {
    raw = await fs.readFile(manifestPath)
  } catch (error) {
    throw new Error(
      `[postbuild-og] cannot read authoritative prerender manifest: ${manifestPath}: ${error.message}`,
    )
  }

  let manifest
  try {
    manifest = JSON.parse(raw)
  } catch (error) {
    throw new Error(`[postbuild-og] invalid prerender manifest JSON: ${error.message}`)
  }
  if (
    !manifest ||
    typeof manifest !== 'object' ||
    manifest.version !== 4 ||
    !manifest.routes ||
    typeof manifest.routes !== 'object' ||
    Array.isArray(manifest.routes)
  ) {
    throw new Error('[postbuild-og] invalid prerender manifest shape')
  }

  const routes = []
  const normalizedRoutes = new Set()
  for (const [route, entry] of Object.entries(manifest.routes)) {
    if (!isRootRelativeRoute(route)) {
      throw new Error(`[postbuild-og] prerender route must be root-relative: ${route}`)
    }
    const basename = socialRouteBasename(route)
    if (!SOCIAL_ROUTE_BASENAME_PATTERN.test(basename)) continue
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`[postbuild-og] invalid metadata inventory entry: ${route}`)
    }
    if (
      !isRootRelativeRoute(entry.srcRoute) ||
      !SOCIAL_ROUTE_BASENAME_PATTERN.test(socialRouteBasename(entry.srcRoute))
    ) {
      throw new Error(`[postbuild-og] inconsistent metadata srcRoute: ${route}`)
    }
    if (contentType(entry.initialHeaders).split(';', 1)[0].trim() !== 'image/png') {
      throw new Error(`[postbuild-og] metadata route is not declared as image/png: ${route}`)
    }

    let parsed
    try {
      parsed = new URL(route, 'https://manifest.invalid')
    } catch {
      throw new Error(`[postbuild-og] invalid metadata route URL: ${route}`)
    }
    if (parsed.origin !== 'https://manifest.invalid' || parsed.search || parsed.hash) {
      throw new Error(`[postbuild-og] metadata route must be root-relative: ${route}`)
    }
    const pathname = canonicalizePathname(parsed.pathname, 'metadata route')
    if (normalizedRoutes.has(pathname)) {
      throw new Error(`[postbuild-og] duplicate normalized metadata route: ${pathname}`)
    }
    normalizedRoutes.add(pathname)
    routes.push({ artifactBase: pathnameToArtifactBase(pathname), pathname })
  }
  if (routes.length === 0) {
    throw new Error('[postbuild-og] prerender manifest contains no concrete social-image routes')
  }

  routes.sort((left, right) => left.pathname.localeCompare(right.pathname))
  return { digest: sha256(raw), routes }
}

async function readCommittedState(nextDir) {
  try {
    const state = JSON.parse(await fs.readFile(path.join(nextDir, STATE_FILE), 'utf8'))
    if (
      state?.schemaVersion !== 1 ||
      state?.status !== 'committed' ||
      typeof state.manifestDigest !== 'string' ||
      !state.outputIdentity ||
      typeof state.outputIdentity !== 'object' ||
      !state.routes ||
      typeof state.routes !== 'object' ||
      Array.isArray(state.routes)
    ) {
      return null
    }
    return state
  } catch (error) {
    if (error?.code === 'ENOENT' || error instanceof SyntaxError) return null
    throw error
  }
}

async function readOutputIdentity(outDir) {
  const stat = await fs.lstat(outDir)
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error(`[postbuild-og] output must be a regular directory: ${outDir}`)
  }
  return {
    birthtimeMs: stat.birthtimeMs,
    dev: String(stat.dev),
    ino: String(stat.ino),
  }
}

function sameOutputIdentity(left, right) {
  return (
    left?.birthtimeMs === right.birthtimeMs &&
    left?.dev === right.dev &&
    left?.ino === right.ino
  )
}

async function writeCommittedState(nextDir, state) {
  const target = path.join(nextDir, STATE_FILE)
  const temporary = `${target}.${process.pid}.next`
  await fs.rm(temporary, { force: true })
  try {
    await fs.writeFile(temporary, JSON.stringify(state), { flag: 'wx' })
    await fs.rename(temporary, target)
  } finally {
    await fs.rm(temporary, { force: true })
  }
}

async function assertRegularArtifact(artifactIndex, relativePath) {
  const stat = await fs.lstat(artifactIndex.resolve(relativePath))
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`[postbuild-og] metadata artifact must be a regular file: ${relativePath}`)
  }
}

async function collectCandidates({ artifactIndex, inventory, outputIdentity, state }) {
  const candidates = []
  let usedState = false

  for (const route of inventory.routes) {
    const forms = [route.artifactBase, `${route.artifactBase}.body`, `${route.artifactBase}.png`]
    const present = forms.filter((file) => artifactIndex.has(file))
    if (present.length > 1) {
      throw new Error(
        `[postbuild-og] multiple artifacts for metadata route ${route.pathname}: ${present.join(', ')}`,
      )
    }

    const finalFile = `${route.artifactBase}.png`
    const finalUrl = `${route.pathname}.png`
    if (present.length === 1) {
      const sourceFile = present[0]
      await assertRegularArtifact(artifactIndex, sourceFile)
      const content = await artifactIndex.readBuffer(sourceFile)
      candidates.push({
        bytes: content.length,
        content,
        digest: sha256(content),
        finalFile,
        finalUrl,
        pathname: route.pathname,
        present: true,
        sourceFile,
      })
      continue
    }

    const saved =
      state?.manifestDigest === inventory.digest &&
      sameOutputIdentity(state.outputIdentity, outputIdentity)
        ? state.routes[route.pathname]
        : null
    if (
      !saved ||
      saved.finalFile !== finalFile ||
      saved.finalUrl !== finalUrl ||
      typeof saved.digest !== 'string' ||
      !Number.isSafeInteger(saved.bytes) ||
      saved.bytes < 0 ||
      typeof saved.canonicalUrl !== 'string'
    ) {
      throw new Error(`[postbuild-og] missing artifact for metadata route: ${route.pathname}`)
    }
    usedState = true
    candidates.push({
      bytes: saved.bytes,
      content: null,
      digest: saved.digest,
      finalFile,
      finalUrl,
      pathname: route.pathname,
      present: false,
      savedCanonicalUrl: saved.canonicalUrl,
      sourceFile: null,
    })
  }

  if (usedState) {
    const knownRoutes = new Set(inventory.routes.map(({ pathname }) => pathname))
    if (Object.keys(state.routes).some((route) => !knownRoutes.has(route))) {
      throw new Error('[postbuild-og] committed deduplication state does not match metadata inventory')
    }
  }
  return candidates
}

function compareCanonicalCandidates(left, right) {
  if (left.finalUrl === right.finalUrl) return 0
  if (left.finalUrl === ROOT_OPEN_GRAPH_URL) return -1
  if (right.finalUrl === ROOT_OPEN_GRAPH_URL) return 1
  return left.finalUrl.length - right.finalUrl.length || left.finalUrl.localeCompare(right.finalUrl)
}

async function buildDeduplicationPlan({ artifactIndex, candidates }) {
  const byDigest = new Map()
  for (const candidate of candidates) {
    const group = byDigest.get(candidate.digest) ?? []
    group.push(candidate)
    byDigest.set(candidate.digest, group)
  }

  const mappings = new Map()
  const deduplicated = []
  const removals = []
  const renamed = []
  const stateRoutes = {}
  const writes = []

  for (const group of byDigest.values()) {
    const [canonical, ...duplicates] = [...group].sort(compareCanonicalCandidates)
    if (!canonical.present || !artifactIndex.has(canonical.sourceFile)) {
      throw new Error(
        `[postbuild-og] committed canonical artifact is missing: ${canonical.finalUrl}`,
      )
    }
    const canonicalBytes = await artifactIndex.readBuffer(canonical.sourceFile)
    if (canonicalBytes.length !== canonical.bytes || sha256(canonicalBytes) !== canonical.digest) {
      throw new Error(`[postbuild-og] committed canonical artifact changed: ${canonical.finalUrl}`)
    }

    for (const candidate of group) {
      if (
        !candidate.present &&
        candidate.savedCanonicalUrl !== canonical.finalUrl
      ) {
        throw new Error(
          `[postbuild-og] committed route mapping changed for ${candidate.pathname}`,
        )
      }
      mappings.set(candidate.pathname, canonical.finalUrl)
      mappings.set(candidate.finalUrl, canonical.finalUrl)
      stateRoutes[candidate.pathname] = {
        bytes: candidate.bytes,
        canonicalUrl: canonical.finalUrl,
        digest: candidate.digest,
        finalFile: candidate.finalFile,
        finalUrl: candidate.finalUrl,
      }
    }

    if (canonical.sourceFile !== canonical.finalFile) {
      writes.push({
        content: canonical.content,
        expectedExisting: false,
        kind: 'normalization',
        path: canonical.finalFile,
      })
      removals.push({
        expectedBytes: canonical.bytes,
        expectedDigest: canonical.digest,
        path: canonical.sourceFile,
      })
      renamed.push({ from: canonical.sourceFile, to: canonical.finalFile })
    }

    for (const duplicate of duplicates) {
      if (!duplicate.present) continue
      removals.push({
        expectedBytes: duplicate.bytes,
        expectedDigest: duplicate.digest,
        path: duplicate.sourceFile,
      })
      deduplicated.push({
        bytes: duplicate.bytes,
        canonicalFile: canonical.finalFile,
        canonicalUrl: canonical.finalUrl,
        digest: duplicate.digest,
        removedFile: duplicate.sourceFile,
        removedUrl: duplicate.finalUrl,
      })
    }
  }

  deduplicated.sort((left, right) => left.removedUrl.localeCompare(right.removedUrl))
  renamed.sort((left, right) => left.from.localeCompare(right.from))
  return { deduplicated, mappings, removals, renamed, stateRoutes, writes }
}

function parseUrlReference(rawReference, siteOrigin) {
  const decoded = rawReference.replaceAll('\\/', '/')
  const absolute = /^https?:\/\//i.test(decoded)
  if (!absolute && (!decoded.startsWith('/') || decoded.startsWith('//'))) return null

  const suffixIndex = decoded.search(/[?#]/)
  const source = suffixIndex === -1 ? decoded : decoded.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? '' : decoded.slice(suffixIndex)
  let parsed
  try {
    parsed = new URL(source, siteOrigin)
  } catch {
    return null
  }
  if (absolute && parsed.origin !== siteOrigin) return null
  if (!absolute && parsed.origin !== siteOrigin) return null

  let pathname
  try {
    pathname = canonicalizePathname(parsed.pathname)
  } catch {
    return null
  }
  return { absolute, pathname, suffix }
}

function rewriteOgUrls(content, extension, mappings, siteOrigin) {
  return transformConsumerUrls(content, extension, (reference) => {
    const parsed = parseUrlReference(reference, siteOrigin)
    const target = parsed ? mappings.get(parsed.pathname) : null
    if (!target) return reference
    const replacement = `${parsed.absolute ? siteOrigin : ''}${target}${parsed.suffix}`
    return replacement
  })
}

function findRemovedAliasReference(content, extension, removedAliases, siteOrigin) {
  let remaining = null
  visitConsumerUrls(content, extension, (reference) => {
    if (remaining) return
    const parsed = parseUrlReference(reference, siteOrigin)
    if (parsed && removedAliases.has(parsed.pathname)) remaining = reference
  })
  return remaining
}

async function planConsumerRewrites({
  artifactIndex,
  concurrency,
  mappings,
  removals,
  siteOrigin,
  transactionDir,
}) {
  const updated = { html: 0, text: 0 }
  const writes = []
  let activePlanBytes = 0
  let peakPlanBytes = 0
  const removedAliases = new Set()
  for (const [source, target] of mappings) {
    if (source !== target) removedAliases.add(source)
  }
  for (const { path: relativePath } of removals) {
    const route = `/${relativePath.replace(/\.body$/i, '').replace(/\.png$/i, '')}`
    removedAliases.add(canonicalizePathname(route))
    if (/\.png$/i.test(relativePath)) removedAliases.add(`${canonicalizePathname(route)}.png`)
  }
  const consumers = artifactIndex.files().filter((file) =>
    CONSUMER_EXTENSIONS.has(path.posix.extname(file).toLowerCase()),
  )
  await mapWithConcurrency(consumers, concurrency, async (file) => {
    const extension = path.posix.extname(file).toLowerCase()
    await assertRegularArtifact(artifactIndex, file)
    const originalBuffer = await artifactIndex.readBufferUncached(file)
    activePlanBytes += originalBuffer.length
    peakPlanBytes = Math.max(peakPlanBytes, activePlanBytes)
    try {
      const original = originalBuffer.toString('utf8')
      const next = rewriteOgUrls(original, extension, mappings, siteOrigin)
      const remaining = findRemovedAliasReference(next, extension, removedAliases, siteOrigin)
      if (remaining) {
        throw new Error(
          `[postbuild-og] ${file} still references removed social-image alias: ${remaining}`,
        )
      }
      if (next === original) return
      const nextBuffer = Buffer.from(next)
      activePlanBytes += nextBuffer.length
      peakPlanBytes = Math.max(peakPlanBytes, activePlanBytes)
      try {
        const stagedPath = path.join(transactionDir, 'staged', file)
        await fs.mkdir(path.dirname(stagedPath), { recursive: true })
        await fs.writeFile(stagedPath, nextBuffer, { flag: 'wx' })
      } finally {
        activePlanBytes -= nextBuffer.length
      }
      writes.push({
        cache: false,
        expectedBytes: originalBuffer.length,
        expectedDigest: sha256(originalBuffer),
        expectedExisting: true,
        kind: 'consumer',
        path: file,
        staged: true,
      })
      if (extension === '.html' || extension === '.htm') updated.html += 1
      else updated.text += 1
    } finally {
      activePlanBytes -= originalBuffer.length
    }
  })
  writes.sort((left, right) => left.path.localeCompare(right.path))
  return { peakPlanBytes, updated, writes }
}

async function resolveSiteOrigin(value) {
  let candidate = value
  if (!candidate) {
    let config
    try {
      config = JSON.parse(await fs.readFile(BUDGET_CONFIG, 'utf8'))
    } catch (error) {
      throw new Error(`[postbuild-og] cannot load site origin: ${error.message}`)
    }
    candidate = config.siteOrigin
  }
  let parsed
  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error(`[postbuild-og] invalid site origin: ${String(candidate)}`)
  }
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(`[postbuild-og] site origin must be an HTTP(S) origin: ${candidate}`)
  }
  return parsed.origin
}

function skippedResult() {
  return {
    skipped: true,
    renamed: [],
    deduplicated: [],
    peakConsumerPlanBytes: 0,
    savedBytes: 0,
    updatedHtml: 0,
    updatedText: 0,
  }
}

async function normalizeStaticOgArtifactsLocked({
  artifactIndex,
  consumerConcurrency = metadataConcurrency(),
  injectFailure,
  nextDir = NEXT_DIR,
  outDir = OUT_DIR,
  recoverTransactions = true,
  siteOrigin,
} = {}) {
  try {
    await fs.access(outDir)
  } catch {
    return skippedResult()
  }

  if (recoverTransactions) {
    const recovered = await recoverStaleOgTransactions(outDir)
    if (recovered > 0 && artifactIndex) {
      throw new Error('[postbuild-og] supplied artifact index is stale after transaction recovery')
    }
  }
  const index = artifactIndex ?? (await createArtifactIndex(outDir))
  if (path.resolve(index.root) !== path.resolve(outDir)) {
    throw new Error('[postbuild-og] artifact index root does not match outDir')
  }

  const origin = await resolveSiteOrigin(siteOrigin)
  const outputIdentity = await readOutputIdentity(outDir)
  const inventory = await readMetadataInventory(nextDir)
  const state = await readCommittedState(nextDir)
  const candidates = await collectCandidates({
    artifactIndex: index,
    inventory,
    outputIdentity,
    state,
  })
  const plan = await buildDeduplicationPlan({ artifactIndex: index, candidates })
  const transactionDir = await createOgTransactionWorkspace(outDir)
  let consumerPlan
  let writes
  let applyStarted = false
  let applyCompleted = false
  try {
    consumerPlan = await planConsumerRewrites({
      artifactIndex: index,
      concurrency: consumerConcurrency,
      mappings: plan.mappings,
      removals: plan.removals,
      siteOrigin: origin,
      transactionDir,
    })
    writes = [...plan.writes, ...consumerPlan.writes]

    applyStarted = true
    await applyOgArtifactTransaction({
      beforeCommit: () =>
        writeCommittedState(nextDir, {
          schemaVersion: 1,
          status: 'committed',
          manifestDigest: inventory.digest,
          outputIdentity,
          routes: plan.stateRoutes,
        }),
      injectFailure,
      outDir,
      removals: plan.removals,
      transactionDir,
      writes,
    })
    applyCompleted = true
    index.commitExternalChanges({
      removals: plan.removals.map(({ path: relativePath }) => relativePath),
      writes,
    })
  } finally {
    if (!applyStarted || applyCompleted) {
      await fs.rm(transactionDir, { recursive: true, force: true })
    }
  }

  return {
    skipped: false,
    renamed: plan.renamed.map(({ from, to }) => ({
      from: index.resolve(from),
      to: index.resolve(to),
    })),
    deduplicated: plan.deduplicated.map((entry) => ({
      ...entry,
      canonicalFile: index.resolve(entry.canonicalFile),
      removedFile: index.resolve(entry.removedFile),
    })),
    peakConsumerPlanBytes: consumerPlan.peakPlanBytes,
    savedBytes: plan.deduplicated.reduce((total, entry) => total + entry.bytes, 0),
    updatedHtml: consumerPlan.updated.html,
    updatedText: consumerPlan.updated.text,
  }
}

export async function normalizeStaticOgArtifacts(options = {}) {
  const outDir = options.outDir ?? OUT_DIR
  try {
    await fs.access(outDir)
  } catch {
    return skippedResult()
  }
  if (options.acquireLock === false) return normalizeStaticOgArtifactsLocked(options)
  return withPostbuildTransformLock(outDir, () =>
    normalizeStaticOgArtifactsLocked({ ...options, acquireLock: false }),
  )
}

async function main() {
  const result = await normalizeStaticOgArtifacts()
  if (result.skipped) {
    console.warn(`[postbuild-og] skip: ${OUT_DIR} does not exist`)
    return
  }
  const { deduplicated, renamed, savedBytes, updatedHtml, updatedText } = result
  console.log(
    `[postbuild-og] renamed ${renamed.length} OG file(s), deduplicated ${deduplicated.length} ` +
      `file(s) / ${savedBytes} byte(s), rewrote ${updatedHtml} HTML and ${updatedText} text metadata file(s)`,
  )
  for (const entry of renamed.slice(0, MAX_RENAME_LOGS)) {
    console.log(`  ${path.relative(OUT_DIR, entry.from)} → ${path.relative(OUT_DIR, entry.to)}`)
  }
  if (renamed.length > MAX_RENAME_LOGS) {
    console.log(`  ... ${renamed.length - MAX_RENAME_LOGS} more file(s) omitted`)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[postbuild-og] failed:', error)
    process.exitCode = 1
  })
}
