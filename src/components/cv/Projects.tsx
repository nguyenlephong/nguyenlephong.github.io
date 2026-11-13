'use client'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ProjectType } from '@/app/app.type'
import CaseFile, { bold, trackProjectView, type CaseFileKey } from './CaseFile'

type Props = { data: ProjectType[] }

const CASE_FILES: Record<string, CaseFileKey> = {
  'LogiUP - Multi-tenant Logistics SaaS': 'logiup',
  'BonBon Mobility - VETC Mini App & Automotive Platform': 'bonbon',
}
// Smaller, earlier work: kept on the page under its own heading, never as a third "system".
const MORE: Record<string, string> = {
  'Digital SAT Math': 'sat',
  'Vietnam Australia Center': 'vac',
}

/** "Oct 2023 - Apr 2025" → "2023–2025", "Mar 2026 - Present" → "2026–", "May 2023" → "2023". */
function yearSpan(duration: string): string {
  const [from, to] = duration.match(/\d{4}/g) ?? []
  if (/present/i.test(duration)) return `${from}–`
  return to && to !== from ? `${from}–${to}` : (from ?? '')
}

export default function Projects({ data }: Props) {
  const t = useTranslations('Projects')
  const more = data.filter((p) => MORE[p.name])
  const listRef = useRef<HTMLUListElement>(null)

  // The smaller entries count as a project view at 50% too, so every project keeps `cv_project_view`.
  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-project]')
    if (!items?.length) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio < 0.5) continue
          trackProjectView(e.target.getAttribute('data-project') ?? '')
          io.unobserve(e.target)
        }
      },
      { threshold: 0.5 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div className="case-files">
        {data
          .filter((p) => CASE_FILES[p.name])
          .map((p) => (
            <CaseFile key={p.name} id={CASE_FILES[p.name]} project={p} />
          ))}
      </div>

      <section className="project-more" aria-labelledby="project-more-title">
        <h3 id="project-more-title" className="project-more-title">
          {t('labels.moreTitle')}
        </h3>
        <ul ref={listRef} className="pm-list">
          {more.map((p) => {
            const key = MORE[p.name]
            return (
              <li key={p.name} className="pm-item" data-project={p.name}>
                <h4 className="pm-name">
                  {t(`${key}.name`)} <span className="pm-period">{yearSpan(p.duration)}</span>
                </h4>
                <p className="pm-proof">{t.rich(`${key}.proof`, { b: bold })}</p>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}
