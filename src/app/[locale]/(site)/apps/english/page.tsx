import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/app/seo.config'
import PageTracker from '@/components/analytics/PageTracker'
import AppsLinkTracker from '@/components/analytics/AppsLinkTracker'
import EnglishPracticeApp from '@/components/apps/english/EnglishPracticeApp'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'E-Slang Practice',
    description:
      'A private static English slang practice app with flashcards, fill-in-the-blank prompts, quick quizzes, and text-to-speech.',
    alternates: { canonical: `/${locale}/apps/english` },
    robots: { index: false, follow: false },
    openGraph: {
      title: 'E-Slang Practice',
      description: 'A private English slang practice console.',
      url: absoluteUrl(`/${locale}/apps/english`),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'E-Slang Practice',
      description: 'A private English slang practice console.',
    },
  }
}

export default async function EnglishAppPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <main className="english-page">
      <PageTracker page="apps" eventName="apps_view" section="english_practice" />
      <AppsLinkTracker />
      <div className="container">
        <EnglishPracticeApp locale={locale} />
      </div>
    </main>
  )
}
