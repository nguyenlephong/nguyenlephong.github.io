import { ImageResponse } from 'next/og'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { routing } from '@/i18n/routing'

export const alt = PAGE_SEO.home.ogAlt ?? PAGE_SEO.home.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const dynamic = 'force-static'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function OgImage() {
  return new ImageResponse(
    (
      <OgShell
        theme="gold"
        eyebrow="Nguyen Le Phong"
        title="Senior Software Engineer · Tech Lead"
        subtitle="Bachelor of IT — Very Good classification (GPA 3.36). 8+ years shipping product, leading delivery, and architecting Micro-Frontend, Kubernetes, and rollout systems."
        chips={['React · Next.js', 'Java Spring · Node.js', 'Kubernetes · ArgoCD', 'Micro-Frontend']}
        badge={{ label: 'GPA', value: '3.36 / 4.0' }}
        footer="nguyenlephong.github.io · Head of Tech @ NDSVN"
      />
    ),
    { ...size }
  )
}
