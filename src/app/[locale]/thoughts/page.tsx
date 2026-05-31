import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import {
  PAGE_SEO,
  SITE,
  SITE_URL,
  THOUGHTS_SOURCE,
  absoluteUrl,
} from '@/app/seo.config'
import {
  OG_LOCALE_MAP,
  canonicalFor,
  localeAlternates,
} from '@/lib/thoughts/seo'
import { loadGraph } from '@/lib/thoughts/data'
import ThoughtGraph from '@/components/thoughts/ThoughtGraph'
import './thoughts.css'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const seo = PAGE_SEO.thoughts

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Pages.thoughts' })

  const title = `${t('title')} — ${t('eyebrow')}`
  const description = seo.description
  const canonical = canonicalFor(locale, '/thoughts')
  const languages = localeAlternates('/thoughts')

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

const maturityOrder: Record<string, number> = {
  evergreen: 0,
  budding: 1,
  seed: 2,
}

export default async function ThoughtsIndexPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Pages.thoughts' })
  const graph = loadGraph(locale)
  const thoughts = Object.values(graph.thoughts).sort(
    (a, b) => (maturityOrder[a.maturity] ?? 2) - (maturityOrder[b.maturity] ?? 2),
  )

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonicalFor(locale, '/thoughts') + '#collection',
    name: `${t('title')} — ${t('eyebrow')}`,
    description: seo.description,
    url: canonicalFor(locale, '/thoughts'),
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person` },
    hasPart: thoughts.map((th) => ({
      '@type': 'Article',
      name: th.title,
      url: canonicalFor(locale, `/thoughts/${th.slug}`),
    })),
  }

  return (
    <main className="thoughts-fullpage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <header className="thoughts-fullpage__head">
        <div className="thoughts-fullpage__head-inner">
          <div className="thoughts-fullpage__meta">
            <p className="thoughts-fullpage__eyebrow">{t('eyebrow')}</p>
            <h1 className="thoughts-fullpage__title">{t('title')}</h1>
            <p className="thoughts-fullpage__intro">{t('intro')}</p>
          </div>
          <p className="thoughts-fullpage__credit">
            {t.rich('credit', {
              link: (chunks) => (
                <a
                  href={THOUGHTS_SOURCE.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      </header>

      {thoughts.length > 0 ? (
        <div className="thoughts-fullpage__graph">
          <ThoughtGraph thoughts={thoughts} edges={graph.edges} fillViewport />
        </div>
      ) : (
        <p className="thoughts-fullpage__empty">{t('empty')}</p>
      )}
    </main>
  )
}
