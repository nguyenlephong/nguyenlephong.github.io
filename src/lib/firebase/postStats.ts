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

export const REACTION_KEYS = ['like', 'love', 'insightful', 'clap'] as const
export type ReactionKey = (typeof REACTION_KEYS)[number]

export type ReactionCounts = Record<ReactionKey, number>

export interface PostStats {
  views: number
  shares: number
  reactions: ReactionCounts
}

const COLLECTION = 'postStats'

function emptyReactions(): ReactionCounts {
  return { like: 0, love: 0, insightful: 0, clap: 0 }
}

/** Stable, locale-agnostic Firestore document id for an article. */
export function postStatsId(category: string, slug: string): string {
  return `${category}__${slug}`
}

function normalise(data: Record<string, unknown> | undefined): PostStats {
  const reactions = (data?.reactions ?? {}) as Partial<ReactionCounts>
  return {
    views: Number(data?.views ?? 0),
    shares: Number(data?.shares ?? 0),
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

/** Atomically bumps the view counter. Best-effort; never throws. */
export async function incrementView(id: string): Promise<void> {
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
    // ignore
  }
}

/** Atomically bumps the share counter. Best-effort; never throws. */
export async function incrementShare(id: string): Promise<void> {
  const db = await getDb()
  if (!db) return
  try {
    const { doc, setDoc, increment } = await import('firebase/firestore')
    await setDoc(
      doc(db, COLLECTION, id),
      { shares: increment(1) },
      { merge: true },
    )
  } catch {
    // ignore
  }
}

/**
 * Applies a reaction change. Pass `delta: +1` to add a reaction and `-1` to
 * remove it; switching reactions is two calls (−1 old, +1 new). Best-effort.
 */
export async function applyReaction(
  id: string,
  reaction: ReactionKey,
  delta: 1 | -1,
): Promise<void> {
  const db = await getDb()
  if (!db) return
  try {
    const { doc, setDoc, increment } = await import('firebase/firestore')
    await setDoc(
      doc(db, COLLECTION, id),
      { reactions: { [reaction]: increment(delta) } },
      { merge: true },
    )
  } catch {
    // ignore
  }
}

export { emptyReactions }
