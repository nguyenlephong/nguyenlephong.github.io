import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import NotesCollectionPage, {
  notesCollectionMetadata,
} from '@/components/notes/NotesCollectionPage'
import { feedAlternateTypes } from '@/lib/seo/content-feeds'
import './notes.css'
import '../blog/blog.css'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const metadata = await notesCollectionMetadata(locale, 1)
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: await feedAlternateTypes('notes', locale),
    },
  }
}

export default async function NotesPage({ params }: Props) {
  const { locale } = await params
  return <NotesCollectionPage locale={locale} page={1} />
}
