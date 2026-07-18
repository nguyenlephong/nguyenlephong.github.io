import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE, type OgTheme } from '@/app/_og/og-shell'
import { getCategory, getPostsByCategory, listCategorySlugs } from '@/lib/blog/data'
import { hashOgParams, getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'
import { filterOgStaticParams } from '@/lib/og/build-targets'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Blog category — Nguyen Le Phong'

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  const slugs = listCategorySlugs()
  const params = routing.locales.flatMap((locale) =>
    slugs.map((category) => ({ locale, category })),
  )
  return filterOgStaticParams(
    params,
    ({ locale, category }) => `/${locale}/blog/${category}`,
    { keepFirstWhenEmpty: true },
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
  const hash = hashOgParams({ title: cat.title, tagline: cat.tagline, accent: cat.accent, count, locale })
  const cacheKey = `blog-cat-${category}-${locale}-${hash}`

  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
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

  await saveOgCache(cacheKey, response.clone())
  return response
}
