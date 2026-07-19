import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { listNoteHubPageParams } from '@/lib/notes/data'
import { parsePageNumber } from '@/lib/content/pagination'
import NotesTopicCollectionPage, {
  notesTopicMetadata,
} from '@/components/notes/NotesTopicCollectionPage'
import '../../../../notes.css'
import '../../../../../blog/blog.css'

type Props = {
  params: Promise<{ locale: string; topic: string; page: string }>
}

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return listNoteHubPageParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, topic, page: rawPage } = await params
  const page = parsePageNumber(rawPage)
  if (!page || page === 1) notFound()
  return notesTopicMetadata(locale, topic, page)
}

export default async function PaginatedNotesTopicPage({ params }: Props) {
  const { locale, topic, page: rawPage } = await params
  const page = parsePageNumber(rawPage)
  if (!page || page === 1) notFound()
  return <NotesTopicCollectionPage locale={locale} topic={topic} page={page} />
}
