import { ImageResponse } from 'next/og'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { routing } from '@/i18n/routing'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const alt = PAGE_SEO.home.ogAlt ?? PAGE_SEO.home.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const dynamic = 'force-static'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function OgImage() {
  const cacheKey = 'static-locale-root-v1'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="gold"
        eyebrow="Nguyen Le Phong"
        title="Senior Software Engineer · Technical Lead"
        subtitle="8+ years shipping product, platform systems, Micro-Frontend architecture, Kubernetes operations, secure fintech integrations, and rollout workflows."
        chips={['React · Next.js', 'Node · Java · .NET', 'Kubernetes · ArgoCD', 'Micro-Frontend']}
        badge={{ label: 'Scale', value: '80M+ users' }}
        footer="nguyenlephong.github.io · Product to platform"
      />
    ),
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
