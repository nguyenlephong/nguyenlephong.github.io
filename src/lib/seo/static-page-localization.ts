import type { Metadata } from 'next'
import { SITE } from '@/app/seo.config'
import { routing, type Locale } from '@/i18n/routing'
import { canonicalFor, localeAlternates, ogLocaleFor } from '@/lib/seo/locale'
import { sectionOgImages } from '@/lib/seo/section-og-image'

export const STATIC_PAGE_SEO_POLICY = {
  about: {
    path: '/about',
    ogSegment: '/[locale]/(site)/about',
    contentLocales: routing.locales,
  },
  apps: {
    path: '/apps',
    ogSegment: '/[locale]/(site)/apps',
    contentLocales: ['en', 'vi'],
  },
  gallery: {
    path: '/gallery',
    ogSegment: '/[locale]/(site)/gallery',
    contentLocales: routing.locales,
  },
  // Studio prose is written in English and Vietnamese only (MEP-54).
  studio: {
    path: '/studio',
    ogSegment: '/[locale]/(site)/studio',
    contentLocales: ['en', 'vi'],
  },
  'studio/checklists': {
    path: '/studio/checklists',
    ogSegment: '/[locale]/(site)/studio',
    contentLocales: ['en', 'vi'],
  },
  'studio/system-maps': {
    path: '/studio/system-maps',
    ogSegment: '/[locale]/(site)/studio',
    contentLocales: ['en', 'vi'],
  },
  'studio/ai-setup': {
    path: '/studio/ai-setup',
    ogSegment: '/[locale]/(site)/studio',
    contentLocales: ['en', 'vi'],
  },
} as const satisfies Record<
  string,
  // ogSegment: the app segment whose opengraph-image is this page's social card (MEP-64).
  { path: `/${string}`; ogSegment: string; contentLocales: readonly Locale[] }
>

export type StaticPageName = keyof typeof STATIC_PAGE_SEO_POLICY

export type StaticPageLocalization = {
  authored: boolean
  canonical: string
  contentLocale: Locale
  follow: true
  index: boolean
  languages: Record<string, string>
  ogImageSegment: string
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
 * routes stay usable and self-canonical but noindex, with no hreflang, so search
 * engines never see a canonical that disagrees with the robots directive. They
 * stay out of the sitemap (`staticPageSitemapLocales`).
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
    canonical: canonicalFor(routeLocale, policy.path),
    contentLocale,
    follow: true,
    index: authored,
    languages: authored ? localeAlternates(policy.path, policy.contentLocales) : {},
    ogImageSegment: policy.ogSegment,
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
      siteName: SITE.name,
      type: openGraphType,
      locale: localization.ogLocale,
      ...alternateLocale,
      // The title is in the page's language, so it doubles as a localized alt for the card.
      images: sectionOgImages(
        localization.ogImageSegment,
        { locale: localization.routeLocale },
        title,
      ),
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
