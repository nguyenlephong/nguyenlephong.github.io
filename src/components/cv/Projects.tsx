'use client'
import { ProjectType } from '@/app/app.type'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { track } from '@/lib/analytics'

type Props = { data: ProjectType[] }

export default function Projects({ data }: Props) {
  return (
    <Stagger className="project-grid" stagger={0.08}>
      {data.map((p) => (
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
              {p.technologies.map((t) => (
                <span key={t} className="tech-chip tech-chip-soft">
                  {t}
                </span>
              ))}
            </div>

            <ul className="project-bullets">
              {p.accomplishment.map((item) => (
                <li
                  key={item}
                  className="project-bullet"
                  dangerouslySetInnerHTML={{ __html: item }}
                />
              ))}
            </ul>
          </>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
