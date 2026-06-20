'use client'

import { useEffect, useRef } from 'react'
import { registerPageContext, track } from '@/lib/analytics'

export type PageType = 'home' | 'apps' | 'gallery' | 'about' | 'cv' | 'home_alt'

interface PageTrackerProps {
  page: PageType
  /** Optional section grouping that rides along every event on this page. */
  section?: string
  /** Override the page_view event name (default: `page_view`). */
  eventName?: 'page_view' | 'apps_view' | 'gallery_view' | 'about_view' | 'cv_view'
}

const SCROLL_BUCKETS = [25, 50, 75, 100] as const

export default function PageTracker({ page, section, eventName = 'page_view' }: PageTrackerProps) {
  const startedAtRef = useRef<number>(0)
  const visibleMsRef = useRef<number>(0)
  const lastVisibleAtRef = useRef<number>(0)
  const reportedRef = useRef<Set<number>>(new Set())
  const finalReportedRef = useRef<boolean>(false)

  useEffect(() => {
    const startedAt = Date.now()
    startedAtRef.current = startedAt
    lastVisibleAtRef.current = startedAt
    visibleMsRef.current = 0
    reportedRef.current = new Set()
    finalReportedRef.current = false

    registerPageContext({
      page_type: page,
      page_section: section ?? null,
    })

    track(eventName, {
      page_type: page,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      screen_w: typeof window !== 'undefined' ? window.innerWidth : null,
      screen_h: typeof window !== 'undefined' ? window.innerHeight : null,
    })

    const onScroll = (): void => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100))
      for (const bucket of SCROLL_BUCKETS) {
        if (pct >= bucket && !reportedRef.current.has(bucket)) {
          reportedRef.current.add(bucket)
          track('page_scroll_depth', { page_type: page, depth: bucket })
        }
      }
    }

    const onVisibility = (): void => {
      const now = Date.now()
      if (document.visibilityState === 'hidden') {
        visibleMsRef.current += now - lastVisibleAtRef.current
        track('page_visibility_change', {
          page_type: page,
          to: 'hidden',
          visible_ms: visibleMsRef.current,
        })
      } else {
        lastVisibleAtRef.current = now
        track('page_visibility_change', { page_type: page, to: 'visible' })
      }
    }

    const reportTime = (): void => {
      // `pagehide` and `beforeunload` can both fire on the same navigation;
      // only emit the final time-on-page once.
      if (finalReportedRef.current) return
      finalReportedRef.current = true
      const now = Date.now()
      if (document.visibilityState === 'visible') {
        visibleMsRef.current += now - lastVisibleAtRef.current
        lastVisibleAtRef.current = now
      }
      track('page_time_on_page', {
        page_type: page,
        total_ms: now - startedAtRef.current,
        visible_ms: visibleMsRef.current,
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', reportTime)
    window.addEventListener('beforeunload', reportTime)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', reportTime)
      window.removeEventListener('beforeunload', reportTime)
    }
  }, [page, section, eventName])

  return null
}
