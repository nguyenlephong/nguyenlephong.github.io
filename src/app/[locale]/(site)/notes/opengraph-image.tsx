import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

// Fallback alt only: notes pages attach this card with a localized alt (sectionOgImages).
export const alt = PAGE_SEO.notes.ogAlt
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const cacheKey = 'static-notes-list-v1'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="gold"
        eyebrow="Notes"
        title="Notes on work, learning and life."
        subtitle="Shorter notes on career, books, money and everyday decisions, from a Lead Software Engineer at Zalo PC."
        chips={['Career', 'Books', 'Money', 'Everyday decisions']}
        badge={{ label: 'Format', value: 'Short notes' }}
      />
    ),
    { ...size },
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
