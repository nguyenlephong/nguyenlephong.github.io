'use client'

import type { ComponentProps } from 'react'
import PageTracker from '@/components/analytics/PageTracker'
import { useContentHubClickTracking } from '@/components/analytics/useContentHubClickTracking'

/** Combine page and delegated hub analytics behind one serialized boundary. */
export default function ContentHubPageTracker(
  props: ComponentProps<typeof PageTracker>,
) {
  useContentHubClickTracking(true)
  return <PageTracker {...props} />
}
