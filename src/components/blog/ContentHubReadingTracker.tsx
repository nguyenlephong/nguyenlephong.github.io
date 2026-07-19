'use client'

import type { ComponentProps } from 'react'
import { useContentHubClickTracking } from '@/components/analytics/useContentHubClickTracking'
import BlogReadingTracker from '@/components/blog/BlogReadingTracker'

/** Combine article reading and hierarchy-click analytics in one boundary. */
export default function ContentHubReadingTracker(
  props: ComponentProps<typeof BlogReadingTracker>,
) {
  useContentHubClickTracking(true)
  return <BlogReadingTracker {...props} />
}
