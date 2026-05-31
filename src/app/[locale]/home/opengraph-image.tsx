import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const alt = PAGE_SEO.homeAlt.ogAlt ?? PAGE_SEO.homeAlt.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const cacheKey = 'static-home-v1'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="gold"
        eyebrow="Profile"
        title="Nguyen Le Phong — Software Engineer"
        subtitle="A passionate full-stack engineer building end-to-end products: front-end, services, CI/CD, and production infrastructure."
        chips={['React', 'Next.js', 'Java Spring', 'Kubernetes']}
        badge={{ label: 'GPA', value: '3.36' }}
      />
    ),
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
