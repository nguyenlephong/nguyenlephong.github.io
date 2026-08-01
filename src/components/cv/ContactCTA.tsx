'use client'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LuMail, LuDownload, LuArrowUpRight } from 'react-icons/lu'
import { profileInfo, APP_ROUTE } from '@/app/app.const'
import { track } from '@/lib/analytics'

export default function ContactCTA() {
  const t = useTranslations('CTA')
  const c = profileInfo.contact
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="cta-inner">
        <p className="cta-eyebrow">{t('eyebrow')}</p>
        <h2 id="cta-title" className="cta-title">
          {t('title')}
        </h2>
        <p className="cta-body">{t('body')}</p>

        <div className="cta-actions">
          <a
            href={`mailto:${c.email}`}
            className="btn btn-primary btn-lg"
            onClick={() => track('cv_contact_click', { channel: 'email', source: 'cta' })}
          >
            <LuMail size={18} aria-hidden="true" /> {t('emailMe')}
          </a>
          <a
            href={APP_ROUTE.CV_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-lg"
            onClick={() => track('cv_resume_download', { source: 'cta' })}
          >
            <LuDownload size={18} aria-hidden="true" /> {t('resumePdf')}
          </a>
          <Link
            href={c.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-lg"
            onClick={() => track('cv_social_click', { platform: 'linkedin', source: 'cta' })}
          >
            <LuArrowUpRight size={18} aria-hidden="true" /> {t('linkedin')}
          </Link>
        </div>
      </div>
    </section>
  )
}
