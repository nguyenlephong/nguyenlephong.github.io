'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'

export interface ChamberNavItem {
  /** Topic id — matches the DOM id `chamber-section-${id}`. */
  id: string
  label: string
  color: string
}

interface NotesChamberNavProps {
  chambers: ChamberNavItem[]
}

/** 1 → "I", 2 → "II"… small range is all an archive index ever needs. */
function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let out = ''
  let value = n
  for (const [num, sym] of map) {
    while (value >= num) {
      out += sym
      value -= num
    }
  }
  return out
}

function sectionId(id: string): string {
  return `chamber-section-${id}`
}

/**
 * A quick jump for the notes index that adapts to the surface:
 *   - Desktop (wide): a fixed vertical rail in the right gutter. Ticks expand
 *     and labels reveal on hover; the active chamber is gilt-marked.
 *   - Mobile / tablet: a sticky horizontal chip strip under the header so the
 *     next categories are always one tap away — no long scrolling required.
 * Both share one scroll-spy driven by IntersectionObserver.
 */
export default function NotesChamberNav({ chambers }: NotesChamberNavProps) {
  const [activeId, setActiveId] = useState<string>(chambers[0]?.id ?? '')
  const stripRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Scroll-spy: the chamber whose top is nearest the header wins.
  useEffect(() => {
    const sections = chambers
      .map((c) => document.getElementById(sectionId(c.id)))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const topicId = entry.target.getAttribute('data-topic') ?? ''
          if (entry.isIntersecting) {
            visible.set(topicId, entry.intersectionRatio)
          } else {
            visible.delete(topicId)
          }
        }
        if (visible.size > 0) {
          // Pick whichever intersecting section is highest on the page.
          let bestId = ''
          let bestTop = Infinity
          for (const topicId of visible.keys()) {
            const el = document.getElementById(sectionId(topicId))
            if (!el) continue
            const top = Math.abs(el.getBoundingClientRect().top)
            if (top < bestTop) {
              bestTop = top
              bestId = topicId
            }
          }
          if (bestId) setActiveId(bestId)
        }
      },
      {
        // Bias the active line to just under the fixed header + strip.
        rootMargin: '-140px 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 1],
      },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [chambers])

  // Keep the active chip in view inside the horizontal strip.
  useEffect(() => {
    const chip = chipRefs.current.get(activeId)
    if (chip) chip.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [activeId])

  const jumpTo = useCallback((id: string) => {
    const el = document.getElementById(sectionId(id))
    if (!el) return
    setActiveId(id)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    track('notes_nav_jump', { notes_slug_topic: id })
  }, [])

  if (chambers.length < 2) return null

  return (
    <>
      {/* Desktop — vertical rail in the right gutter */}
      <nav className="chamber-nav chamber-nav--rail" aria-label="Mục lục chuyên mục">
        <ul>
          {chambers.map((c, i) => {
            const isActive = c.id === activeId
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`chamber-nav__tick${isActive ? ' is-active' : ''}`}
                  style={{ '--topic-color': c.color } as React.CSSProperties}
                  onClick={() => jumpTo(c.id)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="chamber-nav__rule" aria-hidden="true" />
                  <span className="chamber-nav__roman">{toRoman(i + 1)}</span>
                  <span className="chamber-nav__name">{c.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mobile / tablet — sticky horizontal chip strip */}
      <nav className="chamber-nav chamber-nav--strip" aria-label="Chuyên mục">
        <div className="chamber-nav__strip-scroll" ref={stripRef}>
          {chambers.map((c, i) => {
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                type="button"
                ref={(el) => {
                  if (el) chipRefs.current.set(c.id, el)
                  else chipRefs.current.delete(c.id)
                }}
                className={`chamber-nav__chip${isActive ? ' is-active' : ''}`}
                style={{ '--topic-color': c.color } as React.CSSProperties}
                onClick={() => jumpTo(c.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="chamber-nav__chip-roman" aria-hidden="true">
                  {toRoman(i + 1)}
                </span>
                <span className="chamber-nav__chip-name">{c.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
