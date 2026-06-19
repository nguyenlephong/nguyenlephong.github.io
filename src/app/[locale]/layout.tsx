import type { Metadata, Viewport } from 'next'
import {
  Inter,
  JetBrains_Mono,
  Source_Sans_3,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Atkinson_Hyperlegible,
  Lora,
  Be_Vietnam_Pro,
  Fraunces,
} from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { profileInfo, SEO } from '@/app/app.const'
import Script from 'next/script'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import ThemeScript from '@/components/theme/ThemeScript'
import ThemeSync from '@/components/theme/ThemeSync'
import FontScript from '@/components/font/FontScript'
import ReadingBackgroundScript from '@/components/reading/ReadingBackgroundScript'
import MotionProvider from '@/components/motion/MotionProvider'
import RouteProgressBar from '@/components/motion/RouteProgressBar'
import WebVitalsReporter from '@/components/analytics/WebVitalsReporter'
import { SITE_URL } from '@/app/seo.config'
import { routing, type Locale } from '@/i18n/routing'
import { Person, WithContext } from 'schema-dts'
import React from 'react'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-reading-source',
  display: 'swap',
  preload: false,
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-reading-plex',
  display: 'swap',
  preload: false,
})

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-reading-atkinson',
  display: 'swap',
  preload: false,
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-reading-lora',
  display: 'swap',
  preload: false,
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-reading-be-vietnam',
  display: 'swap',
  preload: false,
})

const fraunces = Fraunces({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-reading-fraunces',
  display: 'swap',
  preload: false,
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-reading-ibm-plex-mono',
  display: 'swap',
  preload: false,
})

const FONT_VARIABLES = [
  jbMono.variable,
  sourceSans.variable,
  plexSans.variable,
  atkinson.variable,
  lora.variable,
  beVietnamPro.variable,
  fraunces.variable,
  ibmPlexMono.variable,
].join(' ')

const PROFILE_AVATAR =
  'https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom.png'

const LOCALE_OG_MAP: Record<Locale, string> = {
  en: 'en_US',
  vi: 'vi_VN',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  fr: 'fr_FR',
}

export function generateStaticParams() {
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

  return {
    title: {
      template: '%s · ' + SEO.title_tail,
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

  const t = await getTranslations({ locale, namespace: 'SEO.home' })
  const seoDescription = t('description')

  const personSchema: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Nguyen Le Phong',
    alternateName: ['Nguyễn Lê Phong', 'Phong Nguyen'],
    url: SITE_URL,
    image: PROFILE_AVATAR,
    jobTitle: 'Senior Software Engineer · Technical Lead · Full-stack Engineer',
    description: seoDescription,
    email: `mailto:${profileInfo.contact.email}`,
    telephone: profileInfo.contact.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ho Chi Minh City',
      addressCountry: 'VN',
    },
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Java',
      'Spring Framework',
      'Micro-Frontend Architecture',
      'Kubernetes',
      'ArgoCD',
      'CI/CD',
      'System Design',
      'Engineering Leadership',
      'Secure Financial Integrations',
      'Progressive Delivery',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'NDSVN JSC',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Information Technology — Bachelor (GPA 3.36)',
    },
    sameAs: [
      profileInfo.contact.linkedin,
      profileInfo.contact.github,
      profileInfo.contact.leetcode,
      profileInfo.contact.youtube,
      profileInfo.contact.twitter,
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Nguyen Le Phong — Senior Software Engineer & Technical Lead',
    description: seoDescription,
    inLanguage: locale,
    author: { '@id': `${SITE_URL}/#person` },
  }

  return (
    <html lang={locale} className={`${inter.variable} ${FONT_VARIABLES}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <FontScript />
        <ReadingBackgroundScript />
        <meta name="google-adsense-account" content="ca-pub-2196929070546836" />
        <link rel="preconnect" href="https://app.posthog.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://app.posthog.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>

      <Script
        strategy="lazyOnload"
        id="GTM"
        src="https://www.googletagmanager.com/gtag/js?id=G-RLXNC58343"
      />
      <Script
        strategy="lazyOnload"
        id="adsbygoogle"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2196929070546836"
        crossOrigin="anonymous"
      />
      <Script
        id="GTM_datalayer"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RLXNC58343', { page_path: window.location.pathname });
          `,
        }}
      />
      <Script
        id="POSTHOG"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_Ti11bWc5cshVoQe8AI7SuY56FMFP7Fhc9WyymdOGVSw',{
              api_host:'https://app.posthog.com',
              capture_pageview: true,
              capture_pageleave: true,
              autocapture: false,
              disable_session_recording: true,
              respect_dnt: true,
              persistence: 'localStorage+cookie'
            });
            posthog.register({ site: 'nguyenlephong.github.io', surface: 'cv', locale: ${JSON.stringify(locale)} });
          `,
        }}
      />

      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <ThemeSync />
          <MotionProvider>
            <RouteProgressBar />
            <WebVitalsReporter />
            <AppHeader />
            {children}
            <AppFooter />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
