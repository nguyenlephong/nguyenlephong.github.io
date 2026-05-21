import { ImageResponse } from 'next/og'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { PAGE_SEO } from '@/app/seo.config'

export const alt = PAGE_SEO.cv.ogAlt ?? PAGE_SEO.cv.title
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const dynamic = 'force-static'

export default async function OgImage() {
  return new ImageResponse(
    (
      <OgShell
        theme="dark"
        eyebrow="Curriculum Vitae"
        title="Built systems. Led teams. Shipped product."
        subtitle="Head of Tech @ NDSVN. Previously Zalo PC (15M+ MAU) and PrimeData CDxP. End-to-end full-stack from UI to Kubernetes rollout."
        chips={['Head of Tech', 'ex-Zalo PC', 'ex-PrimeData', 'React · Java Spring · K8s']}
        badge={{ label: 'Experience', value: '8+ yrs' }}
        footer="Download résumé · nguyenlephong.github.io/cv"
      />
    ),
    { ...size }
  )
}
