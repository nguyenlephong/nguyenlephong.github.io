import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE, type OgTheme } from '@/app/_og/og-shell'
import { getCategory, listCategoryPostPairs, loadPost } from '@/lib/blog/data'
import { buildDescription } from '@/lib/blog/seo'
import { hashOgParams, getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'
import { filterOgStaticParams } from '@/lib/og/build-targets'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Blog post — Nguyen Le Phong'

export function generateStaticParams() {
  const pairs = listCategoryPostPairs()
  const params = routing.locales.flatMap((locale) =>
    pairs.map(({ category, slug }) => ({ locale, category, slug })),
  )
  return filterOgStaticParams(
    params,
    ({ locale, category, slug }) => `/${locale}/blog/${category}/${slug}`,
    { keepFirstWhenEmpty: true },
  )
}
export const dynamic = 'force-static'

type Params = { locale: string; category: string; slug: string }

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { locale, category, slug } = await params
  const post = loadPost(slug, locale)
  if (!post || post.category !== category) {
    return new ImageResponse(
      <OgShell theme="dark" eyebrow="Blog" title="Post not found" />,
      { ...size },
    )
  }

  const subtitle = post.summary || buildDescription(post.html, 180)
  const hash = hashOgParams({ title: post.title, tags: post.tags, subtitle, readingMinutes: post.readingMinutes, category, locale })
  const cacheKey = `blog-post-${category}-${slug}-${locale}-${hash}`

  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const cat = getCategory(category, locale)

  const response = new ImageResponse(
    (
      <OgShell
        theme={(cat?.accent as OgTheme) ?? 'ocean'}
        eyebrow={`Blog · ${cat?.title ?? 'Article'}`}
        title={post.title}
        subtitle={subtitle}
        chips={post.tags.slice(0, 4)}
        badge={{ label: 'Read', value: `${post.readingMinutes} min` }}
        titleSize={post.title.length > 48 ? 56 : 64}
      />
    ),
    { ...size },
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
