'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { LuCheck, LuPalette } from 'react-icons/lu'
import { track } from '@/lib/analytics'
import {
  READING_BACKGROUNDS,
  READING_BACKGROUND_STORAGE_KEY,
  type ReadingBackground,
} from './ReadingBackgroundScript'

interface BackgroundMeta {
  id: ReadingBackground
}

const BACKGROUNDS: BackgroundMeta[] = READING_BACKGROUNDS.map((id) => ({ id }))

function applyBackground(background: ReadingBackground) {
  document.documentElement.setAttribute('data-reading-background', background)
  try {
    localStorage.setItem(READING_BACKGROUND_STORAGE_KEY, background)
  } catch {
    // ignore
  }
}

interface ReadingBackgroundSwitcherProps {
  placement?: 'down' | 'up'
}

export default function ReadingBackgroundSwitcher({
  placement = 'down',
}: ReadingBackgroundSwitcherProps) {
  const t = useTranslations('Nav.background')
  const [mounted, setMounted] = useState(false)
  const [current, setCurrent] = useState<ReadingBackground>('plain')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return
      setMounted(true)
      try {
        const stored = localStorage.getItem(
          READING_BACKGROUND_STORAGE_KEY,
        ) as ReadingBackground | null
        if (stored && READING_BACKGROUNDS.includes(stored)) setCurrent(stored)
      } catch {
        // ignore
      }
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const handlePick = (background: ReadingBackground) => {
    setCurrent(background)
    applyBackground(background)
    setOpen(false)
    track('reading_background_change', { background })
  }

  const currentLabel = t(current)
  const ariaLabel = `${t('label')}: ${mounted ? currentLabel : t('plain')}`

  return (
    <div
      className={`reading-background-switcher reading-background-switcher--${placement}`}
      ref={ref}
    >
      <button
        type="button"
        className="reading-background-switcher__trigger"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <LuPalette size={16} aria-hidden="true" />
        <span className="reading-background-switcher__current" aria-hidden="true">
          {mounted ? currentLabel : t('plain')}
        </span>
      </button>

      {open && (
        <div role="menu" className="reading-background-switcher__menu">
          <p className="reading-background-switcher__title">{t('label')}</p>
          <ul className="reading-background-switcher__list">
            {BACKGROUNDS.map(({ id }) => {
              const active = id === current
              return (
                <li key={id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    className={`reading-background-switcher__option${
                      active ? ' is-active' : ''
                    }`}
                    onClick={() => handlePick(id)}
                  >
                    <span
                      className={`reading-background-switcher__swatch reading-background-switcher__swatch--${id}`}
                      aria-hidden="true"
                    />
                    <span className="reading-background-switcher__name">
                      {t(id)}
                    </span>
                    {active && <LuCheck size={14} aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
