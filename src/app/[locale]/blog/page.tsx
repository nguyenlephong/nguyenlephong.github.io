import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { PAGE_SEO, SITE, SITE_URL } from '@/app/seo.config'
import { OG_LOCALE_MAP, canonicalFor, localeAlternates } from '@/lib/blog/seo'
import { listCategories, listPosts } from '@/lib/blog/data'
import BlogCategoryCard from '@/components/blog/BlogCategoryCard'
import BlogPostCard from '@/components/blog/BlogPostCard'
import './blog.css'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const seo = PAGE_SEO.blog

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Pages.blog' })

  const title = `${t('title')} — ${t('eyebrow')}`
  const description = seo.description
  const canonical = canonicalFor(locale, '/blog')
  const languages = localeAlternates('/blog')

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale as Locale] ?? OG_LOCALE_MAP.en,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE_MAP[l]),
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

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Pages.blog' })
  const categories = listCategories(locale)
  const posts = listPosts(locale)
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))

  const countFor = (slug: string) => {
    const n = posts.filter((p) => p.category === slug).length
    return t('articleCount', { count: n })
  }

  const blogLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': canonicalFor(locale, '/blog') + '#blog',
    name: `${t('title')} — ${t('eyebrow')}`,
    description: seo.description,
    url: canonicalFor(locale, '/blog'),
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person` },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: canonicalFor(locale, `/blog/${p.category}/${p.slug}`),
      datePublished: p.date,
    })),
  }

  return (
    <main className="blog-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <header className="blog-home__head">
        <p className="blog-home__eyebrow">{t('eyebrow')}</p>
        <h1 className="blog-home__title">{t('title')}</h1>
        <p className="blog-home__intro">{t('intro')}</p>
      </header>

      <section
        className="blog-home__section"
        aria-labelledby="blog-categories-heading"
      >
        <h2 id="blog-categories-heading" className="blog-home__section-title">
          {t('categoriesHeading')}
        </h2>
        <div className="blog-cat-grid">
          {categories.map((c) => (
            <BlogCategoryCard
              key={c.slug}
              category={c}
              countLabel={countFor(c.slug)}
            />
          ))}
        </div>
      </section>

      <section
        className="blog-home__section"
        aria-labelledby="blog-latest-heading"
      >
        <h2 id="blog-latest-heading" className="blog-home__section-title">
          {t('latestHeading')}
        </h2>
        {posts.length > 0 ? (
          <div className="blog-post-list">
            {posts.map((p) => {
              const cat = categoryBySlug.get(p.category)
              return (
                <BlogPostCard
                  key={p.slug}
                  post={p}
                  accent={cat?.accent ?? 'ocean'}
                  categoryTitle={cat?.title ?? p.category}
                  locale={locale}
                  readingLabel={t('readingTime', { minutes: p.readingMinutes })}
                />
              )
            })}
          </div>
        ) : (
          <p className="blog-empty">{t('empty')}</p>
        )}
      </section>
    </main>
  )
}
