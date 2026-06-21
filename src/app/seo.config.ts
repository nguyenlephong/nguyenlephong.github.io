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
  'home' | 'about' | 'gallery' | 'apps' | 'blog' | 'studio',
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
    title: 'About — Backend, Platform & Product Engineering',
    description:
      'How Nguyen Le Phong builds production systems across backend services, secure integrations, Kubernetes infrastructure, load balancer paths, feature-flag rollouts, observability, and technical leadership.',
    path: '/about',
    keywords: [
      'About Nguyen Le Phong',
      'Backend engineer',
      'Platform engineer',
      'Technical Lead',
      'Kubernetes',
      'Load balancer',
      'Feature flags',
      'Observability',
      'Secure integrations',
    ],
    ogAlt:
      'About Nguyen Le Phong — backend, platform, infrastructure, and product engineering',
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
      'A public working shelf for AI operating notes, daily learning checklists, machine setup, and skill libraries across NotebookLM, GPT, Claude, Codex, and Antigravity.',
    path: '/studio',
    keywords: [
      'Nguyen Le Phong studio',
      'engineering machine setup',
      'AI operating system',
      'AI learning checklist',
      'AI-driven engineering roadmap',
      'production readiness checklist',
      'Event Sourcing',
      'Circuit Breaker',
      'OpenTelemetry',
      'observability checklist',
      'AI developer setup',
      'NotebookLM workflow',
      'ChatGPT Projects',
      'Codex skills',
      'Claude skills',
      'Antigravity skills',
      'developer checklist',
    ],
    ogAlt:
      'Studio — AI operating notes, learning checklists, and engineering setup',
  },
}

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) return path
  return `${SITE_URL}${path === '/' ? '' : path}`
}
