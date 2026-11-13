'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { LuCheck, LuCopy } from 'react-icons/lu'
import { APP_ROUTE } from '@/app/app.const'
import { contact as c } from '@/content/profile'
import { track } from '@/lib/analytics'

type CopyState = 'idle' | 'copied' | 'failed'

// Failed stays longer so the manual-copy instruction can be read.
const RESET_MS = { copied: 2000, failed: 4000 } as const

export default function ContactCTA() {
  const t = useTranslations('CTA')
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const addressRef = useRef<HTMLAnchorElement>(null)
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  // Clipboard can be missing (http, old WebView) or denied; then select the address so it can be copied by hand.
  const selectAddress = () => {
    const node = addressRef.current
    const selection = window.getSelection()
    if (!node || !selection) return
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const copyEmail = async () => {
    let next: keyof typeof RESET_MS = 'copied'
    try {
      await navigator.clipboard.writeText(c.email)
    } catch {
      next = 'failed'
      selectAddress()
    }
    // Cleared after the await so overlapping clicks never leave an orphan timer; the last click wins.
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopyState('idle'), RESET_MS[next])
    setCopyState(next)
    track('cv_email_copy', { source: 'cta', result: next })
  }

  return (
    <section className="cta" aria-labelledby="cta-title" data-copy={copyState}>
      <h2 id="cta-title" className="cv-section-title cta-title">
        {t('title')}
      </h2>

      <dl className="cta-spec">
        <div className="cta-row">
          <dt>{t('openToLabel')}</dt>
          <dd>{t('openTo')}</dd>
        </div>
        <div className="cta-row">
          <dt>{t('whereLabel')}</dt>
          <dd>{t('where')}</dd>
        </div>
        <div className="cta-row cta-row-email">
          <dt>{t('emailLabel')}</dt>
          <dd>
            <svg className="cta-port" viewBox="0 0 40 12" aria-hidden="true" focusable="false">
              <path d="M0 6H31" />
              <circle cx="35" cy="6" r="4" />
            </svg>
            <a
              ref={addressRef}
              href={`mailto:${c.email}`}
              className="cta-address"
              onClick={() => track('cv_contact_click', { channel: 'email', source: 'cta' })}
            >
              {c.email}
            </a>
            <button type="button" className="btn btn-primary btn-sm cta-copy" onClick={copyEmail}>
              <span className="cta-copy-label" aria-hidden={copyState === 'copied'}>
                <LuCopy size={14} aria-hidden="true" /> {t('copyEmail')}
              </span>
              <span className="cta-copy-label cta-copy-done" aria-hidden={copyState !== 'copied'}>
                <LuCheck size={14} aria-hidden="true" /> {t('copied')}
              </span>
            </button>
            <p className="cta-copy-status" role="status" aria-live="polite">
              {copyState === 'copied' && t('copiedStatus')}
              {copyState === 'failed' && t('copyFailed')}
            </p>
          </dd>
        </div>
        <div className="cta-row">
          <dt>{t('phoneLabel')}</dt>
          <dd>
            <a
              href={`tel:+${c.phone.replace(/\D/g, '')}`}
              className="cta-link"
              onClick={() => track('cv_contact_click', { channel: 'phone', source: 'cta' })}
            >
              {c.phone}
            </a>
          </dd>
        </div>
        <div className="cta-row">
          <dt>{t('linksLabel')}</dt>
          <dd className="cta-links">
            <a
              href={c.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-link"
              onClick={() => track('cv_social_click', { platform: 'linkedin', source: 'cta' })}
            >
              {t('linkedin')}
            </a>
            <a
              href={c.github}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-link"
              onClick={() => track('cv_social_click', { platform: 'github', source: 'cta' })}
            >
              {t('github')}
            </a>
            <a
              href={APP_ROUTE.CV_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-link"
              onClick={() => track('cv_resume_download', { source: 'cta' })}
            >
              {t('resumePdf')}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  )
}
