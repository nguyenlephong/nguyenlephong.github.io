'use client'

import type { ReactNode } from 'react'
import { APP_ROUTE } from '@/app/app.const'
import { Link } from '@/i18n/navigation'
import { track } from '@/lib/analytics'

type Props = {
  children: ReactNode
}

export default function GalleryPageBackLink({ children }: Props) {
  return (
    <Link
      href={APP_ROUTE.HOME}
      prefetch={false}
      className="page-back"
      onClick={() =>
        track('cv_nav_click', {
          target: 'home',
          source: 'gallery_page_back',
        })
      }
    >
      {children}
    </Link>
  )
}
