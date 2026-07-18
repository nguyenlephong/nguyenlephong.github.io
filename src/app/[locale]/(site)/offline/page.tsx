import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { APP_ROUTE } from '@/app/app.const'
import PageTracker from '@/components/analytics/PageTracker'
import { routing } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'Offline.page' })

  return {
    title: t('title'),
    description: t('body'),
    alternates: {
      canonical: `/${locale}${APP_ROUTE.OFFLINE}`,
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}

export default async function OfflinePage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Offline.page' })

  return (
    <main className="offline-page-shell">
      <PageTracker page="offline" eventName="offline_view" section="fallback" />

      <section className="offline-card">
        <p className="offline-card__eyebrow">{t('eyebrow')}</p>
        <h1 className="offline-card__title">{t('title')}</h1>
        <p className="offline-card__body">{t('body')}</p>
        <p className="offline-card__hint">{t('hint')}</p>

        <nav className="offline-card__actions" aria-label={t('actionsLabel')}>
          <Link href={APP_ROUTE.HOME} className="offline-card__link">
            {t('home')}
          </Link>
          <Link href={APP_ROUTE.BLOG} className="offline-card__link">
            {t('blog')}
          </Link>
          <Link href={APP_ROUTE.NOTES} className="offline-card__link">
            {t('notes')}
          </Link>
          <Link href={APP_ROUTE.ABOUT} className="offline-card__link">
            {t('about')}
          </Link>
        </nav>
      </section>
    </main>
  )
}
