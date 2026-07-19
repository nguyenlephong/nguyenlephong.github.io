import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import ContentHubPage from '@/components/content/ContentHubPage'
import {
  getBlogSeries,
  getCategory,
  getPostsBySeries,
  listBlogSeriesPageLocales,
} from '@/lib/blog/data'
import { blogPostOgImageUrl } from '@/lib/og/static-images'
import { CONTENT_HUB_LOCALES } from '@/lib/content/route-contract'
import { collectionPagePath, paginate } from '@/lib/content/pagination'
import {
  buildContentHubMetadata,
  buildContentHubStructuredData,
  resolveContentHubLocale,
} from '@/lib/content/hub-page'
import { canonicalFor } from '@/lib/seo/locale'

const COPY = {
  en: {
    eyebrow: 'Blog series',
    back: 'Blog',
    suffix: 'Blog series',
    empty: 'No published articles yet.',
  },
  vi: {
    eyebrow: 'Loạt bài Blog',
    back: 'Blog',
    suffix: 'Loạt bài Blog',
    empty: 'Chưa có bài viết đã xuất bản.',
  },
} as const

export async function blogSeriesMetadata(
  locale: string,
  seriesId: string,
  page: number,
): Promise<Metadata> {
  const resolvedLocale = resolveContentHubLocale(locale, CONTENT_HUB_LOCALES)
  if (!resolvedLocale) notFound()
  const availableLocales = listBlogSeriesPageLocales(seriesId, page)
  if (!availableLocales.includes(resolvedLocale)) notFound()
  const series = getBlogSeries(seriesId, resolvedLocale)
  const pageData = paginate(getPostsBySeries(seriesId, resolvedLocale), page)
  if (!series || !pageData) notFound()

  const t = await getTranslations({
    locale: resolvedLocale,
    namespace: 'Pages.blog',
  })
  const path = collectionPagePath(`/blog/series/${seriesId}`, page)
  const pageLabel = t('controls.pagination.pageLabel', {
    page,
    total: pageData.totalPages,
  })
  const title =
    page === 1
      ? `${series.title} — ${COPY[resolvedLocale].suffix}`
      : `${series.title} — ${pageLabel}`
  const description =
    page === 1 ? series.intro : `${series.intro} ${pageLabel}.`

  return buildContentHubMetadata({
    locale: resolvedLocale,
    availableLocales,
    path,
    title,
    description,
  })
}

export default async function BlogSeriesCollectionPage({
  locale,
  seriesId,
  page,
}: {
  locale: string
  seriesId: string
  page: number
}) {
  const resolvedLocale = resolveContentHubLocale(locale, CONTENT_HUB_LOCALES)
  if (!resolvedLocale) notFound()
  setRequestLocale(resolvedLocale)

  const series = getBlogSeries(seriesId, resolvedLocale)
  const pageData = paginate(getPostsBySeries(seriesId, resolvedLocale), page)
  if (!series || !pageData) notFound()

  const t = await getTranslations({
    locale: resolvedLocale,
    namespace: 'Pages.blog',
  })
  const copy = COPY[resolvedLocale]
  const basePath = `/blog/series/${seriesId}`
  const path = collectionPagePath(basePath, page)
  const canonical = canonicalFor(resolvedLocale, path)
  const pageLabel =
    page > 1
      ? t('controls.pagination.pageLabel', { page, total: pageData.totalPages })
      : undefined

  const { collectionJsonLd, breadcrumbJsonLd } =
    buildContentHubStructuredData({
      canonical,
      locale: resolvedLocale,
      title: series.title,
      description: series.intro,
      parent: {
        type: 'Blog',
        id: `${canonicalFor(resolvedLocale, '/blog')}#blog`,
      },
      ownerRole: 'author',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      items: pageData.items.map((post, index) => ({
        type: 'BlogPosting',
        headline: post.title,
        url: canonicalFor(
          resolvedLocale,
          `/blog/${post.category}/${post.slug}`,
        ),
        image: blogPostOgImageUrl(post.slug),
        datePublished: post.date,
        position: pageData.startIndex + index + 1,
      })),
      breadcrumb: {
        rootName: copy.back,
        rootUrl: canonicalFor(resolvedLocale, '/blog'),
        hubName: series.title,
        hubUrl: canonicalFor(resolvedLocale, basePath),
      },
    })

  return (
    <ContentHubPage
      kind="blog_series"
      locale={resolvedLocale}
      hubId={seriesId}
      title={series.title}
      intro={series.intro}
      eyebrow={copy.eyebrow}
      backHref="/blog"
      backLabel={copy.back}
      pageLabel={pageLabel}
      currentPage={page}
      totalPages={pageData.totalPages}
      basePath={basePath}
      cards={pageData.items.map((post, index) => ({
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        kicker:
          getCategory(post.category, resolvedLocale)?.title ?? post.category,
        contentCategory: post.category,
        href: `/blog/${post.category}/${post.slug}`,
        date: post.date,
        readingLabel: t('readingTime', { minutes: post.readingMinutes }),
        position: pageData.startIndex + index + 1,
      }))}
      emptyLabel={copy.empty}
      pagination={{
        label: t('controls.pagination.label'),
        previous: t('controls.pagination.prev'),
        next: t('controls.pagination.next'),
        goToPage: t('controls.pagination.goToPage', { page: '{page}' }),
      }}
      collectionJsonLd={collectionJsonLd}
      breadcrumbJsonLd={breadcrumbJsonLd}
    />
  )
}
