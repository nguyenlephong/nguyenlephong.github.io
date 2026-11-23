'use client'

import { useMemo, useState } from 'react'
import { LuArrowUpRight } from 'react-icons/lu'
import {
  personalizeWish,
  wishjarUrl,
  type AppsCopyLocale,
  type WishDemo,
} from '@/app/[locale]/(site)/apps/apps.data'
import { track } from '@/lib/analytics'

interface WishJarProps {
  demo: WishDemo
  locale: AppsCopyLocale
  shakeLabel: string
  forLabel: string
  occasionLabel: string
  openLabel: string
}

// Paper strips inside the jar: x, y, rotation, colour. Fixed so server and client render the same jar.
const STRIPS: [number, number, number, string][] = [
  [22, 92, -18, '#ffd23f'],
  [52, 86, 24, '#5cd6a9'],
  [82, 94, -8, '#ff8fb8'],
  [30, 112, 12, '#6ec1ff'],
  [62, 108, -26, '#ff7a45'],
  [90, 116, 16, '#ffd23f'],
  [20, 132, -4, '#ff8fb8'],
  [50, 128, 30, '#6ec1ff'],
  [80, 136, -14, '#5cd6a9'],
  [36, 150, 8, '#ff7a45'],
  [68, 152, -22, '#ffd23f'],
]

/**
 * A small Wishjar: pick an occasion, shake the jar for a real line from the library, and switch the
 * recipient to watch the Vietnamese pronouns change. The CTA opens the same line on live Wishjar.
 * No autoplay: the jar only moves when someone shakes it.
 */
export default function WishJar({ demo, locale, shakeLabel, forLabel, occasionLabel, openLabel }: Readonly<WishJarProps>) {
  const [occasion, setOccasion] = useState(demo.occasions[0]?.id ?? '')
  const [lineId, setLineId] = useState(() => demo.lines.find((l) => l.occasion === occasion)?.id ?? '')
  const [audienceId, setAudienceId] = useState(() => demo.lines.find((l) => l.id === lineId)?.audiences[0] ?? '')
  const [shakes, setShakes] = useState(0)

  const line = demo.lines.find((l) => l.id === lineId) ?? demo.lines[0]
  const audience = demo.audiences.find((a) => a.id === audienceId) ?? demo.audiences[0]
  const parts = useMemo(
    () => (line && audience ? personalizeWish(line.text, audience.you, audience.me) : []),
    [line, audience]
  )
  if (!line || !audience) return null

  const show = (nextId: string): void => {
    const next = demo.lines.find((l) => l.id === nextId)
    if (!next) return
    setLineId(next.id)
    // Keep the chosen recipient when the new line suits them; otherwise use the line's default.
    setAudienceId((current) => (next.audiences.includes(current) ? current : next.audiences[0] ?? current))
    setShakes((n) => n + 1)
  }

  const shake = (): void => {
    const pool = demo.lines.filter((l) => l.occasion === occasion && l.id !== line.id)
    const next = pool[Math.floor(Math.random() * pool.length)]
    if (!next) return
    show(next.id)
    track('apps_demo_interact', { app_id: 'wishjar', action: 'shake', occasion, wish: next.id })
  }

  const pickOccasion = (id: string): void => {
    if (id === occasion) return
    setOccasion(id)
    const first = demo.lines.find((l) => l.occasion === id)
    if (first) show(first.id)
    track('apps_demo_interact', { app_id: 'wishjar', action: 'occasion', occasion: id })
  }

  const pickAudience = (id: string): void => {
    if (id === audience.id) return
    setAudienceId(id)
    track('apps_demo_interact', { app_id: 'wishjar', action: 'audience', audience: id, wish: line.id })
  }

  return (
    <div className="apps-stage-play wish-jar">
      <div className="wish-occasions" role="group" aria-label={occasionLabel}>
        {demo.occasions.map((o) => (
          <button
            key={o.id}
            type="button"
            className="wish-chip"
            aria-pressed={o.id === occasion}
            onClick={() => pickOccasion(o.id)}
          >
            <span aria-hidden="true">{o.emoji}</span> {o.label[locale]}
          </button>
        ))}
      </div>

      <div className="wish-scene">
        <button type="button" className="wish-jar-button" onClick={shake} aria-label={shakeLabel}>
          <svg
            key={shakes}
            className="wish-jar-svg"
            data-shaken={shakes > 0 || undefined}
            viewBox="0 0 120 190"
            aria-hidden="true"
          >
            <rect x="30" y="8" width="60" height="22" rx="6" fill="#e8475b" stroke="#3b2a8c" strokeWidth="4" />
            <rect x="36" y="30" width="48" height="12" rx="3" fill="#fff" stroke="#3b2a8c" strokeWidth="4" />
            <path d="M28 46 Q12 50 12 72 V166 Q12 182 30 182 H90 Q108 182 108 166 V72 Q108 50 92 46 Z" fill="rgb(110 193 255 / 0.14)" stroke="#3b2a8c" strokeWidth="4" />
            {STRIPS.map(([x, y, r, c]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="26" height="10" rx="2" fill={c} stroke="#3b2a8c" strokeWidth="1.5" transform={`rotate(${r} ${x + 13} ${y + 5})`} />
            ))}
          </svg>
          <span className="wish-jar-label">{shakeLabel}</span>
        </button>

        <figure className="wish-note" key={`${line.id}-${shakes}`}>
          <blockquote lang="vi" className="wish-text" aria-live="polite">
            {parts.map((part, i) =>
              part.pronoun ? (
                <mark key={`${i}-${audience.id}`} className="wish-pronoun">
                  {part.text}
                </mark>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </blockquote>
          {locale === 'en' && <figcaption className="wish-gloss">{line.gloss}</figcaption>}
        </figure>
      </div>

      <div className="wish-audiences" role="group" aria-label={forLabel}>
        <span className="wish-for">{forLabel}</span>
        {line.audiences.map((id) => {
          const a = demo.audiences.find((x) => x.id === id)
          if (!a) return null
          return (
            <button
              key={id}
              type="button"
              className="wish-chip wish-chip--audience"
              aria-pressed={id === audience.id}
              onClick={() => pickAudience(id)}
            >
              {a.label[locale]}
              <span className="wish-chip-pair" lang="vi">
                {a.you} · {a.me}
              </span>
            </button>
          )
        })}
      </div>

      <div className="wish-controls">
        <a
          href={wishjarUrl(line, audience.id, locale)}
          target="_blank"
          rel="noopener noreferrer"
          className="apps-btn apps-btn--primary"
          onClick={() =>
            track('apps_link_click', {
              app_id: 'wishjar',
              app_name: 'Wishjar',
              link_kind: 'site',
              wish: line.id,
              audience: audience.id,
              position: 2,
              source: 'apps_demo',
            })
          }
        >
          {openLabel}
          <LuArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
