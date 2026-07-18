import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

async function loadPolicyModule() {
  const source = await readFile(
    'src/lib/firebase/app-check-policy.ts',
    'utf8',
  )
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
  )
}

async function loadBootstrapModule() {
  const source = await readFile(
    'src/lib/firebase/app-check-bootstrap.ts',
    'utf8',
  )
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
  )
}

test('App Check status distinguishes optional absence from required failure', async () => {
  const { createInitialAppCheckStatus, engagementWritesAllowed } =
    await loadPolicyModule()

  const optional = createInitialAppCheckStatus('optional', '')
  assert.deepEqual(optional, {
    mode: 'optional',
    state: 'not-configured',
    configured: false,
    active: false,
    failure: null,
  })
  assert.equal(engagementWritesAllowed(optional), true)

  const required = createInitialAppCheckStatus('required', '')
  assert.deepEqual(required, {
    mode: 'required',
    state: 'failed',
    configured: false,
    active: false,
    failure: 'missing-site-key',
  })
  assert.equal(engagementWritesAllowed(required), false)
})

test('required mode enables writes only after App Check becomes active', async () => {
  const {
    activateAppCheck,
    createInitialAppCheckStatus,
    engagementWritesAllowed,
    failAppCheck,
    parseAppCheckMode,
  } = await loadPolicyModule()

  assert.equal(parseAppCheckMode('required'), 'required')
  assert.equal(parseAppCheckMode(undefined), 'optional')
  assert.equal(parseAppCheckMode('unexpected'), 'invalid')

  const invalid = createInitialAppCheckStatus('invalid', 'public-site-key')
  assert.equal(invalid.state, 'failed')
  assert.equal(invalid.failure, 'invalid-mode')
  assert.equal(engagementWritesAllowed(invalid), false)

  const pending = createInitialAppCheckStatus('required', 'public-site-key')
  assert.equal(pending.state, 'pending')
  assert.equal(pending.configured, true)
  assert.equal(engagementWritesAllowed(pending), false)

  const active = activateAppCheck(pending)
  assert.equal(active.state, 'active')
  assert.equal(active.active, true)
  assert.equal(engagementWritesAllowed(active), true)

  const failed = failAppCheck(pending)
  assert.equal(failed.state, 'failed')
  assert.equal(failed.failure, 'initialization-failed')
  assert.equal(engagementWritesAllowed(failed), false)
})

test('optional mode exposes bootstrap failure while preserving legacy fail-soft writes', async () => {
  const {
    createInitialAppCheckStatus,
    engagementWritesAllowed,
    failAppCheck,
  } = await loadPolicyModule()
  const failed = failAppCheck(
    createInitialAppCheckStatus('optional', 'public-site-key'),
  )

  assert.equal(failed.configured, true)
  assert.equal(failed.active, false)
  assert.equal(failed.failure, 'initialization-failed')
  assert.equal(engagementWritesAllowed(failed), true)
})

test('App Check becomes active only after initial token acquisition succeeds', async () => {
  const { bootstrapAppCheckToken } = await loadBootstrapModule()
  const calls = []
  class Provider {
    constructor(siteKey) {
      calls.push(['provider', siteKey])
    }
  }
  const successfulSdk = {
    ReCaptchaEnterpriseProvider: Provider,
    initializeAppCheck: (app, options) => {
      calls.push(['initialize', app, options.isTokenAutoRefreshEnabled])
      return { appCheck: true }
    },
    getToken: async (appCheck) => {
      calls.push(['token', appCheck])
      return { token: 'verified-token' }
    },
  }

  assert.equal(
    await bootstrapAppCheckToken(
      { app: true },
      'public-site-key',
      async () => successfulSdk,
    ),
    true,
  )
  assert.deepEqual(calls.map(([kind]) => kind), [
    'provider',
    'initialize',
    'token',
  ])

  assert.equal(
    await bootstrapAppCheckToken({}, 'public-site-key', async () => ({
      ...successfulSdk,
      getToken: async () => {
        throw new Error('blocked token exchange')
      },
    })),
    false,
  )
  assert.equal(
    await bootstrapAppCheckToken({}, 'public-site-key', async () => ({
      ...successfulSdk,
      getToken: async () => ({ token: '' }),
    })),
    false,
  )
  assert.equal(
    await bootstrapAppCheckToken(
      {},
      'public-site-key',
      async () => ({
        ...successfulSdk,
        getToken: async () => new Promise(() => {}),
      }),
      5,
    ),
    false,
  )
  assert.equal(
    await bootstrapAppCheckToken(
      {},
      'public-site-key',
      async () => new Promise(() => {}),
      5,
    ),
    false,
    'timeout must include a loader that never resolves',
  )
})

test('Firebase adapter and documentation enforce the required-mode boundary', async () => {
  const [
    client,
    repository,
    repositoryPort,
    facade,
    hook,
    envExample,
    technicalSpec,
    boundarySpec,
  ] = await Promise.all([
    readFile('src/lib/firebase/client.ts', 'utf8'),
    readFile('src/lib/engagement/firebase-repository.ts', 'utf8'),
    readFile('src/lib/engagement/repository.ts', 'utf8'),
    readFile('src/lib/firebase/postStats.ts', 'utf8'),
    readFile('src/components/blog/usePostEngagement.ts', 'utf8'),
    readFile('.env.example', 'utf8'),
    readFile('docs/technical-specification.md', 'utf8'),
    readFile('specs/engagement-provider-boundary.md', 'utf8'),
  ])

  assert.match(client, /getFirebaseAppCheckStatus/)
  assert.match(client, /areFirebaseEngagementWritesEnabled/)
  assert.match(client, /await bootstrapAppCheckToken\(app, appCheckSiteKey\)/)
  assert.equal(
    repository.match(/!areFirebaseEngagementWritesEnabled\(\)/g)?.length,
    3,
    'view, share, and reaction writes must share the required-mode gate',
  )

  const reads = repository.slice(
    repository.indexOf('async getStats('),
    repository.indexOf('async recordView('),
  )
  assert.doesNotMatch(reads, /areFirebaseEngagementWritesEnabled/)
  assert.match(repositoryPort, /recordView\(id: string\): Promise<boolean>/)
  assert.match(facade, /incrementView\(id: string\): Promise<boolean>/)
  assert.match(hook, /recordSessionView/)
  assert.doesNotMatch(hook, /safeSet\('session', viewedKey, '1'\)\s*\n\s*await incrementView/)

  assert.match(envExample, /NEXT_PUBLIC_FIREBASE_APPCHECK_MODE=optional/)
  assert.match(technicalSpec, /Enforcement remains[\s\S]*external Firebase Console setting/)
  assert.match(
    boundarySpec,
    /every\s+engagement write is denied unless App Check is active/,
  )
})
