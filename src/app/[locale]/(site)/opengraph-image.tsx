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
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export default async function OgImage() {
  const cacheKey = 'static-locale-root-v2'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="gold"
        eyebrow="Nguyen Le Phong"
        title="Lead Software Engineer · Zalo PC"
        subtitle="Shipping cross-device message continuity, reliable releases, and platform systems for products at national scale."
        chips={['PC → Mobile Restore', 'React · Electron', 'Node · Kotlin', 'Platform Reliability']}
        badge={{ label: 'Zalo', value: '80M+ MAU' }}
        footer="nguyenlephong.github.io · Cross-device product to platform"
      />
    ),
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
