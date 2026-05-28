'use client'
import { Link } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { APP_ROUTE } from '@/app/app.const'
import ThemeToggle from '@/components/theme/ThemeToggle'
import FontSwitcher from '@/components/font/FontSwitcher'
import { track } from '@/lib/analytics'

export default function AppHeader() {
  const t = useTranslations('Nav')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const sections: { id: string; key: 'about' | 'experience' | 'projects' | 'contact' }[] = [
    { id: 'about', key: 'about' },
    { id: 'experience', key: 'experience' },
    { id: 'projects', key: 'projects' },
    { id: 'contact', key: 'contact' },
  ]

  return (
    <header className={`app-nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="app-nav-inner">
        <Link
          href={APP_ROUTE.HOME}
          className="brand"
          onClick={() => track('cv_nav_click', { target: 'home' })}
        >
          <span className="brand-mark" aria-hidden="true">NLP</span>
          <span className="brand-text">Nguyen Le Phong</span>
        </Link>

        <nav className="nav-links" aria-label="Sections">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              className="nav-link"
              onClick={() => track('cv_nav_click', { target: s.id })}
            >
              {t(s.key)}
            </Link>
          ))}
          <Link
            href={APP_ROUTE.GALLERY}
            className="nav-link"
            onClick={() => track('cv_nav_click', { target: 'gallery' })}
          >
            {t('gallery')}
          </Link>
        </nav>

        <div className="nav-actions">
          <FontSwitcher />
          <ThemeToggle />
          <a
            href={APP_ROUTE.CV_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            onClick={() => track('cv_resume_download', { source: 'nav' })}
          >
            {t('resume')}
          </a>
        </div>
      </div>
    </header>
  )
}
