import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { listNotes, NOTE_CONTENT_LOCALES } from '@/lib/notes/data'
import {
  toNoteSearchItem,
  type NotesSearchIndex,
} from '@/lib/content/search-index'
import { createSearchIndex } from '@/lib/content/search-index.server'

type Context = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return NOTE_CONTENT_LOCALES.map((locale) => ({ locale }))
}

export async function GET(_request: Request, { params }: Context) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const index: NotesSearchIndex = createSearchIndex(
    listNotes(locale).map(toNoteSearchItem),
  )

  // No Cache-Control here: the static export drops route headers and the host
  // sets its own. Freshness comes from the `?v=<revision>` URL instead.
  return Response.json(index)
}
