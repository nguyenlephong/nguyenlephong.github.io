import type { Metadata, Viewport } from 'next'
import { SITE_URL } from '@/app/seo.config'
import PostHogBootstrap from '@/components/analytics/PostHogBootstrap'
import AdminGate from '@/components/admin/AdminGate'
import ThemeScript from '@/components/theme/ThemeScript'
import '../document.css'
import './admin.css'

export const dynamic = 'force-static'

// MEP-90: owner-only page. Kept out of the sitemap, the navigation and search
// engines, and it carries no social card.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Admin | Nguyen Le Phong',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  openGraph: null,
  twitter: null,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1115' },
  ],
}

export default function AdminPage() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="admin-body">
        <PostHogBootstrap locale="en" surface="admin" />
        <AdminGate />
      </body>
    </html>
  )
}
