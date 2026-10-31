import { APP_ROUTE } from '@/app/app.const'
import { SITE_URL } from '@/app/seo.config'

/**
 * Single list of the public top-level sections. Structured data, the root stub
 * navigation, and tests read from here so the names, URLs and descriptions
 * Google sees never drift from each other. Names are the same words used as the
 * visible anchor text in the header navigation.
 */
export interface SiteSection {
  id: 'home' | 'about' | 'blog' | 'notes' | 'gallery' | 'apps' | 'studio' | 'resume'
  /** Locale-relative path. `''` is the localized home page. */
  path: string
  /** Absolute, locale-independent file (the résumé PDF). */
  absolute?: string
  name: string
  description: string
}

export const SITE_SECTIONS: readonly SiteSection[] = [
  {
    id: 'home',
    path: '',
    name: 'Home',
    description:
      'Lead Software Engineer at Zalo PC and co-founder of BonBon Mobility: profile, experience and signature projects.',
  },
  {
    id: 'about',
    path: APP_ROUTE.ABOUT,
    name: 'About',
    description:
      'How Nguyen Le Phong builds backend, platform and product systems that can be shipped, observed and recovered.',
  },
  {
    id: 'blog',
    path: APP_ROUTE.BLOG,
    name: 'Blog',
    description:
      'Practical writing on software architecture and source-code structure, with diagrams and real examples.',
  },
  {
    id: 'notes',
    path: APP_ROUTE.NOTES,
    name: 'Notes',
    description:
      'A personal archive of lessons on life, work and learning, kept as short reflective notes.',
  },
  {
    id: 'gallery',
    path: APP_ROUTE.GALLERY,
    name: 'Gallery',
    description:
      'Certificates, awards, project snapshots and activities that show how Nguyen Le Phong learns and delivers.',
  },
  {
    id: 'apps',
    path: APP_ROUTE.APPS,
    name: 'Apps',
    description:
      'Small open-source apps and tools built to be fast, practical and pleasant to use.',
  },
  {
    id: 'studio',
    path: APP_ROUTE.STUDIO,
    name: 'Studio',
    description:
      'A public workspace of engineering notes, delivery checklists and interactive system design flows.',
  },
  {
    id: 'resume',
    path: '',
    absolute: `${SITE_URL}${APP_ROUTE.CV_PDF}`,
    name: 'Résumé',
    description:
      'Downloadable PDF résumé of Nguyen Le Phong, Lead Software Engineer.',
  },
]

export function sectionUrl(section: SiteSection, locale: string): string {
  return section.absolute ?? `${SITE_URL}/${locale}${section.path}`
}
