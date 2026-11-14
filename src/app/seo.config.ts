export const SITE_URL = 'https://nguyenlephong.github.io'
// The CV page (ProfilePage). `/` is only a redirect stub, so Person.url and author.url point here.
export const PROFILE_URL = `${SITE_URL}/en`

export const SITE = {
  url: SITE_URL,
  // One site name everywhere (og:site_name, WebSite.name) so Google's site-name
  // and result titles agree on a single brand string.
  name: 'Nguyen Le Phong',
  brandShort: 'Nguyen Le Phong',
  twitter: '@nguyenlephong17',
  locale: 'en_US',
  defaultOgAlt: 'Nguyen Le Phong, Lead Software Engineer at Zalo PC',
}

// MEP-63: Vietnamese pages show the name with diacritics (h1, title suffix). Person.name and
// SITE.name stay Latin; the diacritic form lives in JSON-LD alternateName.
export function displayName(locale: string): string {
  return locale === 'vi' ? 'Nguyễn Lê Phong' : SITE.brandShort
}

// Titles and descriptions live only in messages/<locale>.json (SEO namespace), so the root stub,
// /en and every locale read one source (MEP-61). Studio metadata lives in
// src/app/[locale]/(site)/studio/studio-static-content.ts. What stays here has no per-locale copy:
// the English fallback alt baked into each opengraph-image route, and keyword lists.
export const PAGE_SEO = {
  home: {
    ogAlt:
      'Nguyen Le Phong, Lead Software Engineer at Zalo PC and co-founder of BonBon Mobility',
  },
  about: {
    ogAlt:
      'About Nguyen Le Phong: from an outsourcing agency to Lead at Zalo PC and co-founder of BonBon Mobility',
  },
  gallery: {
    ogAlt:
      'Photos and certificates: BonBon Mobility winning Wash3000, the $500K pre-seed and Best Rookie of the Year 2019',
  },
  apps: {
    ogAlt: 'Apps: small tools Nguyen Le Phong built for his own work, starting with Glance for macOS',
  },
  blog: {
    keywords: [
      'software architecture blog',
      'source code structure',
      'hexagonal architecture',
      'ports and adapters',
      'clean architecture',
      'system design',
      'software engineering tutorials',
      'Nguyen Le Phong blog',
    ],
    ogAlt: 'Blog: software architecture, AI and team practice by Nguyen Le Phong',
  },
  notes: {
    ogAlt: 'Notes on work, learning and life by Nguyen Le Phong',
  },
  studio: {
    ogAlt: 'Engineering Studio: delivery checklists and system maps by Nguyen Le Phong',
  },
} as const

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) return path
  return `${SITE_URL}${path === '/' ? '' : path}`
}
