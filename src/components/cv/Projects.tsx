'use client'
import { LuExternalLink } from 'react-icons/lu'
import { useTranslations } from 'next-intl'
import { ProjectType } from '@/app/app.type'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { track } from '@/lib/analytics'

type Props = { data: ProjectType[] }

const PROJECT_KEY_MAP: Record<string, string> = {
  'LogiUP - Multi-tenant Logistics SaaS': 'logiup',
  'BonBon - VETC Mini App & Automotive Platform': 'bonbon',
  'Digital SAT Math': 'sat',
  CDP: 'cdp',
  'Event Tracking - Web SDK': 'sdk',
  'Vietnam Australia Center': 'vac',
  'House Management - Mona House': 'mona',
  'Bank tool - Mobivi': 'mobivi',
  'Savyu - Synova Solutions': 'savyu',
}

export default function Projects({ data }: Props) {
  const t = useTranslations('Projects')

  return (
    <Stagger className="project-grid" stagger={0.08}>
      {data.map((p) => {
        const key = PROJECT_KEY_MAP[p.name]
        const items = key
          ? (t.raw(`${key}.accomplishments`) as string[])
          : p.accomplishment
        return (
          <StaggerItem
            as="article"
            key={p.name}
            className="project-card"
            onMouseEnter={() => track('cv_project_view', { project: p.name })}
          >
            <>
              <header className="project-head">
                <h3 className="project-name">{p.name}</h3>
                <span className="project-duration">{p.duration}</span>
              </header>

              <div className="tech-row">
                {p.technologies.map((tech) => (
                  <span key={tech} className="tech-chip tech-chip-soft">
                    {tech}
                  </span>
                ))}
              </div>

              <ul className="project-bullets">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="project-bullet"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </ul>

              {p.evidence && (
                <div className="role-evidence">
                  <span className="role-evidence-label">{t('labels.publicEvidence')}</span>
                  <a
                    href={p.evidence.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track(
                        'cv_project_evidence_click',
                        {
                          project: p.name,
                          publisher: p.evidence?.publisher,
                          published_at: p.evidence?.publishedAt,
                        },
                        { beacon: true },
                      )
                    }
                  >
                    {t('labels.readCoverage', { publisher: p.evidence.publisher })}
                    <LuExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              )}
            </>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
