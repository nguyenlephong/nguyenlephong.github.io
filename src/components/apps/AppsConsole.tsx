'use client'

import { useEffect, useRef } from 'react'
import { LuArrowUpRight, LuDownload, LuFileText, LuGithub } from 'react-icons/lu'
import { APP_ROUTE } from '@/app/app.const'
import type {
  AppShowcaseItem,
  AppsCopyLocale,
  AppsPageCopy,
} from '@/app/[locale]/(site)/apps/apps.data'
import { Link } from '@/i18n/navigation'
import { track } from '@/lib/analytics'
import GlanceVisual from './GlanceVisual'

type LinkKind = 'repo' | 'download' | 'docs'

interface AppsConsoleProps {
  apps: AppShowcaseItem[]
  copy: AppsPageCopy
  copyLocale: AppsCopyLocale
}

const LINK_ICONS = { repo: LuGithub, download: LuDownload, docs: LuFileText } as const

// Plain list of shipped apps: one article per app, no filters, no timers.
export default function AppsConsole({ apps, copy, copyLocale }: AppsConsoleProps) {
  return (
    <>
      <header className="apps-header">
        <h1 className="apps-title">{copy.title}</h1>
        <p className="apps-sub">{copy.sub}</p>
        <Link
          href={APP_ROUTE.HOME}
          prefetch={false}
          className="page-back"
          data-track="cv_nav_click"
          data-track-target="home"
          data-track-source="apps_page_back"
        >
          {copy.back}
        </Link>
      </header>

      <div className="apps-list">
        {apps.map((app, index) => (
          <AppArticle
            key={app.id}
            app={app}
            position={index + 1}
            copy={copy}
            copyLocale={copyLocale}
          />
        ))}
      </div>

      <footer className="apps-lab-note">
        <p>{copy.labNote}</p>
        <Link
          href="https://github.com/nguyenlephong?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="apps-text-link"
          data-track="apps_cta_click"
          data-track-target="github_repositories"
        >
          {copy.github}
          <LuArrowUpRight aria-hidden="true" />
        </Link>
      </footer>
    </>
  )
}

function AppArticle({
  app,
  position,
  copy,
  copyLocale,
}: {
  app: AppShowcaseItem
  position: number
  copy: AppsPageCopy
  copyLocale: AppsCopyLocale
}) {
  const ref = useRef<HTMLElement>(null)
  const text = app.copy[copyLocale]

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        track('apps_card_view', {
          app_id: app.id,
          app_name: app.name,
          app_status: app.status,
          position,
          source: 'apps_list',
        })
      },
      { threshold: 0.4 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [app.id, app.name, app.status, position])

  const links = (['repo', 'download', 'docs'] as const).filter((kind) => app.links[kind])
  const trackLink = (kind: LinkKind): void => {
    track('apps_link_click', {
      app_id: app.id,
      app_name: app.name,
      link_kind: kind,
      position,
      source: 'apps_list',
    })
  }

  return (
    <article ref={ref} className="apps-item" aria-labelledby={`app-${app.id}-name`}>
      <div className="apps-item-aside">
        <div className="apps-item-visual">{app.visual === 'glance' && <GlanceVisual />}</div>
        <p id={`app-${app.id}-hotkeys`} className="apps-hotkeys-title">
          {copy.hotkeys}
        </p>
        <dl className="apps-hotkeys" aria-labelledby={`app-${app.id}-hotkeys`}>
          {app.hotkeys.map((hotkey) => (
            <div key={hotkey.keys.join('')} className="apps-hotkey-row">
              <dt>
                {hotkey.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </dt>
              <dd>{hotkey.action[copyLocale]}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="apps-item-body">
        <h2 id={`app-${app.id}-name`} className="apps-item-name">
          {app.name}
        </h2>
        <p className="apps-item-meta">
          {copy.status[app.status]} {app.version} · {app.platforms.join(', ')}, {text.hardware} ·{' '}
          {app.stack.join(', ')} · {app.license}
        </p>
        <p className="apps-item-tagline">{text.tagline}</p>

        <ul className="apps-item-facts">
          {text.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>


        <div className="apps-item-actions">
          {links.map((kind, i) => {
            const Icon = LINK_ICONS[kind]
            return (
              <Link
                key={kind}
                href={app.links[kind] ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => trackLink(kind)}
              >
                <Icon aria-hidden="true" />
                {copy.links[kind]}
              </Link>
            )
          })}
        </div>
      </div>
    </article>
  )
}
