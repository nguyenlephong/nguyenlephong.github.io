export interface DeferredPostStatsValue {
  views: number
}

export type DeferredPostStatsLoader = (
  ids: readonly string[],
) => Promise<ReadonlyMap<string, DeferredPostStatsValue>>

export interface DeferredPostStatsStoreOptions {
  batchSize: number
  cacheLimit: number
}

interface ActiveBatch {
  ids: readonly string[]
  promise: Promise<void>
}

function validateOptions({ batchSize, cacheLimit }: DeferredPostStatsStoreOptions) {
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) {
    throw new RangeError('Deferred post stats batchSize must be a positive integer')
  }
  if (!Number.isSafeInteger(cacheLimit) || cacheLimit < batchSize) {
    throw new RangeError('Deferred post stats cacheLimit must be at least batchSize')
  }
}

/**
 * Mounted-archive cache with one provider batch and one latest-visible queue.
 * Replacing the queue under navigation churn bounds work without starving the
 * final view behind pages that are no longer visible.
 */
export function createDeferredPostStatsStore(
  loader: DeferredPostStatsLoader,
  options: DeferredPostStatsStoreOptions,
) {
  validateOptions(options)
  const { batchSize, cacheLimit } = options
  const resolved = new Map<string, number | null>()
  const listeners = new Set<() => void>()
  const idleResolvers = new Set<() => void>()
  let activeBatch: ActiveBatch | null = null
  let latestVisibleIds: readonly string[] = []
  let queuedIds: readonly string[] = []

  const boundedUniqueIds = (ids: readonly string[]) =>
    [...new Set(ids.filter(Boolean))].slice(0, batchSize)

  const prune = () => {
    const protectedIds = new Set(latestVisibleIds)
    for (const id of resolved.keys()) {
      if (resolved.size <= cacheLimit) break
      if (!protectedIds.has(id)) resolved.delete(id)
    }
  }

  const notify = () => {
    for (const listener of listeners) listener()
  }

  const resolveIdle = () => {
    if (activeBatch || queuedIds.length > 0) return
    for (const resolve of idleResolvers) resolve()
    idleResolvers.clear()
  }

  const startNextBatch = () => {
    if (activeBatch || queuedIds.length === 0) return

    const ids = queuedIds
    queuedIds = []
    const requestedSet = new Set(ids)
    let promise: Promise<void>
    promise = Promise.resolve()
      .then(() => loader(ids))
      .catch(() => new Map<string, DeferredPostStatsValue>())
      .then((stats) => {
        for (const id of ids) resolved.set(id, null)
        for (const [id, value] of stats) {
          if (requestedSet.has(id) && Number.isFinite(value.views) && value.views >= 0) {
            resolved.set(id, value.views)
          }
        }
      })
      .finally(() => {
        if (activeBatch?.promise === promise) activeBatch = null
        prune()
        startNextBatch()
        notify()
        resolveIdle()
      })

    activeBatch = { ids, promise }
  }

  const request = (ids: readonly string[]) => {
    latestVisibleIds = boundedUniqueIds(ids)
    const activeIds = new Set(activeBatch?.ids ?? [])
    queuedIds = latestVisibleIds.filter((id) => !resolved.has(id) && !activeIds.has(id))
    startNextBatch()
  }

  const outstandingIds = () => [
    ...(activeBatch?.ids ?? []),
    ...queuedIds,
  ]

  return {
    activeBatchCount: () => (activeBatch ? 1 : 0),
    activeIds: () => [...(activeBatch?.ids ?? [])],
    get: (id: string) => resolved.get(id),
    hasOutstanding: (ids: readonly string[]) => {
      const outstanding = new Set(outstandingIds())
      return ids.some((id) => outstanding.has(id))
    },
    missingIds: (ids: readonly string[]) => {
      const outstanding = new Set(outstandingIds())
      return boundedUniqueIds(ids).filter((id) => !resolved.has(id) && !outstanding.has(id))
    },
    outstandingIds,
    pendingIds: () => [...(activeBatch?.ids ?? [])],
    queuedIds: () => [...queuedIds],
    request,
    resolvedSize: () => resolved.size,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    whenIdle: () => {
      if (!activeBatch && queuedIds.length === 0) return Promise.resolve()
      return new Promise<void>((resolve) => idleResolvers.add(resolve))
    },
  }
}
