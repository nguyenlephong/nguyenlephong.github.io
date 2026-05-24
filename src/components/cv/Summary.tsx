'use client'
import type { IconType } from 'react-icons'
import { useTranslations } from 'next-intl'
import {
  LuLayers,
  LuToggleRight,
  LuUsers as LuLeadIcon,
  LuShieldCheck,
  LuBoxes,
  LuBot,
  LuCheck,
} from 'react-icons/lu'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'

type PillarTone = 'amber' | 'violet' | 'sky' | 'emerald' | 'rose' | 'cyan'

type PillarKey = 'endToEnd' | 'multiTenant' | 'leadership' | 'fintech' | 'mfe' | 'ai'

type Pillar = {
  icon: IconType
  key: PillarKey
  tone: PillarTone
}

const pillars: Pillar[] = [
  { icon: LuLayers, key: 'endToEnd', tone: 'sky' },
  { icon: LuToggleRight, key: 'multiTenant', tone: 'violet' },
  { icon: LuLeadIcon, key: 'leadership', tone: 'amber' },
  { icon: LuShieldCheck, key: 'fintech', tone: 'emerald' },
  { icon: LuBoxes, key: 'mfe', tone: 'rose' },
  { icon: LuBot, key: 'ai', tone: 'cyan' },
]

const skillKeys = [
  'backend',
  'frontend',
  'databases',
  'infra',
  'architecture',
  'testing',
  'libraries',
  'other',
] as const

const introKeys = ['intro1', 'intro2', 'intro3'] as const

export default function Summary() {
  const t = useTranslations('Summary')

  return (
    <>
      <Stagger className="prose" stagger={0.06}>
        {introKeys.map((k) => (
          <StaggerItem key={k}>
            <p className="prose-p" dangerouslySetInnerHTML={{ __html: t.raw(k) }} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="vision-header" role="presentation">
        <span className="vision-eyebrow">{t('visionEyebrow')}</span>
        <span className="vision-rule" aria-hidden="true" />
      </div>

      <Stagger as="ul" className="vision-grid" stagger={0.05}>
        {pillars.map((p) => {
          const Icon = p.icon
          return (
            <StaggerItem
              as="li"
              key={p.key}
              className={`vision-card vision-tone-${p.tone}`}
            >
              <span className="vision-glow" aria-hidden="true" />
              <div className="vision-head">
                <span className="vision-icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span className="vision-chip">{t(`pillars.${p.key}.chip`)}</span>
              </div>
              <h3 className="vision-title">{t(`pillars.${p.key}.title`)}</h3>
              <p className="vision-body">{t(`pillars.${p.key}.body`)}</p>
            </StaggerItem>
          )
        })}
      </Stagger>

      <div className="vision-header" role="presentation">
        <span className="vision-eyebrow">{t('hardSkillsEyebrow')}</span>
        <span className="vision-rule" aria-hidden="true" />
      </div>

      <Stagger as="ul" className="skill-list" stagger={0.05}>
        {skillKeys.map((k) => (
          <StaggerItem as="li" key={k} className="skill-list-item">
            <span className="skill-check" aria-hidden="true">
              <LuCheck size={12} strokeWidth={3} />
            </span>
            <span
              className="skill-text"
              dangerouslySetInnerHTML={{ __html: t.raw(`skills.${k}`) }}
            />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  )
}
