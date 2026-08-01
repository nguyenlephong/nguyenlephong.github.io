import type { Person, WithContext } from 'schema-dts'
import { profileInfo } from '@/app/app.const'
import { SITE_URL } from '@/app/seo.config'
import type { Locale } from '@/i18n/routing'

const PROFILE_AVATAR = `${SITE_URL}/icon.png`

export function buildPersonSchema(description: string): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Nguyen Le Phong',
    alternateName: ['Nguyễn Lê Phong', 'Phong Nguyen'],
    url: SITE_URL,
    image: PROFILE_AVATAR,
    jobTitle: 'Lead Software Engineer · Technical Lead · Full-stack Engineer',
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
    mainEntity: { '@id': `${SITE_URL}/#person` },
  }
}

export function buildWebsiteSchema(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Nguyen Le Phong',
    description,
    inLanguage: 'en',
    author: { '@id': `${SITE_URL}/#person` },
  }
}
