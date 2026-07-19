import type { Metadata } from 'next'
import { SITE, SITE_URL, absoluteUrl } from '@/app/seo.config'
import { pageCount } from '@/lib/content/pagination'
import { OG_LOCALE_MAP, canonicalFor, localeAlternates } from '@/lib/seo/locale'

export interface ContentHubRoute<Locale extends string, HubId extends string> {
  hubId: HubId
  page: number
  locales: Locale[]
}

export function resolveContentHubLocale<Locale extends string>(
  locale: string,
  locales: readonly Locale[],
): Locale | null {
  return (locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : null
}

interface ContentHubRouteInventoryOptions<
  Locale extends string,
  HubId extends string,
> {
  locales: readonly Locale[]
  listHubIds: (locale: Locale) => readonly HubId[]
  itemCount: (hubId: HubId, locale: Locale) => number
}

/**
 * Builds the one page-aware route inventory shared by static params, metadata,
 * and the sitemap. A locale is present only when that exact page is exportable.
 */
export function listContentHubRoutes<
  Locale extends string,
  HubId extends string,
>({
  locales,
  listHubIds,
  itemCount,
}: ContentHubRouteInventoryOptions<Locale, HubId>): ContentHubRoute<
  Locale,
  HubId
>[] {
  const idsByLocale = new Map<Locale, Set<HubId>>()
  const orderedHubIds: HubId[] = []
  const knownHubIds = new Set<HubId>()

  for (const locale of locales) {
    const ids = new Set(listHubIds(locale))
    idsByLocale.set(locale, ids)
    for (const hubId of ids) {
      if (knownHubIds.has(hubId)) continue
      knownHubIds.add(hubId)
      orderedHubIds.push(hubId)
    }
  }

  return orderedHubIds.flatMap((hubId) => {
    const totalPages = Math.max(
      0,
      ...locales.map((locale) =>
        idsByLocale.get(locale)?.has(hubId)
          ? pageCount(itemCount(hubId, locale))
          : 0,
      ),
    )

    return Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1
      return {
        hubId,
        page,
        locales: locales.filter(
          (locale) =>
            idsByLocale.get(locale)?.has(hubId) === true &&
            page <= pageCount(itemCount(hubId, locale)),
        ),
      }
    })
  })
}

export function contentHubPageLocales<
  Locale extends string,
  HubId extends string,
>(
  routes: readonly ContentHubRoute<Locale, HubId>[],
  hubId: HubId,
  page: number,
): Locale[] {
  return [
    ...(routes.find(
      (route) => route.hubId === hubId && route.page === page,
    )?.locales ?? []),
  ]
}

export const CONTENT_HUB_SOCIAL_IMAGE = absoluteUrl('/opengraph-image.png')

interface ContentHubMetadataOptions<Locale extends keyof typeof OG_LOCALE_MAP> {
  locale: Locale
  availableLocales: readonly Locale[]
  path: string
  title: string
  description: string
}

export function buildContentHubMetadata<
  Locale extends keyof typeof OG_LOCALE_MAP,
>({
  locale,
  availableLocales,
  path,
  title,
  description,
}: ContentHubMetadataOptions<Locale>): Metadata {
  const canonical = canonicalFor(locale, path)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: localeAlternates(path, availableLocales),
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale],
      alternateLocale: availableLocales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => OG_LOCALE_MAP[candidate]),
      images: [
        {
          url: CONTENT_HUB_SOCIAL_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE.twitter,
      creator: SITE.twitter,
      images: [CONTENT_HUB_SOCIAL_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

interface ContentHubSchemaItem {
  type: 'Article' | 'BlogPosting'
  headline: string
  url: string
  image: string
  datePublished: string
  position: number
}

interface ContentHubStructuredDataOptions {
  canonical: string
  locale: string
  title: string
  description: string
  parent: {
    type: 'Blog' | 'WebSite'
    id: string
  }
  ownerRole: 'author' | 'publisher'
  itemListOrder:
    | 'https://schema.org/ItemListOrderAscending'
    | 'https://schema.org/ItemListOrderDescending'
  items: readonly ContentHubSchemaItem[]
  breadcrumb: {
    rootName: string
    rootUrl: string
    hubName: string
    hubUrl: string
  }
}

export function buildContentHubStructuredData({
  canonical,
  locale,
  title,
  description,
  parent,
  ownerRole,
  itemListOrder,
  items,
  breadcrumb,
}: ContentHubStructuredDataOptions): {
  collectionJsonLd: Record<string, unknown>
  breadcrumbJsonLd: Record<string, unknown>
} {
  return {
    collectionJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonical}#collection`,
      name: title,
      description,
      url: canonical,
      inLanguage: locale,
      isPartOf: { '@type': parent.type, '@id': parent.id },
      [ownerRole]: { '@type': 'Person', '@id': `${SITE_URL}/#person` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListOrder,
        itemListElement: items.map((item) => ({
          '@type': 'ListItem',
          position: item.position,
          item: {
            '@type': item.type,
            headline: item.headline,
            url: item.url,
            image: item.image,
            datePublished: item.datePublished,
          },
        })),
      },
    },
    breadcrumbJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: breadcrumb.rootName,
          item: breadcrumb.rootUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: breadcrumb.hubName,
          item: breadcrumb.hubUrl,
        },
      ],
    },
  }
}
