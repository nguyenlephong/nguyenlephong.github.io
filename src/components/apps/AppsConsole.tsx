'use client'

import { Fragment, useEffect, useRef, type CSSProperties } from 'react'
import { LuArrowUpRight, LuBookOpen, LuDownload, LuFileText, LuGithub } from 'react-icons/lu'
import { APP_ROUTE } from '@/app/app.const'
import type {
  AppLinks,
  AppShowcaseItem,
  AppsCopyLocale,
  AppsPageCopy,
} from '@/app/[locale]/(site)/apps/apps.data'
import { Link } from '@/i18n/navigation'
import { track } from '@/lib/analytics'
import DishReel from './DishReel'
import GlanceDemo from './GlanceDemo'

type LinkKind = keyof AppLinks

interface AppsConsoleProps {
  apps: AppShowcaseItem[]
  copy: AppsPageCopy
  copyLocale: AppsCopyLocale
}

// Install-first order: the first link present is the app's main action.
const LINK_KINDS = ['site', 'download', 'article', 'docs', 'repo'] as const
const LINK_ICONS = {
  site: LuArrowUpRight,
  article: LuBookOpen,
  repo: LuGithub,
  download: LuDownload,
  docs: LuFileText,
} as const

// One stage per shipped app, each with a demo you can play before leaving the page. No filters, no timers.
export default function AppsConsole({ apps, copy, copyLocale }: AppsConsoleProps) {
  return (
    <>
      <header className="apps-header">
        <h1 className="apps-title">
          {/* Words rise in one by one on load; the heading text stays whole for readers and search. */}
          {copy.title.split(' ').map((word, i) => (
            <Fragment key={`${i}-${word}`}>
              {i > 0 && ' '}
              <span className="apps-title-word" style={{ '--w': i } as CSSProperties}>
                {word}
              </span>
            </Fragment>
          ))}
        </h1>
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
          <AppStage
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

interface AppStageProps {
  app: AppShowcaseItem
  position: number
  copy: AppsPageCopy
  copyLocale: AppsCopyLocale
}

function useCardView(app: AppShowcaseItem, position: number) {
  const ref = useRef<HTMLElement>(null)
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
  return ref
}

function AppStage({ app, position, copy, copyLocale }: Readonly<AppStageProps>) {
  const ref = useCardView(app, position)
  const text = app.copy[copyLocale]
  const appLinks: AppLinks = app.links
  const links = LINK_KINDS.filter((kind) => appLinks[kind])
  // With the dish reel, its result button is the way into the app, so the other links stay quiet.
  const primaryIndex = app.dishes ? -1 : 0

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
    <article
      ref={ref}
      id={`app-${app.id}`}
      className="apps-stage"
      data-app={app.id}
      aria-labelledby={`app-${app.id}-name`}
    >
      <div className="apps-stage-head">
        <h2 id={`app-${app.id}-name`} className="apps-stage-name">
          <span className="apps-stage-icon" aria-hidden="true" />
          {app.name}
        </h2>
        <p className="apps-stage-tagline">{text.tagline}</p>
      </div>

      {/* DishReel places its own play and visual cells in the stage grid. */}
      {app.dishes && (
        <DishReel
          dishes={app.dishes}
          locale={copyLocale}
          lead={copy.dishLead}
          spinLabel={copy.spin}
          openTemplate={copy.openDish}
        />
      )}
      {app.glanceDemo && (
        <div className="apps-stage-play">
          <GlanceDemo
            demo={app.glanceDemo}
            hint={copy.glanceHint}
            replaceLabel={app.hotkeys[1]?.action[copyLocale] ?? ''}
          />
        </div>
      )}

      <div className="apps-stage-actions">
        {app.hotkeys.length > 0 && (
          <dl className="apps-hotkeys" aria-label={copy.hotkeys}>
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
        )}
        <div className="apps-stage-links">
          {links.map((kind, i) => {
            const Icon = LINK_ICONS[kind]
            const href = appLinks[kind] ?? '#'
            const external = !href.startsWith('/')
            return (
              <Link
                key={kind}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                prefetch={external ? undefined : false}
                className={`apps-btn ${i === primaryIndex ? 'apps-btn--primary' : 'apps-btn--quiet'}`}
                onClick={() => trackLink(kind)}
              >
                <Icon aria-hidden="true" />
                {copy.links[kind]}
              </Link>
            )
          })}
        </div>
        <p className="apps-stage-meta">
          {copy.status[app.status]} <span className="apps-mono">{app.version}</span>,{' '}
          {app.platforms.join(', ')}, {text.hardware}. {app.stack.join(', ')}. {app.license}.
        </p>
      </div>

      <ul className="apps-stage-facts">
        {text.facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </article>
  )
}
