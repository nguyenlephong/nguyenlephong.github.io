'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { track } from '@/lib/analytics'

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    track('web_vital', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: (metric as { rating?: string }).rating,
      id: metric.id,
      navigation_type: (metric as { navigationType?: string }).navigationType,
    })
  })
  return null
}
