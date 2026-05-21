import { Metadata } from 'next'
import { FaHandPointRight } from 'react-icons/fa'
import { GoDotFill } from 'react-icons/go'
import { profileInfo } from '@/app/app.const'
import { PAGE_SEO, absoluteUrl } from '@/app/seo.config'
import PageTracker from '@/components/analytics/PageTracker'

const seo = PAGE_SEO.about

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  alternates: { canonical: seo.path },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: absoluteUrl(seo.path),
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
  },
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

export default function AboutPage() {
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
