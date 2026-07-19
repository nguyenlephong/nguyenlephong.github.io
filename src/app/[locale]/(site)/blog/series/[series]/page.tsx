import type { Metadata } from 'next'
import { listBlogSeriesParams } from '@/lib/blog/data'
import BlogSeriesCollectionPage, {
  blogSeriesMetadata,
} from '@/components/blog/BlogSeriesCollectionPage'
import '../../blog.css'

type Props = { params: Promise<{ locale: string; series: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return listBlogSeriesParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, series } = await params
  return blogSeriesMetadata(locale, series, 1)
}

export default async function BlogSeriesPage({ params }: Props) {
  const { locale, series } = await params
  return <BlogSeriesCollectionPage locale={locale} seriesId={series} page={1} />
}
