import type { Metadata } from 'next'
import { routing, type Locale } from '@/i18n/routing'
import { canonicalFor, localeAlternates, ogLocaleFor } from '@/lib/seo/locale'

export const STATIC_PAGE_SEO_POLICY = {
  about: {
    path: '/about',
    contentLocales: ['en', 'vi'],
  },
  apps: {
    path: '/apps',
    contentLocales: ['en', 'vi'],
  },
  gallery: {
    path: '/gallery',
    contentLocales: routing.locales,
  },
} as const satisfies Record<
  string,
  { path: `/${string}`; contentLocales: readonly Locale[] }
>

export type StaticPageName = keyof typeof STATIC_PAGE_SEO_POLICY

export type StaticPageLocalization = {
  authored: boolean
  canonical: string
  contentLocale: Locale
  follow: true
  index: boolean
  languages: Record<string, string>
  ogLocale: string
  alternateOgLocales: string[]
  path: `/${string}`
  routeLocale: Locale
}

function isLocale(value: string): value is Locale {
  return routing.locales.some((locale) => locale === value)
}

/**
 * Resolves content identity separately from route identity. Unsupported locale
 * routes stay usable, but point search engines at the authored English page.
 */
export function resolveStaticPageLocalization(
  page: StaticPageName,
  routeLocale: string,
): StaticPageLocalization {
  if (!isLocale(routeLocale)) {
    throw new Error(`Unsupported static-page locale: ${routeLocale}`)
  }

  const policy = STATIC_PAGE_SEO_POLICY[page]
  const authored = policy.contentLocales.some((locale) => locale === routeLocale)
  const contentLocale = authored ? routeLocale : routing.defaultLocale

  return {
    authored,
    canonical: canonicalFor(contentLocale, policy.path),
    contentLocale,
    follow: true,
    index: authored,
    languages: authored ? localeAlternates(policy.path, policy.contentLocales) : {},
    ogLocale: ogLocaleFor(contentLocale),
    alternateOgLocales: authored
      ? policy.contentLocales
          .filter((locale) => locale !== contentLocale)
          .map(ogLocaleFor)
      : [],
    path: policy.path,
    routeLocale,
  }
}

export function buildStaticPageMetadata({
  description,
  localization,
  openGraphType,
  title,
}: {
  description: string
  localization: StaticPageLocalization
  openGraphType: 'profile' | 'website'
  title: string
}): Metadata {
  const languages = localization.authored
    ? { languages: localization.languages }
    : {}
  const alternateLocale = localization.authored
    ? { alternateLocale: localization.alternateOgLocales }
    : {}

  return {
    title: { absolute: title },
    description,
    // The locale layout has broad portfolio keywords. These focused static
    // pages intentionally use their title, description, and visible copy
    // instead of inheriting a generic keyword meta tag.
    keywords: null,
    alternates: {
      canonical: localization.canonical,
      ...languages,
    },
    robots: {
      index: localization.index,
      follow: localization.follow,
      googleBot: {
        index: localization.index,
        follow: localization.follow,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: localization.canonical,
      type: openGraphType,
      locale: localization.ogLocale,
      ...alternateLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export function staticPageSitemapLocales(page: StaticPageName): readonly Locale[] {
  return STATIC_PAGE_SEO_POLICY[page].contentLocales
}
