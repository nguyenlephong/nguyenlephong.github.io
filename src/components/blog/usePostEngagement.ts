'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyReaction,
  emptyReactions,
  getPostStats,
  incrementShare,
  incrementView,
  postStatsId,
  type ReactionCounts,
  type ReactionKey,
} from '@/lib/firebase/postStats'

interface EngagementState {
  views: number
  shares: number
  reactions: ReactionCounts
  /** Which reaction this browser has registered, if any. */
  myReaction: ReactionKey | null
  /** True once initial counters have loaded (or failed) — used to fade in. */
  ready: boolean
}

export interface EngagementOptions {
  /**
   * When false, reaction state + its `localStorage` are skipped and `react()`
   * is a no-op (surfaces that only track views/shares, e.g. thoughts).
   */
  withReactions?: boolean
  /**
   * Storage key prefix. Defaults to `blog` (shared by blog + notes); thoughts
   * pass `thought` to keep their existing per-browser keys stable.
   */
  storageNamespace?: string
}

function safeGet(store: 'local' | 'session', key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return (store === 'local' ? localStorage : sessionStorage).getItem(key)
  } catch {
    return null
  }
}

function safeSet(store: 'local' | 'session', key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    ;(store === 'local' ? localStorage : sessionStorage).setItem(key, value)
  } catch {
    /* storage unavailable (private mode) — ignore */
  }
}

function safeRemove(store: 'local' | 'session', key: string): void {
  if (typeof window === 'undefined') return
  try {
    ;(store === 'local' ? localStorage : sessionStorage).removeItem(key)
  } catch {
    /* ignore */
  }
}

/**
 * Drives the engagement bar for one article. Loads counters, records a single
 * view per browser session, and applies optimistic reaction/share toggles
 * backed by `localStorage`. Failed writes roll the optimistic update back.
 *
 * Both the blog/notes engagement bar (via `EngagementProvider`) and the
 * thoughts surface share this hook — pass `{ withReactions: false }` for the
 * latter.
 */
export function usePostEngagement(
  category: string,
  slug: string,
  options: EngagementOptions = {},
) {
  const { withReactions = true, storageNamespace = 'blog' } = options
  const id = postStatsId(category, slug)
  const viewedKey = `${storageNamespace}:viewed:${id}`
  const reactionStoreKey = `${storageNamespace}:reaction:${id}`

  const [state, setState] = useState<EngagementState>({
    views: 0,
    shares: 0,
    reactions: emptyReactions(),
    myReaction: null,
    ready: false,
  })

  // Mirror the latest state so the callbacks below can read it and roll back
  // without performing side effects inside a setState updater (React may invoke
  // an updater more than once, which would double-fire the Firestore write).
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Initial load + once-per-session view increment.
  useEffect(() => {
    let cancelled = false

    async function init() {
      const mine = withReactions
        ? (safeGet('local', reactionStoreKey) as ReactionKey | null)
        : null

      if (safeGet('session', viewedKey) !== '1') {
        safeSet('session', viewedKey, '1')
        await incrementView(id)
      }

      const stats = await getPostStats(id)
      if (cancelled) return

      setState({
        views: stats?.views ?? 0,
        shares: stats?.shares ?? 0,
        reactions: stats ? stats.reactions : emptyReactions(),
        myReaction: mine,
        ready: true,
      })
    }

    init()
    return () => {
      cancelled = true
    }
  }, [id, viewedKey, reactionStoreKey, withReactions])

  const react = useCallback(
    (next: ReactionKey) => {
      if (!withReactions) return

      const snapshot = stateRef.current
      const prevReaction = snapshot.myReaction
      const reactions = { ...snapshot.reactions }

      // Toggle off.
      if (prevReaction === next) {
        reactions[next] = Math.max(0, reactions[next] - 1)
        setState({ ...snapshot, reactions, myReaction: null })
        safeRemove('local', reactionStoreKey)
        applyReaction(id, next, -1).then((ok) => {
          if (!ok) {
            setState(snapshot)
            safeSet('local', reactionStoreKey, next)
          }
        })
        return
      }

      // Switch or set.
      if (prevReaction) reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1)
      reactions[next] += 1
      setState({ ...snapshot, reactions, myReaction: next })
      safeSet('local', reactionStoreKey, next)

      const writes: Promise<boolean>[] = []
      if (prevReaction) writes.push(applyReaction(id, prevReaction, -1))
      writes.push(applyReaction(id, next, 1))
      Promise.all(writes).then((results) => {
        if (results.some((ok) => !ok)) {
          setState(snapshot)
          if (prevReaction) safeSet('local', reactionStoreKey, prevReaction)
          else safeRemove('local', reactionStoreKey)
        }
      })
    },
    [id, reactionStoreKey, withReactions],
  )

  const recordShare = useCallback(() => {
    const snapshot = stateRef.current
    setState({ ...snapshot, shares: snapshot.shares + 1 })
    incrementShare(id).then((ok) => {
      if (!ok) setState((s) => ({ ...s, shares: Math.max(0, s.shares - 1) }))
    })
  }, [id])

  return { ...state, react, recordShare }
}
