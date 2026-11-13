'use client'
import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { LuDownload, LuArrowRight, LuMail } from 'react-icons/lu'
import { APP_ROUTE } from '@/app/app.const'
import { displayName } from '@/app/seo.config'
import { email, social } from '@/content/social'
import { track } from '@/lib/analytics'
import HeroTopology from './HeroTopology'
import { openCaseFile } from './CaseFile'

// The BonBon story only exists in English and Vietnamese.
const BONBON_NOTE = '/notes/the-quiet-engineering-behind-bonbons-500k-round'

// Date tokens share the Experience timeline's mono date style.
const date = (chunks: ReactNode) => <span className="ht-date">{chunks}</span>

export default function Hero() {
  const t = useTranslations('Hero')
  const locale = useLocale()

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-grid">
        <div className="hero-meta">
          <Link
            href={BONBON_NOTE}
            locale={locale === 'vi' ? 'vi' : 'en'}
            prefetch={false}
            className="eyebrow hero-news"
            onClick={() => track('cv_announcement_click', { target: 'bonbon_pre_seed_note' })}
          >
            <span className="status-dot" aria-hidden="true" />
            <span>
              {t('news')}{' '}
              <b>
                {t('newsCta')} <LuArrowRight size={13} aria-hidden="true" />
              </b>
            </span>
          </Link>
          <h1 id="hero-heading" className="hero-name">
            {displayName(locale)}
          </h1>
          <p className="hero-claim">{t('claim')}</p>
          <ul className="hero-role">
            <li>
              {t('role')} <span>@</span>{' '}
              <a
                className="hero-role-link"
                href="#experience"
                onClick={() => track('cv_hero_node_select', { node: 'zalo_pc', surface: 'role' })}
              >
                Zalo PC
              </a>
            </li>
            <li>
              {t('cofounder')} <span>@</span>{' '}
              <a
                className="hero-role-link"
                href="#case-bonbon"
                onClick={() => {
                  track('cv_hero_node_select', { node: 'bonbon', surface: 'role' })
                  openCaseFile('bonbon', 'hero')
                }}
              >
                BonBon Mobility
              </a>{' '}
              <span className="hero-role-type">{t('partTime')}</span>
            </li>
          </ul>
          <p className="hero-bio">{t('bio')}</p>

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
              href={`mailto:${email}`}
              className="btn btn-secondary"
              onClick={() => track('cv_contact_click', { channel: 'email', source: 'hero_cta' })}
            >
              <LuMail size={16} aria-hidden="true" /> {t('getInTouch')}
            </a>
          </div>

          <ul className="social-row" aria-label={t('socialProfiles')}>
            <SocialLink href={social.linkedin} label="LinkedIn" platform="linkedin">
              <FaLinkedin size={15} aria-hidden="true" />
            </SocialLink>
            <SocialLink href={social.github} label="GitHub" platform="github">
              <FaGithub size={15} aria-hidden="true" />
            </SocialLink>
          </ul>
        </div>

        <HeroTopology
          labels={{
            label: t('topology.label'),
            location: t('location'),
            zaloEdge: t.rich('topology.zaloMeta', { date }),
            zaloNote: t('topology.zaloNote'),
            bonbonEdge: t.rich('topology.bonbonMeta', { date }),
            bonbonNote: t('topology.bonbonNote'),
            previousEdge: t.rich('topology.previousMeta', { date }),
            previousNote: t('topology.previousNote'),
          }}
        />
      </div>
    </section>
  )
}

function SocialLink({
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
        className="social-link"
        onClick={() => track('cv_social_click', { platform })}
      >
        {children}
        {label}
      </Link>
    </li>
  )
}
