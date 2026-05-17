'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { APP_ROUTE } from '@/app/app.const'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { track } from '@/lib/analytics'

export default function AppHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const sections: { id: string; label: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
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
              {s.label}
            </Link>
          ))}
          <Link
            href={APP_ROUTE.GALLERY}
            className="nav-link"
            onClick={() => track('cv_nav_click', { target: 'gallery' })}
          >
            Gallery
          </Link>
        </nav>

        <div className="nav-actions">
          <ThemeToggle />
          <Link
            href={APP_ROUTE.CV_PDF}
            target="_blank"
            className="btn btn-primary btn-sm"
            onClick={() => track('cv_resume_download', { source: 'nav' })}
          >
            Résumé
          </Link>
        </div>
      </div>
    </header>
  )
}
