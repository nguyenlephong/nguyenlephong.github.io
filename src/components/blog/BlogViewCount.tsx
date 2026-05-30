'use client'

import { LuEye } from 'react-icons/lu'
import { formatCount } from '@/lib/firebase/postStats'
import { useEngagement } from './EngagementProvider'

/**
 * Inline view counter for the article meta line. Stays invisible until counters
 * have loaded (and there is at least one view) so it never flashes "0 views" or
 * shifts the byline before Firestore answers.
 */
export default function BlogViewCount({ label }: { label: string }) {
  const engagement = useEngagement()
  if (!engagement || !engagement.ready || engagement.views <= 0) return null

  return (
    <>
      <span aria-hidden="true">·</span>
      <span className="blog-article__views">
        <LuEye aria-hidden="true" />
        {formatCount(engagement.views)} {label}
      </span>
    </>
  )
}
