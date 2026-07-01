import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SITE_URL } from '@/app/seo.config'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
