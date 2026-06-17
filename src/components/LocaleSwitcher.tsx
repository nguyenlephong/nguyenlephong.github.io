'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing, LOCALE_LABELS, type Locale } from '@/i18n/routing'
import { LuCheck, LuChevronDown } from 'react-icons/lu'
import { track } from '@/lib/analytics'

interface LocaleSwitcherProps {
  placement?: 'up' | 'down'
  compact?: boolean
}

export default function LocaleSwitcher({
  placement = 'up',
  compact = false,
}: LocaleSwitcherProps) {
  const t = useTranslations('Footer')
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale() as Locale
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(event: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function selectLocale(nextLocale: Locale) {
    if (nextLocale === currentLocale) {
      setOpen(false)
      return
    }
    track('locale_change', { from: currentLocale, to: nextLocale })
    setOpen(false)
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  const current = LOCALE_LABELS[currentLocale]

  return (
    <div
      ref={rootRef}
      className={[
        'locale-menu',
        `locale-menu--${placement}`,
        compact ? 'locale-menu--compact' : '',
        open ? 'is-open' : '',
        isPending ? 'is-pending' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        ref={triggerRef}
        type="button"
        className="locale-menu-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language')}
        title={t('language')}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="locale-flag" aria-hidden="true">{current.flag}</span>
        <span className="locale-name">{current.name}</span>
        <LuChevronDown size={14} className="locale-caret" aria-hidden="true" />
      </button>

      <ul
        className="locale-menu-list"
        role="listbox"
        aria-label={t('language')}
        tabIndex={-1}
      >
        {routing.locales.map((loc) => {
          const isActive = loc === currentLocale
          const meta = LOCALE_LABELS[loc]
          return (
            <li key={loc} role="none">
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                className={`locale-menu-item${isActive ? ' is-active' : ''}`}
                onClick={() => selectLocale(loc)}
              >
                <span className="locale-flag" aria-hidden="true">{meta.flag}</span>
                <span className="locale-name">{meta.name}</span>
                <span className="locale-code" aria-hidden="true">{loc.toUpperCase()}</span>
                {isActive && (
                  <span className="locale-check" aria-hidden="true">
                    <LuCheck size={14} strokeWidth={3} />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
