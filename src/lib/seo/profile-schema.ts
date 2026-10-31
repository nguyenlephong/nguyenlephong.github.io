import type { Person, WithContext } from 'schema-dts'
import { profileInfo } from '@/app/app.const'
import { SITE_URL } from '@/app/seo.config'
import type { Locale } from '@/i18n/routing'
import { SITE_SECTIONS, sectionUrl } from '@/lib/seo/site-sections'

const DEFAULT_LOCALE = 'en'

const PROFILE_AVATAR = `${SITE_URL}/icon.png`

const BONBON_ORGANIZATION = {
  '@type': 'Organization',
  name: 'BonBon Mobility',
  alternateName: 'BonBon',
  url: 'https://bonbon.com.vn',
  logo: `${SITE_URL}/brand/bonbon-mark.png`,
} as const

// Press coverage naming or picturing Nguyen Le Phong as a BonBon co-founder (Sep 2026 pre-seed round).
const BONBON_PRESS_COVERAGE = [
  {
    headline:
      'Tasco dẫn dắt vòng đầu tư 500.000 USD vào Bonbon - nền tảng O2O kết nối chủ xe với mạng lưới garage và trung tâm chăm sóc xe',
    url: 'https://www.tasco.com.vn/post/tasco-dan-dat-vong-dau-tu-500-000-usd-vao-bonbon-nen-tang-o2o-ket-noi-chu-xe-voi-mang-luoi-garage-va-trung-tam-cham-soc-xe',
    publisher: 'Tasco',
    datePublished: '2026-09-21',
    inLanguage: 'vi',
  },
  {
    headline: 'Tasco và GenAI Fund rót 500.000 USD vào nền tảng công nghệ Bonbon',
    url: 'https://www.vietnamplus.vn/tasco-va-genai-fund-rot-500000-usd-vao-nen-tang-cong-nghe-bonbon-post1137679.vnp',
    publisher: 'VietnamPlus',
    datePublished: '2026-09-22',
    inLanguage: 'vi',
  },
  {
    headline: 'Tasco rót 500.000 USD vào nền tảng chăm sóc ô tô Bonbon',
    url: 'https://tapchikinhtetaichinh.vn/tasco-rot-500-000-usd-vao-nen-tang-cham-soc-o-to-bonbon-167714.html',
    publisher: 'Tạp chí Kinh tế - Tài chính',
    datePublished: '2026-09-22',
    inLanguage: 'vi',
  },
  {
    headline: 'Startup Bonbon gọi vốn pre-seed 500 ngàn USD từ Tasco và GenAI Fund',
    url: 'https://bbw.vn/startup-bonbon-goi-von-pre-seed-500000-usd-tu-tasco-va-genai-fund-60451.html',
    publisher: 'Bloomberg Businessweek Việt Nam',
    datePublished: '2026-09-22',
    inLanguage: 'vi',
  },
  {
    headline:
      "Vietnam's Bonbon Mobility raises $500,000 pre-seed round led by Tasco, GenAI Fund co-investing",
    url: 'https://technode.global/2026/09/22/vietnams-bonbon-mobility-raises-500000-pre-seed-round-led-by-tasco-genai-fund-co-investing/',
    publisher: 'TNGlobal',
    datePublished: '2026-09-22',
    inLanguage: 'en',
  },
  {
    headline: "Bonbon Mobility raises US$500K to digitise Vietnam's car-care market",
    url: 'https://e27.co/bonbon-mobility-raises-us500k-to-digitise-vietnams-car-care-market-20260922/',
    publisher: 'e27',
    datePublished: '2026-09-22',
    inLanguage: 'en',
  },
  {
    headline: "Building Beyond the Pilot: GenAI Fund Backs Bonbon's $500K Pre-Seed Round",
    url: 'https://genaifund.ai/2026/09/23/genai-fund-backs-bonbon-500k/',
    publisher: 'GenAI Fund',
    datePublished: '2026-09-23',
    inLanguage: 'en',
  },
  {
    headline: "GenAI Fund backs Bonbon Mobility's $500,000 pre-seed round",
    url: 'https://vir.com.vn/genai-fund-backs-bonbon-mobilitys-500000-pre-seed-round-161626.html',
    publisher: 'Vietnam Investment Review',
    datePublished: '2026-09-25',
    inLanguage: 'en',
  },
] as const

export function buildPersonSchema(description: string): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Nguyen Le Phong',
    alternateName: ['Nguyễn Lê Phong', 'Phong Nguyen', 'nguyenlephong'],
    url: SITE_URL,
    image: PROFILE_AVATAR,
    jobTitle: 'Lead Software Engineer · Co-founder of BonBon · Technical Lead',
    description,
    email: `mailto:${profileInfo.contact.email}`,
    telephone: profileInfo.contact.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ho Chi Minh City',
      addressCountry: 'VN',
    },
    knowsAbout: [
      'Cross-device Message Backup and Restore',
      'Sync Reliability and Client Observability',
      'Document Classification Engines',
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Go',
      'Python',
      'Java',
      'Spring Framework',
      'PostgreSQL',
      'Redis',
      'Multi-tenant SaaS Architecture',
      'Electron Desktop Architecture',
      'OAuth 2.1 and OIDC',
      'AI-assisted Document Processing',
      'Feature Flag Platforms',
      'VETC Partner Mini Apps',
      'Automotive Service Platforms',
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
      name: 'Zalo - VNG Corporation',
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
}

// Kept off the homepage Person node on purpose: the home HTML/RSC performance
// budgets have no headroom, so the venture facts extend the same @id from /about.
export function buildPersonVentureSchema(): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Nguyen Le Phong',
    affiliation: BONBON_ORGANIZATION,
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Co-founder, BonBon Mobility',
      description:
        'Co-founder of BonBon, an O2O platform connecting car owners with garages and car care centers in Vietnam.',
    },
    subjectOf: BONBON_PRESS_COVERAGE.map((article) => ({
      '@type': 'NewsArticle',
      headline: article.headline,
      url: article.url,
      datePublished: article.datePublished,
      inLanguage: article.inLanguage,
      publisher: { '@type': 'Organization', name: article.publisher },
      about: BONBON_ORGANIZATION,
    })),
  }
}

export function buildProfilePageSchema(
  locale: Locale,
  title: string,
  description: string,
) {
  const url = `${SITE_URL}/${locale}`
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profilepage`,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: { '@id': `${SITE_URL}/#person` },
  }
}

const WEBSITE_ID = `${SITE_URL}/#website`

/** Sections that are real HTML pages, in the order they appear in navigation. */
const WEBSITE_PART_IDS = ['about', 'blog', 'notes', 'gallery', 'apps', 'studio'] as const

/**
 * Site-level entity for the domain root. Owned by the root stub (`/`), where
 * Google reads the site name; `alternateName` carries the brand spellings people
 * actually search for, and `hasPart` names every top-level section with its URL.
 */
export function buildWebsiteSchema(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: 'Nguyen Le Phong',
    alternateName: ['Nguyễn Lê Phong', 'nguyenlephong', 'Phong Nguyen'],
    description,
    inLanguage: 'en',
    author: { '@id': `${SITE_URL}/#person` },
    publisher: { '@id': `${SITE_URL}/#person` },
    hasPart: SITE_SECTIONS.filter((section) =>
      (WEBSITE_PART_IDS as readonly string[]).includes(section.id),
    ).map((section) => ({
      '@type': 'WebPage',
      name: section.name,
      description: section.description,
      url: sectionUrl(section, DEFAULT_LOCALE),
    })),
  }
}

/**
 * Main-menu description as SiteNavigationElement nodes (name + URL). Google does
 * not require this markup for sitelinks, but it states the same section list as
 * the visible navigation in machine-readable form.
 */
export function buildSiteNavigationSchema(locale: string = DEFAULT_LOCALE) {
  return {
    '@context': 'https://schema.org',
    '@graph': SITE_SECTIONS.map((section) => ({
      '@type': 'SiteNavigationElement',
      '@id': `${SITE_URL}/#nav-${section.id}`,
      name: section.name,
      description: section.description,
      url: sectionUrl(section, locale),
      isPartOf: { '@id': WEBSITE_ID },
    })),
  }
}
