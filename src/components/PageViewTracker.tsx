'use client'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export default function PageViewTracker() {
  useEffect(() => {
    track('cv_view', { referrer: document.referrer || null })
  }, [])
  return null
}
