'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LuArrowUpRight, LuExternalLink } from 'react-icons/lu'
import type { GalleryPhoto } from '@/content/gallery'
import { track } from '@/lib/analytics'

type Category = {
  id: string
  label: string
  items: GalleryPhoto[]
}

type Props = {
  categories: Category[]
}

// Filter ids sent with `gallery_tab_click`: 'all' plus each group id, in page order.
const GALLERY_FILTER_ALL = 'all'
// Mirrors gallery.css: one column to 640px, two to 1040px, then three (the BonBon lead spans two).
const CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1040px) 50vw, 400px'
const LEAD_SIZES = '(max-width: 1040px) 100vw, 800px'

export default function GalleryGrid({ categories }: Props) {
  const t = useTranslations('Pages.gallery')
  const [active, setActive] = useState<string>(GALLERY_FILTER_ALL)
  const visible =
    active === GALLERY_FILTER_ALL
      ? categories
      : categories.filter((c) => c.id === active)
  // The very first photo of the page is the LCP candidate; everything after it loads lazily.
  const firstSrc = visible[0]?.items[0]?.src

  const select = (id: string, count: number): void => {
    setActive(id)
    track(
      'gallery_tab_click',
      id === GALLERY_FILTER_ALL ? { filter: id, total: count } : { filter: id, count }
    )
  }

  return (
    <>
      <div className="gallery-filter" role="group" aria-label={t('tabsLabel')}>
        {[GALLERY_FILTER_ALL, ...categories.map((c) => c.id)].map((id) => {
          const isAll = id === GALLERY_FILTER_ALL
          const count = isAll
            ? categories.reduce((sum, c) => sum + c.items.length, 0)
            : (categories.find((c) => c.id === id)?.items.length ?? 0)
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active === id}
              className="gallery-chip"
              onClick={() => select(id, count)}
            >
              {isAll ? t('all') : categories.find((c) => c.id === id)?.label}
            </button>
          )
        })}
      </div>

      <div id="gallery-proof-wall" className="gallery-modules">
        {visible.map((cat) => (
          <section
            key={cat.id}
            className={`gallery-group gallery-group--${cat.id}`}
            aria-labelledby={`gallery-${cat.id}-title`}
          >
            <h2 id={`gallery-${cat.id}-title`} className="gallery-group-title">
              {cat.label}
            </h2>
            <div className="gallery-proof-grid">
              {cat.items.map((photo, index) => (
                <PhotoCard
                  key={photo.src}
                  photo={photo}
                  category={cat.id}
                  index={index}
                  eager={photo.src === firstSrc}
                  lead={cat.id === 'bonbon' && index === 0}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

function PhotoCard({
  photo,
  category,
  index,
  eager,
  lead,
}: {
  photo: GalleryPhoto
  category: string
  index: number
  eager: boolean
  lead: boolean
}) {
  const t = useTranslations('Pages.gallery')
  const href = photo.refs ?? photo.src
  const external = Boolean(photo.refs)
  const caption = t(`captions.${photo.id}`)

  return (
    <Link
      href={href}
      target="_blank"
      rel={external ? 'noopener noreferrer' : undefined}
      className="gallery-card"
      data-category={category}
      data-fit={photo.fit}
      aria-label={`${caption} ${external ? t('verified') : t('original')}`}
      onClick={() =>
        track('gallery_item_click', {
          category,
          target: href,
          is_external: external,
          alt: photo.alt,
          position: index + 1,
          variant: index === 0 ? 'lead' : 'compact',
        })
      }
    >
      <figure className="gallery-figure">
        <div className="gallery-frame">
          {/* A plain img: with images.unoptimized, next/image drops any srcSet. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            srcSet={photo.srcSet}
            sizes={photo.srcSet ? (lead ? LEAD_SIZES : CARD_SIZES) : undefined}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className="gallery-image"
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
          />
        </div>
        <figcaption className="gallery-caption">
          <span className="gallery-caption-text">{caption}</span>
          <span className="gallery-caption-meta">
            {external ? t('verified') : t('original')}
            {external ? (
              <LuExternalLink size={14} aria-hidden="true" />
            ) : (
              <LuArrowUpRight size={14} aria-hidden="true" />
            )}
          </span>
        </figcaption>
      </figure>
    </Link>
  )
}
