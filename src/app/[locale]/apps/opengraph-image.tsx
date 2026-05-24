import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'
import { apps } from '@/app/[locale]/apps/apps.data'

export const alt = PAGE_SEO.apps.ogAlt ?? PAGE_SEO.apps.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  const live = apps.filter((a) => a.status === 'shipped').length
  const featured = apps.slice(0, 3).map((a) => a.name)
  return new ImageResponse(
    (
      <OgShell
        theme="ocean"
        eyebrow="Apps · Showroom"
        title="Tiny apps, crafted with care."
        subtitle="A personal showroom of utilities I've shipped — each one open-source, opinionated about what to leave out, and designed to disappear into your workflow."
        chips={featured.length ? featured.concat(['Open-source', 'MIT']) : ['Open-source', 'MIT', 'macOS · Web']}
        badge={{ label: 'Apps live', value: String(live || apps.length) }}
        footer="nguyenlephong.github.io/apps · Open-source"
      />
    ),
    { ...size }
  )
}
