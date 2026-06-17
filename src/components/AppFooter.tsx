'use client'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'
import { LuAppWindow } from 'react-icons/lu'
import { SiLeetcode } from 'react-icons/si'
import { APP_ROUTE, profileInfo } from '@/app/app.const'
import { track } from '@/lib/analytics'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import FontSwitcher from '@/components/font/FontSwitcher'

const year = new Date().getFullYear()

export default function AppFooter() {
  const t = useTranslations('Footer')
  const c = profileInfo.contact
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-meta">
          <p className="footer-name">Nguyen Le Phong</p>
          <p className="footer-tag">{t('tag')}</p>
        </div>

        <div className="footer-center">
          <ul className="footer-social" aria-label="Social profiles">
            <li>
              <Link
                href={APP_ROUTE.APPS}
                aria-label="Apps"
                title="Apps"
                onClick={() => track('cv_nav_click', { target: 'apps_footer' })}
              >
                <LuAppWindow size={18} />
              </Link>
            </li>
            <li>
              <Link
                href={c.linkedin}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="LinkedIn"
                onClick={() => track('cv_social_click', { platform: 'linkedin', source: 'footer' })}
              >
                <FaLinkedin size={18} />
              </Link>
            </li>
            <li>
              <Link
                href={c.github}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="GitHub"
                onClick={() => track('cv_social_click', { platform: 'github', source: 'footer' })}
              >
                <FaGithub size={18} />
              </Link>
            </li>
            <li>
              <Link
                href={c.leetcode}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="LeetCode"
                onClick={() => track('cv_social_click', { platform: 'leetcode', source: 'footer' })}
              >
                <SiLeetcode size={18} />
              </Link>
            </li>
            <li>
              <Link
                href={c.youtube}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="YouTube"
                onClick={() => track('cv_social_click', { platform: 'youtube', source: 'footer' })}
              >
                <FaYoutube size={18} />
              </Link>
            </li>
          </ul>
          <p className="footer-copy">
            {t('copy', { year })}
            {process.env.NEXT_PUBLIC_APP_VERSION && (
              <span className="footer-version">
                v{process.env.NEXT_PUBLIC_APP_VERSION}
              </span>
            )}
          </p>
        </div>

        <div className="footer-bottom">
          <div className="footer-controls">
            <FontSwitcher placement="up" />
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
