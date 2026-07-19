import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { profileInfo } from '@/app/app.const'
import Hero from '@/components/cv/Hero'
import Section from '@/components/cv/Section'
import Summary from '@/components/cv/Summary'
import Experience from '@/components/cv/Experience'
import Projects from '@/components/cv/Projects'
import ContactCTA from '@/components/cv/ContactCTA'
import PageViewTracker from '@/components/PageViewTracker'
import PageTracker from '@/components/analytics/PageTracker'
import type { Locale } from '@/i18n/routing'
import {
  buildPersonSchema,
  buildProfilePageSchema,
} from '@/lib/seo/profile-schema'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import ScopedIntlProvider from '@/i18n/ScopedIntlProvider'
import MotionProvider from '@/components/motion/MotionProvider'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export default async function MainPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations('Sections')
  const seoT = await getTranslations({ locale, namespace: 'SEO.home' })
  const title = seoT('title')
  const description = seoT('description')
  const personSchema = buildPersonSchema(description)
  const profilePageSchema = buildProfilePageSchema(locale as Locale, title, description)

  return (
    <MotionProvider>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(profilePageSchema) }}
        />
        <PageViewTracker />
        <PageTracker page="home" eventName="page_view" section="cv_main" />
        <ScopedIntlProvider scope="home">
          <div className="container">
            <Hero />

            <Section id="about" eyebrow={t('aboutEyebrow')} title={t('aboutTitle')}>
              <Summary />
            </Section>

            <Section
              id="experience"
              eyebrow={t('experienceEyebrow')}
              title={t('experienceTitle')}
            >
              <Experience data={profileInfo.experience} />
            </Section>

            <Section
              id="projects"
              eyebrow={t('projectsEyebrow')}
              title={t('projectsTitle')}
            >
              <Projects data={profileInfo.projects} />
            </Section>

            <div id="contact">
              <ContactCTA />
            </div>
          </div>
        </ScopedIntlProvider>
      </main>
    </MotionProvider>
  )
}
