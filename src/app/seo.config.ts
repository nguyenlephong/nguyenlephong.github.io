export const SITE_URL = 'https://nguyenlephong.github.io'

export const SITE = {
  url: SITE_URL,
  name: 'Nguyen Le Phong — Senior Software Engineer',
  brandShort: 'Nguyen Le Phong',
  twitter: '@nguyenlephong17',
  locale: 'en_US',
  defaultOgAlt: 'Nguyen Le Phong — Senior Software Engineer & Technical Lead',
}

export interface PageSEO {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogAlt?: string
}

export const PAGE_SEO: Record<
  'home' | 'about' | 'cv' | 'gallery' | 'apps' | 'blog' | 'studio',
  PageSEO
> = {
  home: {
    title: 'Nguyen Le Phong — Senior Software Engineer & Technical Lead',
    description:
      'Senior full-stack engineer and technical lead with 8+ years shipping product, platform, Micro-Frontend, Kubernetes, secure fintech integration, and rollout systems.',
    path: '/',
    keywords: [
      'Nguyen Le Phong',
      'Nguyễn Lê Phong',
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
      'Nguyen Le Phong — 8+ years across product, platform, and technical leadership',
  },
  about: {
    title: 'About — Skills, Strengths & Engineering Principles',
    description:
      "Skills, strengths, and how I think about engineering. Bachelor's in Information Technology — Very Good classification, GPA 3.36 — with 8+ years shipping production systems.",
    path: '/about',
    keywords: [
      'About Nguyen Le Phong',
      'Software Engineer principles',
      'Engineering philosophy',
      'Very Good degree',
      'GPA 3.36',
    ],
    ogAlt: 'About Nguyen Le Phong — Very Good classification, GPA 3.36',
  },
  cv: {
    title: 'Curriculum Vitae — Nguyen Le Phong',
    description:
      'Downloadable résumé and work history of Nguyen Le Phong — senior full-stack engineer and technical lead at NDSVN, ex-Zalo PC (15M+ MAU), ex-PrimeData. React, Next.js, Java Spring, .NET Core, Kubernetes.',
    path: '/cv',
    keywords: [
      'Nguyen Le Phong CV',
      'Resume',
      'Software Engineer Resume',
      'Tech Lead CV',
      'Technical Lead',
    ],
    ogAlt: 'Nguyen Le Phong — Résumé (technical lead · ex-Zalo · ex-PrimeData)',
  },
  gallery: {
    title: 'Gallery — Career Signals Behind the Work',
    description:
      'A curated gallery of certifications, recognitions, project snapshots, and personal discipline signals that show how Nguyen Le Phong learns, builds, and delivers.',
    path: '/gallery',
    keywords: [
      'Nguyen Le Phong gallery',
      'Software Engineer certificates',
      'Best Rookie of the Year',
      'Compliance Refresh Training',
      'Cybersecurity certificate',
    ],
    ogAlt:
      'Gallery — career signals from certifications, recognitions, projects and steady practice',
  },
  apps: {
    title: 'Apps — A Showroom of Tiny, Crafted Tools',
    description:
      'A curated showroom of apps built by Nguyen Le Phong — open-source utilities and tools designed to be tiny, fast, and a joy to use.',
    path: '/apps',
    keywords: [
      'Nguyen Le Phong apps',
      'macOS utilities',
      'Glance translation',
      'open source apps',
      'developer tools',
    ],
    ogAlt: 'Apps Showroom — tiny, crafted open-source tools',
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
  studio: {
    title: 'Studio — Learning Notes & Engineering Machine Setup',
    description:
      'A public working shelf for AI setup, machine setup, terminal setup, and the skill libraries Nguyen Le Phong keeps installed across Codex, Claude, Antigravity, and Gemini.',
    path: '/studio',
    keywords: [
      'Nguyen Le Phong studio',
      'engineering machine setup',
      'AI developer setup',
      'Codex skills',
      'Claude skills',
      'Antigravity skills',
      'Gemini skills',
      'developer checklist',
    ],
    ogAlt:
      'Studio — learning notes, AI tooling inventory, and engineering setup checklist',
  },
}

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) return path
  return `${SITE_URL}${path === '/' ? '' : path}`
}
