/**
 * Compatibility facade for article engagement.
 *
 * UI modules keep this stable API while provider-specific Firestore behavior
 * lives behind the EngagementRepository boundary.
 */
import {
  firebaseEngagementRepository,
  boundPostStatsIds,
} from '@/lib/engagement/firebase-repository'
import {
  REACTION_KEYS,
  emptyReactions,
  type PostStats,
  type ReactionCounts,
  type ReactionKey,
} from '@/lib/engagement/domain'

export { REACTION_KEYS, boundPostStatsIds, emptyReactions }
export type { PostStats, ReactionCounts, ReactionKey }

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

export function getPostStats(id: string): Promise<PostStats | null> {
  return firebaseEngagementRepository.getStats(id)
}

export function getPostStatsByIds(
  ids: readonly string[],
  limit: number,
): Promise<Map<string, PostStats>> {
  return firebaseEngagementRepository.getStatsByIds(ids, limit)
}

export function incrementView(id: string): Promise<void> {
  return firebaseEngagementRepository.recordView(id)
}

export function incrementShare(id: string): Promise<boolean> {
  return firebaseEngagementRepository.recordShare(id)
}

/** Atomically applies a complete reaction transition in one transaction. */
export function changeReaction(
  id: string,
  previous: ReactionKey | null,
  next: ReactionKey | null,
): Promise<boolean> {
  return firebaseEngagementRepository.changeReaction(id, { previous, next })
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
