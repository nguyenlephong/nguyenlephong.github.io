import { ImageResponse } from 'next/og'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PROFILE_OG_CONTENT, PROFILE_OG_CONTENT_VI } from '@/app/_og/profile-og'
import { PAGE_SEO } from '@/app/seo.config'
import { routing } from '@/i18n/routing'
import { hashOgParams, getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const alt = PAGE_SEO.home.ogAlt
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const dynamic = 'force-static'

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Locales without authored card copy use EN.
  const content = locale === 'vi' ? PROFILE_OG_CONTENT_VI : PROFILE_OG_CONTENT
  // Keyed on the card copy so a copy edit regenerates the PNG; bump the prefix when og-shell layout changes.
  const cacheKey = `profile-${hashOgParams(content)}`
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    <OgShell {...content} />,
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
