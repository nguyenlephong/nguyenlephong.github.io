import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import BlogCollectionPage, {
  blogCollectionMetadata,
} from '@/components/blog/BlogCollectionPage'
import { feedAlternateTypes } from '@/lib/seo/content-feeds'
import './blog.css'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const metadata = await blogCollectionMetadata(locale, 1)
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: await feedAlternateTypes('blog', locale),
    },
  }
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params
  return <BlogCollectionPage locale={locale} page={1} />
}
