import { ImageResponse } from 'next/og'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PROFILE_OG_CONTENT } from '@/app/_og/profile-og'
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
    <OgShell {...PROFILE_OG_CONTENT} />,
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
