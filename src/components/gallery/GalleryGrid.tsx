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
  LuEye,
  LuFileText,
  LuLayers,
  LuShieldCheck,
  LuSparkles,
  LuTarget,
  LuUsers,
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

const CAPTION_KEYS: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /very good/i, key: 'veryGood' },
  { pattern: /score board/i, key: 'scoreboard' },
  { pattern: /tester certificate/i, key: 'testerCertificate' },
  { pattern: /compliance refresh/i, key: 'compliance' },
  { pattern: /cybersecurity/i, key: 'cybersecurity' },
  { pattern: /best rookie/i, key: 'bestRookie' },
  { pattern: /splus certificate/i, key: 'splus' },
  { pattern: /award at primedata/i, key: 'primeAward' },
  { pattern: /uprace.*medal|medal.*uprace/i, key: 'upraceMedals' },
  { pattern: /uprace certificate/i, key: 'uprace323' },
  { pattern: /trekking penang hill/i, key: 'penangHill' },
  { pattern: /desk working/i, key: 'deskWorking' },
  { pattern: /chess games project/i, key: 'chessProject' },
  { pattern: /wat project/i, key: 'watProject' },
  { pattern: /my essay/i, key: 'essay' },
  { pattern: /team to implement essay/i, key: 'teamEssay' },
  { pattern: /drone applications/i, key: 'drone' },
]

const FEATURED_PHOTO_PATTERNS: Record<string, RegExp> = {
  certificates: /compliance refresh/i,
  awards: /award at primedata/i,
  projects: /wat project/i,
  activities: /desk working/i,
}

function getCategoryMeta(id: string) {
  return CATEGORY_META[id] ?? { Icon: LuLayers, accent: 'var(--accent)' }
}

function getCaptionKey(alt: string) {
  return CAPTION_KEYS.find((item) => item.pattern.test(alt))?.key
}

function getDisplayItems(category: Category) {
  const pattern = FEATURED_PHOTO_PATTERNS[category.id]
  const index = pattern
    ? category.items.findIndex((photo) => pattern.test(photo.alt))
    : -1

  if (index <= 0) return category.items

  const items = [...category.items]
  const [featured] = items.splice(index, 1)
  return [featured, ...items]
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
    const projectItems = categories.find((c) => c.id === 'projects')?.items ?? []
    const awardItems = categories.find((c) => c.id === 'awards')?.items ?? []
    const certificateItems =
      categories.find((c) => c.id === 'certificates')?.items ?? []
    const preferred = [
      projectItems[1] ?? projectItems[0],
      awardItems[2] ?? awardItems[0],
      certificateItems[3] ?? certificateItems[0],
    ].filter(Boolean) as Photo[]

    if (preferred.length >= 3) return preferred.slice(0, 3)

    const fallback = categories.flatMap((c) => c.items)
    return [...preferred, ...fallback].filter(Boolean).slice(0, 3)
  }, [categories])

  const stats = useMemo(
    () => [
      {
        value: totalCount,
        label: t('stats.proofs'),
        detail: t('stats.proofsDetail'),
      },
      {
        value:
          categories.find((c) => c.id === 'certificates')?.items.length ?? 0,
        label: t('stats.certifications'),
        detail: t('stats.certificationsDetail'),
      },
      {
        value: categories.find((c) => c.id === 'awards')?.items.length ?? 0,
        label: t('stats.recognitions'),
        detail: t('stats.recognitionsDetail'),
      },
      {
        value: categories.find((c) => c.id === 'projects')?.items.length ?? 0,
        label: t('stats.builds'),
        detail: t('stats.buildsDetail'),
      },
    ],
    [categories, t, totalCount]
  )

  const trustSignals = useMemo(
    () => [
      {
        Icon: LuTarget,
        title: t('trust.learning.title'),
        body: t('trust.learning.body'),
      },
      {
        Icon: LuShieldCheck,
        title: t('trust.delivery.title'),
        body: t('trust.delivery.body'),
      },
      {
        Icon: LuUsers,
        title: t('trust.team.title'),
        body: t('trust.team.body'),
      },
    ],
    [t]
  )

  return (
    <>
      <section className="gallery-hero" aria-labelledby="gallery-board-title">
        <div className="gallery-hero-copy">
          <span className="gallery-hero-kicker">
            <LuSparkles size={15} aria-hidden="true" />
            {t('hero.kicker')}
          </span>
          <h2 id="gallery-board-title" className="gallery-hero-title">
            {t('hero.title')}
          </h2>
          <p className="gallery-hero-lead">{t('hero.lead')}</p>

          <div className="gallery-hero-actions">
            <a href="#gallery-proof-wall" className="gallery-primary-link">
              <LuEye size={17} aria-hidden="true" />
              {t('hero.primaryCta')}
            </a>
            <span className="gallery-scan-note">{t('hero.scanNote')}</span>
          </div>
        </div>

        <div className="gallery-hero-visual">
          <div className="gallery-visual-stack" aria-hidden="true">
            {spotlightPhotos.map((photo, index) => (
              <div
                key={`${photo.src}-${index}`}
                className={`gallery-spotlight-card gallery-spotlight-card-${index + 1}`}
              >
                <Image
                  src={photo.src}
                  alt=""
                  width={photo.width && photo.width > 100 ? photo.width : 900}
                  height={
                    photo.height && photo.height > 100 ? photo.height : 640
                  }
                  className="gallery-spotlight-image"
                  unoptimized
                />
              </div>
            ))}
          </div>
          <div className="gallery-board-badge">
            <LuFileText size={16} aria-hidden="true" />
            <span className="gallery-board-badge-text">
              {t('hero.proofTitle')}
            </span>
          </div>
        </div>
      </section>

      <section
        className="gallery-recruiter-panel"
        aria-label={t('trust.label')}
      >
        <div className="gallery-trust-copy">
          <span className="gallery-story-label">{t('trust.label')}</span>
          <h2 className="gallery-trust-title">{t('trust.title')}</h2>
        </div>
        <div className="gallery-trust-list">
          {trustSignals.map(({ Icon, title, body }) => (
            <article key={title} className="gallery-trust-item">
              <span className="gallery-trust-icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-stat-grid" aria-label={t('stats.label')}>
        {stats.map((stat) => (
          <div key={stat.label} className="gallery-stat">
            <span className="gallery-stat-value">{stat.value}</span>
            <span className="gallery-stat-label">{stat.label}</span>
            <span className="gallery-stat-detail">{stat.detail}</span>
          </div>
        ))}
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
          id="gallery-proof-wall"
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
  const items = getDisplayItems(category)
  const Icon = meta.Icon

  if (items.length === 0) return null

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
        <div className="gallery-module-summary">
          <p className="gallery-module-note">
            {t(`categoryIntros.${category.id}.body`)}
          </p>
          <p className="gallery-module-signal">
            {t(`categoryIntros.${category.id}.signal`)}
          </p>
        </div>
      </header>

      <div className="gallery-proof-grid">
        {items.map((photo, index) => (
          <PhotoCard
            key={photo.src}
            photo={photo}
            category={category.id}
            index={index}
            variant={index === 0 ? 'lead' : 'compact'}
          />
        ))}
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
  const captionKey = getCaptionKey(photo.alt)
  const caption = captionKey
    ? t(`captions.${captionKey}`)
    : formatCaption(photo.alt)
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
