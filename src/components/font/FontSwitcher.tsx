'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { LuType, LuCheck } from 'react-icons/lu'
import { FONT_STORAGE_KEY, READING_FONTS, type ReadingFont } from './FontScript'
import { track } from '@/lib/analytics'

interface FontMeta {
  id: ReadingFont
  label: string
  sampleStyle: React.CSSProperties
  kind: 'sans' | 'serif'
}

const FONTS: FontMeta[] = [
  {
    id: 'inter',
    label: 'Inter',
    kind: 'sans',
    sampleStyle: { fontFamily: 'var(--font-sans), system-ui, sans-serif' },
  },
  {
    id: 'source',
    label: 'Source Sans 3',
    kind: 'sans',
    sampleStyle: {
      fontFamily: 'var(--font-reading-source), system-ui, sans-serif',
    },
  },
  {
    id: 'plex',
    label: 'IBM Plex Sans',
    kind: 'sans',
    sampleStyle: {
      fontFamily: 'var(--font-reading-plex), system-ui, sans-serif',
    },
  },
  {
    id: 'atkinson',
    label: 'Atkinson Hyperlegible',
    kind: 'sans',
    sampleStyle: {
      fontFamily: 'var(--font-reading-atkinson), system-ui, sans-serif',
    },
  },
  {
    id: 'lora',
    label: 'Lora',
    kind: 'serif',
    sampleStyle: { fontFamily: 'var(--font-reading-lora), Georgia, serif' },
  },
]

function applyFont(font: ReadingFont) {
  document.documentElement.setAttribute('data-reading-font', font)
  try {
    localStorage.setItem(FONT_STORAGE_KEY, font)
  } catch {
    // ignore
  }
}

interface FontSwitcherProps {
  /** Direction the menu opens. Use 'up' in the footer. */
  placement?: 'down' | 'up'
}

export default function FontSwitcher({ placement = 'down' }: FontSwitcherProps) {
  const t = useTranslations('Nav.font')
  const [mounted, setMounted] = useState(false)
  const [current, setCurrent] = useState<ReadingFont>('inter')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return
      setMounted(true)
      try {
        const stored = localStorage.getItem(FONT_STORAGE_KEY) as ReadingFont | null
        if (stored && READING_FONTS.includes(stored)) setCurrent(stored)
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

  const handlePick = (font: ReadingFont) => {
    setCurrent(font)
    applyFont(font)
    setOpen(false)
    track('reading_font_change', { font })
  }

  const currentMeta = FONTS.find((f) => f.id === current) ?? FONTS[0]
  const ariaLabel = `${t('label')}: ${currentMeta.label}`

  return (
    <div
      className={`font-switcher font-switcher--${placement}`}
      ref={ref}
    >
      <button
        type="button"
        className="font-switcher__trigger"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <LuType size={16} aria-hidden="true" />
        <span className="font-switcher__current" aria-hidden="true">
          {mounted ? currentMeta.label : 'Aa'}
        </span>
      </button>

      {open && (
        <div role="menu" className="font-switcher__menu">
          <p className="font-switcher__title">{t('label')}</p>
          <ul className="font-switcher__list">
            {FONTS.map((f) => {
              const active = f.id === current
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    className={`font-switcher__option${active ? ' is-active' : ''}`}
                    onClick={() => handlePick(f.id)}
                  >
                    <span className="font-switcher__option-meta">
                      <span className="font-switcher__option-name">{f.label}</span>
                      <span className="font-switcher__option-kind">
                        {f.kind === 'serif' ? t('serif') : t('sans')}
                      </span>
                    </span>
                    <span
                      className="font-switcher__option-sample"
                      style={f.sampleStyle}
                    >
                      Aa Bg
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
