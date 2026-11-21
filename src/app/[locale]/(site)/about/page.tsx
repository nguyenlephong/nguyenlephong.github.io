import { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import { LuDownload, LuMail } from 'react-icons/lu'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { APP_ROUTE } from '@/app/app.const'
import { SITE_URL } from '@/app/seo.config'
import { email, social } from '@/content/social'
import { contact } from '@/content/profile'
import { gallery } from '@/content/gallery'
import CopyEmailButton from '@/components/about/CopyEmailButton'
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
// level orders the scope of each move (1 to 5) for the scope figure; the numbers that
// justify it are the period's measure (About.story.periods.<id>.measure).
const PERIODS = [
  { id: 'early', year: 2018, level: 1 },
  { id: 'product', year: 2020, level: 2 },
  { id: 'scale', year: 2024, level: 3 },
  { id: 'handover', year: 2025, level: 4 },
  { id: 'now', year: 2026, level: 5 },
] as const

// Scope figure geometry in a 100x100 box: stations sit at the middle of each fifth.
const SCOPE_X = (i: number): number => 10 + i * 20
const SCOPE_Y = (level: number): number => 88 - (level - 1) * 19

/** A smooth line through the stations (Catmull-Rom as cubic Béziers), and the area under it. */
function scopePaths(): { line: string; area: string } {
  const pts = PERIODS.map((p, i) => [SCOPE_X(i), SCOPE_Y(p.level)] as const)
  let line = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    line += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
  }
  const last = pts[pts.length - 1]
  return { line, area: `${line} L${last[0]},100 L${pts[0][0]},100 Z` }
}
const SCOPE = scopePaths()

const BONBON_TEAM = gallery.bonbon.find((photo) => photo.id === 'bonbonTeam')

const HABITS = ['scale', 'handover', 'zeroToOne', 'platform'] as const

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
  const hero = await getTranslations('Hero')
  const cta = await getTranslations('CTA')
  const captions = await getTranslations('Pages.gallery.captions')

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
        <div className="about-intro-grid">
          <div className="about-intro-copy">
            <p className="about-lede">{t('lede')}</p>

            {/* The two things a hiring manager does next, before they scroll. */}
            <div className="about-actions">
              <a
                href={`mailto:${email}`}
                className="about-btn about-btn--primary"
                data-track="cv_contact_click"
                data-track-channel="email"
                data-track-source="about_hero"
              >
                <LuMail aria-hidden="true" />
                {hero('getInTouch')}
              </a>
              <a
                href={APP_ROUTE.CV_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="about-btn"
                data-track="cv_resume_download"
                data-track-source="about_hero"
              >
                <LuDownload aria-hidden="true" />
                {hero('downloadResume')}
              </a>
              <p className="about-where">{cta('where')}</p>
            </div>
          </div>
          <div className="about-intro-figure">
            {/* The scope figure: one station per move, climbing with the scope it carried.
                Decorative; the list under it holds the same facts as links. */}
            <figure className="about-scope" aria-hidden="true">
              <span className="about-scope-axis">{t('arc.axis')}</span>
              <svg className="about-scope-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="about-scope-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" className="about-scope-stop" />
                    <stop offset="1" className="about-scope-stop about-scope-stop--end" />
                  </linearGradient>
                </defs>
                {PERIODS.map((p) => (
                  <line
                    key={p.id}
                    className="about-scope-grid"
                    x1="0"
                    x2="100"
                    y1={SCOPE_Y(p.level)}
                    y2={SCOPE_Y(p.level)}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <path className="about-scope-area" d={SCOPE.area} fill="url(#about-scope-fill)" />
                <path className="about-scope-line" d={SCOPE.line} vectorEffect="non-scaling-stroke" />
              </svg>
              {PERIODS.map(({ id, level }, i) => (
                <span
                  key={id}
                  className={`about-scope-node${id === 'now' ? ' is-now' : ''}`}
                  style={{ '--i': i, '--x': SCOPE_X(i), '--y': SCOPE_Y(level) } as CSSProperties}
                >
                  <span className="about-scope-measure">{t(`story.periods.${id}.measure`)}</span>
                </span>
              ))}
            </figure>

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
                    <span className="about-arc-env">{t(`arc.${id}`)}</span>
                    <span className="about-arc-measure">{t(`story.periods.${id}.measure`)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
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
                {id === 'now' && BONBON_TEAM && (
                  <figure className="about-period-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={BONBON_TEAM.src}
                      width={BONBON_TEAM.width}
                      height={BONBON_TEAM.height}
                      alt={captions('bonbonTeam')}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{captions('bonbonTeam')}</figcaption>
                  </figure>
                )}
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
        {/* Each situation leads with its measurement, and ends with a way to say "this is us". */}
        <dl className="about-habits">
          {HABITS.map((id) => (
            <div key={id} className="about-habit">
              <dt>{t(`habits.items.${id}.title`)}</dt>
              <dd>
                <p className="about-habit-figure">
                  <span className="about-habit-number">{t(`habits.items.${id}.figure`)}</span>
                  <span className="about-habit-figure-label">{t(`habits.items.${id}.figureLabel`)}</span>
                </p>
                <p className="about-habit-proof">{t.rich(`habits.items.${id}.proof`, { b: bold })}</p>
                <p className="about-habit-source">{t(`habits.items.${id}.source`)}</p>
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(t(`habits.items.${id}.title`))}`}
                  className="about-habit-ask"
                  data-track="cv_contact_click"
                  data-track-channel="email"
                  data-track-source="about_fit"
                  data-track-fit={id}
                >
                  <LuMail aria-hidden="true" />
                  {t('habits.ask')}
                </a>
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

      {/* The endpoint: what he is open to, where, and one address with a copy button. */}
      <section className="about-block about-closing" aria-labelledby="about-closing-title">
        <h2 id="about-closing-title" className="about-heading about-closing-title">
          {cta('title')}
        </h2>
        <p className="about-closing-line">{t.rich('closing.body', { b: bold })}</p>
        <dl className="about-endpoint">
          <div className="about-endpoint-row">
            <dt>{cta('openToLabel')}</dt>
            <dd>{cta('openTo')}</dd>
          </div>
          <div className="about-endpoint-row">
            <dt>{cta('whereLabel')}</dt>
            <dd>{cta('where')}</dd>
          </div>
          <div className="about-endpoint-row about-endpoint-email">
            <dt>{t('closing.email')}</dt>
            <dd>
              <svg className="about-port" viewBox="0 0 40 12" aria-hidden="true" focusable="false">
                <path d="M0 6H31" />
                <circle cx="35" cy="6" r="4" />
              </svg>
              <a
                id="about-email-address"
                href={`mailto:${email}`}
                className="about-address"
                data-track="cv_contact_click"
                data-track-channel="email"
                data-track-source="about"
              >
                {email}
              </a>
              <CopyEmailButton
                email={email}
                targetId="about-email-address"
                source="about"
                labels={{
                  copy: cta('copyEmail'),
                  copied: cta('copied'),
                  copiedStatus: cta('copiedStatus'),
                  copyFailed: cta('copyFailed'),
                }}
              />
            </dd>
          </div>
          <div className="about-endpoint-row">
            <dt>{cta('phoneLabel')}</dt>
            <dd>
              <a
                href={`tel:+${contact.phone.replace(/\D/g, '')}`}
                data-track="cv_contact_click"
                data-track-channel="phone"
                data-track-source="about"
              >
                {contact.phone}
              </a>
            </dd>
          </div>
        </dl>
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
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-track="cv_social_click"
              data-track-platform="linkedin"
              data-track-source="about"
            >
              {cta('linkedin')}
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
