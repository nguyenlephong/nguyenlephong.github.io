import type { Metadata } from 'next'
import { listNoteHubParams } from '@/lib/notes/data'
import NotesTopicCollectionPage, {
  notesTopicMetadata,
} from '@/components/notes/NotesTopicCollectionPage'
import '../../notes.css'
import '../../../blog/blog.css'

type Props = { params: Promise<{ locale: string; topic: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return listNoteHubParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, topic } = await params
  return notesTopicMetadata(locale, topic, 1)
}

export default async function NotesTopicPage({ params }: Props) {
  const { locale, topic } = await params
  return <NotesTopicCollectionPage locale={locale} topic={topic} page={1} />
}
