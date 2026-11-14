import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

// Fallback alt only: Studio pages attach this card with a localized alt (buildStaticPageMetadata).
export const alt = PAGE_SEO.studio.ogAlt
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const cacheKey = 'static-studio-v1'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="ocean"
        eyebrow="Engineering Studio"
        title="Delivery checklists and system maps."
        subtitle="The checklists and system maps I use to scope work, ship releases and roll them out safely, plus how I set up AI coding agents."
        chips={['Checklists', 'System maps', 'Release rollout', 'AI setup']}
        badge={{ label: 'Format', value: 'Working tools' }}
      />
    ),
    { ...size },
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
