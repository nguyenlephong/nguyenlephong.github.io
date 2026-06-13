import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const alt = PAGE_SEO.cv.ogAlt ?? PAGE_SEO.cv.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const cacheKey = 'static-cv-v1'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="dark"
        eyebrow="Curriculum Vitae"
        title="Built systems. Led teams. Shipped product."
        subtitle="Technical lead at NDSVN. Previously Zalo PC (15M+ MAU) and PrimeData CDxP. End-to-end full-stack from UI to secure integrations and Kubernetes rollout."
        chips={['Technical Lead', 'ex-Zalo PC', 'ex-PrimeData', 'React · .NET · K8s']}
        badge={{ label: 'Experience', value: '8+ yrs' }}
        footer="Download résumé · nguyenlephong.github.io/cv"
      />
    ),
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
