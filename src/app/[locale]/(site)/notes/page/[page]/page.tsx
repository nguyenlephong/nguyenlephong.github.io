import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NOTE_CONTENT_LOCALES } from '@/lib/notes/data'
import NotesCollectionPage, {
  notesCollectionMetadata,
  notesPageCount,
} from '@/components/notes/NotesCollectionPage'
import { parsePageNumber } from '@/lib/content/pagination'
import '../../notes.css'
import '../../../blog/blog.css'

type Props = { params: Promise<{ locale: string; page: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return NOTE_CONTENT_LOCALES.flatMap((locale) =>
    Array.from({ length: Math.max(0, notesPageCount(locale) - 1) }, (_, index) => ({
      locale,
      page: String(index + 2),
    })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page: rawPage } = await params
  const page = parsePageNumber(rawPage)
  if (!page || page === 1) notFound()
  return notesCollectionMetadata(locale, page)
}

export default async function PaginatedNotesPage({ params }: Props) {
  const { locale, page: rawPage } = await params
  const page = parsePageNumber(rawPage)
  if (!page || page === 1) notFound()
  return <NotesCollectionPage locale={locale} page={page} />
}
