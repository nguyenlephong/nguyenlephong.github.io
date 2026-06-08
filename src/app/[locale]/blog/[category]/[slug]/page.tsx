import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { SITE, SITE_URL } from '@/app/seo.config'
import {
  OG_LOCALE_MAP,
  buildDescription,
  canonicalFor,
  htmlToPlainText,
  localeAlternates,
} from '@/lib/blog/seo'
import {
  getCategory,
  getSeriesContext,
  listCategoryPostPairs,
  loadPost,
} from '@/lib/blog/data'
import BlogContent from '@/components/blog/BlogContent'
import BlogToc from '@/components/blog/BlogToc'
import BlogReadingTracker from '@/components/blog/BlogReadingTracker'
import { EngagementProvider } from '@/components/blog/EngagementProvider'
import BlogViewCount from '@/components/blog/BlogViewCount'
import BlogShareDock from '@/components/blog/BlogShareDock'
import BlogReactions from '@/components/blog/BlogReactions'
import '../../blog.css'

type Props = {
  params: Promise<{ locale: string; category: string; slug: string }>
}

export function generateStaticParams() {
  const pairs = listCategoryPostPairs()
  return routing.locales.flatMap((locale) =>
    pairs.map(({ category, slug }) => ({ locale, category, slug })),
  )
}

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, slug } = await params
  const post = loadPost(slug, locale)
  if (!post || post.category !== category) return { title: 'Post not found' }

  const title = post.title
  const description = post.summary || buildDescription(post.html)
  const canonical = canonicalFor(locale, `/blog/${category}/${slug}`)
  const languages = localeAlternates(`/blog/${category}/${slug}`)

  return {
    title,
    description,
    keywords: post.tags,
    alternates: { canonical, languages },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale as Locale] ?? OG_LOCALE_MAP.en,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE_MAP[l]),
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [SITE_URL],
      tags: post.tags,
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
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, category, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const post = loadPost(slug, locale)
  if (!post || post.category !== category) notFound()

  const cat = getCategory(category, locale)
  const series = getSeriesContext(slug, locale)
  const t = await getTranslations({ locale, namespace: 'Pages.blog' })
  const canonical = canonicalFor(locale, `/blog/${category}/${slug}`)
  const description = post.summary || buildDescription(post.html)

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': canonical + '#article',
    headline: post.title,
    description,
    inLanguage: locale,
    url: canonical,
    mainEntityOfPage: canonical,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    keywords: post.tags.join(', '),
    articleSection: cat?.title ?? category,
    isPartOf: {
      '@type': 'Blog',
      '@id': canonicalFor(locale, '/blog') + '#blog',
    },
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Nguyen Le Phong',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Nguyen Le Phong',
      url: SITE_URL,
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('title'),
        item: canonicalFor(locale, '/blog'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cat?.title ?? category,
        item: canonicalFor(locale, `/blog/${category}`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonical,
      },
    ],
  }

  const faqLd =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': canonical + '#faq',
          mainEntity: post.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: htmlToPlainText(f.a) },
          })),
        }
      : null

  return (
    <main className={`blog-article blog-article--${cat?.accent ?? 'ocean'}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <EngagementProvider category={category} slug={slug}>
      <BlogReadingTracker
        category={category}
        slug={slug}
        readingMinutes={post.readingMinutes}
      />
      <BlogShareDock
        url={canonical}
        title={post.title}
        labels={{
          share: t('engagement.share'),
          copyLink: t('engagement.copyLink'),
          copied: t('engagement.copied'),
          close: t('engagement.close'),
        }}
      />
      <div className="blog-article__main">
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <Link href="/blog">{t('title')}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/blog/${category}`}>{cat?.title ?? category}</Link>
        </nav>

        <header className="blog-article__head">
          {series && (
            <p className="blog-article__series">
              {t(`seriesNames.${series.series}`)}
              <span aria-hidden="true"> · </span>
              {t('partOf', { part: series.part, total: series.total })}
            </p>
          )}
          <h1 className="blog-article__title">{post.title}</h1>
          <p className="blog-article__summary">{post.summary}</p>
          <div className="blog-article__meta">
            <span>{t('writtenBy', { author: post.author })}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            <span aria-hidden="true">·</span>
            <span>{t('readingTime', { minutes: post.readingMinutes })}</span>
            <BlogViewCount label={t('engagement.views')} />
          </div>
          {post.tags.length > 0 && (
            <ul className="blog-article__tags">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </header>

        <BlogContent html={post.html} />

        <BlogReactions
          prompt={t('engagement.reactionsPrompt')}
          reactionLabels={{
            like: t('engagement.reactions.like'),
            love: t('engagement.reactions.love'),
            insightful: t('engagement.reactions.insightful'),
            clap: t('engagement.reactions.clap'),
          }}
        />

        {post.faqs && post.faqs.length > 0 && (
          <section className="blog-faq" aria-labelledby="blog-faq-heading">
            <h2 id="blog-faq-heading" className="blog-faq__heading">
              {t('faqHeading')}
            </h2>
            <dl className="blog-faq__list">
              {post.faqs.map((f, i) => (
                <div className="blog-faq__item" key={i}>
                  <dt className="blog-faq__q">{f.q}</dt>
                  <dd
                    className="blog-faq__a"
                    dangerouslySetInnerHTML={{ __html: f.a }}
                  />
                </div>
              ))}
            </dl>
          </section>
        )}

        {series && (series.prev || series.next) && (
          <nav className="blog-series-nav" aria-label={t(`seriesNames.${series.series}`)}>
            {series.prev ? (
              <Link
                href={`/blog/${series.prev.category}/${series.prev.slug}`}
                className="blog-series-nav__link blog-series-nav__link--prev"
              >
                <span className="blog-series-nav__dir">← {t('previously')}</span>
                <span className="blog-series-nav__title">{series.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {series.next ? (
              <Link
                href={`/blog/${series.next.category}/${series.next.slug}`}
                className="blog-series-nav__link blog-series-nav__link--next"
              >
                <span className="blog-series-nav__dir">{t('nextUp')} →</span>
                <span className="blog-series-nav__title">{series.next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <footer className="blog-article__footer">
          <Link href={`/blog/${category}`} className="blog-back">
            ← {t('backToCategory', { category: cat?.title ?? category })}
          </Link>
        </footer>
      </div>

      <aside className="blog-article__toc">
        <BlogToc label={t('onThisPage')} />
      </aside>
      </EngagementProvider>
    </main>
  )
}
