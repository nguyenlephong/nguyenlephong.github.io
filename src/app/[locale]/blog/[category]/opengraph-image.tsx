import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE, type OgTheme } from '@/app/_og/og-shell'
import { getCategory, getPostsByCategory, listCategorySlugs } from '@/lib/blog/data'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Blog category — Nguyen Le Phong'

export function generateStaticParams() {
  const slugs = listCategorySlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((category) => ({ locale, category })),
  )
}
export const dynamic = 'force-static'

type Params = { locale: string; category: string }

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { locale, category } = await params
  const cat = getCategory(category, locale)
  if (!cat) {
    return new ImageResponse(
      <OgShell theme="dark" eyebrow="Blog" title="Category not found" />,
      { ...size },
    )
  }

  const count = getPostsByCategory(category, locale).length

  return new ImageResponse(
    (
      <OgShell
        theme={cat.accent as OgTheme}
        eyebrow="Blog · Category"
        title={cat.title}
        subtitle={cat.tagline}
        chips={['Architecture', 'System design', 'Software craft']}
        badge={{ label: 'Articles', value: String(count) }}
      />
    ),
    { ...size },
  )
}
