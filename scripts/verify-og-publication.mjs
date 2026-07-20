#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs'
import { open } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  articleOgPublicationInventory,
  loadMediaPublicationContract,
} from './lib/media-publication-contract.mjs'

const MAX_FAILURE_LOGS = 50
const DEFAULT_LIVE_CONCURRENCY = 8
const DEFAULT_LIVE_RETRIES = 2
const DEFAULT_LIVE_RETRY_DELAY_MS = 150
const DEFAULT_LIVE_TIMEOUT_MS = 5_000
const DEFAULT_REMOTE_TREE_TIMEOUT_MS = 10_000
const GITHUB_API_ORIGIN = 'https://api.github.com'
const LIVE_SIGNATURE_BYTES = 4
const MAX_LIVE_OG_200_CONTENT_LENGTH_BYTES = 5 * 1024 * 1024
const RELEASED_RESPONSE_BODIES = new WeakSet()

async function isJpeg(filePath) {
  const handle = await open(filePath, 'r')
  try {
    const signature = Buffer.alloc(3)
    const { bytesRead } = await handle.read(signature, 0, signature.length, 0)
    return (
      signature[0] === 0xff &&
      signature[1] === 0xd8 &&
      signature[2] === 0xff &&
      bytesRead === signature.length
    )
  } finally {
    await handle.close()
  }
}

async function localPublicationKeys({ domPubDir, expected, failures }) {
  const keys = new Set()

  for (const entry of expected) {
    const publishedPath = path.resolve(domPubDir, 'icdn', entry.key)
    const relative = path.relative(path.resolve(domPubDir, 'icdn'), publishedPath)
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      failures.push(`Publication key escapes the local icdn root: ${entry.key}`)
      continue
    }
    if (!existsSync(publishedPath) || !statSync(publishedPath).isFile()) continue
    if (!(await isJpeg(publishedPath))) {
      failures.push(`Published OG asset is not a JPEG: icdn/${entry.key}`)
      continue
    }
    keys.add(entry.key)
  }

  return keys
}

async function remotePublicationKeys({
  remoteTreeUrl,
  remoteTreeToken,
  expected,
  fetchImpl,
  timeoutMs,
  failures,
}) {
  const requestedUrl = new URL(remoteTreeUrl)
  if (
    requestedUrl.origin !== GITHUB_API_ORIGIN ||
    requestedUrl.username ||
    requestedUrl.password ||
    requestedUrl.hash
  ) {
    throw new Error('[verify-og-publication] remoteTreeUrl must use the exact GitHub API origin')
  }

  const controller = new AbortController()
  let response
  let timeoutId
  const timeoutError = new Error(
    `[verify-og-publication] remote tree request timed out after ${timeoutMs}ms`,
  )
  timeoutError.code = 'REMOTE_TREE_TIMEOUT'
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort(timeoutError)
      reject(timeoutError)
    }, timeoutMs)
  })

  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'nguyenlephong-static-og-verifier',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (remoteTreeToken) headers.Authorization = `Bearer ${remoteTreeToken}`

    response = await Promise.race([
      fetchImpl(requestedUrl.href, {
        headers,
        redirect: 'manual',
        signal: controller.signal,
      }),
      timeoutPromise,
    ])

    let finalUrl = requestedUrl.href
    try {
      if (response.url) finalUrl = new URL(response.url).href
    } catch {
      await releaseResponseBody(response)
      throw new Error('[verify-og-publication] remote tree response has an invalid final URL')
    }
    if (
      response.type === 'opaqueredirect' ||
      response.redirected === true ||
      (response.status >= 300 && response.status < 400) ||
      new URL(finalUrl).origin !== GITHUB_API_ORIGIN ||
      finalUrl !== requestedUrl.href
    ) {
      await releaseResponseBody(response)
      throw new Error('[verify-og-publication] remote tree redirect or origin change is not allowed')
    }
    if (!response.ok) {
      await releaseResponseBody(response)
      throw new Error(
        `[verify-og-publication] remote tree request failed: ${response.status} ${response.statusText ?? ''}`,
      )
    }

    const payload = await Promise.race([response.json(), timeoutPromise])
    if (payload.truncated === true) {
      failures.push('Remote publication tree is truncated; completeness cannot be proven')
    }
    if (!Array.isArray(payload.tree)) {
      throw new Error('[verify-og-publication] remote tree response is missing its tree array')
    }

    const entriesByPath = new Map(
      payload.tree
        .filter((entry) => entry && typeof entry.path === 'string')
        .map((entry) => [entry.path, entry]),
    )
    const keys = new Set()
    for (const expectedEntry of expected) {
      const treeEntry = entriesByPath.get(`icdn/${expectedEntry.key}`)
      if (!treeEntry) continue
      if (treeEntry.type !== 'blob' || treeEntry.mode !== '100644') {
        failures.push(`Remote OG asset is not a regular file: icdn/${expectedEntry.key}`)
        continue
      }
      if (!Number.isSafeInteger(treeEntry.size) || treeEntry.size < 4) {
        failures.push(`Remote OG asset has an invalid size: icdn/${expectedEntry.key}`)
        continue
      }
      keys.add(expectedEntry.key)
    }
    return keys
  } catch (error) {
    controller.abort(error)
    void releaseResponseBody(response)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function mapWithConcurrency(items, concurrency, task) {
  const results = new Array(items.length)
  const workerCount = Math.max(1, Math.min(concurrency, items.length || 1))
  let nextIndex = 0

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex
        nextIndex += 1
        results[index] = await task(items[index], index)
      }
    }),
  )
  return results
}

function retryableStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500
}

async function releaseResponseBody(response) {
  if (!response) return
  if (typeof response === 'object') {
    if (RELEASED_RESPONSE_BODIES.has(response)) return
    RELEASED_RESPONSE_BODIES.add(response)
  }
  try {
    if (typeof response.body?.cancel === 'function') {
      await response.body.cancel()
    }
  } catch {
    // The response may already be aborted or consumed. Releasing it remains
    // best-effort and must not replace the actionable verification failure.
  }
}

async function readBoundedResponsePrefix(response, byteLimit) {
  let reader
  try {
    reader = response.body?.getReader?.({ mode: 'byob' })
  } catch {
    throw new Error('Live OG response body is not a BYOB byte stream')
  }
  if (!reader) {
    throw new Error('Live OG response body is not a BYOB byte stream')
  }
  if (typeof response === 'object') RELEASED_RESPONSE_BODIES.add(response)

  const prefix = new Uint8Array(byteLimit)
  let bytesRead = 0
  try {
    while (bytesRead < byteLimit) {
      const { done, value } = await reader.read(new Uint8Array(byteLimit - bytesRead))
      if (done) break
      if (!(value instanceof Uint8Array) || value.byteLength === 0) {
        throw new Error('Live OG response stream returned an invalid byte chunk')
      }
      const copyLength = Math.min(value.byteLength, byteLimit - bytesRead)
      prefix.set(value.subarray(0, copyLength), bytesRead)
      bytesRead += copyLength
    }
    return prefix.subarray(0, bytesRead)
  } finally {
    try {
      await reader.cancel()
    } catch {
      // The request timeout may already have aborted the stream.
    }
  }
}

function liveTimeoutError(url, timeoutMs) {
  const error = new Error(`Live OG request timed out after ${timeoutMs}ms: ${url}`)
  error.code = 'LIVE_OG_TIMEOUT'
  return error
}

async function fetchLiveAsset({
  url,
  fetchImpl,
  retries,
  retryDelayMs,
  timeoutMs,
  inspectResponse,
}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    let response
    let timeoutId
    const timeoutError = liveTimeoutError(url, timeoutMs)
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort(timeoutError)
        reject(timeoutError)
      }, timeoutMs)
    })

    try {
      response = await Promise.race([
        fetchImpl(url, {
          method: 'GET',
          headers: {
            Accept: 'image/jpeg',
            Range: `bytes=0-${LIVE_SIGNATURE_BYTES - 1}`,
          },
          redirect: 'manual',
          signal: controller.signal,
        }),
        timeoutPromise,
      ])
      if (!retryableStatus(response.status) || attempt === retries) {
        return await Promise.race([inspectResponse(response), timeoutPromise])
      }
      await Promise.race([releaseResponseBody(response), timeoutPromise])
    } catch (error) {
      lastError = error
      controller.abort(error)
      // If the body read itself timed out, awaiting cancellation could hang on
      // a broken fetch implementation. Start cleanup and let abort settle it.
      void releaseResponseBody(response)
      if (attempt === retries) throw error
    } finally {
      clearTimeout(timeoutId)
    }
    await wait(retryDelayMs * 2 ** attempt)
  }
  throw lastError ?? new Error('Live publication request failed')
}

async function inspectLiveResponse({ response, url, expectedFormat, entry }) {
  let finalUrl = url
  try {
    if (response.url) finalUrl = new URL(response.url).href
  } catch {
    await releaseResponseBody(response)
    return { entry, failure: `Live OG asset returned an invalid final URL: ${url}` }
  }

  if (
    response.type === 'opaqueredirect' ||
    response.redirected === true ||
    (response.status >= 300 && response.status < 400) ||
    finalUrl !== url
  ) {
    await releaseResponseBody(response)
    return { entry, failure: `Live OG asset redirect is not allowed: ${url}` }
  }
  if (!response.ok) {
    await releaseResponseBody(response)
    return { entry, failure: `Live OG asset returned HTTP ${response.status}: ${url}` }
  }

  const expectedContentType = expectedFormat === 'jpeg' ? 'image/jpeg' : `image/${expectedFormat}`
  const contentType = response.headers?.get?.('content-type')?.split(';')[0].trim().toLowerCase()
  if (contentType !== expectedContentType) {
    await releaseResponseBody(response)
    return {
      entry,
      failure: `Live OG asset has content-type ${contentType || 'missing'}; expected ${expectedContentType}: ${url}`,
    }
  }

  if (response.status === 200) {
    const declaredLength = response.headers?.get?.('content-length')?.trim()
    if (declaredLength) {
      if (!/^\d+$/.test(declaredLength) || !Number.isSafeInteger(Number(declaredLength))) {
        await releaseResponseBody(response)
        return {
          entry,
          failure: `Live OG asset has an invalid content-length ${declaredLength}: ${url}`,
        }
      }
      if (Number(declaredLength) > MAX_LIVE_OG_200_CONTENT_LENGTH_BYTES) {
        await releaseResponseBody(response)
        return {
          entry,
          failure: `Live OG asset content-length ${declaredLength} exceeds the ${MAX_LIVE_OG_200_CONTENT_LENGTH_BYTES}-byte safety cap: ${url}`,
        }
      }
    }
  }

  const bytes = await readBoundedResponsePrefix(response, LIVE_SIGNATURE_BYTES)
  if (bytes.byteLength < LIVE_SIGNATURE_BYTES) {
    return { entry, failure: `Live OG asset is shorter than ${LIVE_SIGNATURE_BYTES} bytes: ${url}` }
  }
  if (expectedFormat === 'jpeg' && !(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) {
    return { entry, failure: `Live OG asset signature is not JPEG: ${url}` }
  }
  return { entry, key: entry.key }
}

async function livePublicationKeys({
  expected,
  contract,
  liveBaseUrl,
  fetchImpl,
  concurrency,
  retries,
  retryDelayMs,
  timeoutMs,
  failures,
}) {
  const results = await mapWithConcurrency(expected, concurrency, async (entry) => {
    const url = new URL(entry.publicPath.replace(/^\/+/, ''), `${liveBaseUrl}/`).href
    try {
      const expectedFormat = contract.articleOg[entry.surface].publicationFormat
      return await fetchLiveAsset({
        url,
        fetchImpl,
        retries,
        retryDelayMs,
        timeoutMs,
        inspectResponse: (response) =>
          inspectLiveResponse({ response, url, expectedFormat, entry }),
      })
    } catch (error) {
      if (error?.code === 'LIVE_OG_TIMEOUT') {
        return { entry, failure: `Live OG request timed out after ${timeoutMs}ms: ${url}` }
      }
      const detail = error instanceof Error && error.message ? ` (${error.message})` : ''
      return { entry, failure: `Live OG request failed${detail}: ${url}` }
    }
  })

  const keys = new Set()
  for (const result of results) {
    if (result.failure) failures.push(result.failure)
    else keys.add(result.key)
  }
  return keys
}

export async function verifyOgPublication({
  rootDir = process.cwd(),
  contentBuildDate,
  includeScheduled = false,
  localDomPubDir,
  remoteTreeUrl,
  remoteTreeToken,
  liveBaseUrl,
  fetchImpl = globalThis.fetch,
  liveConcurrency = DEFAULT_LIVE_CONCURRENCY,
  liveRetries = DEFAULT_LIVE_RETRIES,
  liveRetryDelayMs = DEFAULT_LIVE_RETRY_DELAY_MS,
  liveTimeoutMs = DEFAULT_LIVE_TIMEOUT_MS,
  remoteTreeTimeoutMs = DEFAULT_REMOTE_TREE_TIMEOUT_MS,
} = {}) {
  const sourceCount = [localDomPubDir, remoteTreeUrl, liveBaseUrl].filter(Boolean).length
  if (sourceCount !== 1) {
    throw new Error(
      '[verify-og-publication] select exactly one source: localDomPubDir, remoteTreeUrl, or liveBaseUrl',
    )
  }
  if (typeof includeScheduled !== 'boolean') {
    throw new Error('[verify-og-publication] includeScheduled must be a boolean')
  }
  if (
    remoteTreeUrl &&
    remoteTreeToken !== undefined &&
    (typeof remoteTreeToken !== 'string' || !remoteTreeToken || /[\r\n]/.test(remoteTreeToken))
  ) {
    throw new Error('[verify-og-publication] remoteTreeToken must be a non-empty single-line string')
  }

  const contract = await loadMediaPublicationContract(rootDir)
  const inventory = await articleOgPublicationInventory({
    rootDir,
    contract,
    contentBuildDate,
  })
  const requiredEntries = includeScheduled
    ? [...inventory.expected, ...inventory.scheduled]
    : inventory.expected
  const expected = requiredEntries.map(({ published: _published, ...entry }) => entry)
  const failures = []
  let publishedKeys
  let source

  if (localDomPubDir) {
    const resolvedDomPubDir = path.resolve(localDomPubDir)
    if (!existsSync(resolvedDomPubDir) || !statSync(resolvedDomPubDir).isDirectory()) {
      throw new Error(`[verify-og-publication] local dom-pub checkout does not exist: ${resolvedDomPubDir}`)
    }
    source = `local:${resolvedDomPubDir}`
    publishedKeys = await localPublicationKeys({
      domPubDir: resolvedDomPubDir,
      expected,
      failures,
    })
  } else if (remoteTreeUrl) {
    if (typeof fetchImpl !== 'function') {
      throw new Error('[verify-og-publication] fetch is unavailable for remote tree verification')
    }
    if (!Number.isInteger(remoteTreeTimeoutMs) || remoteTreeTimeoutMs < 1) {
      throw new Error('[verify-og-publication] remoteTreeTimeoutMs must be a positive integer')
    }
    source = `remote:${remoteTreeUrl}`
    publishedKeys = await remotePublicationKeys({
      remoteTreeUrl,
      remoteTreeToken,
      expected,
      fetchImpl,
      timeoutMs: remoteTreeTimeoutMs,
      failures,
    })
  } else {
    if (typeof fetchImpl !== 'function') {
      throw new Error('[verify-og-publication] fetch is unavailable for live publication verification')
    }
    if (!Number.isInteger(liveConcurrency) || liveConcurrency < 1) {
      throw new Error('[verify-og-publication] liveConcurrency must be a positive integer')
    }
    if (!Number.isInteger(liveRetries) || liveRetries < 0) {
      throw new Error('[verify-og-publication] liveRetries must be a non-negative integer')
    }
    if (!Number.isFinite(liveRetryDelayMs) || liveRetryDelayMs < 0) {
      throw new Error('[verify-og-publication] liveRetryDelayMs must be a non-negative number')
    }
    if (!Number.isInteger(liveTimeoutMs) || liveTimeoutMs < 1) {
      throw new Error('[verify-og-publication] liveTimeoutMs must be a positive integer')
    }
    const normalizedLiveBaseUrl = new URL(liveBaseUrl)
    if (
      normalizedLiveBaseUrl.protocol !== 'https:' ||
      normalizedLiveBaseUrl.username ||
      normalizedLiveBaseUrl.password ||
      normalizedLiveBaseUrl.search ||
      normalizedLiveBaseUrl.hash
    ) {
      throw new Error('[verify-og-publication] liveBaseUrl must be a credential-free HTTPS URL')
    }
    const livePublicationBase = normalizedLiveBaseUrl.href.replace(/\/+$/, '')
    source = `live:${livePublicationBase}`
    publishedKeys = await livePublicationKeys({
      expected,
      contract,
      liveBaseUrl: livePublicationBase,
      fetchImpl,
      concurrency: liveConcurrency,
      retries: liveRetries,
      retryDelayMs: liveRetryDelayMs,
      timeoutMs: liveTimeoutMs,
      failures,
    })
  }

  const missing = expected.filter((entry) => !publishedKeys.has(entry.key))
  // Live verification already records one actionable HTTP/MIME/signature failure
  // for every unpublished key. Tree and local verification need the generic
  // missing-key diagnostic because absence has no more specific failure.
  if (!liveBaseUrl) {
    for (const entry of missing) failures.push(`Missing published OG asset: icdn/${entry.key}`)
  }

  const expectedBySurface = Object.fromEntries(
    Object.keys(contract.articleOg).map((surface) => [
      surface,
      expected.filter((entry) => entry.surface === surface).length,
    ]),
  )
  const missingBySurface = Object.fromEntries(
    Object.keys(contract.articleOg).map((surface) => [
      surface,
      missing.filter((entry) => entry.surface === surface).length,
    ]),
  )

  return {
    source,
    expected: expected.length,
    expectedBySurface,
    missing,
    missingBySurface,
    failures,
  }
}

export function parseVerifierArgs(argv) {
  const options = {
    rootDir: null,
    localDomPubDir: null,
    remoteTree: false,
    live: false,
    includeScheduled: false,
  }
  const seen = new Set()

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (!['--root', '--local', '--remote-tree', '--live', '--include-scheduled'].includes(argument)) {
      throw new Error(`[verify-og-publication] unknown argument: ${argument}`)
    }
    if (seen.has(argument)) {
      throw new Error(`[verify-og-publication] duplicate flag: ${argument}`)
    }
    seen.add(argument)

    if (argument === '--root' || argument === '--local') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error(`[verify-og-publication] ${argument} requires a value`)
      }
      options[argument === '--root' ? 'rootDir' : 'localDomPubDir'] = value
      index += 1
    } else {
      const option = argument === '--remote-tree'
        ? 'remoteTree'
        : argument === '--include-scheduled'
          ? 'includeScheduled'
          : 'live'
      options[option] = true
    }
  }

  const modeCount = [options.localDomPubDir, options.remoteTree, options.live].filter(Boolean).length
  if (modeCount > 1) {
    throw new Error(
      '[verify-og-publication] --local, --remote-tree, and --live are mutually exclusive',
    )
  }
  return options
}

async function main() {
  const options = parseVerifierArgs(process.argv.slice(2))
  const rootDir = path.resolve(options.rootDir ?? process.cwd())
  const contract = await loadMediaPublicationContract(rootDir)

  let localDomPubDir = options.localDomPubDir
  let remoteTreeUrl = null
  let liveBaseUrl = null
  if (options.remoteTree) remoteTreeUrl = process.env.OG_PUBLICATION_TREE_URL ?? contract.remoteTreeUrl
  if (options.live) liveBaseUrl = process.env.OG_PUBLICATION_LIVE_BASE_URL ?? contract.liveBaseUrl
  if (!localDomPubDir && !remoteTreeUrl && !liveBaseUrl) {
    const sibling = path.resolve(rootDir, '..', 'dom-pub')
    if (existsSync(sibling)) localDomPubDir = sibling
    else remoteTreeUrl = process.env.OG_PUBLICATION_TREE_URL ?? contract.remoteTreeUrl
  }

  const liveTimeoutMs = Number(
    process.env.OG_PUBLICATION_LIVE_TIMEOUT_MS ?? DEFAULT_LIVE_TIMEOUT_MS,
  )
  const remoteTreeTimeoutMs = Number(
    process.env.OG_PUBLICATION_TREE_TIMEOUT_MS ?? DEFAULT_REMOTE_TREE_TIMEOUT_MS,
  )
  const report = await verifyOgPublication({
    rootDir,
    includeScheduled: options.includeScheduled,
    localDomPubDir,
    remoteTreeUrl,
    remoteTreeToken: process.env.OG_PUBLICATION_GITHUB_TOKEN,
    liveBaseUrl,
    liveTimeoutMs,
    remoteTreeTimeoutMs,
  })
  console.log(
    `[verify-og-publication] checked ${report.expected} expected asset(s) against ${report.source}`,
  )
  for (const [surface, expected] of Object.entries(report.expectedBySurface)) {
    console.log(
      `[verify-og-publication] ${surface}: ${expected - report.missingBySurface[surface]}/${expected} published`,
    )
  }

  if (report.failures.length > 0) {
    console.error(`[verify-og-publication] failed with ${report.failures.length} issue(s):`)
    for (const failure of report.failures.slice(0, MAX_FAILURE_LOGS)) console.error(`- ${failure}`)
    if (report.failures.length > MAX_FAILURE_LOGS) {
      console.error(`- ... ${report.failures.length - MAX_FAILURE_LOGS} more issue(s) omitted`)
    }
    process.exitCode = 1
    return
  }

  console.log('[verify-og-publication] passed')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('[verify-og-publication] failed:', error)
    process.exitCode = 1
  })
}
