import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import {
  SITE,
  SITE_URL,
  THOUGHTS_SOURCE,
  PAGE_SEO,
} from '@/app/seo.config'
import {
  OG_LOCALE_MAP,
  buildDescription,
  canonicalFor,
  localeAlternates,
} from '@/lib/thoughts/seo'
import { listThoughtSlugs, loadThought } from '@/lib/thoughts/data'
import ThoughtContent from '@/components/thoughts/ThoughtContent'
import Backlinks from '@/components/thoughts/Backlinks'
import ThoughtViewCount from '@/components/thoughts/ThoughtViewCount'
import ThoughtShareButton from '@/components/thoughts/ThoughtShareButton'
import '../thoughts.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  const slugs = listThoughtSlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const thought = loadThought(slug, locale)
  if (!thought) {
    return { title: 'Thought not found' }
  }

  const title = thought.title
  const description = buildDescription(thought.html)
  const canonical = canonicalFor(locale, `/thoughts/${slug}`)
  const languages = localeAlternates(`/thoughts/${slug}`)

  const baseKeywords = PAGE_SEO.thoughts.keywords ?? []
  const titleWords = thought.title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
  const keywords = [...new Set([...baseKeywords, ...titleWords])]

  return {
    title,
    description,
    keywords,
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
      authors: [SITE_URL],
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

export default async function ThoughtPage({ params }: Props) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const thought = loadThought(slug, locale)
  if (!thought) notFound()

  const t = await getTranslations({ locale, namespace: 'Pages.thoughts' })
  const canonical = canonicalFor(locale, `/thoughts/${slug}`)
  const description = buildDescription(thought.html)
  const originalUrl = THOUGHTS_SOURCE.thoughtUrl(slug)

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': canonical + '#article',
    headline: thought.title,
    description,
    inLanguage: locale,
    url: canonical,
    mainEntityOfPage: canonical,
    isPartOf: {
      '@type': 'CollectionPage',
      '@id': canonicalFor(locale, '/thoughts') + '#collection',
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

  return (
    <main className="thought-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Link href={`/${locale}/thoughts`} className="thought-page__back">
        ← {t('backToIndex')}
      </Link>
      <h1 className="thought-page__title">{thought.title}</h1>
      <div className="thought-page__meta-row">
        <span className="thought-page__maturity">
          {t(`maturity.${thought.maturity}`)}
        </span>
        <ThoughtViewCount slug={slug} />
        <ThoughtShareButton
          url={canonical}
          title={thought.title}
          slug={slug}
          label={t('share')}
          copiedLabel={t('copied')}
        />
      </div>

      <ThoughtContent html={thought.html} />

      <Backlinks items={thought.backlinks} />

      <p className="thoughts-page__credit">
        {t.rich('credit', {
          link: (chunks) => (
            <a href={originalUrl} target="_blank" rel="noopener noreferrer">
              {chunks}
            </a>
          ),
        })}
      </p>
    </main>
  )
}
