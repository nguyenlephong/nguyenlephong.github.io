'use client'
import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { FaYoutube } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'
import { APP_ROUTE } from '@/app/app.const'
import { email, social as c } from '@/content/social'
import IntentPrefetchLink from '@/components/navigation/IntentPrefetchLink'
import { track } from '@/lib/analytics'
import { SITE_INDEX_PATH } from '@/lib/seo/site-index'

const year = new Date().getFullYear()

const profileLinks = [
  { platform: 'linkedin', label: 'LinkedIn', href: c.linkedin },
  { platform: 'github', label: 'GitHub', href: c.github },
] as const

// Secondary profiles stay icon-only so they read lighter than LinkedIn and GitHub.
const minorProfiles = [
  { platform: 'leetcode', label: 'LeetCode', href: c.leetcode, Icon: SiLeetcode },
  { platform: 'youtube', label: 'YouTube', href: c.youtube, Icon: FaYoutube },
] as const

export default function AppFooter() {
  const t = useTranslations('Footer')
  const tNav = useTranslations('Nav')
  const locale = useLocale()
  const studioHref = getPathname({
    href: APP_ROUTE.STUDIO,
    locale: locale as Locale,
  })
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-meta">
          <p className="footer-name">Nguyen Le Phong</p>
          <p className="footer-tag">
            {/* Each role stays whole; a wrap lands after the separator, never before it. */}
            {t('tag')
              .split(' · ')
              .map((role, i) => (
                <span key={role}>
                  {i > 0 && '\u00a0· '}
                  <span className="footer-role">{role}</span>
                </span>
              ))}
          </p>
        </div>

        <ul className="footer-links" aria-label={t('contactLabel')}>
          <li>
            <a
              href={APP_ROUTE.CV_PDF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('cv_resume_download', { source: 'footer' })}
            >
              {tNav('resume')}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${email}`}
              onClick={() => track('cv_contact_click', { channel: 'email', source: 'footer' })}
            >
              {t('email')}
            </a>
          </li>
          {profileLinks.map(({ platform, label, href }) => (
            <li key={platform}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer me"
                onClick={() => track('cv_social_click', { platform, source: 'footer' })}
              >
                {label}
              </a>
            </li>
          ))}
          {minorProfiles.map(({ platform, label, href, Icon }) => (
            <li key={platform}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer me"
                className="footer-icon-link"
                aria-label={label}
                title={label}
                onClick={() => track('cv_social_click', { platform, source: 'footer' })}
              >
                <Icon size={16} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <ul className="footer-links footer-links--site" aria-label={t('siteLabel')}>
          <li>
            <IntentPrefetchLink
              href={APP_ROUTE.GALLERY}
              onClick={() => track('cv_nav_click', { target: 'gallery_footer' })}
            >
              {t('photos')}
            </IntentPrefetchLink>
          </li>
          <li>
            <IntentPrefetchLink
              href={APP_ROUTE.APPS}
              onClick={() => track('cv_nav_click', { target: 'apps_footer' })}
            >
              {t('sideProjects')}
            </IntentPrefetchLink>
          </li>
          <li>
            <a
              href={studioHref}
              title={t('studioHint')}
              data-document-navigation="studio"
              onClick={() =>
                track(
                  'cv_nav_click',
                  { target: 'studio_footer' },
                  { beacon: true },
                )
              }
            >
              Studio
            </a>
          </li>
          <li>
            <Link
              href={SITE_INDEX_PATH}
              prefetch={false}
              onClick={() => track('cv_nav_click', { target: 'sitemap_footer' })}
            >
              {t('sitemap')}
            </Link>
          </li>
        </ul>

        <p className="footer-copy">
          {t('copy', { year })}
          {process.env['NEXT_PUBLIC_APP_VERSION'] && (
            <span className="footer-version">
              v{process.env['NEXT_PUBLIC_APP_VERSION']}
            </span>
          )}
        </p>
      </div>
    </footer>
  )
}
