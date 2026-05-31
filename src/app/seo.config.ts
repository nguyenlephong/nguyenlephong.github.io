export const SITE_URL = 'https://nguyenlephong.github.io'

export const SITE = {
  url: SITE_URL,
  name: 'Nguyen Le Phong — Senior Software Engineer',
  brandShort: 'Nguyen Le Phong',
  twitter: '@nguyenlephong17',
  locale: 'en_US',
  defaultOgAlt: 'Nguyen Le Phong — Senior Software Engineer & Tech Lead',
}

export interface PageSEO {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogAlt?: string
}

export const PAGE_SEO: Record<
  'home' | 'about' | 'cv' | 'gallery' | 'apps' | 'homeAlt' | 'thoughts' | 'blog',
  PageSEO
> = {
  home: {
    title: 'Nguyen Le Phong — Senior Software Engineer & Tech Lead',
    description:
      'Senior Software Engineer & Head of Tech with 8+ years building product, leading delivery, and architecting Micro-Frontend, Kubernetes, and rollout systems. Bachelor of IT — Very Good (GPA 3.36).',
    path: '/',
    keywords: [
      'Nguyen Le Phong',
      'Nguyễn Lê Phong',
      'Senior Software Engineer',
      'Head of Tech',
      'Tech Lead',
      'Full-stack',
      'React',
      'Next.js',
      'Kubernetes',
      'Micro-Frontend',
      'GPA 3.36',
      'Very Good degree',
    ],
    ogAlt: 'Nguyen Le Phong — Very Good degree, GPA 3.36, 8+ years engineering',
  },
  homeAlt: {
    title: 'Nguyen Le Phong — Software Engineer',
    description:
      'A passionate full-stack engineer building end-to-end products: front-end, services, CI/CD, and production infrastructure.',
    path: '/home',
    keywords: ['Nguyen Le Phong', 'Software Engineer', 'Full-stack'],
    ogAlt: 'Nguyen Le Phong — Software Engineer profile',
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
      'Downloadable résumé and full work history of Nguyen Le Phong — Head of Tech at NDSVN, ex-Zalo PC (15M+ MAU), ex-PrimeData. React, Next.js, Java Spring, Kubernetes.',
    path: '/cv',
    keywords: [
      'Nguyen Le Phong CV',
      'Resume',
      'Software Engineer Resume',
      'Tech Lead CV',
      'Head of Tech',
    ],
    ogAlt: 'Nguyen Le Phong — Résumé (Head of Tech · ex-Zalo · ex-PrimeData)',
  },
  gallery: {
    title: 'Gallery — Certifications, Awards & Projects',
    description:
      'Certifications, awards, projects, and activities — a visual record of Nguyen Le Phong as a software engineer.',
    path: '/gallery',
    keywords: [
      'Nguyen Le Phong gallery',
      'Software Engineer certificates',
      'Best Rookie of the Year',
      'Compliance Refresh Training',
      'Cybersecurity certificate',
    ],
    ogAlt: 'Gallery — certifications, awards, projects and activities',
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
  thoughts: {
    title: 'Thoughts — Digital Garden by Nguyen Le Phong',
    description:
      'A personal digital garden by Nguyen Le Phong — a living knowledge graph of evergreen notes on software craft, decision-making, reading, and learning. Available in English and Vietnamese.',
    path: '/thoughts',
    keywords: [
      'digital garden',
      'knowledge graph',
      'evergreen notes',
      'second brain',
      'personal knowledge management',
      'PKM',
      'Zettelkasten',
      'software craft notes',
      'learning in public',
      'decision making notes',
      'reading notes',
      'software engineering essays',
      'note-taking system',
      'Nguyen Le Phong thoughts',
      'tech notes Vietnamese engineer',
    ],
    ogAlt: 'Thoughts — personal digital garden by Nguyen Le Phong',
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
}

// Reference link shown only inside the rendered page (visible footer credit).
// NOT exposed in any SEO metadata — meta description, JSON-LD, OG images,
// sitemap, robots — must stay clean of this URL by request.
export const THOUGHTS_SOURCE = {
  homepage: 'https://huylenq.github.io',
  thoughtUrl: (slug: string) => `https://huylenq.github.io/thoughts/${slug}`,
}

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) return path
  return `${SITE_URL}${path === '/' ? '' : path}`
}
