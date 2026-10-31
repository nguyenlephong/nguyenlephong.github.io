import { serializeJsonLd } from '@/lib/seo/json-ld'
import {
  buildSectionBreadcrumb,
  type SectionBreadcrumbInput,
} from '@/lib/seo/section-breadcrumb'

/** Two-level BreadcrumbList (brand home, then the section) as JSON-LD. */
export default function SectionBreadcrumbJsonLd(props: SectionBreadcrumbInput) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(buildSectionBreadcrumb(props)),
      }}
    />
  )
}
