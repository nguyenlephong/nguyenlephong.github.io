import { ImageResponse } from 'next/og'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'

export const alt = PAGE_SEO.about.ogAlt ?? PAGE_SEO.about.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const dynamic = 'force-static'

export default async function OgImage() {
  return new ImageResponse(
    (
      <OgShell
        theme="violet"
        eyebrow="About"
        title="How I think about engineering."
        subtitle="Skills, strengths, and the principles I bring to every team — semantic HTML, performance, accessibility, testing, and a documentation-first culture."
        chips={['Very Good degree', 'GPA 3.36', '8+ yrs experience', 'Team lead']}
        badge={{ label: 'Classification', value: 'Very Good' }}
      />
    ),
    { ...size }
  )
}
