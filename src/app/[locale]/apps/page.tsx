import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { APP_ROUTE } from '@/app/app.const'
import { PAGE_SEO, absoluteUrl } from '@/app/seo.config'
import { apps } from './apps.data'
import AppCard from '@/components/apps/AppCard'
import PageTracker from '@/components/analytics/PageTracker'
import AppsLinkTracker from '@/components/analytics/AppsLinkTracker'

const seo = PAGE_SEO.apps

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: `/${locale}${seo.path}` },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: absoluteUrl(`/${locale}${seo.path}`),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  }
}

const appsItemListLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': 'https://nguyenlephong.github.io/apps#itemlist',
  name: 'Apps by Nguyen Le Phong',
  itemListElement: apps.map((a, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'SoftwareApplication',
      name: a.name,
      description: a.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: a.platforms.join(', '),
      url: a.links.website ?? a.links.repo ?? a.links.docs,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  })),
}

export default async function AppsPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  return (
    <main className="apps-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appsItemListLd) }}
      />
      <PageTracker page="apps" eventName="apps_view" section="showroom" />
      <AppsLinkTracker />
      <div className="container">
        <header className="apps-hero">
          <div className="apps-hero-bleed" aria-hidden="true" />
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" /> Apps · Showroom
          </span>
          <h1 className="apps-hero-title">
            Tiny apps,{' '}
            <span className="accent">crafted with care.</span>
          </h1>
          <p className="apps-hero-sub">
            A personal showroom of utilities I&apos;ve shipped — each one open-source,
            opinionated about what to leave out, and designed to disappear into your
            workflow.
          </p>
          <div className="apps-hero-meta">
            <span className="apps-hero-meta-item">
              <span className="apps-hero-meta-num">{apps.length}</span>
              <span className="apps-hero-meta-label">app{apps.length > 1 ? 's' : ''} live</span>
            </span>
            <span className="apps-hero-meta-sep" aria-hidden="true" />
            <span className="apps-hero-meta-item">
              <span className="apps-hero-meta-num">MIT</span>
              <span className="apps-hero-meta-label">open-source</span>
            </span>
            <span className="apps-hero-meta-sep" aria-hidden="true" />
            <span className="apps-hero-meta-item">
              <span className="apps-hero-meta-num">∞</span>
              <span className="apps-hero-meta-label">more on the way</span>
            </span>
          </div>
          <Link href={APP_ROUTE.HOME} className="page-back">
            ← Back to CV
          </Link>
        </header>

        <section className="apps-list" aria-label="Apps">
          {apps.map((app, index) => (
            <AppCard key={app.id} app={app} index={index} />
          ))}
        </section>

        <section className="apps-coming">
          <div className="apps-coming-inner">
            <span className="apps-coming-eyebrow">More to come</span>
            <h2 className="apps-coming-title">
              I&apos;m always tinkering. New apps land here first.
            </h2>
            <p className="apps-coming-body">
              If something here saved you a minute, a star on GitHub keeps the lights on.
              Got an idea or a bug? Open an issue — I read every one.
            </p>
            <div className="apps-coming-actions">
              <Link
                href="https://github.com/nguyenlephong"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                data-track="apps_cta_click"
                data-track-target="github_follow"
              >
                Follow on GitHub
              </Link>
              <Link
                href={APP_ROUTE.HOME + '#contact'}
                className="btn btn-ghost"
                data-track="apps_cta_click"
                data-track-target="contact"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
