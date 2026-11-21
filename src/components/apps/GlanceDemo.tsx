'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { GlanceDemo as GlanceDemoData } from '@/app/[locale]/(site)/apps/apps.data'
import { track } from '@/lib/analytics'

interface GlanceDemoProps {
  demo: GlanceDemoData
  hint: string
  replaceLabel: string
}

interface Cursor {
  x: number
  y: number
  shown: boolean
}

const HOTKEY = ['⌃', '⌥', 'T'] as const

// Autoplay timeline for one phrase, in ms from the start of its cycle.
const T_MOVE = 500
const T_SELECT = 1250
const T_KEYS = 1850
const KEY_GAP = 140
const T_PANEL = T_KEYS + KEY_GAP * HOTKEY.length + 80
const T_RELEASE = T_PANEL + 450
const T_NEXT = 4700

const isTyping = (el: EventTarget | null): boolean =>
  el instanceof HTMLElement &&
  (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')

/**
 * A Mac window with a few underlined phrases. While nobody touches it, it plays itself: the cursor
 * goes to a phrase, the selection sweeps across, ⌃⌥T goes down, the Glance panel pops. The first
 * click or real ⌃⌥T hands control to the visitor and the autoplay stops for good.
 */
export default function GlanceDemo({ demo, hint, replaceLabel }: Readonly<GlanceDemoProps>) {
  const count = demo.phrases.length
  const [active, setActive] = useState(0)
  const [panel, setPanel] = useState(0)
  // Bumped on every reveal so the panel replays its entrance even for the same phrase.
  const [shown, setShown] = useState(0)
  const [auto, setAuto] = useState(true)
  const [inView, setInView] = useState(false)
  const [step, setStep] = useState(1)
  const [keys, setKeys] = useState(0)
  const [cursor, setCursor] = useState<Cursor>({ x: 0, y: 0, shown: false })
  const rootRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([])
  // Read by the window key listener, which is bound once and must not go stale.
  const activeRef = useRef(0)
  const inViewRef = useRef(false)
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    activeRef.current = active
  }, [active])
  useEffect(() => () => clearTimeout(releaseTimer.current), [])

  const reveal = (index: number): void => {
    setActive(index)
    setPanel(index)
    setShown((n) => n + 1)
  }

  const takeOver = (): void => {
    setAuto(false)
    setCursor((c) => ({ ...c, shown: false }))
  }

  const pick = (index: number): void => {
    takeOver()
    setKeys(0)
    reveal(index)
    track('apps_demo_interact', { app_id: 'glance', action: 'translate', phrase_index: index, input: 'click' })
  }

  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting)
        inViewRef.current = visible
        setInView(visible)
        // Leaving mid-cycle cancels the release step, so put the keys and cursor back here.
        if (!visible) {
          setKeys(0)
          setCursor((c) => ({ ...c, shown: false }))
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Autoplay: one phrase per cycle, only while the demo is on screen.
  useEffect(() => {
    if (!auto || !inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const index = step % count
    const timers: ReturnType<typeof setTimeout>[] = []
    const at = (ms: number, fn: () => void): void => {
      timers.push(setTimeout(fn, ms))
    }
    at(T_MOVE, () => {
      const el = phraseRefs.current[index]
      const base = textRef.current?.getBoundingClientRect()
      const rect = el?.getClientRects()[0]
      if (!base || !rect) return
      setCursor({ x: rect.left - base.left + 6, y: rect.top - base.top + rect.height * 0.55, shown: true })
    })
    at(T_SELECT, () => setActive(index))
    HOTKEY.forEach((_, i) => at(T_KEYS + KEY_GAP * i, () => setKeys(i + 1)))
    at(T_PANEL, () => {
      setPanel(index)
      setShown((n) => n + 1)
    })
    at(T_RELEASE, () => setKeys(0))
    at(T_NEXT, () => setStep((s) => s + 1))
    return () => timers.forEach(clearTimeout)
  }, [auto, inView, step, count])

  // The real shortcut walks to the next phrase, and the keycaps on the page go down with it.
  // Only while the demo is on screen, and a held key does not repeat it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (!event.ctrlKey || !event.altKey || event.code !== 'KeyT' || isTyping(event.target)) return
      if (!inViewRef.current || event.repeat) return
      event.preventDefault()
      const next = (activeRef.current + 1) % count
      setAuto(false)
      setCursor((c) => ({ ...c, shown: false }))
      setKeys(HOTKEY.length)
      clearTimeout(releaseTimer.current)
      releaseTimer.current = setTimeout(() => setKeys(0), 260)
      setActive(next)
      setPanel(next)
      setShown((n) => n + 1)
      track('apps_demo_interact', { app_id: 'glance', action: 'translate', phrase_index: next, input: 'hotkey' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count])

  const phrase = demo.phrases[panel]

  return (
    <div ref={rootRef} className="app-visual glance-demo" data-auto={auto || undefined}>
      <div className="glance-window">
        <div className="glance-window-bar" aria-hidden="true">
          <span className="glance-dot glance-dot--red" />
          <span className="glance-dot glance-dot--amber" />
          <span className="glance-dot glance-dot--green" />
          <span className="glance-window-title">{demo.windowTitle}</span>
        </div>
        <p ref={textRef} className="glance-window-text" lang="en">
          {demo.parts.map((part) =>
            typeof part === 'number' ? (
              // A span, not a <button>: buttons are inline-block and a long phrase could not wrap on phones.
              <span
                key={`phrase-${part}`}
                ref={(el) => {
                  phraseRefs.current[part] = el
                }}
                role="button" // NOSONAR: a <button> cannot wrap across lines; this span has tabIndex, Enter and Space
                tabIndex={0}
                className="glance-phrase"
                aria-pressed={part === active}
                onClick={() => pick(part)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  pick(part)
                }}
              >
                {demo.phrases[part].source}
              </span>
            ) : (
              <span key={`text-${part}`}>{part}</span>
            )
          )}
          <span
            className="glance-cursor"
            data-shown={cursor.shown || undefined}
            style={{ '--cx': `${cursor.x}px`, '--cy': `${cursor.y}px` } as CSSProperties}
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" width="22" height="22">
              <path
                d="M2 2 L2 12 L5 9 L7.5 14 L9.5 13 L7 8 L11 8 Z"
                fill="#1c1c21"
                stroke="#fff"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </p>
      </div>

      {/* The live region stays mounted; only the inner panel remounts to replay its entrance. */}
      <div className="glance-panel-live" aria-live="polite">
        <div key={shown} className="glance-panel">
          <div className="glance-panel-head">
            <span className="glance-panel-name">
              <span className="glance-panel-dot" aria-hidden="true" /> Glance
            </span>
            <span className="glance-panel-pair">EN → VI</span>
          </div>
          <p className="glance-panel-source" lang="en">{phrase.source}</p>
          <p className="glance-panel-target" lang="vi">{phrase.target}</p>
          <p className="glance-panel-foot">
            <kbd>⌃</kbd>
            <kbd>⌥</kbd>
            <kbd>⏎</kbd>
            <span>{replaceLabel}</span>
          </p>
        </div>
      </div>

      <p className="glance-hint">
        <span className="glance-keys" aria-hidden="true">
          {HOTKEY.map((key, i) => (
            <kbd key={key} data-down={keys > i || undefined}>
              {key}
            </kbd>
          ))}
        </span>
        <span>{hint}</span>
      </p>
    </div>
  )
}
