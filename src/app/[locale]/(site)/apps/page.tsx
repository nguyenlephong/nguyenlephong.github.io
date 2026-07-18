import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { PAGE_SEO } from '@/app/seo.config'
import { apps } from './apps.data'
import AppsConsole from '@/components/apps/AppsConsole'
import PageTracker from '@/components/analytics/PageTracker'
import AppsLinkTracker from '@/components/analytics/AppsLinkTracker'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import { localizedPageIdentity } from '@/lib/seo/locale'

const seo = PAGE_SEO.apps

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const identity = localizedPageIdentity(locale, seo.path)
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: identity.canonical, languages: identity.languages },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: identity.canonical,
      type: 'website',
      locale: identity.ogLocale,
      alternateLocale: identity.alternateOgLocales,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  }
}

export default async function AppsPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const identity = localizedPageIdentity(locale, seo.path)
  const appsItemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${identity.canonical}#itemlist`,
    name: 'Apps by Nguyen Le Phong',
    url: identity.canonical,
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
  return (
    <main className="apps-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(appsItemListLd) }}
      />
      <PageTracker page="apps" eventName="apps_view" section="showroom" />
      <AppsLinkTracker />
      <div className="container">
        <AppsConsole apps={apps} locale={locale} />
      </div>
    </main>
  )
}
