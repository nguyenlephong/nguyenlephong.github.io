import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { PAGE_SEO, absoluteUrl } from '@/app/seo.config'
import { apps } from './apps.data'
import AppsConsole from '@/components/apps/AppsConsole'
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
        <AppsConsole apps={apps} locale={locale} />
      </div>
    </main>
  )
}
