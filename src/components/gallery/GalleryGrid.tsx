'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { LuExternalLink } from 'react-icons/lu'
import { track } from '@/lib/analytics'

type Photo = {
  src: string
  alt: string
  refs?: string
  width?: number
  height?: number
}

type Category = {
  id: string
  label: string
  items: Photo[]
}

type Props = {
  categories: Category[]
}

const ALL = '__all__'

export default function GalleryGrid({ categories }: Props) {
  const t = useTranslations('Pages.gallery')
  const [active, setActive] = useState<string>(ALL)

  const buckets = useMemo(() => {
    if (active === ALL) return categories
    return categories.filter((c) => c.id === active)
  }, [active, categories])

  const totalCount = useMemo(
    () => categories.reduce((sum, c) => sum + c.items.length, 0),
    [categories]
  )

  return (
    <>
      <div className="gallery-filter" role="tablist" aria-label="Gallery categories">
        <FilterChip
          label={t('all')}
          count={totalCount}
          active={active === ALL}
          onClick={() => {
            setActive(ALL)
            track('gallery_tab_click', { filter: 'all', total: totalCount })
          }}
        />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            label={c.label}
            count={c.items.length}
            active={active === c.id}
            onClick={() => {
              setActive(c.id)
              track('gallery_tab_click', { filter: c.id, count: c.items.length })
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <m.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        >
          {buckets.map((cat) => (
            <section
              key={cat.id}
              className="gallery-bucket"
              aria-labelledby={`${cat.id}-title`}
            >
              {active === ALL && (
                <header className="gallery-bucket-head">
                  <h2 id={`${cat.id}-title`} className="gallery-bucket-title">
                    {cat.label}
                  </h2>
                  <span className="gallery-bucket-count">{cat.items.length}</span>
                </header>
              )}

              <div className="gallery-masonry">
                {cat.items.map((photo, idx) => (
                  <PhotoCard
                    key={photo.src}
                    photo={photo}
                    category={cat.id}
                    index={idx}
                  />
                ))}
              </div>
            </section>
          ))}
        </m.div>
      </AnimatePresence>
    </>
  )
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`gallery-chip${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className="gallery-chip-count">{count}</span>
    </button>
  )
}

function PhotoCard({
  photo,
  category,
  index,
}: {
  photo: Photo
  category: string
  index: number
}) {
  const reduced = useReducedMotion()
  const href = photo.refs ?? photo.src
  const external = Boolean(photo.refs)
  const delay = reduced ? 0 : Math.min(index * 0.04, 0.45)

  return (
    <m.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <Link
        href={href}
        target="_blank"
        rel={external ? 'noopener noreferrer' : undefined}
        className="gallery-card"
        onClick={() =>
          track('gallery_item_click', {
            category,
            target: href,
            is_external: external,
            alt: photo.alt,
            position: index + 1,
          })
        }
      >
        <figure className="gallery-figure">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width && photo.width > 100 ? photo.width : 800}
            height={photo.height && photo.height > 100 ? photo.height : 600}
            className="gallery-image"
            unoptimized
          />
          <figcaption className="gallery-caption">
            <span className="gallery-caption-text">{photo.alt}</span>
            <LuExternalLink size={16} aria-hidden="true" />
          </figcaption>
        </figure>
      </Link>
    </m.div>
  )
}
