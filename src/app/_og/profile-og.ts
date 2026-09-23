import type { OgShellProps } from '@/app/_og/og-shell'

export const PROFILE_OG_CONTENT = {
  theme: 'gold',
  eyebrow: 'Nguyen Le Phong',
  title: 'Lead Software Engineer · Zalo PC',
  subtitle:
    'Co-founder of BonBon ($500K pre-seed led by Tasco). Shipping cross-device message continuity and reliable releases at national scale.',
  chips: ['Co-founder · BonBon', 'PC → Mobile Restore', 'React · Electron', 'Platform Reliability'],
  badge: { label: 'Zalo', value: '80M+ MAU' },
  footer: 'nguyenlephong.github.io · Cross-device product to platform',
} satisfies OgShellProps
