import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const alt = PAGE_SEO.about.ogAlt ?? PAGE_SEO.about.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const cacheKey = 'static-about-v2'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="ocean"
        eyebrow="About"
        title="Backend, platform, and product engineering."
        subtitle="Production systems across secure integrations, Kubernetes infrastructure, load balancer paths, feature-flag rollouts, observability, and technical leadership."
        chips={['.NET Core', 'Kubernetes', 'Load balancer', 'Feature flags']}
        badge={{ label: 'Experience', value: '8+ yrs' }}
      />
    ),
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
