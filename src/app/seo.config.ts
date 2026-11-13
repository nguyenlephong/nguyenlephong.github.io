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

export interface PageSEO {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogAlt?: string
}

export const PAGE_SEO: Record<
  'home' | 'about' | 'gallery' | 'apps' | 'blog' | 'studio',
  PageSEO
> = {
  home: {
    title: 'Nguyen Le Phong | Lead Software Engineer · BonBon co-founder',
    description:
      'Lead Software Engineer at Zalo PC and co-founder of BonBon Mobility ($500K pre-seed led by Tasco). Messaging at scale, safe rollouts, multi-tenant SaaS.',
    path: '/',
    keywords: [
      'Nguyen Le Phong',
      'Nguyễn Lê Phong',
      'Lead Software Engineer',
      'Zalo PC',
      'BonBon co-founder',
      'BonBon Mobility',
      'Senior Software Engineer',
      'Technical Lead',
      'Tech Lead',
      'Full-stack',
      'React',
      'Next.js',
      'Kubernetes',
      'Micro-Frontend',
      'GPA 3.36',
      'Very Good degree',
    ],
    ogAlt:
      'Nguyen Le Phong, Lead Software Engineer at Zalo PC and co-founder of BonBon Mobility',
  },
  about: {
    title: 'About Nguyen Le Phong: Lead at Zalo PC, BonBon co-founder',
    description:
      'How I got from an outsourcing agency to leading cross-device sync at Zalo PC and co-founding BonBon Mobility, and the habits I bring to each team.',
    path: '/about',
    keywords: [
      'About Nguyen Le Phong',
      'Lead Software Engineer',
      'Zalo PC',
      'BonBon Mobility co-founder',
      'LogiUP Tech Lead',
      'Feature flags',
      'Engineering leadership',
    ],
    ogAlt:
      'About Nguyen Le Phong: from an outsourcing agency to Lead at Zalo PC and co-founder of BonBon Mobility',
  },
  gallery: {
    title: 'Photos and certificates | Nguyen Le Phong',
    description:
      'BonBon Mobility at the Tasco Foundry Wash3000 Demo Day and its $500K pre-seed, Best Rookie of the Year 2019 at Splus Software, and certificates, each sourced.',
    path: '/gallery',
    keywords: [
      'Nguyen Le Phong gallery',
      'BonBon Mobility',
      'Tasco Foundry Wash3000',
      'Best Rookie of the Year',
      'Software Engineer certificates',
    ],
    ogAlt:
      'Photos and certificates: BonBon Mobility at Wash3000, the $500K pre-seed and Best Rookie of the Year 2019',
  },
  apps: {
    title: 'Apps: Small Open-Source Tools | Nguyen Le Phong',
    description:
      'Small tools Nguyen Le Phong built for his own work, starting with Glance, a macOS menu-bar app that translates selected text with one hotkey.',
    path: '/apps',
    keywords: [
      'Nguyen Le Phong apps',
      'macOS utilities',
      'Glance translation',
      'open source apps',
      'developer tools',
    ],
    ogAlt: 'Apps: small tools Nguyen Le Phong built for his own work, starting with Glance for macOS',
  },
  blog: {
    title: 'Blog — Software Architecture & Engineering, Explained Simply',
    description:
      'Beginner-friendly, deeply practical writing on software architecture and source-code structure — from Ports & Adapters to system design — with diagrams, real-world examples, and lessons that scale from startups to enterprise.',
    path: '/blog',
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
    ogAlt: 'Blog — software architecture and engineering, explained simply',
  },
  // Studio metadata lives in src/app/[locale]/studio/studio-static-content.ts (en and vi copy);
  // this entry mirrors the English copy for shared consumers. No keyword list (SEO-12).
  studio: {
    title: 'Engineering Studio: delivery checklists and system maps',
    description:
      'The checklists and system maps I use to scope work, ship releases and roll them out safely, plus how I set up AI coding agents.',
    path: '/studio',
  },
}

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) return path
  return `${SITE_URL}${path === '/' ? '' : path}`
}
