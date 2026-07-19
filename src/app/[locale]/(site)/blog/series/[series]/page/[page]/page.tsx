import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { listBlogSeriesPageParams } from '@/lib/blog/data'
import { parsePageNumber } from '@/lib/content/pagination'
import BlogSeriesCollectionPage, {
  blogSeriesMetadata,
} from '@/components/blog/BlogSeriesCollectionPage'
import '../../../../blog.css'

type Props = {
  params: Promise<{ locale: string; series: string; page: string }>
}

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return listBlogSeriesPageParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, series, page: rawPage } = await params
  const page = parsePageNumber(rawPage)
  if (!page || page === 1) notFound()
  return blogSeriesMetadata(locale, series, page)
}

export default async function PaginatedBlogSeriesPage({ params }: Props) {
  const { locale, series, page: rawPage } = await params
  const page = parsePageNumber(rawPage)
  if (!page || page === 1) notFound()
  return (
    <BlogSeriesCollectionPage locale={locale} seriesId={series} page={page} />
  )
}
