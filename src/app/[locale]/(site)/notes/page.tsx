import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import NotesCollectionPage, {
  notesCollectionMetadata,
} from '@/components/notes/NotesCollectionPage'
import './notes.css'
import '../blog/blog.css'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return notesCollectionMetadata(locale, 1)
}

export default async function NotesPage({ params }: Props) {
  const { locale } = await params
  return <NotesCollectionPage locale={locale} page={1} />
}
