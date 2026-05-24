'use client'
import type { IconType } from 'react-icons'
import {
  LuLayers,
  LuToggleRight,
  LuUsers as LuLeadIcon,
  LuShieldCheck,
  LuBoxes,
  LuBot,
  LuCheck,
} from 'react-icons/lu'
import { profileInfo } from '@/app/app.const'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'

type PillarTone = 'amber' | 'violet' | 'sky' | 'emerald' | 'rose' | 'cyan'

type Pillar = {
  icon: IconType
  title: string
  body: string
  chip: string
  tone: PillarTone
}

const pillars: Pillar[] = [
  {
    icon: LuLayers,
    title: 'End-to-end engineer',
    body: 'Front-end, backend, CI/CD, release, and production infra — one owner across the full lifecycle.',
    chip: 'FE · BE · Infra',
    tone: 'sky',
  },
  {
    icon: LuToggleRight,
    title: 'Multi-tenant platforms',
    body: 'Feature flags, RBAC, percentage/segment rollouts, JSON-config values, stateless runtime evaluation.',
    chip: '30+ tenants live',
    tone: 'violet',
  },
  {
    icon: LuLeadIcon,
    title: 'Delivery leadership',
    body: 'Lead 11+ engineers — hiring, org design, RFCs, runbooks, rollout playbooks, 1:1 coaching.',
    chip: 'Team of 11',
    tone: 'amber',
  },
  {
    icon: LuShieldCheck,
    title: 'Secure fintech integrations',
    body: 'RSA-4096 handshake, AES-256 payload, mTLS, certificate pinning, idempotent contracts, retry queues.',
    chip: 'Gtel · Napas',
    tone: 'emerald',
  },
  {
    icon: LuBoxes,
    title: 'Micro-frontend & SDKs',
    body: 'Angular host + React modules for independent deploys. JS SDK shipped <200KB, <150ms load.',
    chip: 'MFE · <150ms',
    tone: 'rose',
  },
  {
    icon: LuBot,
    title: 'AI-first engineering',
    body: 'Built AI agents for code review, deploy assistance, service quotas, API health, and release analysis.',
    chip: 'Agents in prod',
    tone: 'cyan',
  },
]

export default function Summary() {
  const { description, skills } = profileInfo.summary
  return (
    <>
      <Stagger className="prose" stagger={0.06}>
        {description.map((html) => (
          <StaggerItem key={html}>
            <p className="prose-p" dangerouslySetInnerHTML={{ __html: html }} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="vision-header" role="presentation">
        <span className="vision-eyebrow">How I work</span>
        <span className="vision-rule" aria-hidden="true" />
      </div>

      <Stagger as="ul" className="vision-grid" stagger={0.05}>
        {pillars.map((p) => {
          const Icon = p.icon
          return (
            <StaggerItem
              as="li"
              key={p.title}
              className={`vision-card vision-tone-${p.tone}`}
            >
              <span className="vision-glow" aria-hidden="true" />
              <div className="vision-head">
                <span className="vision-icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span className="vision-chip">{p.chip}</span>
              </div>
              <h3 className="vision-title">{p.title}</h3>
              <p className="vision-body">{p.body}</p>
            </StaggerItem>
          )
        })}
      </Stagger>

      <div className="vision-header" role="presentation">
        <span className="vision-eyebrow">Hard skills</span>
        <span className="vision-rule" aria-hidden="true" />
      </div>

      <Stagger as="ul" className="skill-list" stagger={0.05}>
        {skills.map((html) => (
          <StaggerItem
            as="li"
            key={html}
            className="skill-list-item"
          >
            <span className="skill-check" aria-hidden="true">
              <LuCheck size={12} strokeWidth={3} />
            </span>
            <span className="skill-text" dangerouslySetInnerHTML={{ __html: html }} />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  )
}
