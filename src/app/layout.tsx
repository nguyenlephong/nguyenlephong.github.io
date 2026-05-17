import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { profileInfo, SEO } from '@/app/app.const'
import Script from 'next/script'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import ThemeScript from '@/components/theme/ThemeScript'
import { Person, WithContext } from 'schema-dts'
import React from 'react'
import './globals.css'

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

const SITE_URL = 'https://nguyenlephong.github.io'
const OG_IMAGE =
  'https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom.png'

export const metadata: Metadata = {
  title: {
    template: '%s · ' + SEO.title_tail,
    default: SEO.title,
  },
  description: SEO.description,
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
  alternates: { canonical: SITE_URL },
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    siteName: 'Nguyen Le Phong — Software Engineer',
    title: SEO.title,
    description: SEO.description,
    url: SITE_URL,
    locale: 'en_US',
    type: 'profile',
    firstName: 'Phong',
    lastName: 'Nguyen Le',
    username: 'nguyenlephong',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Nguyen Le Phong — Senior Software Engineer & Tech Lead',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.title,
    description: SEO.description,
    creator: '@nguyenlephong17',
    images: [OG_IMAGE],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    google: undefined,
  },
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

const personSchema: WithContext<Person> = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Nguyen Le Phong',
  alternateName: ['Nguyễn Lê Phong', 'Phong Nguyen'],
  url: SITE_URL,
  image: OG_IMAGE,
  jobTitle: 'Senior Software Engineer · Tech Lead',
  description: SEO.description,
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
  name: 'Nguyen Le Phong — Senior Software Engineer',
  description: SEO.description,
  inLanguage: 'en-US',
  author: { '@id': `${SITE_URL}/#person` },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <meta name="google-adsense-account" content="ca-pub-2196929070546836" />
        <link rel="preconnect" href="https://app.posthog.com" />
        <link rel="dns-prefetch" href="https://app.posthog.com" />
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
        strategy="afterInteractive"
        id="GTM"
        src="https://www.googletagmanager.com/gtag/js?id=G-RLXNC58343"
      />
      <Script
        strategy="afterInteractive"
        id="adsbygoogle"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2196929070546836"
        crossOrigin="anonymous"
      />
      <Script
        id="GTM_datalayer"
        strategy="afterInteractive"
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
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_Ti11bWc5cshVoQe8AI7SuY56FMFP7Fhc9WyymdOGVSw',{
              api_host:'https://app.posthog.com',
              capture_pageview: true,
              capture_pageleave: true,
              autocapture: true,
              persistence: 'localStorage+cookie'
            });
            posthog.register({ site: 'nguyenlephong.github.io', surface: 'cv' });
          `,
        }}
      />

      <body suppressHydrationWarning>
        <AppHeader />
        {children}
        <AppFooter />
      </body>
    </html>
  )
}
