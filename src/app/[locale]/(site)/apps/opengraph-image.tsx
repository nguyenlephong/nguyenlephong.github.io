import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { apps } from '@/app/[locale]/(site)/apps/apps.data'
import { getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const alt = PAGE_SEO.apps.ogAlt ?? PAGE_SEO.apps.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const names = apps.map((a) => a.name)
  const cacheKey = `static-apps-${names.join('-')}-v2`
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="ocean"
        eyebrow="Apps"
        title="Small tools I built for my own work."
        subtitle={apps[0]?.copy.en.tagline ?? 'Source on GitHub.'}
        chips={[...names, 'macOS 13+', 'Swift', 'MIT']}
        footer="nguyenlephong.github.io/apps · Source on GitHub"
      />
    ),
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
