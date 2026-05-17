import { Metadata } from 'next'
import Link from 'next/link'
import { profileInfo, APP_ROUTE } from '@/app/app.const'
import GalleryGrid from '@/components/gallery/GalleryGrid'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Certifications, awards, projects, and activities — a visual record of Nguyen Le Phong as a software engineer.',
  openGraph: {
    title: 'Gallery · Nguyen Le Phong',
    description:
      'Certifications, awards, projects, and activities — a visual record of Nguyen Le Phong as a software engineer.',
    type: 'website',
  },
}

export default function GalleryPage() {
  const categories = [
    { id: 'certificates', label: 'Certifications', items: profileInfo.gallery.certificates },
    { id: 'awards', label: 'Awards', items: profileInfo.gallery.awards },
    { id: 'projects', label: 'Projects', items: profileInfo.gallery.projects },
    { id: 'activities', label: 'Activities', items: profileInfo.gallery.activities },
  ].filter((c) => c.items.length > 0)

  return (
    <main>
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
