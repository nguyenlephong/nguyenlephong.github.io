import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import AppFooter from '@/components/AppFooter'
import AppHeader from '@/components/AppHeader'
import FontScript from '@/components/font/FontScript'
import RouteProgressBar from '@/components/motion/RouteProgressBar'
import OfflineNavigationCapture from '@/components/offline/OfflineNavigationCapture'
import OfflineStatusBanner from '@/components/offline/OfflineStatusBanner'
import ReadingBackgroundScript from '@/components/reading/ReadingBackgroundScript'
import ThemeScript from '@/components/theme/ThemeScript'
import ThemeSync from '@/components/theme/ThemeSync'
import { routing } from '@/i18n/routing'
import { globalSearchConfig } from '@/lib/content/global-search.server'
import ScopedIntlProvider from '@/i18n/ScopedIntlProvider'
import { publicThirdPartyMetadata } from '@/lib/public-third-party'
import '../../globals.css'

export const metadata: Metadata = publicThirdPartyMetadata()

type SiteLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Nav' })

  // MEP-66: next.config inlines GOOGLE_THIRD_PARTY, so with the flag off this
  // branch is dead code and the GA/AdSense client module never reaches a chunk.
  let thirdPartyResources: ReactNode = null
  if (process.env['GOOGLE_THIRD_PARTY'] === 'on') {
    const { default: PublicThirdPartyResources } = await import(
      '@/components/analytics/PublicThirdPartyResources'
    )
    thirdPartyResources = <PublicThirdPartyResources />
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('skipToContent')}
      </a>
      {thirdPartyResources}
      <ScopedIntlProvider scope="site">
        <ThemeScript />
        <FontScript />
        <ReadingBackgroundScript />
        <ThemeSync />
        <RouteProgressBar />
        <OfflineNavigationCapture />
        <OfflineStatusBanner />
        <AppHeader search={globalSearchConfig(locale)} />
        {/* Skip-link target: every route renders its own <main> right after this. */}
        <div id="main-content" className="skip-target" tabIndex={-1} />
        {children}
        <AppFooter />
      </ScopedIntlProvider>
    </>
  )
}
