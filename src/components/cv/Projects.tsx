'use client'
import { useEffect, useRef } from 'react'
import { LuArrowUp } from 'react-icons/lu'
import { useTranslations } from 'next-intl'
import { ProjectType } from '@/app/app.type'
import CaseFile, { caseFileId, openCaseFile, trackProjectView, type CaseFileKey } from './CaseFile'

type Props = { data: ProjectType[] }

const PROJECT_KEY_MAP: Record<string, string> = {
  'LogiUP - Multi-tenant Logistics SaaS': 'logiup',
  'BonBon Mobility - VETC Mini App & Automotive Platform': 'bonbon',
  'Digital SAT Math': 'sat',
  'Vietnam Australia Center': 'vac',
}
const CASE_FILES: readonly string[] = ['logiup', 'bonbon'] satisfies CaseFileKey[]

/** "Oct 2023 - Apr 2025" → "2023–2025", "Mar 2026 - Present" → "2026–", "May 2023" → "2023". */
function yearSpan(duration: string): string {
  const [from, to] = duration.match(/\d{4}/g) ?? []
  if (/present/i.test(duration)) return `${from}–`
  return to && to !== from ? `${from}–${to}` : (from ?? '')
}

export default function Projects({ data }: Props) {
  const t = useTranslations('Projects')
  const rows = data.filter((p) => PROJECT_KEY_MAP[p.name])
  const tbodyRef = useRef<HTMLTableSectionElement>(null)

  // Index rows count as a project view at 50% too, so every project keeps `cv_project_view`.
  useEffect(() => {
    const rowEls = tbodyRef.current?.querySelectorAll<HTMLElement>('tr[data-project]')
    if (!rowEls?.length) return
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
    rowEls.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div className="case-files">
        {rows
          .filter((p) => CASE_FILES.includes(PROJECT_KEY_MAP[p.name]))
          .map((p) => (
            <CaseFile key={p.name} id={PROJECT_KEY_MAP[p.name] as CaseFileKey} project={p} />
          ))}
      </div>

      <div className="project-index">
        <h3 className="project-index-title">{t('labels.indexTitle')}</h3>
        <table className="pi-table">
          <thead>
            <tr>
              <th scope="col">{t('labels.year')}</th>
              <th scope="col">{t('labels.project')}</th>
              <th scope="col">{t('labels.role')}</th>
              <th scope="col">{t('labels.result')}</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {rows.map((p) => {
              const key = PROJECT_KEY_MAP[p.name]
              const caseKey = CASE_FILES.includes(key) ? (key as CaseFileKey) : null
              return (
                <tr key={p.name} data-project={p.name}>
                  <td className="pi-year">{yearSpan(p.duration)}</td>
                  <td className="pi-name">
                    {caseKey ? (
                      <a href={`#${caseFileId(caseKey)}`} onClick={() => openCaseFile(caseKey, 'index')}>
                        {t(`${key}.name`)}
                        <LuArrowUp size={13} aria-hidden="true" />
                      </a>
                    ) : (
                      t(`${key}.name`)
                    )}
                  </td>
                  <td className="pi-role">{t(`${key}.role`)}</td>
                  <td
                    className="pi-outcome"
                    dangerouslySetInnerHTML={{ __html: t.raw(`${key}.index`) as string }}
                  />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
