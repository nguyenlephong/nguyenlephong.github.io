'use client'
import { useTranslations } from 'next-intl'
import { ProjectType } from '@/app/app.type'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { track } from '@/lib/analytics'

type Props = { data: ProjectType[] }

const PROJECT_KEY_MAP: Record<string, string> = {
  'Digital SAT Math': 'sat',
  'CDP': 'cdp',
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
            </>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
