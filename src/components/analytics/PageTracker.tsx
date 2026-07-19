'use client'

import { useEffect, useRef } from 'react'
import {
  createOnceReporter,
  getAnalyticsPathname,
  registerPageContext,
  track,
} from '@/lib/analytics'

export type PageType =
  | 'home'
  | 'apps'
  | 'gallery'
  | 'about'
  | 'studio'
  | 'blog'
  | 'blog_category'
  | 'notes'
  | 'blog_series'
  | 'notes_topic'
  | 'offline'
  | 'not_found'
  | 'home_alt'

interface PageTrackerProps {
  page: PageType
  /** Optional section grouping that rides along every event on this page. */
  section?: string
  /** Stable, surface-specific context included with the initial page event. */
  context?: Readonly<Record<string, unknown>>
  /** Prevent potentially sensitive fallback URLs and referrers from being captured. */
  omitLocation?: boolean
  /** Override the page_view event name (default: `page_view`). */
  eventName?:
    | 'page_view'
    | 'apps_view'
    | 'gallery_view'
    | 'about_view'
    | 'cv_view'
    | 'studio_view'
    | 'blog_view'
    | 'blog_category_view'
    | 'notes_view'
    | 'content_hub_view'
    | 'offline_view'
    | 'not_found_view'
}

const SCROLL_BUCKETS = [25, 50, 75, 100] as const

export default function PageTracker({
  page,
  section,
  context,
  omitLocation = false,
  eventName = 'page_view',
}: PageTrackerProps) {
  const startedAtRef = useRef<number>(0)
  const visibleMsRef = useRef<number>(0)
  const lastVisibleAtRef = useRef<number>(0)
  const reportedRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    const startedAt = Date.now()
    startedAtRef.current = startedAt
    lastVisibleAtRef.current = startedAt
    visibleMsRef.current = 0
    reportedRef.current = new Set()
    const pagePathname = getAnalyticsPathname()
    const trackOptions = omitLocation
      ? { omitLocation: true }
      : { pathnameOverride: pagePathname }

    registerPageContext({
      ...context,
      page_type: page,
      page_section: section ?? null,
    })

    track(
      eventName,
      {
        ...context,
        page_type: page,
        ...(omitLocation
          ? {}
          : {
              referrer: typeof document !== 'undefined' ? document.referrer || null : null,
              screen_w: typeof window !== 'undefined' ? window.innerWidth : null,
              screen_h: typeof window !== 'undefined' ? window.innerHeight : null,
            }),
      },
      trackOptions,
    )

    const onScroll = (): void => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100))
      for (const bucket of SCROLL_BUCKETS) {
        if (pct >= bucket && !reportedRef.current.has(bucket)) {
          reportedRef.current.add(bucket)
          track('page_scroll_depth', { page_type: page, depth: bucket }, trackOptions)
        }
      }
    }

    const onVisibility = (): void => {
      const now = Date.now()
      if (document.visibilityState === 'hidden') {
        visibleMsRef.current += now - lastVisibleAtRef.current
        track(
          'page_visibility_change',
          {
            page_type: page,
            to: 'hidden',
            visible_ms: visibleMsRef.current,
          },
          trackOptions,
        )
      } else {
        lastVisibleAtRef.current = now
        track('page_visibility_change', { page_type: page, to: 'visible' }, trackOptions)
      }
    }

    const reportTime = createOnceReporter((): void => {
      // `pagehide` and `beforeunload` can both fire on the same navigation;
      // React cleanup also runs on client-side navigation. The once wrapper
      // keeps all three exit paths idempotent.
      const now = Date.now()
      if (document.visibilityState === 'visible') {
        visibleMsRef.current += now - lastVisibleAtRef.current
        lastVisibleAtRef.current = now
      }
      track(
        'page_time_on_page',
        {
          page_type: page,
          total_ms: now - startedAtRef.current,
          visible_ms: visibleMsRef.current,
        },
        trackOptions,
      )
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', reportTime)
    window.addEventListener('beforeunload', reportTime)

    return () => {
      reportTime()
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', reportTime)
      window.removeEventListener('beforeunload', reportTime)
    }
  }, [page, section, context, omitLocation, eventName])

  return null
}
