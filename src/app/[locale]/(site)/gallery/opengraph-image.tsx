import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { gallery } from '@/content/gallery'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const alt = PAGE_SEO.gallery.ogAlt ?? PAGE_SEO.gallery.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const cacheKey = `static-gallery-${gallery.bonbon.length}-${gallery.recognition.length}-v3`
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="light"
        eyebrow="Gallery"
        title="Photos and certificates."
        subtitle="BonBon Mobility at the Tasco Foundry Wash3000 Demo Day, its $500K pre-seed, and the awards and certificates behind the CV, each linked to its source."
        chips={[
          'BonBon Mobility',
          'Wash3000 Demo Day',
          '$500K pre-seed',
          'Best Rookie of the Year 2019',
        ]}
      />
    ),
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
