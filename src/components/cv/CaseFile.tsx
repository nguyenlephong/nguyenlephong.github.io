'use client'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useReducedMotion } from 'framer-motion'
import { LuExternalLink } from 'react-icons/lu'
import { Link } from '@/i18n/navigation'
import type { ProjectType } from '@/app/app.type'
import { track } from '@/lib/analytics'
import {
  MultiTenantDrawing,
  ZeroToPilotDrawing,
  zoneBounds,
  zonePacketPaths,
} from './CapabilityMapDiagram'

export type CaseFileKey = 'logiup' | 'bonbon'
export type CaseFileSource = 'map' | 'hero'

const OPEN_EVENT = 'casefile:open'
// The BonBon story only exists in English and Vietnamese.
const BONBON_NOTE = '/notes/the-quiet-engineering-behind-bonbons-500k-round'

export const caseFileId = (key: CaseFileKey): string => `case-${key}`

// shortcut: module-level, so a client-side return to the page does not re-send views.
const viewedProjects = new Set<string>()
/** `cv_project_view` once per project per page load, shared by case files and the smaller entries. */
export function trackProjectView(project: string): void {
  if (viewedProjects.has(project)) return
  viewedProjects.add(project)
  track('cv_project_view', { project })
}

/** Track the jump; the case file replays its figure once it is in view. */
export function openCaseFile(project: CaseFileKey, source: CaseFileSource): void {
  track('cv_case_file_open', { project, source })
  window.dispatchEvent(new CustomEvent<CaseFileKey>(OPEN_EVENT, { detail: project }))
}

type Drawing = ComponentType<{ figure: string; live: boolean }>
const CASES: Record<CaseFileKey, { zone: 'multiTenant' | 'zeroToPilot'; Drawing: Drawing }> = {
  logiup: { zone: 'multiTenant', Drawing: MultiTenantDrawing },
  bonbon: { zone: 'zeroToPilot', Drawing: ZeroToPilotDrawing },
}

/** Case-file-only detail on the BonBon drawing: new features ship behind a kill switch. */
function KillSwitch() {
  return (
    <g>
      <rect className="cm-switch case-switch" x={1072} y={160} width={28} height={16} rx={8} />
      <circle className="cm-switch-knob case-knob" cx={1092} cy={168} r={5} />
      <text className="cm-note" x={1064} y={173} textAnchor="end">
        kill switch
      </text>
    </g>
  )
}

/** One pass of packets along the zone's edges; mounted only while the figure plays. */
function PacketsOnce({ paths }: { paths: string[] }) {
  return (
    <g className="cm-packets">
      {paths.map((d, i) => (
        <circle key={d} r={4}>
          <animateMotion dur="1.4s" begin={`${0.25 + i * 0.12}s`} fill="remove" path={d} />
        </circle>
      ))}
    </g>
  )
}

type Props = { id: CaseFileKey; project: ProjectType }

export default function CaseFile({ id, project }: Props) {
  const projects = useTranslations('Projects')
  const t = (key: string) => projects(`${id}.${key}`)
  const raw = (key: string) => projects.raw(`${id}.${key}`)
  const labels = useTranslations('Projects.labels')
  const pillars = useTranslations('Summary.pillars')
  const locale = useLocale()
  const reduced = useReducedMotion() ?? false
  const figureRef = useRef<HTMLElement>(null)
  const [plays, setPlays] = useState(0)

  const { zone, Drawing } = CASES[id]
  const b = zoneBounds[zone]

  // One observer: the first 50% view counts as a project view and plays the figure;
  // a later "open" from the map or the hero replays it on arrival.
  useEffect(() => {
    const el = figureRef.current
    if (!el) return
    let viewed = false
    let inView = false
    let pending = window.location.hash === `#${caseFileId(id)}`
    const play = () => {
      pending = false
      if (!reduced) setPlays((n) => n + 1)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.intersectionRatio >= 0.5
        if (!inView) return
        if (!viewed) {
          viewed = true
          trackProjectView(project.name)
          play()
        } else if (pending) play()
      },
      { threshold: [0, 0.5] },
    )
    const onOpen = (event: Event) => {
      if ((event as CustomEvent<CaseFileKey>).detail !== id) return
      pending = true
      if (inView) play()
    }
    io.observe(el)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      io.disconnect()
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [id, project.name, reduced])

  const decisions = raw('decisions') as string[]
  const outcome = raw('outcome') as string[]

  return (
    <article id={caseFileId(id)} className="case-file" aria-labelledby={`${caseFileId(id)}-title`}>
      <header className="case-head">
        <h3 id={`${caseFileId(id)}-title`} className="case-name">
          {t('name')} <span className="case-kind">{t('kind')}</span>
        </h3>
        <p className="case-meta">
          <span>{t('role')}</span>
          <span className="case-period">{t('period')}</span>
        </p>
      </header>
      <figure ref={figureRef} className={plays ? 'case-figure is-playing' : 'case-figure'}>
        {/* Remounting the SVG restarts its SMIL timeline and CSS animations for each play. */}
        <svg
          key={plays}
          className="case-svg"
          viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`}
          aria-hidden="true"
          focusable="false"
        >
          <Drawing figure={pillars(`${zone}.figure`)} live={false} />
          {id === 'bonbon' && <KillSwitch />}
          {plays > 0 && <PacketsOnce paths={zonePacketPaths[zone]} />}
        </svg>
      </figure>

      <div className="case-text">
        <dl className="case-spec">
          <div className="case-row">
            <dt>{labels('context')}</dt>
            <dd dangerouslySetInnerHTML={{ __html: raw('context') as string }} />
          </div>
          <div className="case-row">
            <dt>{labels('decisions')}</dt>
            <dd>
              <ul className="case-list case-decisions">
                {decisions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="case-row">
            <dt>{labels('outcome')}</dt>
            <dd>
              <ul className="case-list case-outcome">
                {outcome.map((line) => (
                  <li key={line} dangerouslySetInnerHTML={{ __html: line }} />
                ))}
              </ul>
            </dd>
          </div>
          <div className="case-row">
            <dt>{labels('evidence')}</dt>
            <dd>
              {id === 'logiup' ? (
                <p className="case-muted">{t('evidenceNote')}</p>
              ) : (
                <ul className="case-links">
                  {project.brand && (
                    <li>
                      <a
                        href={project.brand.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          track(
                            'cv_project_website_click',
                            { project: project.name, host: project.brand?.label },
                            { beacon: true },
                          )
                        }
                      >
                        {project.brand.label}
                        <LuExternalLink size={13} aria-hidden="true" />
                      </a>
                    </li>
                  )}
                  {project.evidence?.map((e) => (
                    <li key={e.href}>
                      <a
                        href={e.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          track(
                            'cv_project_evidence_click',
                            { project: project.name, publisher: e.publisher, published_at: e.publishedAt },
                            { beacon: true },
                          )
                        }
                      >
                        {labels('readCoverage', { publisher: e.publisher })}
                        <LuExternalLink size={13} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={BONBON_NOTE}
                      locale={locale === 'vi' ? 'vi' : 'en'}
                      prefetch={false}
                      onClick={() =>
                        track('cv_project_evidence_click', { project: project.name, publisher: 'note' })
                      }
                    >
                      {labels('note')}
                    </Link>
                  </li>
                </ul>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
