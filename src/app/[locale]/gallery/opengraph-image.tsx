import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { profileInfo } from '@/app/app.const'

export const alt = PAGE_SEO.gallery.ogAlt ?? PAGE_SEO.gallery.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const counts = {
    certs: profileInfo.gallery.certificates.length,
    awards: profileInfo.gallery.awards.length,
    projects: profileInfo.gallery.projects.length,
  }
  return new ImageResponse(
    (
      <OgShell
        theme="light"
        eyebrow="Gallery"
        title="A record of the work."
        subtitle="Certifications, awards, projects, and a few off-screen moments — verifiable proofs of what I've built and learned."
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
}
