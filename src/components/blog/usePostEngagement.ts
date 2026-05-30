'use client'

import { useCallback, useEffect, useState } from 'react'
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

function viewedKey(id: string): string {
  return `blog:viewed:${id}`
}
function reactionKey(id: string): string {
  return `blog:reaction:${id}`
}

function readMyReaction(id: string): ReactionKey | null {
  if (typeof window === 'undefined') return null
  try {
    return (localStorage.getItem(reactionKey(id)) as ReactionKey) || null
  } catch {
    return null
  }
}

function clampReactions(r: ReactionCounts): ReactionCounts {
  return {
    like: Math.max(0, r.like),
    love: Math.max(0, r.love),
    insightful: Math.max(0, r.insightful),
    clap: Math.max(0, r.clap),
  }
}

/**
 * Drives the engagement bar for one article. Loads counters, records a single
 * view per browser session, and applies optimistic reaction toggles backed by
 * `localStorage` so a visitor sees their own choice persist across reloads.
 */
export function usePostEngagement(category: string, slug: string) {
  const id = postStatsId(category, slug)
  const [state, setState] = useState<EngagementState>({
    views: 0,
    shares: 0,
    reactions: emptyReactions(),
    myReaction: null,
    ready: false,
  })

  // Initial load + once-per-session view increment.
  useEffect(() => {
    let cancelled = false

    async function init() {
      const mine = readMyReaction(id)

      let alreadyViewed = false
      try {
        alreadyViewed = sessionStorage.getItem(viewedKey(id)) === '1'
      } catch {
        // sessionStorage unavailable (private mode) — treat as fresh view.
      }

      if (!alreadyViewed) {
        try {
          sessionStorage.setItem(viewedKey(id), '1')
        } catch {
          /* ignore */
        }
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
  }, [id])

  const react = useCallback(
    (next: ReactionKey) => {
      setState((prev) => {
        const prevReaction = prev.myReaction
        const reactions = { ...prev.reactions }

        if (prevReaction === next) {
          // Toggle off.
          reactions[next] -= 1
          try {
            localStorage.removeItem(reactionKey(id))
          } catch {
            /* ignore */
          }
          applyReaction(id, next, -1)
          return {
            ...prev,
            reactions: clampReactions(reactions),
            myReaction: null,
          }
        }

        // Switch or set.
        if (prevReaction) {
          reactions[prevReaction] -= 1
          applyReaction(id, prevReaction, -1)
        }
        reactions[next] += 1
        applyReaction(id, next, 1)
        try {
          localStorage.setItem(reactionKey(id), next)
        } catch {
          /* ignore */
        }
        return {
          ...prev,
          reactions: clampReactions(reactions),
          myReaction: next,
        }
      })
    },
    [id],
  )

  const recordShare = useCallback(() => {
    setState((prev) => ({ ...prev, shares: prev.shares + 1 }))
    incrementShare(id)
  }, [id])

  return { ...state, react, recordShare }
}
