#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs'
import { open } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  expectedArticleOgPublications,
  loadMediaPublicationContract,
} from './lib/media-publication-contract.mjs'

const MAX_FAILURE_LOGS = 50
const DEFAULT_LIVE_CONCURRENCY = 8
const DEFAULT_LIVE_RETRIES = 2
const DEFAULT_LIVE_RETRY_DELAY_MS = 150
const DEFAULT_LIVE_TIMEOUT_MS = 5_000
const DEFAULT_REMOTE_TREE_TIMEOUT_MS = 10_000
const GITHUB_API_ORIGIN = 'https://api.github.com'
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

async function remotePublicationKeys({ remoteTreeUrl, fetchImpl, timeoutMs, failures }) {
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
    response = await Promise.race([
      fetchImpl(requestedUrl.href, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'nguyenlephong-static-og-verifier',
          'X-GitHub-Api-Version': '2022-11-28',
        },
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

    return new Set(
      payload.tree
        .filter((entry) => entry?.type === 'blob' && typeof entry.path === 'string')
        .map((entry) => entry.path)
        .filter((entryPath) => entryPath.startsWith('icdn/'))
        .map((entryPath) => entryPath.slice('icdn/'.length)),
    )
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
      return
    }
    if (typeof response.arrayBuffer === 'function') await response.arrayBuffer()
  } catch {
    // The response may already be aborted or consumed. Releasing it remains
    // best-effort and must not replace the actionable verification failure.
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
            Range: 'bytes=0-2',
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

  const bytes = new Uint8Array(await response.arrayBuffer())
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
      return { entry, failure: `Live OG request failed: ${url}` }
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
  localDomPubDir,
  remoteTreeUrl,
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

  const contract = await loadMediaPublicationContract(rootDir)
  const expected = await expectedArticleOgPublications({ rootDir, contract })
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
  const options = { rootDir: null, localDomPubDir: null, remoteTree: false, live: false }
  const seen = new Set()

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (!['--root', '--local', '--remote-tree', '--live'].includes(argument)) {
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
      options[argument === '--remote-tree' ? 'remoteTree' : 'live'] = true
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
    localDomPubDir,
    remoteTreeUrl,
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
