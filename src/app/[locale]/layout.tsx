import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SITE_URL } from '@/app/seo.config'
import PostHogBootstrap from '@/components/analytics/PostHogBootstrap'
import WebVitalsReporter from '@/components/analytics/WebVitalsReporter'
import { routing, type Locale } from '@/i18n/routing'
import React from 'react'
import '../document.css'

const LOCALE_OG_MAP: Record<Locale, string> = {
  en: 'en_US',
  vi: 'vi_VN',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  fr: 'fr_FR',
}

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations({ locale, namespace: 'SEO.home' })
  const title = t('title')
  const description = t('description')

  const languages: Record<string, string> = {}
  for (const l of routing.locales) languages[l] = `/${l}`
  languages['x-default'] = `/${routing.defaultLocale}`

  return {
    title: {
      template: '%s | Nguyen Le Phong',
      default: title,
    },
    description,
    metadataBase: new URL(SITE_URL),
    applicationName: 'Nguyen Le Phong — CV',
    authors: [{ name: 'Nguyen Le Phong', url: SITE_URL }],
    creator: 'Nguyen Le Phong',
    publisher: 'Nguyen Le Phong',
    keywords: [
      'Nguyen Le Phong',
      'Nguyễn Lê Phong',
      'Software Engineer',
      'Senior Software Engineer',
      'Tech Lead',
      'Full-stack Engineer',
      'Front-end Engineer',
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Java Spring',
      'Micro-Frontend',
      'Kubernetes',
      'ArgoCD',
      'Vietnam',
      'Ho Chi Minh City',
      'CV',
      'Resume',
      'Portfolio',
    ],
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    category: 'technology',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      siteName: 'Nguyen Le Phong — Software Engineer',
      title,
      description,
      url: `${SITE_URL}/${locale}`,
      locale: LOCALE_OG_MAP[locale as Locale],
      type: 'profile',
      firstName: 'Phong',
      lastName: 'Nguyen Le',
      username: 'nguyenlephong',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@nguyenlephong17',
    },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '512x512' },
        { url: '/favicon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { url: '/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
    },
    verification: {
      google: undefined,
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1115' },
  ],
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://us.i.posthog.com" crossOrigin="" />
        <link rel="preconnect" href="https://us-assets.i.posthog.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://us.i.posthog.com" />
        <link rel="dns-prefetch" href="https://us-assets.i.posthog.com" />
      </head>
      <PostHogBootstrap locale={locale} />

      <body suppressHydrationWarning>
        <WebVitalsReporter locale={locale} />
        {children}
      </body>
    </html>
  )
}
