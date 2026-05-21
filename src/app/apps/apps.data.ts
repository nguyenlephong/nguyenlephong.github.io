export type AppStatus = 'shipped' | 'beta' | 'wip'

export interface AppShowcaseItem {
  id: string
  name: string
  tagline: string
  description: string
  longDescription?: string
  status: AppStatus
  platforms: string[]
  hotkey?: { keys: string[]; label: string }[]
  features: string[]
  stats?: { label: string; value: string }[]
  tech: string[]
  links: {
    repo?: string
    download?: string
    website?: string
    docs?: string
  }
  accent?: 'blue' | 'violet' | 'amber' | 'emerald'
  visual: 'glance' | 'placeholder'
}

export const apps: AppShowcaseItem[] = [
  {
    id: 'glance',
    name: 'Glance',
    tagline: 'Một cái liếc — hiểu mọi ngôn ngữ.',
    description:
      'Instant macOS translation via a global hotkey. Highlight text in any app, hit ⌃⌥T, and read the translation right next to your cursor — without ever leaving what you were doing.',
    longDescription:
      'Glance is a tiny menu-bar utility for macOS that turns translation into muscle memory. Works in Safari, Mail, Slack, Zalo, Chrome, VS Code, Notion — anywhere text can be selected.',
    status: 'shipped',
    platforms: ['macOS 13+', 'Apple Silicon', 'Intel'],
    hotkey: [
      { keys: ['⌃', '⌥', 'T'], label: 'Translate selection' },
      { keys: ['⌃', '⌥', '⏎'], label: 'Replace with translation' },
      { keys: ['Esc'], label: 'Dismiss panel' },
    ],
    features: [
      'Global hotkey works in every app — Safari, Mail, Slack, Zalo, VS Code, Chrome.',
      'Floating panel beside the cursor — never steals focus, never covers your work.',
      'Auto-direction: EN → VI and VI → EN, configurable in Settings.',
      'Free engine (Google Translate) — no API key, no signup, no quota anxiety.',
      'Electron-app safe: clipboard snapshot + restore for Slack, Discord, Notion.',
      'Menu bar only, no Dock icon, < 1 MB binary.',
    ],
    stats: [
      { label: 'Binary size', value: '< 1 MB' },
      { label: 'License', value: 'MIT' },
      { label: 'Platform', value: 'macOS 13+' },
      { label: 'Language', value: 'Swift' },
    ],
    tech: ['Swift', 'SwiftUI', 'AppKit', 'XcodeGen', 'Google Translate'],
    links: {
      repo: 'https://github.com/nguyenlephong/glance',
      download: 'https://github.com/nguyenlephong/glance/releases',
      docs: 'https://github.com/nguyenlephong/glance#readme',
    },
    accent: 'blue',
    visual: 'glance',
  },
]
