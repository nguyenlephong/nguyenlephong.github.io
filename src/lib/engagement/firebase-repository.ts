import {
  areFirebaseEngagementWritesEnabled,
  getDb,
} from '@/lib/firebase/client'
import {
  emptyPostStats,
  isReactionKey,
  normalisePostStats,
  type PostStats,
  type ReactionChange,
  type ReactionCounts,
  type ReactionKey,
} from './domain'
import type { EngagementRepository } from './repository'

const COLLECTION = 'postStats'

function isNavigatorOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

export function boundPostStatsIds(
  ids: readonly string[],
  limit: number,
): string[] {
  if (!Number.isSafeInteger(limit) || limit <= 0) return []
  return [...new Set(ids.filter(Boolean))].slice(0, limit)
}

function isValidReactionChange(change: ReactionChange): boolean {
  return (
    (change.previous === null || isReactionKey(change.previous)) &&
    (change.next === null || isReactionKey(change.next))
  )
}

function nextReactionCounts(
  current: ReactionCounts,
  change: ReactionChange,
): ReactionCounts {
  const next = { ...current }

  if (change.previous && change.previous !== change.next) {
    next[change.previous] = Math.max(0, next[change.previous] - 1)
  }
  if (change.next && change.next !== change.previous) {
    next[change.next] += 1
  }

  return next
}

function reactionUpdate(
  current: ReactionCounts,
  next: ReactionCounts,
  change: ReactionChange,
): Record<string, number> {
  const update: Record<string, number> = {}
  const affected = new Set<ReactionKey>()
  if (change.previous) affected.add(change.previous)
  if (change.next) affected.add(change.next)

  for (const reaction of affected) {
    if (current[reaction] !== next[reaction]) {
      update[`reactions.${reaction}`] = next[reaction]
    }
  }
  return update
}

export class FirebaseEngagementRepository implements EngagementRepository {
  async getStats(id: string): Promise<PostStats | null> {
    if (isNavigatorOffline()) return null
    const db = await getDb()
    if (!db) return null
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const snapshot = await getDoc(doc(db, COLLECTION, id))
      return normalisePostStats(
        snapshot.exists() ? snapshot.data() : undefined,
      )
    } catch {
      return null
    }
  }

  async getStatsByIds(
    ids: readonly string[],
    limit: number,
  ): Promise<Map<string, PostStats>> {
    const result = new Map<string, PostStats>()
    if (isNavigatorOffline()) return result
    const boundedIds = boundPostStatsIds(ids, limit)
    if (boundedIds.length === 0) return result
    const db = await getDb()
    if (!db) return result

    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const snapshots = await Promise.allSettled(
        boundedIds.map(async (id) => ({
          id,
          snapshot: await getDoc(doc(db, COLLECTION, id)),
        })),
      )

      for (const settled of snapshots) {
        if (settled.status !== 'fulfilled') continue
        const { id, snapshot } = settled.value
        result.set(
          id,
          normalisePostStats(snapshot.exists() ? snapshot.data() : undefined),
        )
      }
      return result
    } catch {
      return result
    }
  }

  async recordView(id: string): Promise<boolean> {
    if (isNavigatorOffline()) return false
    const db = await getDb()
    if (!db || !areFirebaseEngagementWritesEnabled()) return false
    try {
      const { doc, increment, setDoc } = await import('firebase/firestore')
      await setDoc(
        doc(db, COLLECTION, id),
        { views: increment(1) },
        { merge: true },
      )
      return true
    } catch {
      return false
    }
  }

  async recordShare(id: string): Promise<boolean> {
    if (isNavigatorOffline()) return false
    const db = await getDb()
    if (!db || !areFirebaseEngagementWritesEnabled()) return false
    try {
      const { doc, increment, setDoc } = await import('firebase/firestore')
      await setDoc(
        doc(db, COLLECTION, id),
        { shares: increment(1) },
        { merge: true },
      )
      return true
    } catch {
      return false
    }
  }

  async changeReaction(id: string, change: ReactionChange): Promise<boolean> {
    if (isNavigatorOffline() || !isValidReactionChange(change)) return false
    if (change.previous === change.next) return true
    const db = await getDb()
    if (!db || !areFirebaseEngagementWritesEnabled()) return false

    try {
      const { doc, runTransaction } = await import('firebase/firestore')
      const reference = doc(db, COLLECTION, id)

      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference)
        const current = snapshot.exists()
          ? normalisePostStats(snapshot.data())
          : emptyPostStats()
        const reactions = nextReactionCounts(current.reactions, change)
        const update = reactionUpdate(current.reactions, reactions, change)

        // Firestore can rerun this callback after contention. It only computes
        // document state; UI/localStorage mutations remain in the caller.
        if (Object.keys(update).length === 0) return

        if (snapshot.exists()) {
          transaction.update(reference, update)
        } else {
          transaction.set(reference, { ...current, reactions })
        }
      })

      return true
    } catch {
      return false
    }
  }
}

export const firebaseEngagementRepository =
  new FirebaseEngagementRepository()
