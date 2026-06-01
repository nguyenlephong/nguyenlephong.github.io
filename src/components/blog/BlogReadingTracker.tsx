'use client'

import { useEffect, useRef } from 'react'
import { registerPageContext, track } from '@/lib/analytics'

interface BlogReadingTrackerProps {
  /** Surface bucket, e.g. "notes" — rides along every event. */
  category: string
  /** Article slug — the unique identity used to group reading sessions. */
  slug: string
  /** Author-estimated reading length, for comparing intent vs. reality. */
  readingMinutes?: number
}

const SCROLL_BUCKETS = [25, 50, 75, 100] as const

/**
 * Measures how long a reader actually spends on an article and how far they
 * scroll, then reports it through the existing PostHog event log (`track`).
 *
 * It only counts time while the tab is visible, so a piece left open in a
 * background tab does not inflate the numbers. Three signals are emitted:
 *   - `notes_article_view`   once, on mount
 *   - `notes_scroll_depth`   the first time each 25/50/75/100% line is crossed
 *   - `notes_read_complete`  once, when the reader reaches the end
 *   - `notes_read_time`      on tab hide / page leave, with visible reading ms
 */
export default function BlogReadingTracker({
  category,
  slug,
  readingMinutes,
}: BlogReadingTrackerProps) {
  const startedAtRef = useRef<number>(Date.now())
  const visibleMsRef = useRef<number>(0)
  const lastVisibleAtRef = useRef<number>(Date.now())
  const reportedBucketsRef = useRef<Set<number>>(new Set())
  const completedRef = useRef<boolean>(false)
  const finalSentRef = useRef<boolean>(false)

  useEffect(() => {
    startedAtRef.current = Date.now()
    lastVisibleAtRef.current = Date.now()
    visibleMsRef.current = 0
    reportedBucketsRef.current = new Set()
    completedRef.current = false
    finalSentRef.current = false

    registerPageContext({
      page_type: 'notes_article',
      notes_category: category,
      notes_slug: slug,
    })

    track('notes_article_view', {
      notes_category: category,
      notes_slug: slug,
      estimated_minutes: readingMinutes ?? null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    })

    const accumulateVisible = (): void => {
      const now = Date.now()
      if (document.visibilityState === 'visible') {
        visibleMsRef.current += now - lastVisibleAtRef.current
        lastVisibleAtRef.current = now
      }
    }

    const onScroll = (): void => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100))

      for (const bucket of SCROLL_BUCKETS) {
        if (pct >= bucket && !reportedBucketsRef.current.has(bucket)) {
          reportedBucketsRef.current.add(bucket)
          track('notes_scroll_depth', {
            notes_category: category,
            notes_slug: slug,
            depth: bucket,
          })
        }
      }

      if (pct >= 100 && !completedRef.current) {
        completedRef.current = true
        accumulateVisible()
        track('notes_read_complete', {
          notes_category: category,
          notes_slug: slug,
          visible_ms: visibleMsRef.current,
          total_ms: Date.now() - startedAtRef.current,
          estimated_minutes: readingMinutes ?? null,
        })
      }
    }

    const onVisibility = (): void => {
      if (document.visibilityState === 'hidden') {
        accumulateVisible()
        reportTime('visibility_hidden')
      } else {
        lastVisibleAtRef.current = Date.now()
      }
    }

    const reportTime = (reason: string): void => {
      accumulateVisible()
      // A read time below ~2s is almost always an immediate bounce; still log
      // it once so bounce rate stays measurable, but never double-fire.
      if (finalSentRef.current && reason !== 'visibility_hidden') return
      if (reason !== 'visibility_hidden') finalSentRef.current = true

      const maxDepth = reportedBucketsRef.current.size
        ? Math.max(...reportedBucketsRef.current)
        : 0

      track('notes_read_time', {
        notes_category: category,
        notes_slug: slug,
        reason,
        visible_ms: visibleMsRef.current,
        total_ms: Date.now() - startedAtRef.current,
        max_scroll_depth: maxDepth,
        completed: completedRef.current,
        estimated_minutes: readingMinutes ?? null,
      })
    }

    const onLeave = (): void => reportTime('page_leave')

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onLeave)
    window.addEventListener('beforeunload', onLeave)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onLeave)
      window.removeEventListener('beforeunload', onLeave)
    }
  }, [category, slug, readingMinutes])

  return null
}
