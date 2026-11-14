import type { OgShellProps } from '@/app/_og/og-shell'

// Card copy follows AI/skills/profile-voice: ledger-backed numbers only, same facts as Hero and SEO.home.
// scripts/verify-profile-voice.mjs checks these strings, including the contradicted 80M+ MAU figure.
export const PROFILE_OG_CONTENT = {
  theme: 'gold',
  eyebrow: 'Nguyen Le Phong',
  title: 'Lead Software Engineer · Zalo PC',
  titleSize: 64,
  subtitle:
    'Co-founder of BonBon Mobility ($500K pre-seed led by Tasco). Messaging at scale, safe rollouts, multi-tenant SaaS.',
  chips: ['Co-founder · BonBon', 'PC backup → mobile restore', 'React · Electron', 'Platform reliability'],
  badge: { label: 'Zalo PC', value: '18M+ MAU' },
  footer: 'Lead since Mar 2026 · Ho Chi Minh City, Vietnam',
} satisfies OgShellProps

export const PROFILE_OG_CONTENT_VI = {
  ...PROFILE_OG_CONTENT,
  eyebrow: 'Nguyễn Lê Phong',
  subtitle:
    'Đồng sáng lập BonBon Mobility, pre-seed 500.000 USD do Tasco dẫn dắt. Nhắn tin quy mô lớn, rollout an toàn, SaaS multi-tenant.',
  chips: ['Đồng sáng lập · BonBon', 'Backup PC → khôi phục trên mobile', 'React · Electron', 'Platform reliability'],
  badge: { label: 'Zalo PC · hơn', value: '18 triệu MAU' },
  footer: 'Lead từ 03/2026 · TP. Hồ Chí Minh',
} satisfies OgShellProps

