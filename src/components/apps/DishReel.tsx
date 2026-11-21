'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { LuArrowUpRight, LuDices } from 'react-icons/lu'
import {
  anGiDishUrl,
  type AppsCopyLocale,
  type DishDemo,
} from '@/app/[locale]/(site)/apps/apps.data'
import { track } from '@/lib/analytics'

interface DishReelProps {
  dishes: DishDemo[]
  locale: AppsCopyLocale
  lead: string
  spinLabel: string
  openTemplate: string
}

// The strip repeats the list so a spin always travels a few full loops before it lands.
const LOOPS = 4
const DECK_SIZE = 3
// A little past the 1.9 s CSS transition: lands the reel even if transitionend never fires.
const SETTLE_FALLBACK_MS = 2300
// Covers come from the Ăn Gì app itself (its dish hub images, 640px WebP).
const coverSrc = (slug: string): string => `/apps/an-gi/covers/${slug}.webp`

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * "Hôm nay ăn [Lẩu]": a slot-style reel over the dish lists Ăn Gì really has, and a deck of the
 * app's dish covers where each result is thrown on top. The reel spins once by itself the first
 * time the stage is in view; after that it only moves when someone presses Spin.
 * Renders two grid items (play + visual) straight into the stage grid.
 */
export default function DishReel({ dishes, locale, lead, spinLabel, openTemplate }: DishReelProps) {
  const count = dishes.length
  const [offset, setOffset] = useState(0)
  const [spinning, setSpinning] = useState(false)
  // Newest first; the first entry is the landed dish.
  const [deck, setDeck] = useState<number[]>(() => [0, 2, 5].filter((i) => i < count))
  const [touched, setTouched] = useState(false)
  const target = useRef(0)
  const fallback = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const playRef = useRef<HTMLDivElement>(null)
  const landed = deck[0] ?? 0
  const dish = dishes[landed]

  const land = (next: number): void => {
    setOffset(next)
    setDeck((prev) => [next, ...prev.filter((i) => i !== next)].slice(0, DECK_SIZE))
  }

  const spin = (source: 'user' | 'auto'): void => {
    if (spinning || count < 2) return
    let next = Math.floor(Math.random() * (count - 1))
    if (next >= landed) next += 1
    target.current = next
    if (source === 'user') {
      setTouched(true)
      track('apps_demo_interact', { app_id: 'an-gi', action: 'spin', dish: dishes[next].slug })
    }
    if (prefersReducedMotion()) {
      land(next)
      return
    }
    setSpinning(true)
    setOffset(count * (LOOPS - 1) + next)
    clearTimeout(fallback.current)
    fallback.current = setTimeout(settle, SETTLE_FALLBACK_MS)
  }

  // Back to the first loop with no transition, so the next spin has room to travel. Runs on
  // transitionend, on transitioncancel (reduced motion switched on mid-spin) or on the fallback timer.
  function settle(): void {
    clearTimeout(fallback.current)
    setSpinning(false)
    land(target.current)
  }
  useEffect(() => () => clearTimeout(fallback.current), [])

  // First time the stage is in view: warm the covers, then let the reel show what it does.
  const spinRef = useRef(spin)
  useEffect(() => {
    spinRef.current = spin
  })
  useEffect(() => {
    const node = playRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        for (const d of dishes) new Image().src = coverSrc(d.slug)
        if (!prefersReducedMotion()) timer = setTimeout(() => spinRef.current('auto'), 700)
      },
      { threshold: 0.6 }
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [dishes])

  const cta = openTemplate.replace('{places}', dish.places[locale])

  return (
    <>
      <div ref={playRef} className="apps-stage-play dish-reel">
        <p className="dish-reel-line">
          <span className="dish-reel-lead">{lead}</span>
          <span className="dish-reel-window" data-spinning={spinning || undefined}>
            <span
              className="dish-reel-strip"
              style={{ '--i': offset } as CSSProperties}
              onTransitionEnd={(event) => {
              if (spinning && event.target === event.currentTarget) settle()
            }}
            onTransitionCancel={(event) => {
              if (spinning && event.target === event.currentTarget) settle()
            }}
              aria-hidden="true"
            >
              {Array.from({ length: LOOPS }, (_, loop) =>
                dishes.map((d) => (
                  <span key={`${loop}-${d.slug}`} className="dish-reel-item">
                    {d.name[locale]}
                  </span>
                ))
              )}
            </span>
            <span className="apps-sr-only" aria-live="polite">
              {dish.name[locale]}
            </span>
          </span>
        </p>
        <div className="dish-reel-controls">
          <button
            type="button"
            className="apps-btn apps-btn--spin"
            onClick={() => spin('user')}
            disabled={spinning}
            data-nudge={!touched || undefined}
          >
            <LuDices aria-hidden="true" />
            {spinLabel}
          </button>
          <a
            href={anGiDishUrl(dish.slug, locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="apps-btn apps-btn--primary"
            aria-disabled={spinning || undefined}
            onClick={(event) => {
              // While the reel rolls, the link still points at the previous dish.
              if (spinning) {
                event.preventDefault()
                return
              }
              track('apps_link_click', {
                app_id: 'an-gi',
                app_name: 'Ăn Gì',
                link_kind: 'site',
                dish: dish.slug,
                position: 1,
                source: 'apps_demo',
              })
            }}
          >
            {cta}
            <LuArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="apps-stage-visual dish-deck" data-spinning={spinning || undefined} aria-hidden="true">
        {deck.map((index, pos) => {
          const d = dishes[index]
          return (
            <div key={d.slug} className="dish-card" data-pos={pos}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverSrc(d.slug)}
                width={640}
                height={640}
                alt=""
                loading={pos === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <span className="dish-card-tag">{d.name[locale]}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
