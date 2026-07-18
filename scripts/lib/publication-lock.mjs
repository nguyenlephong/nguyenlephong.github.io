import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import os from 'node:os'

export const PUBLICATION_LOCK_FILENAME = 'og-publication.lock'
export const DEFAULT_STALE_LOCK_MS = 30 * 60 * 1000

function processIsAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error?.code !== 'ESRCH'
  }
}

function validateOwner(owner) {
  const startedAtMs = Date.parse(owner?.startedAt)
  if (
    owner?.schemaVersion !== 1 ||
    typeof owner?.token !== 'string' ||
    owner.token.length < 8 ||
    !Number.isInteger(owner?.pid) ||
    owner.pid < 1 ||
    typeof owner?.hostname !== 'string' ||
    owner.hostname.length === 0 ||
    !Number.isFinite(startedAtMs)
  ) {
    throw new Error('invalid publication lock metadata')
  }
  return { ...owner, startedAtMs }
}

async function lockSnapshot(lockPath) {
  const before = await fs.lstat(lockPath)
  if (before.isSymbolicLink() || !before.isFile()) {
    throw new Error(`[publish-og] publication lock must be a regular file, not a symlink: ${lockPath}`)
  }
  const raw = await fs.readFile(lockPath, 'utf8')
  const after = await fs.lstat(lockPath)
  if (before.dev !== after.dev || before.ino !== after.ino) {
    const error = new Error('[publish-og] publication lock changed while being inspected; retry the command')
    error.code = 'LOCK_CHANGED'
    throw error
  }
  return { raw, stats: after }
}

function parseOwner(snapshot, lockPath) {
  try {
    return validateOwner(JSON.parse(snapshot.raw))
  } catch (error) {
    throw new Error(
      `[publish-og] publication lock metadata is invalid at ${lockPath}; inspect it and remove it manually only after proving no publisher is running`,
      { cause: error },
    )
  }
}

function ownerDescription(owner) {
  return `pid=${owner.pid} host=${owner.hostname} started=${owner.startedAt} surface=${owner.surface ?? 'unknown'}`
}

async function createLockFile(lockPath, owner) {
  const candidatePath = `${lockPath}.candidate-${owner.token}-${randomUUID()}`
  let handle
  let linked = false
  let linkError
  try {
    handle = await fs.open(candidatePath, 'wx', 0o600)
    await handle.writeFile(`${JSON.stringify(owner)}\n`, 'utf8')
    await handle.sync()
    await handle.close()
    handle = null
    await fs.link(candidatePath, lockPath)
    linked = true
  } catch (error) {
    linkError = error
  } finally {
    await handle?.close().catch(() => {})
    try {
      await fs.unlink(candidatePath)
    } catch (error) {
      if (error?.code !== 'ENOENT' && !linkError) linkError = error
    }
  }

  if (linkError) {
    if (linked) await fs.unlink(lockPath).catch(() => {})
    throw linkError
  }
  return { lockPath, owner }
}

async function quarantineStaleLock({ lockPath, snapshot, owner }) {
  const current = await lockSnapshot(lockPath)
  if (
    current.stats.dev !== snapshot.stats.dev ||
    current.stats.ino !== snapshot.stats.ino ||
    current.raw !== snapshot.raw
  ) {
    const error = new Error('[publish-og] publication lock changed before stale recovery; retry the command')
    error.code = 'LOCK_CHANGED'
    throw error
  }

  const quarantinePath = `${lockPath}.recovered-${owner.token}-${randomUUID()}`
  await fs.rename(lockPath, quarantinePath)
  await fs.unlink(quarantinePath)
}

export async function acquirePublicationLock({
  lockPath,
  surface,
  siteRoot,
  recoverStaleLock: allowStaleRecovery = false,
  staleAfterMs = DEFAULT_STALE_LOCK_MS,
  now = () => Date.now(),
  hostname = os.hostname(),
  pid = process.pid,
  isProcessAlive = processIsAlive,
  token = randomUUID(),
} = {}) {
  if (!lockPath) throw new Error('[publish-og] publication lock path is required')
  if (!Number.isFinite(staleAfterMs) || staleAfterMs < 1) {
    throw new Error('[publish-og] stale lock threshold must be a positive number')
  }

  const owner = {
    schemaVersion: 1,
    token,
    pid,
    hostname,
    startedAt: new Date(now()).toISOString(),
    surface,
    siteRoot,
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await createLockFile(lockPath, owner)
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error
    }

    let snapshot
    try {
      snapshot = await lockSnapshot(lockPath)
    } catch (error) {
      if (error?.code === 'ENOENT' || error?.code === 'LOCK_CHANGED') continue
      throw error
    }
    const existingOwner = parseOwner(snapshot, lockPath)
    const sameHost = existingOwner.hostname === hostname
    const alive = sameHost ? await isProcessAlive(existingOwner.pid) : null
    const ageMs = now() - existingOwner.startedAtMs

    if (sameHost && alive) {
      throw new Error(
        `[publish-og] publication lock is active at ${lockPath} (${ownerDescription(existingOwner)}); wait for that publisher to finish`,
      )
    }
    if (!sameHost) {
      throw new Error(
        `[publish-og] publication lock belongs to another host at ${lockPath} (${ownerDescription(existingOwner)}); remote liveness cannot be proven, so recover it manually only after verifying that host`,
      )
    }
    if (ageMs < staleAfterMs) {
      throw new Error(
        `[publish-og] publication lock owner is not running but the lock is only ${Math.max(0, Math.floor(ageMs / 1000))}s old at ${lockPath}; wait until ${Math.ceil(staleAfterMs / 1000)}s or inspect and recover manually`,
      )
    }
    if (!allowStaleRecovery) {
      throw new Error(
        `[publish-og] stale publication lock found at ${lockPath} (${ownerDescription(existingOwner)}); after verifying the owner is gone, rerun with --recover-stale-lock`,
      )
    }

    try {
      await quarantineStaleLock({ lockPath, snapshot, owner: existingOwner })
    } catch (error) {
      if (error?.code === 'ENOENT' || error?.code === 'LOCK_CHANGED') continue
      throw error
    }
  }

  throw new Error(`[publish-og] could not acquire publication lock after concurrent changes: ${lockPath}`)
}

export async function releasePublicationLock(lock) {
  const releasePath = `${lock.lockPath}.release-${lock.owner.token}-${randomUUID()}`
  try {
    await fs.rename(lock.lockPath, releasePath)
  } catch (error) {
    throw new Error(
      `[publish-og] publication lock disappeared or could not be quarantined for safe release: ${lock.lockPath}`,
      { cause: error },
    )
  }

  let releaseOwner
  try {
    releaseOwner = parseOwner(await lockSnapshot(releasePath), releasePath)
  } catch (error) {
    await restoreForeignLock(releasePath, lock.lockPath)
    throw error
  }

  if (releaseOwner.token !== lock.owner.token) {
    await restoreForeignLock(releasePath, lock.lockPath)
    throw new Error(
      `[publish-og] publication lock ownership changed before release; foreign lock was preserved at ${lock.lockPath}`,
    )
  }

  try {
    await fs.unlink(releasePath)
  } catch (error) {
    const cleanupError = new Error(
      `[publish-og] publication completed but lock cleanup failed; inspect and remove ${releasePath} manually`,
      { cause: error },
    )
    cleanupError.recoveryPath = releasePath
    throw cleanupError
  }
}

async function restoreForeignLock(releasePath, lockPath) {
  try {
    await fs.link(releasePath, lockPath)
    await fs.unlink(releasePath)
  } catch (error) {
    const recoveryError = new Error(
      `[publish-og] foreign publication lock could not be restored automatically; preserve and inspect ${releasePath}`,
      { cause: error },
    )
    recoveryError.recoveryPath = releasePath
    throw recoveryError
  }
}
