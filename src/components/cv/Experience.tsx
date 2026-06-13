'use client'
import { LuMapPin, LuCalendarDays } from 'react-icons/lu'
import { useTranslations } from 'next-intl'
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

const COMPANY_KEY_MAP: Record<string, string> = {
  'NDSVN JSC': 'ndsvn',
  'Zalo PC - VNG Corp': 'zalo',
  'PrimeData VN': 'primedata',
  'Splus-Software JSC': 'splus',
  'Propman Guru': 'propman',
}

const ZALO_SUMMARY_KEYS = ['summary1', 'summary2'] as const

function getSummaryKeys(companyKey: string, count: number): string[] {
  if (companyKey === 'zalo') return ZALO_SUMMARY_KEYS.slice(0, count) as unknown as string[]
  if (count === 0) return []
  return ['summary']
}

export default function Experience({ data }: Props) {
  const t = useTranslations('Experience')

  return (
    <Stagger as="ol" className="timeline" stagger={0.1}>
      {data.map((ex, idx) => {
        const companyKey = COMPANY_KEY_MAP[ex.company]
        return (
          <StaggerItem as="li" key={ex.company} className="timeline-item">
            <div className="timeline-marker" aria-hidden="true">
              <span className="timeline-dot" />
              {idx < data.length - 1 && <span className="timeline-line" />}
            </div>

            <div className="timeline-content">
              <header className="timeline-head">
                <h3 className="timeline-company">{ex.company}</h3>
                <span className="meta-tag" title={t('labels.location')}>
                  <LuMapPin size={12} aria-hidden="true" />
                  <span>{ex.location}</span>
                </span>
              </header>

              {ex.jobs.map((job: JobType) => {
                const summaryKeys = getSummaryKeys(companyKey, job.summaries.length)
                const contributions = companyKey
                  ? (t.raw(`${companyKey}.contributions`) as string[])
                  : job.key_contribution
                return (
                  <article key={job.title} className="role">
                    <header className="role-head">
                      <h4 className="role-title">{job.title}</h4>
                      <span className="meta-tag meta-tag-mono" title={t('labels.duration')}>
                        <LuCalendarDays size={12} aria-hidden="true" />
                        <span>{job.duration}</span>
                      </span>
                    </header>

                    {summaryKeys.map((sk) => (
                      <p
                        key={sk}
                        className="role-summary"
                        dangerouslySetInnerHTML={{ __html: t.raw(`${companyKey}.${sk}`) }}
                      />
                    ))}

                    <p className="role-section-label">{t('labels.keyContributions')}</p>
                    <ul className="role-contrib">
                      {contributions.map((item, i) => (
                        <li
                          key={i}
                          className="role-contrib-item"
                          dangerouslySetInnerHTML={{ __html: item }}
                        />
                      ))}
                    </ul>

                    <div className="tech-row" aria-label={t('labels.keyTechnologies')}>
                      {job.key_techs.map((tech) => (
                        <span
                          key={tech}
                          className={`tech-chip${isFeatured(tech) ? ' tech-chip-featured' : ''}`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
