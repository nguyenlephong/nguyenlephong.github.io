import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'

export const alt = PAGE_SEO.thoughts.ogAlt ?? PAGE_SEO.thoughts.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
export const dynamic = 'force-static'

export default async function OgImage() {
  return new ImageResponse(
    (
      <OgShell
        theme="ocean"
        eyebrow="Thoughts"
        title="A living knowledge graph."
        subtitle="Notes on reading, writing, software craft, decision making, and learning — mirrored with credit and progressively translated."
        chips={['Digital garden', 'Evergreen notes', 'Knowledge graph', '40+ thoughts']}
        badge={{ label: 'Source', value: 'huylenq.github.io' }}
      />
    ),
    { ...size },
  )
}
