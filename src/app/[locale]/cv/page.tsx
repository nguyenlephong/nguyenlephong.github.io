import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { PAGE_SEO, absoluteUrl } from '@/app/seo.config'
import PageTracker from '@/components/analytics/PageTracker'

const PDFResumeViewer = dynamic(() => import('@/components/PDFResumeViewer'))

const seo = PAGE_SEO.cv

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
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  }
}

export default async function CVPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Pages.cv' })

  return (
    <main className={'about-page'}>
      <PageTracker page="cv" eventName="cv_view" section="resume" />
      <section className={'section-container'}>
        <h1 style={{ textAlign: 'center', fontSize: 32, padding: 24 }}>{t('title')}</h1>

        <div className={'section-wrapper'}>
          <PDFResumeViewer />
        </div>
      </section>
    </main>
  )
}
