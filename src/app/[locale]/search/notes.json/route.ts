import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { listNotes } from '@/lib/notes/data'
import {
  toNoteSearchItem,
  type NotesSearchIndex,
} from '@/lib/content/search-index'
import { createSearchIndex } from '@/lib/content/search-index.server'

type Context = { params: Promise<{ locale: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function GET(_request: Request, { params }: Context) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const index: NotesSearchIndex = createSearchIndex(
    listNotes(locale).map(toNoteSearchItem),
  )

  return Response.json(index, {
    headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
  })
}
