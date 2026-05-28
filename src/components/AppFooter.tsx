'use client'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'
import { profileInfo } from '@/app/app.const'
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

        <ul className="footer-social" aria-label="Social profiles">
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

        <div className="footer-bottom">
          <p className="footer-copy">{t('copy', { year })}</p>
          <div className="footer-controls">
            <FontSwitcher placement="up" />
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
