import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { SITE, SITE_URL } from '@/app/seo.config'
import { OG_LOCALE_MAP, canonicalFor, localeAlternates } from '@/lib/blog/seo'
import {
  getCategory,
  getPostsByCategory,
  listCategorySlugs,
} from '@/lib/blog/data'
import BlogPostCard from '@/components/blog/BlogPostCard'
import '../blog.css'

type Props = { params: Promise<{ locale: string; category: string }> }

export function generateStaticParams() {
  const slugs = listCategorySlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((category) => ({ locale, category })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params
  const cat = getCategory(category, locale)
  if (!cat) return { title: 'Category not found' }

  const t = await getTranslations({ locale, namespace: 'Pages.blog' })
  const title = `${cat.title} — ${t('title')}`
  const description = cat.description
  const canonical = canonicalFor(locale, `/blog/${category}`)
  const languages = localeAlternates(`/blog/${category}`)

  return {
    title,
    description,
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

export default async function BlogCategoryPage({ params }: Props) {
  const { locale, category } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const cat = getCategory(category, locale)
  if (!cat) notFound()

  const t = await getTranslations({ locale, namespace: 'Pages.blog' })
  const posts = getPostsByCategory(category, locale)

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonicalFor(locale, `/blog/${category}`) + '#collection',
    name: `${cat.title} — ${t('title')}`,
    description: cat.description,
    url: canonicalFor(locale, `/blog/${category}`),
    inLanguage: locale,
    isPartOf: { '@type': 'Blog', '@id': canonicalFor(locale, '/blog') + '#blog' },
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person` },
    hasPart: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: canonicalFor(locale, `/blog/${p.category}/${p.slug}`),
    })),
  }

  return (
    <main className={`blog-category blog-category--${cat.accent}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <Link href="/blog" className="blog-back">
        ← {t('backToBlog')}
      </Link>

      <header className="blog-category__head">
        <p className="blog-category__eyebrow">{t('eyebrow')}</p>
        <h1 className="blog-category__title">{cat.title}</h1>
        <p className="blog-category__tagline">{cat.tagline}</p>
        <p className="blog-category__description">{cat.description}</p>
      </header>

      {posts.length > 0 ? (
        <div className="blog-post-list">
          {posts.map((p) => (
            <BlogPostCard
              key={p.slug}
              post={p}
              accent={cat.accent}
              categoryTitle={cat.title}
              locale={locale}
              readingLabel={t('readingTime', { minutes: p.readingMinutes })}
            />
          ))}
        </div>
      ) : (
        <p className="blog-empty">{t('empty')}</p>
      )}
    </main>
  )
}
