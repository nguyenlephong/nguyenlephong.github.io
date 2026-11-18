'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { KeyboardEvent, ReactNode } from 'react'
import { ThemeToggleControl } from '@/components/theme/ThemeToggle'
import { useAdminText } from './admin-i18n'
import type { AdminLocale } from './admin-locale'

// The homepage's particle field, same component and worker; only its scroll root differs.
const ArchitectureBackdrop = dynamic(() => import('@/components/cv/ArchitectureBackdrop'), { ssr: false })

interface AdminStageProps {
  /** `checking` until the gate has read storage; CSS keeps VI readers from seeing the English prerender. */
  phase: string
  actions?: ReactNode
  children: ReactNode
}

const LOCALES: AdminLocale[] = ['en', 'vi']

/** EN / VI, the same radio pattern and look as the theme control beside it. */
function LanguageToggle() {
  const { locale, setLocale, t } = useAdminText()
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]!
    setLocale(next)
    event.currentTarget.querySelectorAll('button')[LOCALES.indexOf(next)]?.focus()
  }
  return (
    <div className="theme-toggle admin-lang" role="radiogroup" aria-label={t.language} onKeyDown={onKeyDown}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          lang={option}
          aria-checked={locale === option}
          aria-label={option === 'en' ? 'English' : 'Tiếng Việt'}
          tabIndex={locale === option ? 0 : -1}
          className={`theme-toggle-btn admin-lang__btn${locale === option ? ' is-active' : ''}`}
          onClick={() => setLocale(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** Page shell for the lock screen and the dashboard, so the field never remounts on unlock. */
export default function AdminStage({ phase, actions, children }: AdminStageProps) {
  const { locale, t } = useAdminText()
  return (
    <div className="admin-showcase" data-phase={phase}>
      <div className="home-architecture" aria-hidden="true">
        <div className="home-architecture-viewport">
          <ArchitectureBackdrop rootSelector=".admin-showcase" />
        </div>
      </div>
      <header className="admin-header">
        <div className="admin-container admin-header__inner">
          <Link className="admin-brand" href={`/${locale}`} prefetch={false}>
            <span className="admin-brand__node" aria-hidden="true" />
            <span className="admin-brand__name">Nguyen Le Phong</span>
            <span className="admin-brand__area">{t.brandArea}</span>
          </Link>
          <div className="admin-header__actions">
            <LanguageToggle />
            <ThemeToggleControl labels={t.theme} />
            {actions}
          </div>
        </div>
      </header>
      <div className="admin-container admin-content">{children}</div>
    </div>
  )
}
