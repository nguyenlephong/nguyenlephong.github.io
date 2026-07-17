import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

async function loadQueueModule() {
  const source = await readFile(
    'src/lib/engagement/reaction-mutation-queue.ts',
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

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

async function waitFor(predicate) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) return
    await new Promise((resolve) => setImmediate(resolve))
  }
  assert.fail('condition was not reached before the deterministic test deadline')
}

test('rapid reaction clicks serialize against the latest committed transition', async () => {
  const { ReactionMutationQueue } = await loadQueueModule()
  const first = deferred()
  const second = deferred()
  const calls = []
  const committed = []
  const settlements = []
  const queue = new ReactionMutationQueue({
    initialCommitted: null,
    mutate: (previous, next) => {
      calls.push([previous, next])
      return calls.length === 1 ? first.promise : second.promise
    },
    onCommitted: (reaction) => committed.push(reaction),
    onLatestSettled: (settlement) => settlements.push(settlement),
  })

  queue.enqueue('like')
  queue.enqueue('love')

  await waitFor(() => calls.length === 1)
  assert.deepEqual(calls, [[null, 'like']])
  assert.deepEqual(committed, [])
  assert.deepEqual(settlements, [])

  first.resolve(true)
  await waitFor(() => calls.length === 2)
  assert.deepEqual(calls[1], ['like', 'love'])
  assert.deepEqual(committed, ['like'])
  assert.deepEqual(settlements, [])

  second.resolve(true)
  await queue.whenIdle()
  assert.deepEqual(committed, ['like', 'love'])
  assert.deepEqual(settlements, [
    {
      committed: 'love',
      requested: 'love',
      succeeded: true,
      version: 2,
    },
  ])
})

test('a failed earlier click cannot roll back the newer requested reaction', async () => {
  const { ReactionMutationQueue } = await loadQueueModule()
  const first = deferred()
  const second = deferred()
  const calls = []
  const committed = []
  const settlements = []
  const queue = new ReactionMutationQueue({
    initialCommitted: null,
    mutate: (previous, next) => {
      calls.push([previous, next])
      return calls.length === 1 ? first.promise : second.promise
    },
    onCommitted: (reaction) => committed.push(reaction),
    onLatestSettled: (settlement) => settlements.push(settlement),
  })

  queue.enqueue('like')
  queue.enqueue('clap')
  await waitFor(() => calls.length === 1)

  first.resolve(false)
  await waitFor(() => calls.length === 2)
  assert.deepEqual(calls[1], [null, 'clap'])
  assert.deepEqual(settlements, [])

  second.resolve(true)
  await queue.whenIdle()
  assert.deepEqual(committed, ['clap'])
  assert.equal(settlements.length, 1)
  assert.deepEqual(settlements[0], {
    committed: 'clap',
    requested: 'clap',
    succeeded: true,
    version: 2,
  })
})

test('latest failure reconciles to the last successful queued reaction', async () => {
  const { ReactionMutationQueue } = await loadQueueModule()
  const calls = []
  const committed = []
  const settlements = []
  const queue = new ReactionMutationQueue({
    initialCommitted: 'like',
    mutate: async (previous, next) => {
      calls.push([previous, next])
      return calls.length === 1
    },
    onCommitted: (reaction) => committed.push(reaction),
    onLatestSettled: (settlement) => settlements.push(settlement),
  })

  queue.enqueue('love')
  queue.enqueue('insightful')
  await queue.whenIdle()

  assert.deepEqual(calls, [
    ['like', 'love'],
    ['love', 'insightful'],
  ])
  assert.deepEqual(committed, ['love'])
  assert.deepEqual(settlements, [
    {
      committed: 'love',
      requested: 'insightful',
      succeeded: false,
      version: 2,
    },
  ])
})

test('successful settlement persists after unmount without reconciling UI', async () => {
  const { ReactionMutationQueue } = await loadQueueModule()
  const mutation = deferred()
  const uiSettlements = []
  let mounted = true
  let mutationStarted = false
  let storedReaction = null
  const queue = new ReactionMutationQueue({
    initialCommitted: null,
    mutate: () => {
      mutationStarted = true
      return mutation.promise
    },
    onCommitted: (reaction) => {
      storedReaction = reaction
    },
    onLatestSettled: (settlement) => {
      if (mounted) uiSettlements.push(settlement)
    },
  })

  queue.enqueue('love')
  await waitFor(() => mutationStarted)
  assert.equal(storedReaction, null, 'optimistic intent must not reach durable storage')

  mounted = false
  mutation.resolve(true)
  await queue.whenIdle()

  assert.equal(storedReaction, 'love')
  assert.deepEqual(uiSettlements, [])
})

test('failed settlement after unmount preserves the last committed storage', async () => {
  const { ReactionMutationQueue } = await loadQueueModule()
  const mutation = deferred()
  const uiSettlements = []
  let mounted = true
  let mutationStarted = false
  let storedReaction = 'like'
  const queue = new ReactionMutationQueue({
    initialCommitted: 'like',
    mutate: () => {
      mutationStarted = true
      return mutation.promise
    },
    onCommitted: (reaction) => {
      storedReaction = reaction
    },
    onLatestSettled: (settlement) => {
      if (mounted) uiSettlements.push(settlement)
    },
  })

  queue.enqueue('clap')
  await waitFor(() => mutationStarted)
  mounted = false
  mutation.resolve(false)
  await queue.whenIdle()

  assert.equal(storedReaction, 'like')
  assert.deepEqual(uiSettlements, [])
})
