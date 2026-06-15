'use client'
import { useMemo, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { IconType } from 'react-icons'
import {
  LuActivity,
  LuArrowUpRight,
  LuAward,
  LuBadgeCheck,
  LuBriefcase,
  LuExternalLink,
  LuImage,
  LuLayers,
  LuSparkles,
} from 'react-icons/lu'
import { track } from '@/lib/analytics'

type Photo = {
  src: string
  alt: string
  refs?: string
  width?: number
  height?: number
  sizes?: string[]
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

const CATEGORY_META: Record<string, { Icon: IconType; accent: string }> = {
  certificates: { Icon: LuBadgeCheck, accent: 'oklch(65% 0.16 155)' },
  awards: { Icon: LuAward, accent: 'oklch(72% 0.16 78)' },
  projects: { Icon: LuBriefcase, accent: 'oklch(63% 0.17 28)' },
  activities: { Icon: LuActivity, accent: 'oklch(66% 0.15 292)' },
}

function getCategoryMeta(id: string) {
  return CATEGORY_META[id] ?? { Icon: LuLayers, accent: 'var(--accent)' }
}

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

  const spotlightPhotos = useMemo(() => {
    const preferred = [
      categories.find((c) => c.id === 'awards')?.items[0],
      categories.find((c) => c.id === 'certificates')?.items[0],
      categories.find((c) => c.id === 'projects')?.items[0],
    ].filter(Boolean) as Photo[]

    if (preferred.length >= 3) return preferred.slice(0, 3)

    const fallback = categories.flatMap((c) => c.items)
    return [...preferred, ...fallback].filter(Boolean).slice(0, 3)
  }, [categories])

  const stats = useMemo(
    () => [
      { value: totalCount, label: t('stats.proofs') },
      {
        value:
          categories.find((c) => c.id === 'certificates')?.items.length ?? 0,
        label: t('stats.certifications'),
      },
      {
        value: categories.find((c) => c.id === 'awards')?.items.length ?? 0,
        label: t('stats.recognitions'),
      },
      {
        value: categories.find((c) => c.id === 'projects')?.items.length ?? 0,
        label: t('stats.builds'),
      },
    ],
    [categories, t, totalCount]
  )

  return (
    <>
      <section
        className="gallery-evidence-board"
        aria-labelledby="gallery-board-title"
      >
        <div className="gallery-board-copy">
          <span className="gallery-board-kicker">
            <LuSparkles size={14} aria-hidden="true" />
            {t('hero.kicker')}
          </span>
          <h2 id="gallery-board-title" className="gallery-board-title">
            {t('hero.title')}
          </h2>
          <p className="gallery-board-lead">{t('hero.lead')}</p>

          <div className="gallery-stat-grid" aria-label={t('stats.label')}>
            {stats.map((stat) => (
              <div key={stat.label} className="gallery-stat">
                <span className="gallery-stat-value">{stat.value}</span>
                <span className="gallery-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gallery-board-visual" aria-hidden="true">
          {spotlightPhotos.map((photo, index) => (
            <div
              key={`${photo.src}-${index}`}
              className={`gallery-spotlight-card gallery-spotlight-card-${index + 1}`}
            >
              <Image
                src={photo.src}
                alt=""
                width={photo.width && photo.width > 100 ? photo.width : 900}
                height={photo.height && photo.height > 100 ? photo.height : 640}
                className="gallery-spotlight-image"
                unoptimized
              />
            </div>
          ))}
          <div className="gallery-board-badge">
            <LuImage size={16} aria-hidden="true" />
            <span>{t('hero.proofTitle')}</span>
          </div>
        </div>
      </section>

      <section
        className="gallery-storyline"
        aria-labelledby="gallery-story-title"
      >
        <div className="gallery-story-copy">
          <span className="gallery-story-label">{t('story.label')}</span>
          <h2 id="gallery-story-title" className="gallery-story-title">
            {t('story.title')}
          </h2>
          <p>{t('story.body')}</p>
        </div>

        <div
          className="gallery-filter"
          role="tablist"
          aria-label={t('tabsLabel')}
        >
          <FilterChip
            label={t('all')}
            count={totalCount}
            active={active === ALL}
            accent="var(--fg)"
            Icon={LuLayers}
            note={t('categoryNotes.all')}
            onClick={() => {
              setActive(ALL)
              track('gallery_tab_click', { filter: 'all', total: totalCount })
            }}
          />
          {categories.map((c) => {
            const meta = getCategoryMeta(c.id)

            return (
              <FilterChip
                key={c.id}
                label={c.label}
                count={c.items.length}
                active={active === c.id}
                accent={meta.accent}
                Icon={meta.Icon}
                note={t(`categoryNotes.${c.id}`)}
                onClick={() => {
                  setActive(c.id)
                  track('gallery_tab_click', {
                    filter: c.id,
                    count: c.items.length,
                  })
                }}
              />
            )
          })}
        </div>
      </section>

      <AnimatePresence mode="wait">
        <m.div
          key={active}
          className="gallery-modules"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        >
          {buckets.map((cat) => (
            <CategoryModule key={cat.id} category={cat} />
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
  accent,
  Icon,
  note,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  accent: string
  Icon: IconType
  note: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`gallery-chip${active ? ' is-active' : ''}`}
      style={{ '--gallery-accent': accent } as CSSProperties}
      onClick={onClick}
    >
      <span className="gallery-chip-topline">
        <span className="gallery-chip-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="gallery-chip-count">{count}</span>
      </span>
      <span className="gallery-chip-label">{label}</span>
      <span className="gallery-chip-note">{note}</span>
    </button>
  )
}

function CategoryModule({ category }: { category: Category }) {
  const t = useTranslations('Pages.gallery')
  const meta = getCategoryMeta(category.id)
  const [lead, ...supporting] = category.items
  const Icon = meta.Icon

  if (!lead) return null

  return (
    <section
      className="gallery-proof-module"
      style={{ '--gallery-accent': meta.accent } as CSSProperties}
      aria-labelledby={`${category.id}-title`}
    >
      <header className="gallery-module-head">
        <div>
          <span className="gallery-module-kicker">
            <Icon size={17} aria-hidden="true" />
            {t('featured')}
          </span>
          <h2 id={`${category.id}-title`} className="gallery-module-title">
            {category.label}
          </h2>
        </div>
        <p className="gallery-module-note">
          {t(`categoryNotes.${category.id}`)}
        </p>
      </header>

      <div className="gallery-proof-grid">
        <PhotoCard
          photo={lead}
          category={category.id}
          index={0}
          variant="lead"
        />

        {supporting.length > 0 && (
          <div className="gallery-proof-stack" aria-label={t('supporting')}>
            {supporting.map((photo, idx) => (
              <PhotoCard
                key={photo.src}
                photo={photo}
                category={category.id}
                index={idx + 1}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PhotoCard({
  photo,
  category,
  index,
  variant,
}: {
  photo: Photo
  category: string
  index: number
  variant: 'lead' | 'compact'
}) {
  const t = useTranslations('Pages.gallery')
  const reduced = useReducedMotion()
  const href = photo.refs ?? photo.src
  const external = Boolean(photo.refs)
  const delay = reduced ? 0 : Math.min(index * 0.04, 0.28)
  const caption = formatCaption(photo.alt)
  const width =
    photo.width && photo.width > 100
      ? photo.width
      : variant === 'lead'
        ? 1100
        : 720
  const height =
    photo.height && photo.height > 100
      ? photo.height
      : variant === 'lead'
        ? 760
        : 520

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
        className={`gallery-card gallery-card-${variant}`}
        data-category={category}
        aria-label={`${t('openProof')}: ${caption}`}
        onClick={() =>
          track('gallery_item_click', {
            category,
            target: href,
            is_external: external,
            alt: photo.alt,
            position: index + 1,
            variant,
          })
        }
      >
        <figure className="gallery-figure">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={width}
            height={height}
            sizes={
              photo.sizes?.[0] ??
              (variant === 'lead'
                ? '(min-width: 900px) 58vw, 100vw'
                : '(min-width: 900px) 24vw, 50vw')
            }
            className="gallery-image"
            unoptimized
          />
          <figcaption className="gallery-caption">
            <span className="gallery-caption-meta">
              {external ? t('verified') : t('original')}
            </span>
            <span className="gallery-caption-text">{caption}</span>
            <span className="gallery-caption-action" aria-hidden="true">
              {external ? (
                <LuExternalLink size={16} />
              ) : (
                <LuArrowUpRight size={16} />
              )}
            </span>
          </figcaption>
        </figure>
      </Link>
    </m.div>
  )
}

function formatCaption(alt: string) {
  return alt
    .replace(/^Nguyen Le Phong\s*-\s*/i, '')
    .replace(/^Software Engineer\s*-\s*/i, '')
    .replace(/\s+-\s+/g, ' · ')
}
