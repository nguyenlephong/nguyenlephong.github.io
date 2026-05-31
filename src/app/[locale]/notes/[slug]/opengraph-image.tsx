import { ImageResponse } from 'next/og'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { listNoteSlugs, loadNote } from '@/lib/notes/data'
import { buildDescription } from '@/lib/blog/seo'
import { hashOgParams, getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Ghi chú — Nguyen Le Phong'
export const dynamic = 'force-static'

export function generateStaticParams() {
  return listNoteSlugs().map((slug) => ({ locale: 'vi', slug }))
}

type Params = { locale: string; slug: string }

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const note = loadNote(slug)
  if (!note) {
    return new ImageResponse(
      <OgShell theme="dark" eyebrow="Ghi chú" title="Không tìm thấy" />,
      { ...size },
    )
  }

  const subtitle = note.summary || buildDescription(note.html, 180)
  const hash = hashOgParams({ title: note.title, tags: note.tags, subtitle, readingMinutes: note.readingMinutes })
  const cacheKey = `notes-post-${slug}-${hash}`

  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme="ocean"
        eyebrow="Ghi chú"
        title={note.title}
        subtitle={subtitle}
        chips={note.tags.slice(0, 4)}
        badge={{ label: 'Đọc', value: `${note.readingMinutes} phút` }}
        titleSize={note.title.length > 48 ? 52 : 60}
      />
    ),
    { ...size },
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
