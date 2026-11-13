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
  const counts = {
    certs: gallery.certificates.length,
    awards: gallery.awards.length,
    projects: gallery.projects.length,
  }
  const cacheKey = `static-gallery-certs${counts.certs}-awards${counts.awards}-projects${counts.projects}-v2`
  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="light"
        eyebrow="Gallery"
        title="Evidence beyond the resume."
        subtitle="Certifications, awards, project snapshots, and activity signals — visible proof of what I've built, learned, and kept practicing."
        chips={[
          `${counts.certs} certifications`,
          `${counts.awards} awards`,
          `${counts.projects} projects`,
          'Best Rookie of the Year',
        ]}
      />
    ),
    { ...size }
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
