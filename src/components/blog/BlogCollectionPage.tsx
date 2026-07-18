import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PAGE_SEO, SITE, SITE_URL } from '@/app/seo.config'
import { routing, type Locale } from '@/i18n/routing'
import {
  listBlogArchiveLocales,
  listCategories,
  listPosts,
} from '@/lib/blog/data'
import { OG_LOCALE_MAP, canonicalFor, localeAlternates } from '@/lib/seo/locale'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import {
  collectionPagePath,
  paginate,
} from '@/lib/content/pagination'
import { toBlogSearchItem } from '@/lib/content/search-index'
import {
  createSearchIndex,
  versionedSearchIndexUrl,
} from '@/lib/content/search-index.server'
import { blogPostOgImageUrl } from '@/lib/og/static-images'
import PageTracker from '@/components/analytics/PageTracker'
import BlogCategoryCard from '@/components/blog/BlogCategoryCard'
import BlogExplorer from '@/components/blog/BlogExplorer'

const POPULAR_TAG_LIMIT = 12
const seo = PAGE_SEO.blog

function popularTags(posts: { tags: string[] }[]): string[] {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, POPULAR_TAG_LIMIT)
    .map(([tag]) => tag)
}

export function blogPageCount(locale: string): number {
  return paginate(listPosts(locale), 1)?.totalPages ?? 1
}

export async function blogCollectionMetadata(
  locale: string,
  page: number,
): Promise<Metadata> {
  if (!hasLocale(routing.locales, locale)) notFound()
  const pageData = paginate(listPosts(locale), page)
  if (!pageData) notFound()

  const t = await getTranslations({ locale, namespace: 'Pages.blog' })
  const path = collectionPagePath('/blog', page)
  const pageLabel = t('controls.pagination.pageLabel', {
    page,
    total: pageData.totalPages,
  })
  const title = page === 1 ? `${t('title')} — ${t('eyebrow')}` : `${t('title')} — ${pageLabel}`
  const description =
    page === 1
      ? t('intro')
      : t('controls.pagination.pageDescription', {
          page,
          total: pageData.totalPages,
        })
  const canonical = canonicalFor(locale, path)

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: localeAlternates(path, listBlogArchiveLocales(page)),
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale as Locale] ?? OG_LOCALE_MAP.en,
      alternateLocale: listBlogArchiveLocales(page)
        .filter((candidate) => candidate !== locale)
        .map((candidate) => OG_LOCALE_MAP[candidate]),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE.twitter,
      creator: SITE.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

interface BlogCollectionPageProps {
  locale: string
  page: number
}

export default async function BlogCollectionPage({
  locale,
  page,
}: BlogCollectionPageProps) {
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Pages.blog' })
  const categories = listCategories(locale)
  const posts = listPosts(locale)
  const pageData = paginate(posts, page)
  if (!pageData) notFound()
  const searchRevision = createSearchIndex(posts.map(toBlogSearchItem)).revision

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))
  const countFor = (slug: string) =>
    t('articleCount', { count: posts.filter((post) => post.category === slug).length })
  const path = collectionPagePath('/blog', page)
  const canonical = canonicalFor(locale, path)
  const pageLabel = t('controls.pagination.pageLabel', {
    page,
    total: pageData.totalPages,
  })

  const blogLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${canonical}#blog`,
    name: `${t('title')} — ${t('eyebrow')}`,
    description: seo.description,
    url: canonical,
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: pageData.items.length,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      itemListElement: pageData.items.map((post, index) => ({
        '@type': 'ListItem',
        position: pageData.startIndex + index + 1,
        item: {
          '@type': 'BlogPosting',
          headline: post.title,
          url: canonicalFor(locale, `/blog/${post.category}/${post.slug}`),
          image: blogPostOgImageUrl(post.slug),
          datePublished: post.date,
        },
      })),
    },
  }

  return (
    <main className="blog-home">
      <PageTracker
        page="blog"
        eventName="blog_view"
        section={page === 1 ? 'index' : `index_page_${page}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogLd) }}
      />
      <header className="blog-home__head">
        <p className="blog-home__eyebrow">{t('eyebrow')}</p>
        <h1 className="blog-home__title">{t('title')}</h1>
        <p className="blog-home__intro">{t('intro')}</p>
      </header>

      {page === 1 && (
        <section className="blog-home__section" aria-labelledby="blog-categories-heading">
          <h2 id="blog-categories-heading" className="blog-home__section-title">
            {t('categoriesHeading')}
          </h2>
          <div className="blog-cat-grid">
            {categories.map((category) => (
              <BlogCategoryCard
                key={category.slug}
                category={category}
                countLabel={countFor(category.slug)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="blog-home__section" aria-labelledby="blog-latest-heading">
        <h2 id="blog-latest-heading" className="blog-home__section-title">
          {t('latestHeading')}
          {page > 1 && <span className="content-page-label"> — {pageLabel}</span>}
        </h2>
        {pageData.items.length > 0 ? (
          <BlogExplorer
            cards={pageData.items.map((post) => {
              const category = categoryBySlug.get(post.category)
              return {
                post,
                accent: category?.accent ?? 'ocean',
                categoryTitle: category?.title ?? post.category,
                readingLabel: t('readingTime', { minutes: post.readingMinutes }),
              }
            })}
            categories={categories.map((category) => ({
              slug: category.slug,
              title: category.title,
              accent: category.accent,
            }))}
            popularTags={popularTags(posts)}
            locale={locale}
            currentPage={page}
            totalPages={pageData.totalPages}
            totalItems={pageData.totalItems}
            searchIndexUrl={versionedSearchIndexUrl(locale, 'blog', searchRevision)}
          />
        ) : (
          <p className="blog-empty">{t('empty')}</p>
        )}
      </section>
    </main>
  )
}
