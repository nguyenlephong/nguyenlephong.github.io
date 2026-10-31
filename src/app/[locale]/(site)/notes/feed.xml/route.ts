import { buildFeedResponse, feedStaticParams } from '@/lib/seo/content-feeds'

export const dynamic = 'force-static'

type Context = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return feedStaticParams('notes')
}

export async function GET(_request: Request, { params }: Context) {
  const { locale } = await params
  return buildFeedResponse('notes', locale)
}
