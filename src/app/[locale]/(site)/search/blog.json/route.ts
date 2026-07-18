import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { listPosts } from '@/lib/blog/data'
import {
  toBlogSearchItem,
  type BlogSearchIndex,
} from '@/lib/content/search-index'
import { createSearchIndex } from '@/lib/content/search-index.server'

type Context = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export async function GET(_request: Request, { params }: Context) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const index: BlogSearchIndex = createSearchIndex(
    listPosts(locale).map(toBlogSearchItem),
  )

  return Response.json(index, {
    headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
  })
}
