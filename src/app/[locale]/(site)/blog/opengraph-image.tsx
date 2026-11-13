import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

// Fallback alt only: blog pages attach this card with a localized alt (sectionOgImages).
export const alt = PAGE_SEO.blog.ogAlt
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const cacheKey = 'static-blog-list-v2'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="violet"
        eyebrow="Blog"
        title="Software architecture, AI and team practice."
        subtitle="Practical writing on architecture, AI-assisted delivery and how engineering teams work, from a Lead Software Engineer at Zalo PC."
        chips={['Architecture', 'AI in practice', 'System design', 'Team practice']}
        badge={{ label: 'Format', value: 'Long-form' }}
      />
    ),
    { ...size },
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
