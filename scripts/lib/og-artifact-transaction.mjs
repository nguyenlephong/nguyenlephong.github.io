import { createHash, randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const JOURNAL_FILE = 'journal.json'
const LOCK_OWNER_FILE = 'owner.json'
const LOCK_SCHEMA_VERSION = 1
const MALFORMED_LOCK_GRACE_MS = 60_000
const TRANSACTION_PREFIX = '.postbuild-og-transaction-'

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function normalizeRelativePath(value) {
  if (typeof value !== 'string' || value.length === 0 || path.isAbsolute(value)) {
    throw new Error(`[postbuild-og] invalid transaction path: ${String(value)}`)
  }
  const normalized = toPosix(path.normalize(value)).replace(/^\.\//, '')
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`[postbuild-og] transaction path escapes output: ${value}`)
  }
  return normalized
}

function lockPath(outDir) {
  const output = path.resolve(outDir)
  return path.join(path.dirname(output), `.${path.basename(output)}.postbuild-transform.lock`)
}

async function pathExists(value) {
  try {
    await fs.lstat(value)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function processIsAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error?.code === 'ESRCH') return false
    if (error?.code === 'EPERM') return true
    throw error
  }
}

async function readLockOwner(directory) {
  try {
    const owner = JSON.parse(await fs.readFile(path.join(directory, LOCK_OWNER_FILE), 'utf8'))
    if (
      owner?.schemaVersion !== LOCK_SCHEMA_VERSION ||
      !Number.isSafeInteger(owner.pid) ||
      owner.pid < 1 ||
      !Number.isFinite(owner.startedAt) ||
      typeof owner.token !== 'string' ||
      owner.token.length < 16
    ) {
      return null
    }
    return owner
  } catch (error) {
    if (error?.code === 'ENOENT' || error instanceof SyntaxError) return null
    throw error
  }
}

async function retireStaleLock(directory) {
  let stat
  try {
    stat = await fs.lstat(directory)
  } catch (error) {
    if (error?.code === 'ENOENT') return true
    throw error
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error(`[postbuild] transform lock is not a directory: ${directory}`)
  }

  const owner = await readLockOwner(directory)
  if (owner && processIsAlive(owner.pid)) return false
  if (!owner && Date.now() - stat.mtimeMs < MALFORMED_LOCK_GRACE_MS) return false

  const retired = `${directory}.stale-${randomUUID()}`
  try {
    await fs.rename(directory, retired)
  } catch (error) {
    if (error?.code === 'ENOENT') return true
    throw error
  }
  await fs.rm(retired, { recursive: true, force: true })
  return true
}

export async function withPostbuildTransformLock(outDir, task) {
  const directory = lockPath(outDir)
  const owner = {
    schemaVersion: LOCK_SCHEMA_VERSION,
    pid: process.pid,
    startedAt: Date.now(),
    token: randomUUID(),
  }

  let acquired = false
  for (let attempt = 0; attempt < 2 && !acquired; attempt += 1) {
    try {
      await fs.mkdir(directory)
      try {
        await fs.writeFile(
          path.join(directory, LOCK_OWNER_FILE),
          JSON.stringify(owner),
          { flag: 'wx' },
        )
      } catch (error) {
        await fs.rm(directory, { recursive: true, force: true })
        throw error
      }
      acquired = true
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error
      if (!(await retireStaleLock(directory))) {
        throw new Error(`[postbuild] transform lock is already held: ${directory}`)
      }
    }
  }
  if (!acquired) throw new Error(`[postbuild] could not acquire transform lock: ${directory}`)

  let result
  let taskError
  try {
    result = await task()
  } catch (error) {
    taskError = error
  }

  let releaseError
  try {
    const current = await readLockOwner(directory)
    if (!current || current.token !== owner.token) {
      throw new Error(`[postbuild] transform lock ownership changed: ${directory}`)
    }
    const retired = `${directory}.release-${owner.token}`
    await fs.rename(directory, retired)
    await fs.rm(retired, { recursive: true, force: true })
  } catch (error) {
    releaseError = error
  }

  if (taskError && releaseError) {
    throw new AggregateError([taskError, releaseError], '[postbuild] task and lock release failed')
  }
  if (taskError) throw taskError
  if (releaseError) throw releaseError
  return result
}

async function copyFilePreservingBytes(from, to) {
  await fs.mkdir(path.dirname(to), { recursive: true })
  await fs.copyFile(from, to)
}

async function writeJournal(transactionDir, journal) {
  const target = path.join(transactionDir, JOURNAL_FILE)
  const temporary = `${target}.next`
  await fs.writeFile(temporary, JSON.stringify(journal), { flag: 'wx' })
  await fs.rename(temporary, target)
}

async function replaceJournal(transactionDir, journal) {
  const target = path.join(transactionDir, JOURNAL_FILE)
  const temporary = `${target}.next`
  await fs.rm(temporary, { force: true })
  await fs.writeFile(temporary, JSON.stringify(journal), { flag: 'wx' })
  await fs.rename(temporary, target)
}

async function rollbackTransaction(outDir, transactionDir, journal) {
  for (const relativePath of journal.originalAbsent) {
    await fs.rm(path.join(outDir, relativePath), { force: true })
  }
  for (const relativePath of journal.originalExisting) {
    await copyFilePreservingBytes(
      path.join(transactionDir, 'backup', relativePath),
      path.join(outDir, relativePath),
    )
  }
}

function validateJournal(entryName, journal) {
  if (
    journal?.version !== 1 ||
    !['prepared', 'applying', 'committed'].includes(journal.state) ||
    !Array.isArray(journal.originalExisting) ||
    !Array.isArray(journal.originalAbsent)
  ) {
    throw new Error(`[postbuild-og] cannot recover invalid transaction ${entryName}`)
  }
  const originalExisting = journal.originalExisting.map(normalizeRelativePath)
  const originalAbsent = journal.originalAbsent.map(normalizeRelativePath)
  if (
    new Set(originalExisting).size !== originalExisting.length ||
    new Set(originalAbsent).size !== originalAbsent.length ||
    originalAbsent.some((relativePath) => originalExisting.includes(relativePath))
  ) {
    throw new Error(`[postbuild-og] cannot recover conflicting transaction ${entryName}`)
  }
  return { ...journal, originalAbsent, originalExisting }
}

export async function createOgTransactionWorkspace(outDir) {
  const output = path.resolve(outDir)
  return fs.mkdtemp(path.join(output, TRANSACTION_PREFIX))
}

export async function recoverStaleOgTransactions(outDir) {
  const output = path.resolve(outDir)
  let recovered = 0

  for (const entry of await fs.readdir(output, { withFileTypes: true })) {
    if (!entry.name.startsWith(TRANSACTION_PREFIX)) continue
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      throw new Error(`[postbuild-og] invalid transaction workspace: ${entry.name}`)
    }
    recovered += 1
    const transactionDir = path.join(output, entry.name)
    const journalPath = path.join(transactionDir, JOURNAL_FILE)
    if (!(await pathExists(journalPath))) {
      await fs.rm(transactionDir, { recursive: true, force: true })
      continue
    }

    let journal
    try {
      journal = JSON.parse(await fs.readFile(journalPath, 'utf8'))
    } catch (error) {
      throw new Error(
        `[postbuild-og] cannot recover malformed transaction ${entry.name}: ${error.message}`,
      )
    }
    journal = validateJournal(entry.name, journal)

    if (journal.state === 'applying') {
      await rollbackTransaction(output, transactionDir, journal)
    }
    await fs.rm(transactionDir, { recursive: true, force: true })
  }

  return recovered
}

function assertUniqueOperations(writes, removals, transactionDir) {
  const writePaths = new Set()
  for (const write of writes) {
    const hasInlineContent = Buffer.isBuffer(write?.content) || typeof write?.content === 'string'
    if (
      !write ||
      !['consumer', 'normalization'].includes(write.kind) ||
      typeof write.expectedExisting !== 'boolean' ||
      (!hasInlineContent && write.staged !== true) ||
      (write.expectedExisting &&
        (!Number.isSafeInteger(write.expectedBytes) || typeof write.expectedDigest !== 'string'))
    ) {
      throw new Error('[postbuild-og] transaction contains an invalid write')
    }
    write.path = normalizeRelativePath(write.path)
    if (writePaths.has(write.path)) {
      throw new Error(`[postbuild-og] transaction has duplicate write target: ${write.path}`)
    }
    if (write.staged && !transactionDir) {
      throw new Error('[postbuild-og] staged transaction write has no workspace')
    }
    writePaths.add(write.path)
  }

  const removalPaths = new Set()
  for (const removal of removals) {
    if (
      !removal ||
      !Number.isSafeInteger(removal.expectedBytes) ||
      typeof removal.expectedDigest !== 'string'
    ) {
      throw new Error('[postbuild-og] transaction contains an invalid removal')
    }
    removal.path = normalizeRelativePath(removal.path)
    if (removalPaths.has(removal.path)) {
      throw new Error(`[postbuild-og] transaction has duplicate removal: ${removal.path}`)
    }
    if (writePaths.has(removal.path)) {
      throw new Error(`[postbuild-og] transaction writes and removes the same path: ${removal.path}`)
    }
    removalPaths.add(removal.path)
  }
}

async function assertExpectedFile(absolutePath, operation, label) {
  let stat
  try {
    stat = await fs.lstat(absolutePath)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`[postbuild-og] transaction preflight missing ${label}: ${operation.path}`)
    }
    throw error
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`[postbuild-og] transaction ${label} is not a regular file: ${operation.path}`)
  }
  if (stat.size !== operation.expectedBytes) {
    throw new Error(`[postbuild-og] transaction preflight bytes changed for ${label}: ${operation.path}`)
  }
  const digest = createHash('sha256').update(await fs.readFile(absolutePath)).digest('hex')
  if (digest !== operation.expectedDigest) {
    throw new Error(`[postbuild-og] transaction preflight digest changed for ${label}: ${operation.path}`)
  }
}

async function assertPreflightState(outDir, writes, removals, transactionDir) {
  for (const write of writes) {
    const absolutePath = path.join(outDir, write.path)
    if (write.expectedExisting) {
      await assertExpectedFile(absolutePath, write, 'write')
    } else if (await pathExists(absolutePath)) {
      throw new Error(`[postbuild-og] transaction preflight changed for write: ${write.path}`)
    }
    if (write.staged) {
      const stagedPath = path.join(transactionDir, 'staged', write.path)
      const stat = await fs.lstat(stagedPath)
      if (!stat.isFile() || stat.isSymbolicLink()) {
        throw new Error(`[postbuild-og] staged write is not a regular file: ${write.path}`)
      }
    }
  }
  for (const removal of removals) {
    await assertExpectedFile(path.join(outDir, removal.path), removal, 'removal')
  }
}

export async function applyOgArtifactTransaction({
  beforeCommit,
  injectFailure,
  outDir,
  removals,
  transactionDir,
  writes,
}) {
  const output = path.resolve(outDir)
  const workspace = path.resolve(transactionDir)
  const workspaceRelative = path.relative(output, workspace)
  if (
    !workspaceRelative ||
    workspaceRelative.startsWith('..') ||
    path.isAbsolute(workspaceRelative) ||
    !path.basename(workspace).startsWith(TRANSACTION_PREFIX)
  ) {
    throw new Error('[postbuild-og] transaction workspace must be inside output')
  }

  const plannedWrites = writes.map((entry) => ({ ...entry }))
  const plannedRemovals = removals.map((entry) => ({ ...entry }))
  assertUniqueOperations(plannedWrites, plannedRemovals, workspace)

  if (plannedWrites.length === 0 && plannedRemovals.length === 0) {
    await beforeCommit?.()
    return
  }

  const changedPaths = [
    ...new Set([
      ...plannedWrites
        .filter(({ expectedExisting }) => expectedExisting)
        .map(({ path: value }) => value),
      ...plannedRemovals.map(({ path: value }) => value),
    ]),
  ].sort()
  const originalAbsent = plannedWrites
    .filter(({ expectedExisting }) => !expectedExisting)
    .map(({ path: value }) => value)
    .sort()
  const journal = {
    version: 1,
    state: 'prepared',
    originalExisting: changedPaths,
    originalAbsent,
  }
  let applying = false
  let committed = false

  try {
    for (const write of plannedWrites) {
      if (write.expectedExisting) {
        await copyFilePreservingBytes(
          path.join(output, write.path),
          path.join(workspace, 'backup', write.path),
        )
      }
      if (!write.staged) {
        const stagedPath = path.join(workspace, 'staged', write.path)
        await fs.mkdir(path.dirname(stagedPath), { recursive: true })
        await fs.writeFile(stagedPath, write.content, { flag: 'wx' })
      }
    }
    for (const removal of plannedRemovals) {
      await copyFilePreservingBytes(
        path.join(output, removal.path),
        path.join(workspace, 'backup', removal.path),
      )
    }
    await writeJournal(workspace, journal)
    await injectFailure?.('before-preflight')
    await assertPreflightState(output, plannedWrites, plannedRemovals, workspace)
    journal.state = 'applying'
    await replaceJournal(workspace, journal)
    applying = true

    for (const write of plannedWrites.filter(({ kind }) => kind === 'normalization')) {
      await fs.mkdir(path.dirname(path.join(output, write.path)), { recursive: true })
      await fs.rename(path.join(workspace, 'staged', write.path), path.join(output, write.path))
      await injectFailure?.('after-normalization-promote', { path: write.path })
    }
    for (const write of plannedWrites.filter(({ kind }) => kind === 'consumer')) {
      await fs.rename(path.join(workspace, 'staged', write.path), path.join(output, write.path))
      await injectFailure?.('after-consumer-promote', { path: write.path })
    }
    for (const removal of plannedRemovals) {
      const destination = path.join(workspace, 'deleted', removal.path)
      await fs.mkdir(path.dirname(destination), { recursive: true })
      await fs.rename(path.join(output, removal.path), destination)
      await injectFailure?.('after-prune-move', { path: removal.path })
    }

    await beforeCommit?.()
    journal.state = 'committed'
    await replaceJournal(workspace, journal)
    committed = true
    await fs.rm(workspace, { recursive: true, force: true })
  } catch (error) {
    try {
      if (applying && !committed) {
        await rollbackTransaction(output, workspace, journal)
      }
      await fs.rm(workspace, { recursive: true, force: true })
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        `[postbuild-og] transaction failed and rollback requires recovery: ${workspace}`,
      )
    }
    throw error
  }
}
