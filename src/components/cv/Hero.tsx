'use client'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { m, useReducedMotion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'
import {
  LuMail,
  LuPhone,
  LuDownload,
  LuMapPin,
  LuCalendarClock,
  LuCode2,
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
import CountUp from '@/components/motion/CountUp'

type StatTone = 'amber' | 'violet' | 'sky' | 'emerald' | 'rose' | 'cyan' | 'indigo' | 'lime'

type StatKey =
  | 'yearsShipping'
  | 'hoursCoding'
  | 'usersTouched'
  | 'engineersLed'
  | 'tenantsPowered'
  | 'domainsDelivered'
  | 'projectsLaunched'
  | 'testCasesAuthored'

type Stat = {
  icon: IconType
  value: string
  key: StatKey
  tone: StatTone
  spark: number[]
}

const stats: Stat[] = [
  { icon: LuCalendarClock, value: '8+', key: 'yearsShipping', tone: 'amber', spark: [3, 4, 5, 6, 7, 8, 9, 10] },
  { icon: LuCode2, value: '9K+', key: 'hoursCoding', tone: 'violet', spark: [4, 5, 7, 6, 8, 9, 10, 12] },
  { icon: LuUsers, value: '80M+', key: 'usersTouched', tone: 'sky', spark: [2, 3, 4, 6, 8, 9, 11, 12] },
  { icon: LuCrown, value: '12+', key: 'engineersLed', tone: 'emerald', spark: [2, 3, 4, 5, 7, 8, 10, 11] },
  { icon: LuBuilding2, value: '30+', key: 'tenantsPowered', tone: 'rose', spark: [1, 2, 4, 5, 6, 8, 9, 11] },
  { icon: LuLayers, value: '20+', key: 'domainsDelivered', tone: 'cyan', spark: [3, 4, 4, 5, 6, 7, 9, 10] },
  { icon: LuRocket, value: '30+', key: 'projectsLaunched', tone: 'indigo', spark: [2, 3, 4, 5, 6, 7, 9, 10] },
  { icon: LuShieldCheck, value: '1K+', key: 'testCasesAuthored', tone: 'lime', spark: [1, 2, 3, 4, 6, 8, 9, 11] },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Hero() {
  const t = useTranslations('Hero')
  const c = profileInfo.contact
  const reduced = useReducedMotion()

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease },
        }

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-bleed" aria-hidden="true" />
      <div className="hero-grid">
        <div className="hero-meta">
          <m.span className="eyebrow" {...fade(0)}>
            <span className="status-dot" aria-hidden="true" /> {t('eyebrow')}
          </m.span>
          <m.h1 id="hero-heading" className="hero-name" {...fade(0.08)}>
            Nguyen <span className="accent">Le Phong</span>
          </m.h1>
          <m.p className="hero-role" {...fade(0.16)}>
            {t('role')}
            <br />
            <span className="hero-role-sub">{t('roleSub')}</span>
          </m.p>

          <m.p className="hero-bio" {...fade(0.24)}>
            {t('bio')}
          </m.p>

          <m.ul className="hero-contact" {...fade(0.3)}>
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
          </m.ul>

          <m.div className="hero-cta" {...fade(0.36)}>
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
          </m.div>

          <m.ul className="social-row" aria-label={t('socialProfiles')} {...fade(0.42)}>
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
          </m.ul>
        </div>

        <m.aside
          className="hero-stats"
          aria-label={t('careerHighlights')}
          initial={reduced ? false : 'hidden'}
          animate={reduced ? undefined : 'visible'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
          }}
        >
          {stats.map((s) => {
            const Icon = s.icon
            const max = Math.max(...s.spark)
            const label = t(`stats.${s.key}`)
            const caption = t(`stats.${s.key}Caption`)
            return (
              <m.div
                key={s.key}
                className={`stat-card stat-tone-${s.tone}`}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
                }}
              >
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
                <div className="stat-value">
                  <CountUp value={s.value} />
                </div>
                <div className="stat-label">{label}</div>
                <div className="stat-caption">{caption}</div>
              </m.div>
            )
          })}
        </m.aside>
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
