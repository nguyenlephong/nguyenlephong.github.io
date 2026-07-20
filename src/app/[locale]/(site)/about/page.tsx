import { Metadata } from 'next'
import {
  LuActivity,
  LuBoxes,
  LuCode2,
  LuGitBranch,
  LuNetwork,
  LuRouter,
  LuServerCog,
  LuShieldCheck,
} from 'react-icons/lu'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import PageTracker from '@/components/analytics/PageTracker'
import { serializeJsonLd } from '@/lib/seo/json-ld'
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

type Metric = {
  value: string
  label: string
}

type SystemLayer = {
  title: string
  body: string
  tags: string[]
}

type StackGroup = {
  title: string
  items: string[]
}

type Principle = {
  title: string
  body: string
}

const systemIcons = [LuServerCog, LuNetwork, LuRouter, LuActivity]
const systemTones = ['sky', 'emerald', 'violet', 'amber'] as const
const stackIcons = [LuCode2, LuShieldCheck, LuBoxes, LuGitBranch]

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
    mainEntity: { '@id': 'https://nguyenlephong.github.io/#person' },
    url: localization.canonical,
  }

  const t = await getTranslations('About')
  const metrics = t.raw('hero.metrics') as Metric[]
  const systems = t.raw('systems.items') as SystemLayer[]
  const stackGroups = t.raw('stack.groups') as StackGroup[]
  const principles = t.raw('principles.items') as Principle[]

  return (
    <main
      className="about-page about-page-v2"
      lang={localization.authored ? undefined : localization.contentLocale}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(aboutPageLd) }}
      />
      <PageTracker page="about" eventName="about_view" />

      <section className="about-hero">
        <div className="about-hero__copy">
          <p className="about-eyebrow">{t('hero.eyebrow')}</p>
          <h1 className="about-hero__title">{t('hero.title')}</h1>
          <p
            className="about-hero__lead"
            dangerouslySetInnerHTML={{ __html: t.raw('hero.lead') }}
          />
        </div>

        <dl className="about-metrics" aria-label={t('hero.metricsLabel')}>
          {metrics.map((metric) => (
            <div key={metric.label} className="about-metric">
              <dt>{metric.value}</dt>
              <dd>{metric.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="about-section" aria-labelledby="about-systems-title">
        <div className="about-section__header">
          <p className="about-eyebrow">{t('systems.eyebrow')}</p>
          <h2 id="about-systems-title">{t('systems.title')}</h2>
          <p>{t('systems.intro')}</p>
        </div>

        <div className="about-system-grid">
          {systems.map((item, index) => {
            const Icon = systemIcons[index % systemIcons.length]
            const tone = systemTones[index % systemTones.length]
            return (
              <article key={item.title} className={`about-system-card about-tone-${tone}`}>
                <span className="about-system-card__icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <h3>{item.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: item.body }} />
                <ul aria-label={item.title}>
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-stack-title">
        <div className="about-section__header">
          <p className="about-eyebrow">{t('stack.eyebrow')}</p>
          <h2 id="about-stack-title">{t('stack.title')}</h2>
          <p>{t('stack.intro')}</p>
        </div>

        <div className="about-stack-grid">
          {stackGroups.map((group, index) => {
            const Icon = stackIcons[index % stackIcons.length]
            return (
              <section key={group.title} className="about-stack-group">
                <div className="about-stack-group__head">
                  <span aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <h3>{group.title}</h3>
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </section>

      <section className="about-section about-principles" aria-labelledby="about-principles-title">
        <div className="about-section__header">
          <p className="about-eyebrow">{t('principles.eyebrow')}</p>
          <h2 id="about-principles-title">{t('principles.title')}</h2>
          <p>{t('principles.intro')}</p>
        </div>

        <div className="about-principle-list">
          {principles.map((principle, index) => (
            <article key={principle.title} className="about-principle">
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-closing" aria-label={t('closing.label')}>
        <p dangerouslySetInnerHTML={{ __html: t.raw('closing.body') }} />
      </section>
    </main>
  )
}
