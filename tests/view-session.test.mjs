import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

async function loadViewSessionModule() {
  const source = await readFile(
    'src/lib/engagement/view-session.ts',
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

test('a failed view write retries on a later init before committing the marker', async () => {
  const { recordSessionView, VIEW_INCREMENT_MAX_ATTEMPTS } =
    await loadViewSessionModule()
  let viewed = false
  let marks = 0
  const attempts = []

  const options = {
    key: 'blog:viewed:network-retry',
    isViewed: () => viewed,
    markViewed: () => {
      viewed = true
      marks += 1
    },
    increment: async () => {
      attempts.push(viewed)
      return attempts.length === 2
    },
  }

  assert.equal(VIEW_INCREMENT_MAX_ATTEMPTS, 2)
  assert.equal(await recordSessionView(options), false)
  assert.deepEqual(attempts, [false])
  assert.equal(marks, 0)
  assert.equal(viewed, false)

  assert.equal(await recordSessionView(options), true)
  assert.deepEqual(attempts, [false, false])
  assert.equal(marks, 1)
  assert.equal(viewed, true)
})

test('failed view retries are capped across the current page runtime', async () => {
  const { recordSessionView } = await loadViewSessionModule()
  let viewed = false
  let calls = 0

  const options = {
    key: 'blog:viewed:later-retry',
    isViewed: () => viewed,
    markViewed: () => {
      viewed = true
    },
    increment: async () => {
      calls += 1
      return false
    },
  }

  assert.equal(await recordSessionView(options), false)
  assert.equal(viewed, false)
  assert.equal(calls, 1)

  assert.equal(await recordSessionView(options), false)
  assert.equal(await recordSessionView(options), false)
  assert.equal(viewed, false)
  assert.equal(calls, 2)
})

test('a committed session view is idempotent across sequential and concurrent init', async () => {
  const { recordSessionView } = await loadViewSessionModule()
  let viewed = false
  let calls = 0
  let release
  const pending = new Promise((resolve) => {
    release = resolve
  })
  const options = {
    key: 'blog:viewed:idempotent',
    isViewed: () => viewed,
    markViewed: () => {
      viewed = true
    },
    increment: async () => {
      calls += 1
      await pending
      return true
    },
  }

  const first = recordSessionView(options)
  const concurrent = recordSessionView(options)
  assert.equal(calls, 1)
  release()

  assert.deepEqual(await Promise.all([first, concurrent]), [true, true])
  assert.equal(calls, 1)
  assert.equal(await recordSessionView(options), true)
  assert.equal(calls, 1)
})

test('a pending view mutation never blocks the initial stats read', async () => {
  const hook = await readFile(
    'src/components/blog/usePostEngagement.ts',
    'utf8',
  )
  assert.match(hook, /void recordSessionView\(\{/)
  assert.doesNotMatch(hook, /await recordSessionView/)
})
