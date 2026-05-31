import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from '@/app/_og/og-shell'
import { listThoughtSlugs, loadThought } from '@/lib/thoughts/data'
import { buildDescription } from '@/lib/thoughts/seo'
import { hashOgParams, getCachedOg, saveOgCache, cachedOgResponse } from '@/lib/og/cache'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Thought — Nguyen Le Phong'

export function generateStaticParams() {
  const slugs = listThoughtSlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  )
}
export const dynamic = 'force-static'

const MATURITY_LABEL: Record<string, string> = {
  evergreen: 'Evergreen',
  budding: 'Budding',
  seed: 'Seed',
}

const MATURITY_THEME: Record<string, 'gold' | 'ocean' | 'violet'> = {
  evergreen: 'gold',
  budding: 'ocean',
  seed: 'violet',
}

type Params = { locale: string; slug: string }

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params
  const thought = loadThought(slug, locale)
  if (!thought) {
    return new ImageResponse(
      (
        <OgShell
          theme="dark"
          eyebrow="Thought"
          title="Not found"
          subtitle="This thought may have been renamed or removed."
        />
      ),
      { ...size },
    )
  }

  const subtitle = buildDescription(thought.html, 180)
  const theme = MATURITY_THEME[thought.maturity] ?? 'ocean'
  const hash = hashOgParams({ title: thought.title, subtitle, maturity: thought.maturity, locale })
  const cacheKey = `thought-${slug}-${locale}-${hash}`

  const cached = getCachedOg(cacheKey)
  if (cached) return cachedOgResponse(cached)

  const response = new ImageResponse(
    (
      <OgShell
        theme={theme}
        eyebrow="Thought"
        title={thought.title}
        subtitle={subtitle}
        chips={[
          MATURITY_LABEL[thought.maturity] ?? 'Note',
          'Knowledge graph',
          'Thoughts',
        ]}
        badge={{ label: 'Maturity', value: MATURITY_LABEL[thought.maturity] ?? 'Note' }}
      />
    ),
    { ...size },
  )

  await saveOgCache(cacheKey, response.clone())
  return response
}
