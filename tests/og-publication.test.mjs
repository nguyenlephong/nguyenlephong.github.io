import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  parseVerifierArgs,
  verifyOgPublication,
} from '../scripts/verify-og-publication.mjs'
import { expectedArticleOgPublications } from '../scripts/lib/media-publication-contract.mjs'

const JPEG_FIXTURE = Buffer.from([0xff, 0xd8, 0xff, 0xd9])

async function createFixture(t) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'og-publication-'))
  const domPubDir = path.join(rootDir, 'dom-pub')
  const siteDir = path.join(rootDir, 'site')
  const contract = {
    schemaVersion: 1,
    remoteTreeUrl: 'https://api.github.com/repos/nguyenlephong/dom-pub/git/trees/main?recursive=1',
    liveBaseUrl: 'https://media.example.test',
    articleOg: {
      blog: {
        sourceIndex: 'public/blog-data/_index.json',
        sourceDirectory: 'public/og/blog',
        sourceExtension: '.png',
        publicPathPrefix: '/og/blogs',
        publicationDirectory: 'og/blogs',
        publicationExtension: '.jpg',
        publicationFormat: 'jpeg',
      },
      notes: {
        sourceIndex: 'public/notes-data/_index.json',
        sourceDirectory: 'public/og/notes',
        sourceExtension: '.png',
        publicPathPrefix: '/og/notes',
        publicationDirectory: 'og/notes',
        publicationExtension: '.jpg',
        publicationFormat: 'jpeg',
      },
    },
  }

  await Promise.all([
    fs.mkdir(path.join(siteDir, 'config'), { recursive: true }),
    fs.mkdir(path.join(siteDir, 'public/blog-data'), { recursive: true }),
    fs.mkdir(path.join(siteDir, 'public/notes-data'), { recursive: true }),
    fs.mkdir(path.join(domPubDir, 'icdn/og/blogs'), { recursive: true }),
    fs.mkdir(path.join(domPubDir, 'icdn/og/notes'), { recursive: true }),
  ])
  await Promise.all([
    fs.writeFile(path.join(siteDir, 'config/media-publication.json'), JSON.stringify(contract)),
    fs.writeFile(
      path.join(siteDir, 'public/blog-data/_index.json'),
      JSON.stringify({
        posts: [
          { slug: 'static-first', date: '2020-01-01' },
          { slug: 'safe-boundaries', date: '2020-01-02' },
        ],
      }),
    ),
    fs.writeFile(
      path.join(siteDir, 'public/notes-data/_index.json'),
      JSON.stringify({ posts: [{ slug: 'calm-systems', date: '2020-01-03' }] }),
    ),
  ])
  t.after(() => fs.rm(rootDir, { recursive: true, force: true }))
  return { contract, domPubDir, siteDir }
}

test('expects only published article OG assets and ignores stale unpublished files', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(
      path.join(siteDir, 'public/blog-data/_index.json'),
      JSON.stringify({
        posts: [
          { slug: 'static-first', date: '2026-07-18' },
          { slug: 'safe-boundaries', date: '2026-07-19' },
          { slug: 'draft-entry', date: '2020-01-01', status: 'draft' },
        ],
      }),
    ),
    fs.writeFile(
      path.join(siteDir, 'public/notes-data/_index.json'),
      JSON.stringify({
        posts: [{ slug: 'calm-systems', date: '2020-01-01', publishAt: '2026-07-19' }],
      }),
    ),
    fs.writeFile(path.join(domPubDir, 'icdn/og/blogs/static-first.jpg'), JPEG_FIXTURE),
    fs.writeFile(path.join(domPubDir, 'icdn/og/blogs/safe-boundaries.jpg'), JPEG_FIXTURE),
  ])

  const expected = await expectedArticleOgPublications({
    rootDir: siteDir,
    contentBuildDate: '2026-07-18',
  })
  assert.deepEqual(expected.map(({ slug }) => slug), ['static-first'])

  const report = await verifyOgPublication({
    rootDir: siteDir,
    contentBuildDate: '2026-07-18',
    localDomPubDir: domPubDir,
  })
  assert.equal(report.expected, 1)
  assert.deepEqual(report.expectedBySurface, { blog: 1, notes: 0 })
  assert.deepEqual(report.failures, [])
  assert.deepEqual(await fs.readFile(path.join(domPubDir, 'icdn/og/blogs/safe-boundaries.jpg')), JPEG_FIXTURE)
})

test('fails closed when a raw OG publication index has invalid lifecycle metadata', async (t) => {
  const { siteDir } = await createFixture(t)
  await fs.writeFile(
    path.join(siteDir, 'public/blog-data/_index.json'),
    JSON.stringify({ posts: [{ slug: 'static-first', date: '2026-02-30' }] }),
  )

  await assert.rejects(
    expectedArticleOgPublications({ rootDir: siteDir, contentBuildDate: '2026-07-18' }),
    /invalid publication metadata for blog\/static-first: Content date must be a real UTC date/,
  )
})

test('proves all expected article OG keys from a read-only local dom-pub tree', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(domPubDir, 'icdn/og/blogs/static-first.jpg'), JPEG_FIXTURE),
    fs.writeFile(path.join(domPubDir, 'icdn/og/blogs/safe-boundaries.jpg'), JPEG_FIXTURE),
    fs.writeFile(path.join(domPubDir, 'icdn/og/notes/calm-systems.jpg'), JPEG_FIXTURE),
  ])

  const report = await verifyOgPublication({ rootDir: siteDir, localDomPubDir: domPubDir })

  assert.equal(report.expected, 3)
  assert.deepEqual(report.expectedBySurface, { blog: 2, notes: 1 })
  assert.deepEqual(report.missing, [])
  assert.deepEqual(report.failures, [])
})

test('fails deterministically when a local publication is missing or has the wrong format', async (t) => {
  const { domPubDir, siteDir } = await createFixture(t)
  await Promise.all([
    fs.writeFile(path.join(domPubDir, 'icdn/og/blogs/static-first.jpg'), JPEG_FIXTURE),
    fs.writeFile(path.join(domPubDir, 'icdn/og/notes/calm-systems.jpg'), 'not jpeg'),
  ])

  const report = await verifyOgPublication({ rootDir: siteDir, localDomPubDir: domPubDir })
  const failures = report.failures.join('\n')

  assert.deepEqual(
    report.missing.map(({ key }) => key),
    ['og/blogs/safe-boundaries.jpg', 'og/notes/calm-systems.jpg'],
  )
  assert.match(failures, /Published OG asset is not a JPEG: icdn\/og\/notes\/calm-systems\.jpg/)
  assert.match(failures, /Missing published OG asset: icdn\/og\/blogs\/safe-boundaries\.jpg/)
})

test('proves expected keys against an untruncated remote repository tree', async (t) => {
  const { contract, siteDir } = await createFixture(t)
  const fetchImpl = async (url, options) => {
    assert.equal(url, contract.remoteTreeUrl)
    assert.equal(options.headers.Accept, 'application/vnd.github+json')
    assert.equal(options.redirect, 'manual')
    assert.ok(options.signal instanceof AbortSignal)
    return {
      ok: true,
      async json() {
        return {
          truncated: false,
          tree: [
            { type: 'blob', path: 'icdn/og/blogs/static-first.jpg' },
            { type: 'blob', path: 'icdn/og/blogs/safe-boundaries.jpg' },
            { type: 'blob', path: 'icdn/og/notes/calm-systems.jpg' },
          ],
        }
      },
    }
  }

  const report = await verifyOgPublication({
    rootDir: siteDir,
    remoteTreeUrl: contract.remoteTreeUrl,
    fetchImpl,
  })

  assert.deepEqual(report.failures, [])
})

test('fails closed when the remote repository tree is truncated', async (t) => {
  const { contract, siteDir } = await createFixture(t)
  const fetchImpl = async () => ({
    ok: true,
    async json() {
      return { truncated: true, tree: [] }
    },
  })

  const report = await verifyOgPublication({
    rootDir: siteDir,
    remoteTreeUrl: contract.remoteTreeUrl,
    fetchImpl,
  })

  assert.match(report.failures.join('\n'), /tree is truncated; completeness cannot be proven/)
  assert.equal(report.missing.length, 3)
})

test('bounds remote-tree requests and aborts a never-resolving fetch', async (t) => {
  const { contract, siteDir } = await createFixture(t)
  let aborted = 0
  const fetchImpl = (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener(
        'abort',
        () => {
          aborted += 1
          reject(signal.reason)
        },
        { once: true },
      )
    })

  await assert.rejects(
    verifyOgPublication({
      rootDir: siteDir,
      remoteTreeUrl: contract.remoteTreeUrl,
      fetchImpl,
      remoteTreeTimeoutMs: 5,
    }),
    /remote tree request timed out after 5ms/,
  )
  assert.equal(aborted, 1)
})

test('rejects remote-tree redirects and final URLs outside the exact GitHub API request', async (t) => {
  const { contract, siteDir } = await createFixture(t)
  let cancellations = 0
  const response = ({ status = 200, finalUrl, redirected = false }) => ({
    ok: status >= 200 && status < 300,
    status,
    url: finalUrl,
    redirected,
    body: {
      async cancel() {
        cancellations += 1
      },
    },
    async json() {
      return { truncated: false, tree: [] }
    },
  })

  await assert.rejects(
    verifyOgPublication({
      rootDir: siteDir,
      remoteTreeUrl: contract.remoteTreeUrl,
      fetchImpl: async () => response({ status: 302, finalUrl: contract.remoteTreeUrl }),
    }),
    /redirect or origin change is not allowed/,
  )
  await assert.rejects(
    verifyOgPublication({
      rootDir: siteDir,
      remoteTreeUrl: contract.remoteTreeUrl,
      fetchImpl: async () =>
        response({
          finalUrl: contract.remoteTreeUrl.replace('api.github.com', 'api.github.com.evil.test'),
          redirected: true,
        }),
    }),
    /redirect or origin change is not allowed/,
  )
  assert.equal(cancellations, 2)
})

test('CLI parser rejects unknown, duplicate, and conflicting verification modes', () => {
  assert.deepEqual(parseVerifierArgs(['--root', 'site', '--remote-tree']), {
    rootDir: 'site',
    localDomPubDir: null,
    remoteTree: true,
    live: false,
  })
  assert.throws(() => parseVerifierArgs(['--liv']), /unknown argument: --liv/)
  assert.throws(
    () => parseVerifierArgs(['--live', '--live']),
    /duplicate flag: --live/,
  )
  assert.throws(
    () => parseVerifierArgs(['--local', '../dom-pub', '--remote-tree']),
    /mutually exclusive/,
  )
  assert.throws(
    () => parseVerifierArgs(['--remote-tree', '--live']),
    /mutually exclusive/,
  )
})

function liveResponse({
  status = 206,
  contentType = 'image/jpeg',
  body = JPEG_FIXTURE,
  finalUrl = '',
  redirected = false,
  onCancel,
} = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    url: finalUrl,
    redirected,
    body: onCancel
      ? {
          async cancel() {
            onCancel()
          },
        }
      : undefined,
    headers: {
      get(name) {
        return name.toLowerCase() === 'content-type' ? contentType : null
      },
    },
    async arrayBuffer() {
      return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)
    },
  }
}

test('proves live publication MIME and JPEG signatures with bounded range requests', async (t) => {
  const { contract, siteDir } = await createFixture(t)
  let active = 0
  let maximumActive = 0
  const fetchImpl = async (url, options) => {
    assert.match(url, /^https:\/\/media\.example\.test\/og\/(?:blogs|notes)\//)
    assert.equal(options.method, 'GET')
    assert.equal(options.headers.Range, 'bytes=0-2')
    assert.equal(options.redirect, 'manual')
    assert.ok(options.signal instanceof AbortSignal)
    active += 1
    maximumActive = Math.max(maximumActive, active)
    await new Promise((resolve) => setTimeout(resolve, 2))
    active -= 1
    return liveResponse()
  }

  const report = await verifyOgPublication({
    rootDir: siteDir,
    liveBaseUrl: contract.liveBaseUrl,
    fetchImpl,
    liveConcurrency: 2,
    liveRetries: 0,
  })

  assert.deepEqual(report.failures, [])
  assert.ok(maximumActive <= 2)
})

test('retries transient live failures and rejects wrong MIME or signature deterministically', async (t) => {
  const { contract, siteDir } = await createFixture(t)
  const attempts = new Map()
  let cancelledWrongMime = 0
  const fetchImpl = async (url) => {
    const attempt = (attempts.get(url) ?? 0) + 1
    attempts.set(url, attempt)
    if (url.endsWith('/static-first.jpg') && attempt === 1) {
      return liveResponse({ status: 503 })
    }
    if (url.endsWith('/safe-boundaries.jpg')) {
      return liveResponse({
        contentType: 'application/octet-stream',
        onCancel: () => {
          cancelledWrongMime += 1
        },
      })
    }
    if (url.endsWith('/calm-systems.jpg')) {
      return liveResponse({ body: Buffer.from('not jpeg') })
    }
    return liveResponse()
  }

  const report = await verifyOgPublication({
    rootDir: siteDir,
    liveBaseUrl: contract.liveBaseUrl,
    fetchImpl,
    liveConcurrency: 1,
    liveRetries: 1,
    liveRetryDelayMs: 0,
  })
  const failures = report.failures.join('\n')

  assert.equal(attempts.get(`${contract.liveBaseUrl}/og/blogs/static-first.jpg`), 2)
  assert.equal(cancelledWrongMime, 1)
  assert.equal(report.failures.length, 2)
  assert.match(failures, /content-type application\/octet-stream; expected image\/jpeg/)
  assert.match(failures, /signature is not JPEG/)
  assert.doesNotMatch(failures, /Missing published OG asset/)
  assert.deepEqual(
    report.missing.map(({ key }) => key),
    ['og/blogs/safe-boundaries.jpg', 'og/notes/calm-systems.jpg'],
  )
})

test('aborts each timed-out live attempt and retries with backoff', async (t) => {
  const { contract, siteDir } = await createFixture(t)
  const attempts = new Map()
  const aborts = new Map()
  const attemptTimes = new Map()
  const timeoutMs = 5
  const retryDelayMs = 5
  const fetchImpl = (url, { signal }) => {
    attempts.set(url, (attempts.get(url) ?? 0) + 1)
    attemptTimes.set(url, [...(attemptTimes.get(url) ?? []), Date.now()])
    return new Promise((_resolve, reject) => {
      signal.addEventListener(
        'abort',
        () => {
          aborts.set(url, (aborts.get(url) ?? 0) + 1)
          reject(signal.reason)
        },
        { once: true },
      )
    })
  }

  const report = await verifyOgPublication({
    rootDir: siteDir,
    liveBaseUrl: contract.liveBaseUrl,
    fetchImpl,
    liveConcurrency: 1,
    liveRetries: 1,
    liveRetryDelayMs: retryDelayMs,
    liveTimeoutMs: timeoutMs,
  })

  assert.equal(report.failures.length, 3)
  assert.match(report.failures.join('\n'), /timed out after 5ms/)
  for (const entry of attempts.keys()) {
    assert.equal(attempts.get(entry), 2)
    assert.equal(aborts.get(entry), 2)
    const times = attemptTimes.get(entry)
    assert.ok(times[1] - times[0] >= timeoutMs + retryDelayMs - 2)
  }
})

test('rejects redirects and cancels their response body', async (t) => {
  const { contract, siteDir } = await createFixture(t)
  let cancellations = 0
  const fetchImpl = async (url, options) => {
    assert.equal(options.redirect, 'manual')
    return liveResponse({
      status: url.endsWith('/static-first.jpg') ? 302 : 206,
      finalUrl: url.endsWith('/static-first.jpg')
        ? url
        : url.replace('media.example.test', 'redirected.example.test'),
      redirected: !url.endsWith('/static-first.jpg'),
      onCancel: () => {
        cancellations += 1
      },
    })
  }

  const report = await verifyOgPublication({
    rootDir: siteDir,
    liveBaseUrl: contract.liveBaseUrl,
    fetchImpl,
    liveRetries: 0,
  })

  assert.equal(report.failures.length, 3)
  assert.equal(cancellations, 3)
  assert.match(report.failures.join('\n'), /redirect is not allowed/)
})
