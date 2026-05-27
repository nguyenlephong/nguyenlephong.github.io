import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { listThoughtSlugs, loadThought } from '@/lib/thoughts/data'
import ThoughtContent from '@/components/thoughts/ThoughtContent'
import Backlinks from '@/components/thoughts/Backlinks'
import '../thoughts.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  const slugs = listThoughtSlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const thought = loadThought(slug)
  return {
    title: thought?.title ?? 'Thought',
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    alternates: { canonical: null },
  }
}

export default async function ThoughtPage({ params }: Props) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const thought = loadThought(slug)
  if (!thought) notFound()

  const t = await getTranslations({ locale, namespace: 'Pages.thoughts' })

  return (
    <main className="thought-page">
      <Link href={`/${locale}/thoughts`} className="thought-page__back">
        ← {t('backToIndex')}
      </Link>
      <h1 className="thought-page__title">{thought.title}</h1>
      <div className="thought-page__maturity">
        {t(`maturity.${thought.maturity}`)}
      </div>

      <ThoughtContent html={thought.html} />

      <Backlinks items={thought.backlinks} />

      <p className="thoughts-page__credit">
        {t.rich('credit', {
          link: (chunks) => (
            <a
              href={`https://huylenq.github.io/thoughts/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    </main>
  )
}
