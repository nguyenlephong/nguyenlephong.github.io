import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import AppFooter from '@/components/AppFooter'
import AppHeader from '@/components/AppHeader'
import PublicThirdPartyResources from '@/components/analytics/PublicThirdPartyResources'
import FontScript from '@/components/font/FontScript'
import RouteProgressBar from '@/components/motion/RouteProgressBar'
import OfflineNavigationCapture from '@/components/offline/OfflineNavigationCapture'
import OfflineStatusBanner from '@/components/offline/OfflineStatusBanner'
import ReadingBackgroundScript from '@/components/reading/ReadingBackgroundScript'
import ThemeScript from '@/components/theme/ThemeScript'
import ThemeSync from '@/components/theme/ThemeSync'
import { routing } from '@/i18n/routing'
import ScopedIntlProvider from '@/i18n/ScopedIntlProvider'
import { PUBLIC_THIRD_PARTY } from '@/lib/public-third-party'
import '../../globals.css'

export const metadata: Metadata = {
  other: {
    'google-adsense-account': PUBLIC_THIRD_PARTY.adsenseClientId,
  },
}

type SiteLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  return (
    <>
      <PublicThirdPartyResources />
      <ScopedIntlProvider scope="site">
        <ThemeScript />
        <FontScript />
        <ReadingBackgroundScript />
        <ThemeSync />
        <RouteProgressBar />
        <OfflineNavigationCapture />
        <OfflineStatusBanner />
        <AppHeader />
        {children}
        <AppFooter />
      </ScopedIntlProvider>
    </>
  )
}
