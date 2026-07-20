import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import ts from 'typescript'

import {
  exportCompletionSignature,
  isAuthoritativeExportComplete,
  isAuthoritativeExportDetail,
  isExportQuiet,
  removeStaleExportDetail,
  resolveBuildExitCode,
} from '../scripts/lib/build-export-guard.mjs'
import {
  formatBuildOgError,
  reportBuildOgFailure,
} from '../scripts/lib/build-og-error.mjs'
import { runBuildUnderPostbuildLock } from '../scripts/lib/build-og-lock.mjs'
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

function staticRuntimeModuleNames(sourceFile) {
  const moduleNames = []
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      if (statement.importClause?.isTypeOnly) continue
      moduleNames.push(statement.moduleSpecifier.text)
    } else if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      !statement.isTypeOnly
    ) {
      moduleNames.push(statement.moduleSpecifier.text)
    }
  }
  return moduleNames
}

async function collectEagerImportGraph(entry) {
  const files = new Set()
  const packages = new Set()
  const queue = [path.resolve(entry)]

  while (queue.length > 0) {
    const file = queue.shift()
    if (files.has(file)) continue
    files.add(file)
    const source = await fs.readFile(file, 'utf8')
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    )
    assert.equal(sourceFile.parseDiagnostics.length, 0, `${file} must parse`)

    for (const moduleName of staticRuntimeModuleNames(sourceFile)) {
      if (moduleName.startsWith('node:')) continue
      if (!moduleName.startsWith('.')) {
        packages.add(moduleName)
        continue
      }
      queue.push(path.resolve(path.dirname(file), moduleName))
    }
  }

  return { files, packages }
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

test('whole-build lock rejects a concurrent destructive prepare and releases after failure', async (t) => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'build-og-lock-'))
  const outDir = path.join(rootDir, 'out')
  await fs.mkdir(outDir)
  t.after(() => fs.rm(rootDir, { recursive: true, force: true }))

  let releaseFirst
  let firstReachedBuild
  const release = new Promise((resolve) => {
    releaseFirst = resolve
  })
  const reachedBuild = new Promise((resolve) => {
    firstReachedBuild = resolve
  })
  let concurrentPrepareCalls = 0
  const first = runBuildUnderPostbuildLock({
    async build() {
      firstReachedBuild()
      await release
      return 0
    },
    outDir,
    async postbuild() {},
    async prepare() {
      await fs.writeFile(path.join(outDir, 'first-prepared'), 'owned by first build')
    },
  })
  await reachedBuild

  await assert.rejects(
    runBuildUnderPostbuildLock({
      async build() {
        return 0
      },
      outDir,
      async postbuild() {},
      async prepare() {
        concurrentPrepareCalls += 1
        await fs.rm(path.join(outDir, 'first-prepared'))
      },
    }),
    /transform lock is already held/,
  )
  assert.equal(concurrentPrepareCalls, 0)
  assert.equal(await fs.readFile(path.join(outDir, 'first-prepared'), 'utf8'), 'owned by first build')

  releaseFirst()
  assert.equal(await first, 0)

  await assert.rejects(
    runBuildUnderPostbuildLock({
      async build() {
        return 0
      },
      outDir,
      async postbuild() {
        throw new Error('injected postbuild failure')
      },
      async prepare() {},
    }),
    /injected postbuild failure/,
  )
  const retry = await runBuildUnderPostbuildLock({
    async build() {
      return 0
    },
    outDir,
    async postbuild() {},
    async prepare() {},
  })
  assert.equal(retry, 0)
})

test('whole-build wrapper does not enter postbuild after a failed Next build', async (t) => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'build-og-failed-build-'))
  const outDir = path.join(rootDir, 'out')
  await fs.mkdir(outDir)
  t.after(() => fs.rm(rootDir, { recursive: true, force: true }))

  let postbuildCalls = 0
  const result = await runBuildUnderPostbuildLock({
    async build() {
      return 7
    },
    outDir,
    async postbuild() {
      postbuildCalls += 1
    },
    async prepare() {},
  })

  assert.equal(result, 7)
  assert.equal(postbuildCalls, 0)
})

test('build failure reporter preserves the error graph without exposing arbitrary properties', () => {
  const taskCause = new Error('task root cause')
  const taskError = new Error('postbuild task failed', { cause: taskCause })
  const releaseError = new Error('postbuild lock release failed')
  taskCause.cause = taskError
  taskError.secret = 'DO_NOT_PRINT_BUILD_TOKEN'
  releaseError.authorization = 'Bearer private-ci-token'
  const error = new AggregateError(
    [taskError, releaseError],
    '[postbuild] task and lock release failed',
  )
  let output = ''

  reportBuildOgFailure(error, (message) => {
    output = message
  })

  assert.match(output, /AggregateError: \[postbuild\] task and lock release failed/)
  assert.match(output, /Error: postbuild task failed/)
  assert.match(output, /Error: task root cause/)
  assert.match(output, /Error: postbuild lock release failed/)
  assert.match(output, /\n\s+at /, 'CI diagnostic must retain a useful stack')
  assert.match(output, /circular error reference/)
  assert.doesNotMatch(output, /DO_NOT_PRINT_BUILD_TOKEN|private-ci-token|authorization|secret/)
})

test('build failure formatter bounds deep, wide, and oversized error graphs', () => {
  let cause = new Error('deepest cause')
  for (let index = 0; index < 40; index += 1) {
    cause = new Error(`cause-${index}-${'x'.repeat(20_000)}`, { cause })
    cause.stack = `${cause.name}: ${cause.message}\n    at oversized-stack-${'y'.repeat(20_000)}`
  }
  const error = new AggregateError(
    Array.from({ length: 100 }, (_, index) =>
      index === 0 ? cause : new Error(`aggregate child ${index}`),
    ),
    'bounded build failure',
  )

  const output = formatBuildOgError(error)

  assert.ok(output.length <= 64 * 1024, `formatted error is ${output.length} characters`)
  assert.match(output, /(?:depth|entry|output|string) limit|truncated/)
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

test('Next build eager imports exclude the success-only postbuild parser graph', async () => {
  const buildFile = path.resolve('scripts/build-og.mjs')
  const postbuildFile = path.resolve('scripts/postbuild.mjs')
  const source = await fs.readFile(buildFile, 'utf8')
  const sourceFile = ts.createSourceFile(
    buildFile,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  )
  const postbuildImports = []

  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(node.arguments[0]) &&
      node.arguments[0].text === './postbuild.mjs'
    ) {
      postbuildImports.push(node)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  assert.equal(postbuildImports.length, 1)
  let callback = postbuildImports[0].parent
  while (callback && !ts.isMethodDeclaration(callback)) callback = callback.parent
  assert.ok(callback && ts.isIdentifier(callback.name))
  assert.equal(callback.name.text, 'postbuild')
  assert.ok(ts.isObjectLiteralExpression(callback.parent))
  assert.ok(ts.isCallExpression(callback.parent.parent))
  assert.equal(callback.parent.parent.expression.getText(sourceFile), 'runBuildUnderPostbuildLock')

  const eagerBuild = await collectEagerImportGraph(buildFile)
  assert.equal(eagerBuild.files.has(postbuildFile), false)
  assert.equal(eagerBuild.packages.has('typescript'), false)
  assert.equal(eagerBuild.packages.has('entities'), false)

  const eagerPostbuild = await collectEagerImportGraph(postbuildFile)
  assert.equal(eagerPostbuild.packages.has('typescript'), true)
  assert.equal(eagerPostbuild.packages.has('entities'), true)
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
  assert.ok(
    buildScript.indexOf('unlinkSync(POSTBUILD_OG_STATE)') <
      buildScript.indexOf('rmSync(EXPECTED_OUT_DIR'),
    'committed OG state must be invalidated before a fresh output tree is created',
  )
  assert.match(
    buildScript,
    /child\.on\('close', \(code, signal\) => \{\s+const exportState = getExportState\(startedAt\)/,
  )
  assert.match(buildScript, /runBuildUnderPostbuildLock\(\{/)
  assert.equal(buildScript.match(/resolveContentBuildDate\(/g)?.length, 1)
  assert.match(
    buildScript,
    /contentBuildDate = resolveContentBuildDate\(process\.env\.CONTENT_BUILD_DATE\)/,
  )
  assert.match(buildScript, /CONTENT_BUILD_DATE: contentBuildDate/)
  assert.match(buildScript, /run\(nextBin, \['build', '--turbopack'\], env,/)
  assert.match(
    buildScript,
    /runPostbuildTransforms\(\{\s+acquireLock: false,\s+nextDir:/,
  )
  assert.doesNotMatch(buildScript, /run\(process\.execPath, \['scripts\/postbuild\.mjs'\]/)
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
