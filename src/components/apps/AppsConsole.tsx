'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { IconType } from 'react-icons'
import {
  LuActivity,
  LuArrowUpRight,
  LuCode2,
  LuCommand,
  LuCpu,
  LuDownload,
  LuExternalLink,
  LuFileText,
  LuGithub,
  LuLayers,
  LuSearch,
  LuTerminalSquare,
  LuX,
} from 'react-icons/lu'
import { APP_ROUTE } from '@/app/app.const'
import type { AppShowcaseItem } from '@/app/[locale]/apps/apps.data'
import { Link } from '@/i18n/navigation'
import { track } from '@/lib/analytics'
import EnglishVisual from './EnglishVisual'
import GlanceVisual from './GlanceVisual'

type LinkKind = 'app' | 'repo' | 'download' | 'docs' | 'website'

interface AppsConsoleProps {
  apps: AppShowcaseItem[]
  locale: string
}

const copy = {
  vi: {
    eyebrow: 'Apps · Product lab',
    title: 'Công cụ nhỏ, chạy như sản phẩm thật.',
    titleAccent: 'Gọn, nhanh, có chủ đích.',
    intro:
      'Đây là nơi mình đặt những utility được build từ vấn đề gặp thật trong công việc: ít thao tác hơn, ít ngắt mạch suy nghĩ hơn, nhưng vẫn đủ kỹ để dùng mỗi ngày.',
    back: 'Về CV',
    github: 'GitHub lab',
    command: 'apps.inspect --live',
    live: 'Live',
    searchPlaceholder: 'Tìm theo app, tech, feature...',
    allPlatforms: 'Tất cả platform',
    match: 'đang khớp',
    reset: 'Xoá lọc',
    empty: 'Không có app nào khớp. Thử xoá filter hoặc tìm bằng tech stack.',
    metrics: {
      liveApps: 'Live apps',
      platforms: 'Platforms',
      stack: 'Stack signals',
    },
    indexTitle: 'App index',
    focusTitle: 'Focus panel',
    workflowTitle: 'Workflow signal',
    detailTitle: 'Tại sao đáng dùng',
    hotkeyTitle: 'Hotkey flow',
    statsTitle: 'Build facts',
    techTitle: 'Tech stack',
    status: {
      shipped: 'Shipped',
      beta: 'Beta',
      wip: 'In progress',
    },
    links: {
      app: 'Mở app',
      repo: 'Source',
      download: 'Download',
      docs: 'Docs',
      website: 'Website',
    },
    roadmapTitle: 'Lab notes',
    roadmapBody:
      'Mỗi app mới sẽ chỉ xuất hiện khi nó giải quyết được một tình huống đủ rõ. Làm ít hơn, nhưng chăm hơn.',
  },
  en: {
    eyebrow: 'Apps · Product lab',
    title: 'Small tools that behave like real products.',
    titleAccent: 'Lean, fast, intentional.',
    intro:
      'A focused lab for utilities born from real work: fewer clicks, fewer context switches, and enough craft to stay useful every day.',
    back: 'Back to CV',
    github: 'GitHub lab',
    command: 'apps.inspect --live',
    live: 'Live',
    searchPlaceholder: 'Search app, tech, feature...',
    allPlatforms: 'All platforms',
    match: 'matching',
    reset: 'Reset',
    empty: 'No app matches this view. Clear the filter or search by tech stack.',
    metrics: {
      liveApps: 'Live apps',
      platforms: 'Platforms',
      stack: 'Stack signals',
    },
    indexTitle: 'App index',
    focusTitle: 'Focus panel',
    workflowTitle: 'Workflow signal',
    detailTitle: 'Why it earns a spot',
    hotkeyTitle: 'Hotkey flow',
    statsTitle: 'Build facts',
    techTitle: 'Tech stack',
    status: {
      shipped: 'Shipped',
      beta: 'Beta',
      wip: 'In progress',
    },
    links: {
      app: 'Open app',
      repo: 'Source',
      download: 'Download',
      docs: 'Docs',
      website: 'Website',
    },
    roadmapTitle: 'Lab notes',
    roadmapBody:
      'New apps land here only when the problem is clear enough. Fewer launches, better care.',
  },
} as const

function getCopy(locale: string) {
  return locale === 'vi' ? copy.vi : copy.en
}

function renderVisual(visual: AppShowcaseItem['visual']) {
  if (visual === 'glance') return <GlanceVisual />
  if (visual === 'english') return <EnglishVisual />
  return <div className="app-visual app-visual--placeholder" aria-hidden="true" />
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values))
}

function matchesApp(app: AppShowcaseItem, query: string, platform: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  const platformMatches = platform === 'all' || app.platforms.includes(platform)
  if (!platformMatches) return false
  if (!normalizedQuery) return true

  const haystack = [
    app.name,
    app.tagline,
    app.description,
    app.longDescription,
    ...app.features,
    ...app.tech,
    ...app.platforms,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

export default function AppsConsole({ apps, locale }: AppsConsoleProps) {
  const t = getCopy(locale)
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('all')
  const [activeId, setActiveId] = useState(apps[0]?.id ?? '')
  const [activeSignal, setActiveSignal] = useState(0)
  const seenAppsRef = useRef<Set<string>>(new Set())

  const platforms = useMemo(
    () => uniqueValues(apps.flatMap((app) => app.platforms)),
    [apps]
  )

  const filteredApps = useMemo(
    () => apps.filter((app) => matchesApp(app, query, platform)),
    [apps, platform, query]
  )

  const activeApp = useMemo(
    () =>
      filteredApps.find((app) => app.id === activeId) ??
      filteredApps[0] ??
      apps.find((app) => app.id === activeId) ??
      apps[0],
    [activeId, apps, filteredApps]
  )

  const activeIndex = activeApp
    ? Math.max(0, apps.findIndex((app) => app.id === activeApp.id))
    : 0

  const workflowSignals = useMemo(() => {
    if (!activeApp) return []
    if (activeApp.hotkey?.length) {
      return activeApp.hotkey.map((item) => ({
        label: item.label,
        value: item.keys.join(' '),
      }))
    }
    return activeApp.features.slice(0, 3).map((feature, index) => ({
      label: feature,
      value: `0${index + 1}`,
    }))
  }, [activeApp])

  useEffect(() => {
    if (!activeApp || seenAppsRef.current.has(activeApp.id)) return
    seenAppsRef.current.add(activeApp.id)
    track('apps_card_view', {
      app_id: activeApp.id,
      app_name: activeApp.name,
      app_status: activeApp.status,
      position: activeIndex + 1,
      source: 'apps_console_focus',
    })
  }, [activeApp, activeIndex])

  useEffect(() => {
    if (workflowSignals.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveSignal((current) => (current + 1) % workflowSignals.length)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [workflowSignals.length])

  if (!activeApp) return null

  const visibleSignal = workflowSignals.length > 0 ? activeSignal % workflowSignals.length : 0
  const totalTech = uniqueValues(apps.flatMap((app) => app.tech)).length
  const metricItems = [
    { label: t.metrics.liveApps, value: String(apps.length), icon: LuActivity },
    { label: t.metrics.platforms, value: String(platforms.length), icon: LuLayers },
    { label: t.metrics.stack, value: String(totalTech), icon: LuCpu },
  ] satisfies Array<{ label: string; value: string; icon: IconType }>

  const selectApp = (app: AppShowcaseItem): void => {
    setActiveId(app.id)
    track('apps_app_select', {
      app_id: app.id,
      app_name: app.name,
      app_status: app.status,
      position: apps.findIndex((item) => item.id === app.id) + 1,
    })
  }

  const selectPlatform = (value: string): void => {
    setPlatform(value)
    track('apps_filter_click', { filter_kind: 'platform', filter_value: value })
  }

  const resetFilters = (): void => {
    setQuery('')
    setPlatform('all')
    track('apps_filter_click', { filter_kind: 'reset', filter_value: 'all' })
  }

  const trackLink = (kind: LinkKind): void => {
    track('apps_link_click', {
      app_id: activeApp.id,
      app_name: activeApp.name,
      link_kind: kind,
      position: activeIndex + 1,
      source: 'apps_console_focus',
    })
  }

  const actionLinks = [
    { kind: 'app', href: activeApp.links.app, label: t.links.app, icon: LuArrowUpRight, variant: 'btn-primary' },
    { kind: 'repo', href: activeApp.links.repo, label: t.links.repo, icon: LuGithub, variant: 'btn-primary' },
    {
      kind: 'download',
      href: activeApp.links.download,
      label: t.links.download,
      icon: LuDownload,
      variant: 'btn-secondary',
    },
    { kind: 'docs', href: activeApp.links.docs, label: t.links.docs, icon: LuFileText, variant: 'btn-ghost' },
    {
      kind: 'website',
      href: activeApp.links.website,
      label: t.links.website,
      icon: LuExternalLink,
      variant: 'btn-ghost',
    },
  ] satisfies Array<{
    kind: LinkKind
    href?: string
    label: string
    icon: IconType
    variant: string
  }>

  return (
    <section className="apps-console" aria-label="Apps product lab">
      <header className="apps-lab-hero">
        <div className="apps-hero-copy">
          <span className="eyebrow apps-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" /> {t.eyebrow}
          </span>
          <h1 className="apps-hero-title">
            {t.title}
            <span>{t.titleAccent}</span>
          </h1>
          <p className="apps-hero-sub">{t.intro}</p>
          <div className="apps-hero-actions">
            <Link href={APP_ROUTE.HOME} className="page-back">
              {t.back}
            </Link>
            <Link
              href="https://github.com/nguyenlephong"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              data-track="apps_cta_click"
              data-track-target="github_lab"
            >
              <LuGithub aria-hidden="true" />
              {t.github}
            </Link>
          </div>
        </div>

        <div className="apps-command-panel" aria-label="Apps command panel">
          <div className="apps-command-topline">
            <LuTerminalSquare aria-hidden="true" />
            <span>{t.command}</span>
            <span className="apps-live-pill">{t.live}</span>
          </div>

          <label className="apps-search" htmlFor="apps-search">
            <LuSearch aria-hidden="true" />
            <input
              id="apps-search"
              type="search"
              value={query}
              placeholder={t.searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label={t.reset}>
                <LuX aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="apps-filter-row" aria-label="Platform filters">
            <button
              type="button"
              className={platform === 'all' ? 'is-active' : undefined}
              onClick={() => selectPlatform('all')}
            >
              {t.allPlatforms}
            </button>
            {platforms.map((item) => (
              <button
                key={item}
                type="button"
                className={platform === item ? 'is-active' : undefined}
                onClick={() => selectPlatform(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="apps-console-metrics">
            {metricItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="apps-console-metric">
                  <Icon aria-hidden="true" />
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <div className="apps-workbench">
        <aside className="apps-index-panel" aria-label={t.indexTitle}>
          <div className="apps-panel-head">
            <div>
              <span>{t.indexTitle}</span>
              <strong>
                {filteredApps.length}/{apps.length} {t.match}
              </strong>
            </div>
            {(query || platform !== 'all') && (
              <button type="button" onClick={resetFilters}>
                {t.reset}
              </button>
            )}
          </div>

          {filteredApps.length > 0 ? (
            <div className="apps-stack">
              {filteredApps.map((app, index) => (
                <button
                  key={app.id}
                  type="button"
                  className={app.id === activeApp.id ? 'apps-stack-item is-active' : 'apps-stack-item'}
                  onClick={() => selectApp(app)}
                  aria-pressed={app.id === activeApp.id}
                >
                  <span className="apps-stack-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="apps-stack-main">
                    <span className="apps-stack-name">{app.name}</span>
                    <span className="apps-stack-tagline">{app.tagline}</span>
                  </span>
                  <span className="apps-stack-status">
                    <span className={`app-status-dot app-status-dot--${app.status === 'shipped' ? 'green' : app.status}`} />
                    {t.status[app.status]}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="apps-empty">{t.empty}</p>
          )}

          <div className="apps-signal-log" aria-label={t.workflowTitle}>
            <div className="apps-signal-head">
              <LuCommand aria-hidden="true" />
              <span>{t.workflowTitle}</span>
            </div>
            {workflowSignals.map((signal, index) => (
              <div
                key={`${signal.label}-${signal.value}`}
                className={index === visibleSignal ? 'apps-signal-line is-active' : 'apps-signal-line'}
              >
                <code>{signal.value}</code>
                <span>{signal.label}</span>
              </div>
            ))}
          </div>
        </aside>

        <article
          className={`apps-focus app-card--accent-${activeApp.accent ?? 'blue'}`}
          aria-labelledby={`apps-focus-${activeApp.id}`}
        >
          <div className="apps-focus-preview">{renderVisual(activeApp.visual)}</div>

          <div className="apps-focus-body">
            <div className="apps-focus-kicker">
              <span>{t.focusTitle}</span>
              <span>{t.status[activeApp.status]}</span>
            </div>

            <h2 id={`apps-focus-${activeApp.id}`} className="apps-focus-title">
              {activeApp.name}
            </h2>
            <p className="apps-focus-tagline">{activeApp.tagline}</p>
            <p className="apps-focus-desc">{activeApp.longDescription ?? activeApp.description}</p>

            <div className="apps-focus-actions">
              {actionLinks
                .filter((link) => Boolean(link.href))
                .map((link) => {
                  const Icon = link.icon
                  const isExternal = link.kind !== 'app'
                  return (
                    <Link
                      key={link.kind}
                      href={link.href ?? '#'}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className={`btn ${link.variant}`}
                      onClick={() => trackLink(link.kind)}
                    >
                      <Icon aria-hidden="true" />
                      {link.label}
                      {isExternal && <LuArrowUpRight aria-hidden="true" />}
                    </Link>
                  )
                })}
            </div>

            {activeApp.hotkey && activeApp.hotkey.length > 0 && (
              <section className="apps-focus-section" aria-labelledby="apps-hotkey-title">
                <h3 id="apps-hotkey-title">{t.hotkeyTitle}</h3>
                <div className="apps-hotkey-list">
                  {activeApp.hotkey.map((hotkey) => (
                    <div key={hotkey.label} className="apps-hotkey-row">
                      <span>
                        {hotkey.keys.map((key, index) => (
                          <kbd key={`${hotkey.label}-${index}`}>{key}</kbd>
                        ))}
                      </span>
                      <strong>{hotkey.label}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="apps-focus-section" aria-labelledby="apps-detail-title">
              <h3 id="apps-detail-title">{t.detailTitle}</h3>
              <ul className="apps-feature-list">
                {activeApp.features.map((feature) => (
                  <li key={feature}>
                    <LuCode2 aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            {activeApp.stats && activeApp.stats.length > 0 && (
              <section className="apps-focus-section" aria-labelledby="apps-stats-title">
                <h3 id="apps-stats-title">{t.statsTitle}</h3>
                <dl className="apps-stat-grid">
                  {activeApp.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt>{stat.label}</dt>
                      <dd>{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="apps-focus-section" aria-labelledby="apps-tech-title">
              <h3 id="apps-tech-title">{t.techTitle}</h3>
              <div className="app-card-tech">
                {activeApp.tech.map((item) => (
                  <span key={item} className="tech-chip">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>

      <section className="apps-lab-notes" aria-labelledby="apps-lab-notes-title">
        <div>
          <span>{t.roadmapTitle}</span>
          <h2 id="apps-lab-notes-title">{t.roadmapBody}</h2>
        </div>
        <Link
          href="https://github.com/nguyenlephong?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          data-track="apps_cta_click"
          data-track-target="github_repositories"
        >
          <LuGithub aria-hidden="true" />
          {t.github}
        </Link>
      </section>
    </section>
  )
}
