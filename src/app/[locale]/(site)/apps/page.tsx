import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { apps } from './apps.data'
import AppsConsole from '@/components/apps/AppsConsole'
import PageTracker from '@/components/analytics/PageTracker'
import AppsLinkTracker from '@/components/analytics/AppsLinkTracker'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import {
  buildStaticPageMetadata,
  resolveStaticPageLocalization,
} from '@/lib/seo/static-page-localization'
import './apps.css'

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const localization = resolveStaticPageLocalization('apps', locale)
  const seo = await getTranslations({
    locale: localization.contentLocale,
    namespace: 'SEO.apps',
  })
  return buildStaticPageMetadata({
    title: seo('title'),
    description: seo('description'),
    localization,
    openGraphType: 'website',
  })
}

export default async function AppsPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const localization = resolveStaticPageLocalization('apps', locale)
  const seo = await getTranslations({
    locale: localization.contentLocale,
    namespace: 'SEO.apps',
  })
  const title = seo('title')
  const description = seo('description')
  const appsItemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${localization.canonical}#itemlist`,
    name: title,
    description,
    inLanguage: localization.contentLocale,
    url: localization.canonical,
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
    <main
      className="apps-page"
      lang={localization.authored ? undefined : localization.contentLocale}
    >
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
