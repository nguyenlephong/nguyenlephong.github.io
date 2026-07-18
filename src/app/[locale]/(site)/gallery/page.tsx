import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { profileInfo, APP_ROUTE } from '@/app/app.const'
import { PAGE_SEO, absoluteUrl } from '@/app/seo.config'
import GalleryGrid from '@/components/gallery/GalleryGrid'
import PageTracker from '@/components/analytics/PageTracker'

const seo = PAGE_SEO.gallery

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
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
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  }
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Pages.gallery' })
  const categories = [
    { id: 'certificates', label: t('categories.certificates'), items: profileInfo.gallery.certificates },
    { id: 'awards', label: t('categories.awards'), items: profileInfo.gallery.awards },
    { id: 'projects', label: t('categories.projects'), items: profileInfo.gallery.projects },
    { id: 'activities', label: t('categories.activities'), items: profileInfo.gallery.activities },
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
    <main className="gallery-showcase">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryLd) }}
      />
      <PageTracker page="gallery" eventName="gallery_view" />
      <div className="container">
        <header className="page-header gallery-page-header">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" /> {t('eyebrow')}
          </span>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-sub">{t('sub')}</p>
          <Link href={APP_ROUTE.HOME} className="page-back">
            {t('back')}
          </Link>
        </header>

        <GalleryGrid categories={categories} />
      </div>
    </main>
  )
}
