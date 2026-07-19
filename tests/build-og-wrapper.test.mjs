import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  exportCompletionSignature,
  isAuthoritativeExportComplete,
  isAuthoritativeExportDetail,
  isExportQuiet,
  removeStaleExportDetail,
  resolveBuildExitCode,
} from '../scripts/lib/build-export-guard.mjs'
import { getValidatedExportFallback } from '../scripts/lib/export-completion.mjs'

async function createFixture(t) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'build-og-export-'))
  await Promise.all([
    fs.mkdir(path.join(rootDir, '.next'), { recursive: true }),
    fs.mkdir(path.join(rootDir, 'out', 'en'), { recursive: true }),
  ])
  t.after(() => fs.rm(rootDir, { recursive: true, force: true }))
  return rootDir
}

test('fallback diagnostics distinguish partial and complete expected HTML', async (t) => {
  const rootDir = await createFixture(t)
  const startedAt = Date.now()
  const manifest = {
    routes: {
      '/': { dataRoute: '/index.rsc', srcRoute: '/' },
      '/en': { dataRoute: '/en.rsc', srcRoute: '/[locale]' },
      '/en/studio': { dataRoute: '/en/studio.rsc', srcRoute: '/[locale]/studio' },
      '/icon.png': { dataRoute: null, srcRoute: '/icon.png' },
      '/_global-error': { dataRoute: '/_global-error.rsc', srcRoute: '/_global-error' },
    },
  }
  await Promise.all([
    fs.writeFile(path.join(rootDir, '.next', 'prerender-manifest.json'), JSON.stringify(manifest)),
    fs.writeFile(path.join(rootDir, 'out', 'index.html'), '<main>root</main>'),
    fs.writeFile(path.join(rootDir, 'out', 'en.html'), '<main>home</main>'),
    fs.writeFile(path.join(rootDir, 'out', 'en', 'unrelated.html'), '<main>fresh but undeclared</main>'),
  ])

  const partial = getValidatedExportFallback({ rootDir, startedAt })
  assert.equal(partial.expectedPageCount, 3)
  assert.equal(partial.missingPageCount, 1)
  assert.equal(partial.fallbackSatisfied, false)
  assert.equal(partial.htmlCount, 2)

  await fs.writeFile(path.join(rootDir, 'out', 'en', 'studio.html'), '<main>studio</main>')
  const complete = getValidatedExportFallback({ rootDir, startedAt })
  assert.equal(complete.expectedPageCount, 3)
  assert.equal(complete.missingPageCount, 0)
  assert.equal(complete.fallbackSatisfied, true)
})

test('validated fallback refuses a stale prerender manifest', async (t) => {
  const rootDir = await createFixture(t)
  const manifestPath = path.join(rootDir, '.next', 'prerender-manifest.json')
  await Promise.all([
    fs.writeFile(manifestPath, JSON.stringify({ routes: { '/': { dataRoute: '/index.rsc' } } })),
    fs.writeFile(path.join(rootDir, 'out', 'index.html'), '<main>root</main>'),
  ])
  const staleTime = new Date(Date.now() - 10_000)
  await fs.utimes(manifestPath, staleTime, staleTime)

  const state = getValidatedExportFallback({ rootDir, startedAt: Date.now() })
  assert.equal(state.manifestFresh, false)
  assert.equal(state.fallbackSatisfied, false)
})

test('build setup fails closed when a stale export detail cannot be removed', () => {
  const unlinkError = Object.assign(new Error('permission denied'), { code: 'EACCES' })
  assert.throws(
    () =>
      removeStaleExportDetail({
        exists: () => true,
        unlink: () => {
          throw unlinkError
        },
      }),
    (error) =>
      error instanceof Error &&
      error.message.includes('refusing to build') &&
      error.cause === unlinkError,
  )
})

test('export detail authority rejects the former freshness slop and wrong output tree', async (t) => {
  const rootDir = await createFixture(t)
  const expectedOutDirectory = path.join(rootDir, 'out')
  const startedAt = 10_000
  const validDetail = { success: true, outDirectory: expectedOutDirectory }

  assert.equal(
    isAuthoritativeExportDetail({
      detail: validDetail,
      detailMtimeMs: startedAt - 1,
      startedAt,
      expectedOutDirectory,
    }),
    false,
    'a marker inside the former one-second slop is still stale',
  )
  assert.equal(
    isAuthoritativeExportDetail({
      detail: { success: true, outDirectory: path.join(rootDir, 'other-out') },
      detailMtimeMs: startedAt,
      startedAt,
      expectedOutDirectory,
    }),
    false,
  )
  assert.equal(
    isAuthoritativeExportDetail({
      detail: validDetail,
      detailMtimeMs: startedAt,
      startedAt,
      expectedOutDirectory,
    }),
    true,
  )
})

test('build wrapper requires exact observed and actually-sent signal provenance', () => {
  const resolve = (overrides) =>
    resolveBuildExitCode({
      code: null,
      signal: null,
      exportTerminationSignalsSent: [],
      authoritativeExportSucceeded: true,
      ...overrides,
    })

  assert.equal(resolve({ signal: 'SIGTERM', exportTerminationSignalsSent: ['SIGTERM'] }), 0)
  assert.equal(resolve({ code: 143, exportTerminationSignalsSent: ['SIGTERM'] }), 0)
  assert.equal(resolve({ signal: 'SIGKILL', exportTerminationSignalsSent: ['SIGKILL'] }), 0)
  assert.equal(resolve({ code: 137, exportTerminationSignalsSent: ['SIGKILL'] }), 0)

  assert.equal(resolve({ signal: 'SIGTERM' }), 1, 'external SIGTERM must fail')
  assert.equal(resolve({ code: 130 }), 130, 'external SIGINT-style exit must fail')
  assert.equal(resolve({ code: 137 }), 137, 'external OOM-style exit must fail')
  assert.equal(
    resolve({ signal: 'SIGTERM', exportTerminationSignalsSent: ['SIGKILL'] }),
    1,
    'TERM observation cannot borrow KILL provenance',
  )
  assert.equal(
    resolve({ signal: 'SIGKILL', exportTerminationSignalsSent: ['SIGTERM'] }),
    1,
    'KILL observation cannot borrow TERM provenance',
  )
  assert.equal(
    resolve({
      code: 137,
      signal: 'SIGTERM',
      exportTerminationSignalsSent: ['SIGTERM', 'SIGKILL'],
    }),
    137,
    'conflicting code and signal must fail closed',
  )
})

test('build wrapper revalidates export completion after its termination request', () => {
  assert.equal(
    resolveBuildExitCode({
      code: null,
      signal: 'SIGTERM',
      exportTerminationSignalsSent: ['SIGTERM'],
      authoritativeExportSucceeded: false,
    }),
    1,
  )
  assert.equal(
    resolveBuildExitCode({
      code: 0,
      signal: null,
      exportTerminationSignalsSent: [],
      authoritativeExportSucceeded: false,
    }),
    0,
  )
  assert.equal(
    resolveBuildExitCode({
      code: 0,
      signal: null,
      exportTerminationSignalsSent: [],
      authoritativeExportSucceeded: true,
      timedOut: true,
    }),
    1,
  )
})

test('silent artifact activity resets export settling even without child output', () => {
  const baseState = {
    detailFresh: true,
    detailSuccess: true,
    fallbackSatisfied: true,
    latestActivityMtimeMs: 900,
  }
  const updatedState = { ...baseState, latestActivityMtimeMs: 950 }

  assert.notEqual(exportCompletionSignature(baseState), exportCompletionSignature(updatedState))
  assert.equal(
    isExportQuiet({
      now: 1_000,
      quietMs: 100,
      lastChildOutputAt: 500,
      latestActivityMtimeMs: updatedState.latestActivityMtimeMs,
    }),
    false,
  )
  assert.equal(
    isExportQuiet({
      now: 1_051,
      quietMs: 100,
      lastChildOutputAt: 500,
      latestActivityMtimeMs: updatedState.latestActivityMtimeMs,
    }),
    true,
  )
})

test('complete HTML without export-detail JSON never authorizes fallback success', async (t) => {
  const rootDir = await createFixture(t)
  const startedAt = Date.now()
  await Promise.all([
    fs.writeFile(
      path.join(rootDir, '.next', 'prerender-manifest.json'),
      JSON.stringify({ routes: { '/': { dataRoute: '/index.rsc' } } }),
    ),
    fs.writeFile(path.join(rootDir, 'out', 'index.html'), '<main>complete HTML</main>'),
  ])

  const fallback = getValidatedExportFallback({ rootDir, startedAt })
  const state = {
    detailFresh: false,
    detailSuccess: false,
    fallbackSatisfied: fallback.fallbackSatisfied,
    fallbackExpectedPageCount: fallback.expectedPageCount,
    latestActivityMtimeMs: fallback.latestActivityMtimeMs,
  }

  assert.equal(fallback.fallbackSatisfied, true)
  assert.equal(isAuthoritativeExportComplete(state), false)
  assert.equal(
    isAuthoritativeExportComplete({ detailFresh: false, detailSuccess: true }),
    false,
  )
  assert.equal(exportCompletionSignature(state), '')
  assert.equal(
    resolveBuildExitCode({
      code: null,
      signal: 'SIGTERM',
      exportTerminationSignalsSent: ['SIGTERM'],
      authoritativeExportSucceeded: isAuthoritativeExportComplete(state),
    }),
    1,
  )
})

test('late JavaScript output cannot turn diagnostic HTML fallback into success', async (t) => {
  const rootDir = await createFixture(t)
  const startedAt = Date.now()
  const chunkDir = path.join(rootDir, 'out', '_next', 'static', 'chunks')
  await fs.mkdir(chunkDir, { recursive: true })
  await Promise.all([
    fs.writeFile(
      path.join(rootDir, '.next', 'prerender-manifest.json'),
      JSON.stringify({ routes: { '/': { dataRoute: '/index.rsc' } } }),
    ),
    fs.writeFile(path.join(rootDir, 'out', 'index.html'), '<main>complete HTML</main>'),
  ])

  const fallback = getValidatedExportFallback({ rootDir, startedAt })
  assert.equal(fallback.fallbackSatisfied, true)
  await fs.writeFile(path.join(chunkDir, 'late.js'), 'globalThis.late = true')

  const stateWithoutExportDetail = {
    detailFresh: false,
    detailSuccess: false,
    fallbackSatisfied: true,
    latestActivityMtimeMs: Date.now(),
  }
  assert.equal(isAuthoritativeExportComplete(stateWithoutExportDetail), false)
  assert.equal(exportCompletionSignature(stateWithoutExportDetail), '')
})

test('build wrapper uses one shared postbuild and a stable authoritative success signal', async () => {
  const buildScript = await fs.readFile('scripts/build-og.mjs', 'utf8')

  assert.match(buildScript, /getValidatedExportFallback/)
  assert.match(buildScript, /isAuthoritativeExportComplete\(exportState\)/)
  assert.match(buildScript, /isAuthoritativeExportDetail\(\{/)
  assert.match(buildScript, /exportCompletionSignature\(exportState\)/)
  assert.match(buildScript, /fallbackExpectedPageCount/)
  assert.match(buildScript, /Date\.now\(\) - exportStableSince >= quietMs &&\s+outputQuiet/)
  assert.match(buildScript, /exportTerminationSignalsSent\.add\(signal\)/)
  assert.match(buildScript, /return child\.kill\(signal\) !== false/)
  assert.match(buildScript, /timed out after \$\{BUILD_TIMEOUT_MS\}ms/)
  assert.match(buildScript, /latestActivityMtimeMs: exportState\.latestActivityMtimeMs/)
  assert.doesNotMatch(buildScript, /detailSuccess \|\| exportState\.fallbackSatisfied/)
  assert.doesNotMatch(buildScript, /EXPORT_FALLBACK_QUIET_MS/)
  assert.doesNotMatch(buildScript, /mtimeMs \+ 1000 >= startedAt/)
  assert.doesNotMatch(buildScript, /failed to remove stale export-detail\.json/)
  assert.ok(
    buildScript.lastIndexOf('removeStaleExportDetail({') <
      buildScript.indexOf('rmSync(EXPECTED_OUT_DIR'),
    'stale export detail must be removed before the previous out tree is deleted',
  )
  assert.match(
    buildScript,
    /child\.on\('close', \(code, signal\) => \{\s+const exportState = getExportState\(startedAt\)/,
  )
  assert.match(buildScript, /scripts\/postbuild\.mjs/)
  assert.equal(buildScript.match(/resolveContentBuildDate\(/g)?.length, 1)
  assert.match(
    buildScript,
    /contentBuildDate = resolveContentBuildDate\(process\.env\.CONTENT_BUILD_DATE\)/,
  )
  assert.match(buildScript, /CONTENT_BUILD_DATE: contentBuildDate/)
  assert.match(buildScript, /run\(nextBin, \['build', '--turbopack'\], env,/)
  assert.match(buildScript, /run\(process\.execPath, \['scripts\/postbuild\.mjs'\], env\)/)
  assert.doesNotMatch(buildScript, /scripts\/postbuild-og\.mjs/)
  assert.doesNotMatch(buildScript, /scripts\/postbuild-offline\.mjs/)
})

test('build wrapper rejects an invalid explicit publication date before spawning Next', () => {
  const result = spawnSync(process.execPath, ['scripts/build-og.mjs', '--skip'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, CONTENT_BUILD_DATE: '2026-02-30' },
  })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /CONTENT_BUILD_DATE must be a real UTC date/)
  assert.doesNotMatch(result.stdout, /dynamic OG cache restore only/)
})
