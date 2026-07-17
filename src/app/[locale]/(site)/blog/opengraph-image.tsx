import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const alt = PAGE_SEO.blog.ogAlt ?? PAGE_SEO.blog.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const cacheKey = 'static-blog-list-v1'
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="violet"
        eyebrow="Blog"
        title="Engineering, explained simply."
        subtitle="Deep-dives on software architecture, source structure, and the craft of building systems that last — written for beginners and battle-tested teams alike."
        chips={['Architecture', 'Source structure', 'System design', 'Beginner-friendly']}
        badge={{ label: 'Format', value: 'Long-form' }}
      />
    ),
    { ...size },
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
