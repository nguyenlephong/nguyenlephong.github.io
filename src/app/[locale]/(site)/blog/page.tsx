import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import BlogCollectionPage, {
  blogCollectionMetadata,
} from '@/components/blog/BlogCollectionPage'
import './blog.css'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return blogCollectionMetadata(locale, 1)
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params
  return <BlogCollectionPage locale={locale} page={1} />
}
