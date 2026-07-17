/**
 * Firestore data-access for blog post engagement (views, reactions, shares).
 *
 * Document layout — one doc per article, locale-agnostic so a post's numbers are
 * pooled across every translation:
 *
 *   postStats/{category}__{slug}
 *     views:     number
 *     shares:    number
 *     reactions: { like: number, love: number, insightful: number, clap: number }
 *
 * All writes use atomic `increment()` so concurrent readers never clobber each
 * other, and every function fails soft (returns null / resolves quietly) so the
 * reading experience is never blocked by analytics.
 */
import { getDb } from './client'
import { CONTENT_PAGE_SIZE } from '@/lib/content/pagination'

export const REACTION_KEYS = ['like', 'love', 'insightful', 'clap'] as const
export type ReactionKey = (typeof REACTION_KEYS)[number]

export type ReactionCounts = Record<ReactionKey, number>

export interface PostStats {
  views: number
  shares: number
  reactions: ReactionCounts
}

const COLLECTION = 'postStats'

export function boundPostStatsIds(ids: readonly string[]): string[] {
  return [...new Set(ids.filter(Boolean))].slice(0, CONTENT_PAGE_SIZE)
}

function emptyReactions(): ReactionCounts {
  return { like: 0, love: 0, insightful: 0, clap: 0 }
}

function isNavigatorOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

/** Stable, locale-agnostic Firestore document id for an article. */
export function postStatsId(category: string, slug: string): string {
  return `${category}__${slug}`
}

/** Compact display for counters: 1234 → "1.2k", 12000 → "12k". */
export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return String(n)
}

function normalise(data: Record<string, unknown> | undefined): PostStats {
  const reactions = (data?.['reactions'] ?? {}) as Partial<ReactionCounts>
  return {
    views: Number(data?.['views'] ?? 0),
    shares: Number(data?.['shares'] ?? 0),
    reactions: {
      like: Number(reactions.like ?? 0),
      love: Number(reactions.love ?? 0),
      insightful: Number(reactions.insightful ?? 0),
      clap: Number(reactions.clap ?? 0),
    },
  }
}

/** Reads current counters once. Returns null when unconfigured or on error. */
export async function getPostStats(id: string): Promise<PostStats | null> {
  if (isNavigatorOffline()) return null
  const db = await getDb()
  if (!db) return null
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(db, COLLECTION, id))
    return normalise(snap.exists() ? snap.data() : undefined)
  } catch {
    return null
  }
}

/**
 * Reads counters only for visible archive cards. Input is de-duplicated and
 * hard-capped to the static page size, so a search can never scan the corpus.
 * Individual failures are omitted while successful documents remain usable.
 */
export async function getPostStatsByIds(
  ids: readonly string[],
): Promise<Map<string, PostStats>> {
  const out = new Map<string, PostStats>()
  if (isNavigatorOffline()) return out
  const boundedIds = boundPostStatsIds(ids)
  if (boundedIds.length === 0) return out
  const db = await getDb()
  if (!db) return out
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snapshots = await Promise.allSettled(
      boundedIds.map(async (id) => ({
        id,
        snap: await getDoc(doc(db, COLLECTION, id)),
      })),
    )
    for (const result of snapshots) {
      if (result.status !== 'fulfilled') continue
      const { id, snap } = result.value
      out.set(id, normalise(snap.exists() ? snap.data() : undefined))
    }
    return out
  } catch {
    return out
  }
}

/** Atomically bumps the view counter. Best-effort; never throws. */
export async function incrementView(id: string): Promise<void> {
  if (isNavigatorOffline()) return
  const db = await getDb()
  if (!db) return
  try {
    const { doc, setDoc, increment } = await import('firebase/firestore')
    await setDoc(
      doc(db, COLLECTION, id),
      { views: increment(1) },
      { merge: true },
    )
  } catch {
    // best-effort; a failed view bump must never disrupt reading.
  }
}

/**
 * Atomically bumps the share counter. Returns `true` on success so callers can
 * roll back an optimistic UI update when the write fails. Never throws.
 */
export async function incrementShare(id: string): Promise<boolean> {
  if (isNavigatorOffline()) return false
  const db = await getDb()
  if (!db) return false
  try {
    const { doc, setDoc, increment } = await import('firebase/firestore')
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

/**
 * Applies a reaction change. Pass `delta: +1` to add a reaction and `-1` to
 * remove it; switching reactions is two calls (−1 old, +1 new). Returns `true`
 * on success so callers can roll back an optimistic update. Never throws.
 */
export async function applyReaction(
  id: string,
  reaction: ReactionKey,
  delta: 1 | -1,
): Promise<boolean> {
  if (isNavigatorOffline()) return false
  const db = await getDb()
  if (!db) return false
  try {
    const { doc, setDoc, increment } = await import('firebase/firestore')
    await setDoc(
      doc(db, COLLECTION, id),
      { reactions: { [reaction]: increment(delta) } },
      { merge: true },
    )
    return true
  } catch {
    return false
  }
}

export { emptyReactions }
