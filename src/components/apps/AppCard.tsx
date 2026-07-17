'use client'

import { useEffect, useRef } from 'react'
import { AppShowcaseItem } from '@/app/[locale]/(site)/apps/apps.data'
import { Link } from '@/i18n/navigation'
import EnglishVisual from './EnglishVisual'
import GlanceVisual from './GlanceVisual'
import { track } from '@/lib/analytics'

interface AppCardProps {
  app: AppShowcaseItem
  index: number
}

function StatusBadge({ status }: { status: AppShowcaseItem['status'] }) {
  const map = {
    shipped: { label: 'Shipped', dotClass: 'app-status-dot--green' },
    beta: { label: 'Beta', dotClass: 'app-status-dot--amber' },
    wip: { label: 'In progress', dotClass: 'app-status-dot--violet' },
  } as const
  const { label, dotClass } = map[status]
  return (
    <span className="app-status">
      <span className={`app-status-dot ${dotClass}`} />
      {label}
    </span>
  )
}

function renderVisual(visual: AppShowcaseItem['visual']) {
  if (visual === 'glance') return <GlanceVisual />
  if (visual === 'english') return <EnglishVisual />
  return <div className="app-visual app-visual--placeholder" aria-hidden="true" />
}

export default function AppCard({ app, index }: AppCardProps) {
  const number = String(index + 1).padStart(2, '0')
  const ref = useRef<HTMLElement | null>(null)
  const impressionFiredRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || impressionFiredRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressionFiredRef.current) {
            impressionFiredRef.current = true
            track('apps_card_view', {
              app_id: app.id,
              app_name: app.name,
              app_status: app.status,
              position: index + 1,
            })
            observer.disconnect()
          }
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [app.id, app.name, app.status, index])

  const handleLinkClick = (kind: 'app' | 'repo' | 'download' | 'docs' | 'website'): void => {
    track('apps_link_click', {
      app_id: app.id,
      app_name: app.name,
      link_kind: kind,
      position: index + 1,
    })
  }

  return (
    <article
      ref={ref}
      className={`app-card app-card--accent-${app.accent ?? 'blue'}`}
      aria-labelledby={`app-${app.id}-name`}
      data-app-id={app.id}
    >
      <div className="app-card-grid">
        <div className="app-card-visual">{renderVisual(app.visual)}</div>

        <div className="app-card-body">
          <div className="app-card-meta">
            <span className="app-card-number">{number}</span>
            <StatusBadge status={app.status} />
            <ul className="app-card-platforms">
              {app.platforms.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <h2 id={`app-${app.id}-name`} className="app-card-name">
            {app.name}
          </h2>
          <p className="app-card-tagline">{app.tagline}</p>
          <p className="app-card-desc">{app.description}</p>

          {app.hotkey && app.hotkey.length > 0 && (
            <ul className="app-card-hotkeys">
              {app.hotkey.map((h) => (
                <li key={h.label}>
                  <span className="app-card-hotkey-keys">
                    {h.keys.map((k, i) => (
                      <kbd key={`${h.label}-${i}`}>{k}</kbd>
                    ))}
                  </span>
                  <span className="app-card-hotkey-label">{h.label}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="app-card-section">
            <p className="app-card-section-label">Why you&apos;ll love it</p>
            <ul className="app-card-features">
              {app.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          {app.stats && app.stats.length > 0 && (
            <dl className="app-card-stats">
              {app.stats.map((s) => (
                <div key={s.label} className="app-card-stat">
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="app-card-tech">
            {app.tech.map((t) => (
              <span key={t} className="tech-chip">
                {t}
              </span>
            ))}
          </div>

          <div className="app-card-actions">
            {app.links.app && (
              <Link
                href={app.links.app}
                className="btn btn-primary"
                onClick={() => handleLinkClick('app')}
              >
                Open app
              </Link>
            )}
            {app.links.repo && (
              <Link
                href={app.links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                onClick={() => handleLinkClick('repo')}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                </svg>
                View source
              </Link>
            )}
            {app.links.download && (
              <Link
                href={app.links.download}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                onClick={() => handleLinkClick('download')}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </Link>
            )}
            {app.links.website && (
              <Link
                href={app.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                onClick={() => handleLinkClick('website')}
              >
                Open website
              </Link>
            )}
            {app.links.docs && (
              <Link
                href={app.links.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                onClick={() => handleLinkClick('docs')}
              >
                Read docs
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
