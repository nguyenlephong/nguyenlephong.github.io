/**
 * Compatibility facade for article engagement.
 *
 * UI modules keep this stable API while provider-specific Firestore behavior
 * lives behind the EngagementRepository boundary.
 */
import {
  REACTION_KEYS,
  emptyReactions,
  type PostStats,
  type ReactionCounts,
  type ReactionKey,
} from '@/lib/engagement/domain'
import type { EngagementRepository } from '@/lib/engagement/repository'
import { boundPostStatsIds } from '@/lib/engagement/post-stats-ids'

export { REACTION_KEYS, boundPostStatsIds, emptyReactions }
export type { PostStats, ReactionCounts, ReactionKey }

let repositoryPromise: Promise<EngagementRepository | null> | null = null

function loadEngagementRepository(): Promise<EngagementRepository | null> {
  if (!repositoryPromise) {
    repositoryPromise = import('@/lib/engagement/firebase-repository')
      .then(({ firebaseEngagementRepository }) => firebaseEngagementRepository)
      .catch(() => null)
  }
  return repositoryPromise
}

/** Stable, locale-agnostic Firestore document id for an article. */
export function postStatsId(category: string, slug: string): string {
  return `${category}__${slug}`
}

/** Compact display for counters: 1234 -> "1.2k", 12000 -> "12k". */
export function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  }
  return String(value)
}

export async function getPostStats(id: string): Promise<PostStats | null> {
  const repository = await loadEngagementRepository()
  return repository ? repository.getStats(id) : null
}

export async function getPostStatsByIds(
  ids: readonly string[],
  limit: number,
): Promise<Map<string, PostStats>> {
  const repository = await loadEngagementRepository()
  return repository
    ? repository.getStatsByIds(ids, limit)
    : new Map<string, PostStats>()
}

export async function incrementView(id: string): Promise<boolean> {
  const repository = await loadEngagementRepository()
  return repository ? repository.recordView(id) : false
}

export async function incrementShare(id: string): Promise<boolean> {
  const repository = await loadEngagementRepository()
  return repository ? repository.recordShare(id) : false
}

/** Atomically applies a complete reaction transition in one transaction. */
export async function changeReaction(
  id: string,
  previous: ReactionKey | null,
  next: ReactionKey | null,
): Promise<boolean> {
  const repository = await loadEngagementRepository()
  return repository
    ? repository.changeReaction(id, { previous, next })
    : false
}

/**
 * Backward-compatible single-reaction mutation. New callers should use
 * changeReaction so switches decrement the old and increment the new counter
 * in one transaction.
 */
export function applyReaction(
  id: string,
  reaction: ReactionKey,
  delta: 1 | -1,
): Promise<boolean> {
  return changeReaction(
    id,
    delta === -1 ? reaction : null,
    delta === 1 ? reaction : null,
  )
}
