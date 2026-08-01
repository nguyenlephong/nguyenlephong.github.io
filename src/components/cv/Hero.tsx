'use client'
import dynamic from 'next/dynamic'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'
import {
  LuMail,
  LuPhone,
  LuDownload,
  LuMapPin,
  LuCalendarClock,
  LuUsers,
  LuCrown,
  LuBuilding2,
  LuLayers,
  LuShieldCheck,
  LuRocket,
} from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { profileInfo, APP_ROUTE } from '@/app/app.const'
import { track } from '@/lib/analytics'

const ArchitectureBackdrop = dynamic(() => import('@/components/cv/ArchitectureBackdrop'), {
  ssr: false,
})

type StatTone = 'amber' | 'violet' | 'sky' | 'emerald' | 'rose' | 'cyan' | 'indigo' | 'lime'

type StatKey =
  | 'yearsShipping'
  | 'usersTouched'
  | 'engineersLed'
  | 'tenantsPowered'
  | 'projectsLaunched'
  | 'testCasesAuthored'

type ProofKey = 'scale' | 'team' | 'platform'

type Stat = {
  icon: IconType
  value: string
  key: StatKey
  tone: StatTone
  spark: number[]
}

const stats: Stat[] = [
  { icon: LuCalendarClock, value: '8+', key: 'yearsShipping', tone: 'amber', spark: [3, 4, 5, 6, 7, 8, 9, 10] },
  { icon: LuUsers, value: '80M+', key: 'usersTouched', tone: 'sky', spark: [2, 3, 4, 6, 8, 9, 11, 12] },
  { icon: LuCrown, value: '11', key: 'engineersLed', tone: 'emerald', spark: [2, 3, 4, 5, 7, 8, 10, 11] },
  { icon: LuBuilding2, value: '30+', key: 'tenantsPowered', tone: 'rose', spark: [1, 2, 4, 5, 6, 8, 9, 11] },
  { icon: LuRocket, value: '30+', key: 'projectsLaunched', tone: 'indigo', spark: [2, 3, 4, 5, 6, 7, 9, 10] },
  { icon: LuShieldCheck, value: '1K+', key: 'testCasesAuthored', tone: 'lime', spark: [1, 2, 3, 4, 6, 8, 9, 11] },
]

const proofs: { icon: IconType; key: ProofKey }[] = [
  { icon: LuUsers, key: 'scale' },
  { icon: LuCrown, key: 'team' },
  { icon: LuLayers, key: 'platform' },
]

export default function Hero() {
  const t = useTranslations('Hero')
  const c = profileInfo.contact

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-bleed" aria-hidden="true">
        <ArchitectureBackdrop />
      </div>
      <div className="hero-grid">
        <div className="hero-meta">
          <span className="eyebrow">
            <span className="status-dot" aria-hidden="true" /> {t('eyebrow')}
          </span>
          <h1 id="hero-heading" className="hero-name">
            Nguyen <span className="accent">Le Phong</span>
          </h1>
          <p className="hero-role">
            {t('role')}
            <br />
            <span className="hero-role-sub">{t('roleSub')}</span>
          </p>

          <p className="hero-bio">{t('bio')}</p>

          <ul className="hero-proof">
            {proofs.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.key}>
                  <Icon size={15} aria-hidden="true" />
                  <span>{t(`proof.${item.key}`)}</span>
                </li>
              )
            })}
          </ul>

          <ul className="hero-contact">
            <li>
              <LuMapPin size={16} aria-hidden="true" />
              <span>{t('location')}</span>
            </li>
            <li>
              <a
                href={`mailto:${c.email}`}
                onClick={() => track('cv_contact_click', { channel: 'email' })}
              >
                <LuMail size={16} aria-hidden="true" />
                <span>{c.email}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${c.phone.replace(/\D/g, '')}`}
                onClick={() => track('cv_contact_click', { channel: 'phone' })}
              >
                <LuPhone size={16} aria-hidden="true" />
                <span>{c.phone}</span>
              </a>
            </li>
          </ul>

          <div className="hero-cta">
            <a
              href={APP_ROUTE.CV_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              onClick={() => track('cv_resume_download', { source: 'hero' })}
            >
              <LuDownload size={16} aria-hidden="true" /> {t('downloadResume')}
            </a>
            <a
              href={`mailto:${c.email}`}
              className="btn btn-secondary"
              onClick={() => track('cv_contact_click', { channel: 'email', source: 'hero_cta' })}
            >
              {t('getInTouch')}
            </a>
          </div>

          <ul className="social-row" aria-label={t('socialProfiles')}>
            <SocialIcon href={c.linkedin} label="LinkedIn" platform="linkedin">
              <FaLinkedin size={18} />
            </SocialIcon>
            <SocialIcon href={c.github} label="GitHub" platform="github">
              <FaGithub size={18} />
            </SocialIcon>
            <SocialIcon href={c.leetcode} label="LeetCode" platform="leetcode">
              <SiLeetcode size={18} />
            </SocialIcon>
            <SocialIcon href={c.youtube} label="YouTube" platform="youtube">
              <FaYoutube size={18} />
            </SocialIcon>
          </ul>
        </div>

        <aside className="hero-stats" aria-label={t('careerHighlights')}>
          {stats.map((s) => {
            const Icon = s.icon
            const max = Math.max(...s.spark)
            const label = t(`stats.${s.key}`)
            const caption = t(`stats.${s.key}Caption`)
            return (
              <div key={s.key} className={`stat-card stat-tone-${s.tone}`}>
                <span className="stat-glow" aria-hidden="true" />
                <div className="stat-head">
                  <span className="stat-icon" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <span className="stat-spark" aria-hidden="true">
                    {s.spark.map((v, i) => (
                      <span key={i} style={{ height: `${(v / max) * 100}%` }} />
                    ))}
                  </span>
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{label}</div>
                <div className="stat-caption">{caption}</div>
              </div>
            )
          })}
        </aside>
      </div>
    </section>
  )
}
function SocialIcon({
  href,
  label,
  platform,
  children,
}: {
  href: string
  label: string
  platform: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer me"
        aria-label={label}
        className="social-icon"
        onClick={() => track('cv_social_click', { platform })}
      >
        {children}
      </Link>
    </li>
  )
}
