'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  changeReaction,
  emptyReactions,
  getPostStats,
  incrementShare,
  incrementView,
  postStatsId,
  type ReactionCounts,
  type ReactionKey,
} from '@/lib/firebase/postStats'
import { ReactionMutationQueue } from '@/lib/engagement/reaction-mutation-queue'
import { isReactionKey } from '@/lib/engagement/domain'

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

function transitionReaction(
  state: EngagementState,
  nextReaction: ReactionKey | null,
): EngagementState {
  const previous = state.myReaction
  if (previous === nextReaction) return state

  const reactions = { ...state.reactions }
  if (previous) reactions[previous] = Math.max(0, reactions[previous] - 1)
  if (nextReaction) reactions[nextReaction] += 1

  return { ...state, reactions, myReaction: nextReaction }
}

/**
 * Drives the engagement bar for one article. Loads counters, records a single
 * view per browser session, and applies optimistic reaction/share toggles
 * backed by committed `localStorage`. Optimistic reactions remain in memory;
 * failed writes roll the UI back without persisting an uncommitted intent.
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

  const stateRef = useRef(state)
  const reactionQueueRef = useRef<{
    id: string
    queue: ReactionMutationQueue
  } | null>(null)

  // Publish state and its imperative mirror in the same tick. Rapid clicks can
  // therefore derive from the latest optimistic state before React rerenders.
  const updateState = useCallback(
    (updater: (current: EngagementState) => EngagementState) => {
      const next = updater(stateRef.current)
      stateRef.current = next
      setState(next)
      return next
    },
    [],
  )

  // Initial load + once-per-session view increment.
  useEffect(() => {
    let cancelled = false
    const storedReaction = safeGet('local', reactionStoreKey)
    const mine =
      withReactions && isReactionKey(storedReaction) ? storedReaction : null
    let queue: ReactionMutationQueue | null = null

    if (withReactions) {
      queue = new ReactionMutationQueue({
        initialCommitted: mine,
        mutate: (previous, next) => changeReaction(id, previous, next),
        onCommitted: (committed) => {
          // Remote settlement outlives the component. Always publish the last
          // committed state, even when route navigation has unmounted this UI.
          if (committed) safeSet('local', reactionStoreKey, committed)
          else safeRemove('local', reactionStoreKey)
        },
        onLatestSettled: ({ committed }) => {
          if (
            cancelled ||
            reactionQueueRef.current?.id !== id ||
            reactionQueueRef.current.queue !== queue
          ) {
            return
          }

          updateState((current) => transitionReaction(current, committed))
        },
      })
      reactionQueueRef.current = { id, queue }
    } else {
      reactionQueueRef.current = null
    }

    updateState(() => ({
      views: 0,
      shares: 0,
      reactions: emptyReactions(),
      myReaction: mine,
      ready: false,
    }))

    async function init() {
      if (safeGet('session', viewedKey) !== '1') {
        safeSet('session', viewedKey, '1')
        await incrementView(id)
      }

      const stats = await getPostStats(id)
      if (cancelled) return

      updateState(() => ({
        views: stats?.views ?? 0,
        shares: stats?.shares ?? 0,
        reactions: stats ? stats.reactions : emptyReactions(),
        myReaction: mine,
        ready: true,
      }))
    }

    init()
    return () => {
      cancelled = true
      // Do not cancel or drain the queue: its remote mutation must settle and
      // publish committed browser state after navigation/unmount.
      if (reactionQueueRef.current?.queue === queue) {
        reactionQueueRef.current = null
      }
    }
  }, [id, viewedKey, reactionStoreKey, updateState, withReactions])

  const react = useCallback(
    (next: ReactionKey) => {
      if (!withReactions) return

      const snapshot = stateRef.current
      const queueEntry = reactionQueueRef.current
      if (!snapshot.ready || queueEntry?.id !== id) return

      const requested = snapshot.myReaction === next ? null : next
      updateState((current) => transitionReaction(current, requested))
      queueEntry.queue.enqueue(requested)
    },
    [id, updateState, withReactions],
  )

  const recordShare = useCallback(() => {
    updateState((current) => ({ ...current, shares: current.shares + 1 }))
    incrementShare(id).then((ok) => {
      if (!ok) {
        updateState((current) => ({
          ...current,
          shares: Math.max(0, current.shares - 1),
        }))
      }
    })
  }, [id, updateState])

  return { ...state, react, recordShare }
}
