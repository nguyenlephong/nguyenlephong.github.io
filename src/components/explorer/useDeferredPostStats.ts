'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CONTENT_PAGE_SIZE } from '@/lib/content/pagination'
import { createDeferredPostStatsStore } from '@/lib/engagement/deferred-post-stats-store'
import {
  boundPostStatsIds,
  getPostStatsByIds,
} from '@/lib/firebase/postStats'

type DeferredPostStatsStatus = 'waiting' | 'loading' | 'ready' | 'skipped'

interface DeferredPostStatsResult {
  signalBrowsingIntent: () => void
  status: DeferredPostStatsStatus
  viewCounts: Record<string, number>
}

interface NavigatorWithConnection extends Navigator {
  connection?: { saveData?: boolean }
}

const RESOLVED_STATS_CACHE_LIMIT = CONTENT_PAGE_SIZE * 4

function prefersReducedData(): boolean {
  if (typeof navigator === 'undefined') return false
  return (navigator as NavigatorWithConnection).connection?.saveData === true
}

/**
 * Loads best-effort archive counters only after deliberate browsing activity.
 * Article engagement keeps using the facade directly and is unaffected.
 */
export function useDeferredPostStats(
  ids: readonly string[],
  viewThreshold: number,
): DeferredPostStatsResult {
  const boundedKey = boundPostStatsIds(ids, CONTENT_PAGE_SIZE).join('\u0000')
  const boundedIds = useMemo(
    () => (boundedKey ? boundedKey.split('\u0000') : []),
    [boundedKey],
  )
  const saveDataRef = useRef(false)
  const mountedRef = useRef(false)
  const [store] = useState(() =>
    createDeferredPostStatsStore(
      (requestedIds) => getPostStatsByIds(requestedIds, CONTENT_PAGE_SIZE),
      {
        batchSize: CONTENT_PAGE_SIZE,
        cacheLimit: RESOLVED_STATS_CACHE_LIMIT,
      },
    ),
  )
  const [, setRevision] = useState(0)
  const [hasBrowsingIntent, setHasBrowsingIntent] = useState(false)
  const [saveData, setSaveData] = useState(false)

  const signalBrowsingIntent = useCallback(() => {
    if (!saveDataRef.current) setHasBrowsingIntent(true)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    saveDataRef.current = prefersReducedData()
    if (saveDataRef.current) {
      setSaveData(true)
      return () => {
        mountedRef.current = false
      }
    }

    const onFirstScroll = () => setHasBrowsingIntent(true)
    if (window.scrollY > 0) onFirstScroll()
    window.addEventListener('scroll', onFirstScroll, {
      once: true,
      passive: true,
    })
    return () => {
      mountedRef.current = false
      window.removeEventListener('scroll', onFirstScroll)
    }
  }, [])

  useEffect(
    () => store.subscribe(() => {
      if (mountedRef.current) setRevision((current) => current + 1)
    }),
    [store],
  )

  const unresolvedIds = store.missingIds(boundedIds)
  const hasOutstandingVisibleIds = store.hasOutstanding(boundedIds)

  useEffect(() => {
    if (saveData || !hasBrowsingIntent) return
    store.request(boundedIds)
  }, [boundedIds, hasBrowsingIntent, saveData, store])

  const viewCounts: Record<string, number> = {}
  for (const id of boundedIds) {
    const views = store.get(id)
    if (views !== undefined && views !== null && views >= viewThreshold) {
      viewCounts[id] = views
    }
  }
  const status: DeferredPostStatsStatus = saveData
    ? 'skipped'
    : !hasBrowsingIntent
      ? 'waiting'
      : unresolvedIds.length > 0 || hasOutstandingVisibleIds
        ? 'loading'
        : 'ready'

  return { signalBrowsingIntent, status, viewCounts }
}
