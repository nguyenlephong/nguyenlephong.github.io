import { Metadata } from 'next'
import { FaHandPointRight } from 'react-icons/fa'
import { GoDotFill } from 'react-icons/go'
import { setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { profileInfo } from '@/app/app.const'
import { PAGE_SEO, absoluteUrl } from '@/app/seo.config'
import PageTracker from '@/components/analytics/PageTracker'

const seo = PAGE_SEO.about

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

const aboutPageLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://nguyenlephong.github.io/about#aboutpage',
  name: seo.title,
  description: seo.description,
  mainEntity: { '@id': 'https://nguyenlephong.github.io/#person' },
  url: 'https://nguyenlephong.github.io/about',
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  return (
    <main className={'about-page'}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageLd) }}
      />
      <PageTracker page="about" eventName="about_view" />
      <section className={'section-container'}>
        <h1 style={{ textAlign: 'center', fontSize: 32, padding: 24 }}>
          Nguyen Le Phong — Software Engineer
        </h1>

        {profileInfo.about.map((item) => {
          return (
            <div key={`sm_${item.id}`} id={`sm_${item.id}`} className={'section-wrapper'}>
              <h2 className={'box-title'}>
                <FaHandPointRight size={24} /> {item.categories}
              </h2>

              <ul className={'list-none'}>
                {item.descriptions.map((des, ind) => {
                  return (
                    <li key={`des_${ind}`}>
                      <span className={'align-centered'}>
                        <GoDotFill size={12} color={'green'} />
                        <span style={{ paddingLeft: 8 }} dangerouslySetInnerHTML={{ __html: des }}></span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </section>
    </main>
  )
}
