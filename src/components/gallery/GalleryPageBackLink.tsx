'use client'

import type { ReactNode } from 'react'
import { APP_ROUTE } from '@/app/app.const'
import IntentPrefetchLink from '@/components/navigation/IntentPrefetchLink'
import { track } from '@/lib/analytics'

type Props = {
  children: ReactNode
}

export default function GalleryPageBackLink({ children }: Props) {
  return (
    <IntentPrefetchLink
      href={APP_ROUTE.HOME}
      className="page-back"
      onClick={() =>
        track('cv_nav_click', {
          target: 'home',
          source: 'gallery_page_back',
        })
      }
    >
      {children}
    </IntentPrefetchLink>
  )
}
