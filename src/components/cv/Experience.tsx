'use client'
import { LuMapPin, LuCalendarDays } from 'react-icons/lu'
import { ExperienceItemType, JobType } from '@/app/app.type'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'

type Props = { data: ExperienceItemType[] }

const FEATURED_TECHS = new Set([
  'react',
  'reactjs',
  'react.js',
  'react native',
  'next.js',
  'nextjs',
  'node.js',
  'nodejs',
  'node',
  'typescript',
  'javascript',
  'java',
  'spring framework',
  'spring boot',
  'angular',
  'kotlin',
  'flutter',
  'docker',
  '.net',
  'electron',
  'aks/fke/k3s/eks',
  'kubernetes',
])

function isFeatured(tech: string): boolean {
  return FEATURED_TECHS.has(tech.trim().toLowerCase())
}

export default function Experience({ data }: Props) {
  return (
    <Stagger as="ol" className="timeline" stagger={0.1}>
      {data.map((ex, idx) => (
        <StaggerItem as="li" key={ex.company} className="timeline-item">
          <div className="timeline-marker" aria-hidden="true">
            <span className="timeline-dot" />
            {idx < data.length - 1 && <span className="timeline-line" />}
          </div>

          <div className="timeline-content">
            <header className="timeline-head">
              <h3 className="timeline-company">{ex.company}</h3>
              <span className="meta-tag" title="Location">
                <LuMapPin size={12} aria-hidden="true" />
                <span>{ex.location}</span>
              </span>
            </header>

            {ex.jobs.map((job: JobType) => (
              <article key={job.title} className="role">
                <header className="role-head">
                  <h4 className="role-title">{job.title}</h4>
                  <span className="meta-tag meta-tag-mono" title="Duration">
                    <LuCalendarDays size={12} aria-hidden="true" />
                    <span>{job.duration}</span>
                  </span>
                </header>

                {job.summaries.map((s) => (
                  <p
                    key={s}
                    className="role-summary"
                    dangerouslySetInnerHTML={{ __html: s }}
                  />
                ))}

                <p className="role-section-label">Key contributions</p>
                <ul className="role-contrib">
                  {job.key_contribution.map((item) => (
                    <li
                      key={item}
                      className="role-contrib-item"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>

                <div className="tech-row" aria-label="Key technologies">
                  {job.key_techs.map((t) => (
                    <span
                      key={t}
                      className={`tech-chip${isFeatured(t) ? ' tech-chip-featured' : ''}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
