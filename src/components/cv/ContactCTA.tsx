'use client'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { m, useReducedMotion } from 'framer-motion'
import { LuMail, LuDownload, LuArrowUpRight } from 'react-icons/lu'
import { profileInfo, APP_ROUTE } from '@/app/app.const'
import { track } from '@/lib/analytics'

export default function ContactCTA() {
  const t = useTranslations('CTA')
  const c = profileInfo.contact
  const reduced = useReducedMotion()
  const reveal = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '0px 0px -80px 0px' },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
      }
  return (
    <section className="cta" aria-labelledby="cta-title">
      <m.div className="cta-inner" {...reveal}>
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
      </m.div>
    </section>
  )
}
