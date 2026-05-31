'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getPostStats,
  incrementShare,
  incrementView,
  postStatsId,
} from '@/lib/firebase/postStats'

const viewedKey = (id: string) => `thought:viewed:${id}`

export function useThoughtEngagement(slug: string) {
  const id = postStatsId('thoughts', slug)
  const [views, setViews] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      let alreadyViewed = false
      try {
        alreadyViewed = sessionStorage.getItem(viewedKey(id)) === '1'
      } catch {}

      if (!alreadyViewed) {
        try {
          sessionStorage.setItem(viewedKey(id), '1')
        } catch {}
        await incrementView(id)
      }

      const stats = await getPostStats(id)
      if (cancelled) return
      setViews(stats?.views ?? 0)
      setReady(true)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [id])

  const recordShare = useCallback(() => {
    incrementShare(id)
  }, [id])

  return { views, ready, recordShare }
}
