import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import AppFooter from '@/components/AppFooter'
import AppHeader from '@/components/AppHeader'
import BlogReaderTools from '@/components/blog/BlogReaderTools'
import FontScript from '@/components/font/FontScript'
import MotionProvider from '@/components/motion/MotionProvider'
import RouteProgressBar from '@/components/motion/RouteProgressBar'
import OfflineNavigationCapture from '@/components/offline/OfflineNavigationCapture'
import OfflineStatusBanner from '@/components/offline/OfflineStatusBanner'
import ReadingBackgroundScript from '@/components/reading/ReadingBackgroundScript'
import ThemeScript from '@/components/theme/ThemeScript'
import ThemeSync from '@/components/theme/ThemeSync'
import { routing } from '@/i18n/routing'

type SiteLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  const rt = await getTranslations({ locale, namespace: 'ReaderTools' })
  const readerLabels = {
    label: rt('label'),
    scrollTop: rt('scrollTop'),
    scrollBottom: rt('scrollBottom'),
    font: rt('font'),
    background: rt('background'),
    language: rt('language'),
  }

  return (
    <>
      <ThemeScript />
      <FontScript />
      <ReadingBackgroundScript />
      <ThemeSync />
      <MotionProvider>
        <RouteProgressBar />
        <OfflineNavigationCapture />
        <OfflineStatusBanner />
        <AppHeader />
        {children}
        <AppFooter />
        <BlogReaderTools labels={readerLabels} />
      </MotionProvider>
    </>
  )
}
