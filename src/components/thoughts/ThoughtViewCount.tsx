'use client'

import { LuEye } from 'react-icons/lu'
import { formatCount } from '@/lib/firebase/postStats'
import { useThoughtEngagement } from './useThoughtEngagement'

export default function ThoughtViewCount({ slug }: { slug: string }) {
  const { views, ready } = useThoughtEngagement(slug)
  if (!ready || views <= 0) return null

  return (
    <span className="thought-page__views">
      <LuEye size={12} aria-hidden />
      {formatCount(views)}
    </span>
  )
}
