import { SITE_URL } from '@/app/seo.config'

export const BREADCRUMB_HOME_NAME = 'Nguyen Le Phong'

export interface SectionBreadcrumbInput {
  /** Locale whose pages the breadcrumb URLs point at (the content locale). */
  locale: string
  /** Visible section name, for example "About". */
  name: string
  /** Absolute canonical URL of the section page. */
  url: string
}

/**
 * Two-level BreadcrumbList (brand home, then the section) for top-level
 * section pages. The home crumb uses the brand name so it is correct in every
 * locale without another translated string.
 */
export function buildSectionBreadcrumb({ locale, name, url }: SectionBreadcrumbInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: BREADCRUMB_HOME_NAME,
        item: `${SITE_URL}/${locale}`,
      },
      { '@type': 'ListItem', position: 2, name, item: url },
    ],
  }
}
