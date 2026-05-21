import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { PAGE_SEO, absoluteUrl } from '@/app/seo.config'
import PageTracker from '@/components/analytics/PageTracker'

const PDFResumeViewer = dynamic(() => import('@/components/PDFResumeViewer'))

const seo = PAGE_SEO.cv

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

export default function CVPage() {
  return (
    <main className={'about-page'}>
      <PageTracker page="cv" eventName="cv_view" section="resume" />
      <section className={'section-container'}>
        <h1 style={{ textAlign: 'center', fontSize: 32, padding: 24 }}>Software Engineer</h1>

        <div className={'section-wrapper'}>
          <PDFResumeViewer />
        </div>
      </section>
    </main>
  )
}
