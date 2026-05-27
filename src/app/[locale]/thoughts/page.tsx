import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { loadGraph } from '@/lib/thoughts/data'
import ThoughtGraph from '@/components/thoughts/ThoughtGraph'
import './thoughts.css'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Thoughts',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
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
  const graph = loadGraph()
  const thoughts = Object.values(graph.thoughts).sort(
    (a, b) => (maturityOrder[a.maturity] ?? 2) - (maturityOrder[b.maturity] ?? 2),
  )

  return (
    <main className="thoughts-fullpage">
      <header className="thoughts-fullpage__head">
        <div className="thoughts-fullpage__head-inner">
          <div className="thoughts-fullpage__meta">
            <p className="thoughts-fullpage__eyebrow">{t('eyebrow')}</p>
            <h1 className="thoughts-fullpage__title">{t('title')}</h1>
          </div>
          <p className="thoughts-fullpage__credit">
            {t.rich('credit', {
              link: (chunks) => (
                <a
                  href="https://huylenq.github.io"
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
