import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { listBlogArchiveLocales } from '@/lib/blog/data'
import BlogCollectionPage, {
  blogCollectionMetadata,
  blogPageCount,
} from '@/components/blog/BlogCollectionPage'
import { parsePageNumber } from '@/lib/content/pagination'
import '../../blog.css'

type Props = { params: Promise<{ locale: string; page: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return listBlogArchiveLocales(1).flatMap((locale) =>
    Array.from({ length: Math.max(0, blogPageCount(locale) - 1) }, (_, index) => ({
      locale,
      page: String(index + 2),
    })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page: rawPage } = await params
  const page = parsePageNumber(rawPage)
  if (!page || page === 1) notFound()
  return blogCollectionMetadata(locale, page)
}

export default async function PaginatedBlogPage({ params }: Props) {
  const { locale, page: rawPage } = await params
  const page = parsePageNumber(rawPage)
  if (!page || page === 1) notFound()
  return <BlogCollectionPage locale={locale} page={page} />
}
