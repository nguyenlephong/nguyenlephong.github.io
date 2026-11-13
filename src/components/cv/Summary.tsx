'use client'
import { useTranslations } from 'next-intl'
import CapabilityMap from './CapabilityMap'

const stackKeys = [
  'frontend',
  'backend',
  'data',
  'platform',
  'architecture',
  'testing',
  'team',
] as const

export default function Summary() {
  const t = useTranslations('Summary')

  return (
    <>
      <CapabilityMap />

      <div className="stack">
        <h3 id="stack-title" className="stack-title">
          {t('stackTitle')}
        </h3>
        <dl className="stack-list" aria-labelledby="stack-title">
          {stackKeys.map((k) => (
            <div key={k} className="stack-row">
              <dt>{t(`stack.${k}.label`)}</dt>
              <dd>{t(`stack.${k}.items`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}
