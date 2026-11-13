import { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { APP_ROUTE } from '@/app/app.const'
import { SITE_URL } from '@/app/seo.config'
import { email } from '@/content/social'
import PageTracker from '@/components/analytics/PageTracker'
import AppsLinkTracker from '@/components/analytics/AppsLinkTracker'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import { buildPersonVentureSchema } from '@/lib/seo/profile-schema'
import { buildSectionBreadcrumb } from '@/lib/seo/section-breadcrumb'
import {
  buildStaticPageMetadata,
  resolveStaticPageLocalization,
} from '@/lib/seo/static-page-localization'
import './about.css'

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

type Props = { params: Promise<{ locale: string }> }

// The career arc, oldest first. Keys index About.arc and About.story.periods.
const PERIODS = [
  { id: 'early', year: 2018 },
  { id: 'product', year: 2020 },
  { id: 'scale', year: 2024 },
  { id: 'handover', year: 2025 },
  { id: 'now', year: 2026 },
] as const

const HABITS = ['trace', 'contracts', 'rollout', 'writing'] as const

const WRITING_LINKS = {
  blog: APP_ROUTE.BLOG,
  notes: APP_ROUTE.NOTES,
  note: `${APP_ROUTE.NOTES}/the-quiet-engineering-behind-bonbons-500k-round`,
  post: `${APP_ROUTE.BLOG}/ways-of-working/feature-flags-for-safer-deployments`,
} as const

const bold = (chunks: ReactNode) => <b>{chunks}</b>

function writingLink(target: keyof typeof WRITING_LINKS) {
  function WritingLink(chunks: ReactNode) {
    return (
      <Link
        href={WRITING_LINKS[target]}
        prefetch={false}
        data-track="about_link_click"
        data-track-target={target}
      >
        {chunks}
      </Link>
    )
  }
  return WritingLink
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const localization = resolveStaticPageLocalization('about', locale)
  const seo = await getTranslations({
    locale: localization.contentLocale,
    namespace: 'SEO.about',
  })
  return buildStaticPageMetadata({
    title: seo('title'),
    description: seo('description'),
    localization,
    openGraphType: 'profile',
  })
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const localization = resolveStaticPageLocalization('about', locale)
  const seo = await getTranslations({
    locale: localization.contentLocale,
    namespace: 'SEO.about',
  })
  const title = seo('title')
  const description = seo('description')
  const aboutPageLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${localization.canonical}#aboutpage`,
    name: title,
    description,
    inLanguage: localization.contentLocale,
    mainEntity: { '@id': `${SITE_URL}/#person` },
    url: localization.canonical,
    significantLink: [
      `${SITE_URL}${APP_ROUTE.CV_PDF}`,
      `${SITE_URL}/${localization.contentLocale}#experience`,
    ],
  }

  const navT = await getTranslations({
    locale: localization.contentLocale,
    namespace: 'Nav',
  })
  const breadcrumbLd = buildSectionBreadcrumb({
    locale: localization.contentLocale,
    name: navT('about'),
    url: localization.canonical,
  })

  const t = await getTranslations('About')

  return (
    <main
      className="about-page about-page-v3"
      lang={localization.authored ? undefined : localization.contentLocale}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(aboutPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildPersonVentureSchema()) }}
      />
      <PageTracker page="about" eventName="about_view" />
      <AppsLinkTracker />

      <header className="about-intro">
        <h1 className="about-title">{t('title')}</h1>
        <p className="about-lede">{t('lede')}</p>

        {/* The route figure: one node per move, each a jump to its period below. */}
        <ol className="about-arc" aria-label={t('arc.label')}>
          {PERIODS.map(({ id, year }) => (
            <li key={id} className={id === 'now' ? 'is-now' : undefined}>
              <a
                href={`#period-${id}`}
                data-track="about_link_click"
                data-track-target="arc"
                data-track-period={id}
              >
                <span className="about-arc-year">{year}</span>
                <span className="about-arc-node" aria-hidden="true" />
                <span className="about-arc-env">{t(`arc.${id}`)}</span>
              </a>
            </li>
          ))}
        </ol>
      </header>

      <section className="about-block" aria-labelledby="about-story-title">
        <h2 id="about-story-title" className="about-heading">
          {t('story.title')}
        </h2>
        <ol className="about-story">
          {PERIODS.map(({ id }) => (
            <li
              key={id}
              id={`period-${id}`}
              className={`about-period${id === 'now' ? ' is-now' : ''}`}
            >
              <p className="about-period-dates">{t(`story.periods.${id}.dates`)}</p>
              <div className="about-period-body">
                <h3>{t(`story.periods.${id}.where`)}</h3>
                <p className="about-period-env">{t(`story.periods.${id}.env`)}</p>
                <p>{t.rich(`story.periods.${id}.body`, { b: bold })}</p>
              </div>
              {/* What the move changed: a margin annotation on wide screens. */}
              <p className="about-period-shift">{t(`story.periods.${id}.shift`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-block" aria-labelledby="about-habits-title">
        <h2 id="about-habits-title" className="about-heading">
          {t('habits.title')}
        </h2>
        <dl className="about-habits">
          {HABITS.map((id) => (
            <div key={id} className="about-habit">
              <dt>{t(`habits.items.${id}.title`)}</dt>
              <dd>
                <p>{t.rich(`habits.items.${id}.proof`, { b: bold })}</p>
                <p className="about-habit-source">{t(`habits.items.${id}.source`)}</p>
              </dd>
            </div>
          ))}
        </dl>
        <p className="about-stack">{t('habits.stack')}</p>
      </section>

      <section className="about-block about-writing" aria-labelledby="about-writing-title">
        <h2 id="about-writing-title" className="about-heading">
          {t('writing.title')}
        </h2>
        <p>
          {t.rich('writing.body', {
            blog: writingLink('blog'),
            notes: writingLink('notes'),
            note: writingLink('note'),
            post: writingLink('post'),
          })}
        </p>
        <p>{t.rich('writing.teaching', { b: bold })}</p>
      </section>

      <section className="about-block about-closing" aria-labelledby="about-closing-line">
        <p id="about-closing-line" className="about-closing-line">
          {t.rich('closing.body', { b: bold })}
        </p>
        <ul className="about-closing-links" aria-label={t('closing.linksLabel')}>
          <li>
            <a
              href={APP_ROUTE.CV_PDF}
              target="_blank"
              rel="noopener noreferrer"
              data-track="cv_resume_download"
              data-track-source="about"
            >
              {t('closing.resume')}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${email}`}
              data-track="cv_contact_click"
              data-track-channel="email"
              data-track-source="about"
            >
              {t('closing.email')}
            </a>
          </li>
          <li>
            <Link
              href={`${APP_ROUTE.HOME}#experience`}
              data-track="cv_nav_click"
              data-track-target="experience"
              data-track-source="about"
            >
              {t('closing.experience')}
            </Link>
          </li>
        </ul>
      </section>
    </main>
  )
}
