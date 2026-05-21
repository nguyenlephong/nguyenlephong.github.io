import { Metadata } from 'next'
import Link from 'next/link'
import { profileInfo, APP_ROUTE } from '@/app/app.const'
import { PAGE_SEO, absoluteUrl } from '@/app/seo.config'
import GalleryGrid from '@/components/gallery/GalleryGrid'
import PageTracker from '@/components/analytics/PageTracker'

const seo = PAGE_SEO.gallery

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  alternates: { canonical: seo.path },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: absoluteUrl(seo.path),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
  },
}

export default function GalleryPage() {
  const categories = [
    { id: 'certificates', label: 'Certifications', items: profileInfo.gallery.certificates },
    { id: 'awards', label: 'Awards', items: profileInfo.gallery.awards },
    { id: 'projects', label: 'Projects', items: profileInfo.gallery.projects },
    { id: 'activities', label: 'Activities', items: profileInfo.gallery.activities },
  ].filter((c) => c.items.length > 0)

  const galleryLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    '@id': 'https://nguyenlephong.github.io/gallery#gallery',
    name: seo.title,
    description: seo.description,
    url: 'https://nguyenlephong.github.io/gallery',
    image: categories.flatMap((c) =>
      c.items.map((it) => ({
        '@type': 'ImageObject',
        contentUrl: it.src.startsWith('http') ? it.src : `https://nguyenlephong.github.io${it.src}`,
        name: it.alt,
      }))
    ),
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryLd) }}
      />
      <PageTracker page="gallery" eventName="gallery_view" />
      <div className="container">
        <header className="page-header">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" /> Gallery
          </span>
          <h1 className="page-title">A record of the work</h1>
          <p className="page-sub">
            Certificates, awards, projects, and a few off-screen moments.
            Click any item to open the full image or its verification link.
          </p>
          <Link href={APP_ROUTE.HOME} className="page-back">
            ← Back to CV
          </Link>
        </header>

        <GalleryGrid categories={categories} />
      </div>
    </main>
  )
}
