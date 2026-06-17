import { APP_ROUTE } from '@/app/app.const'

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
    app?: string
    repo?: string
    download?: string
    website?: string
    docs?: string
  }
  accent?: 'blue' | 'violet' | 'amber' | 'emerald'
  visual: 'glance' | 'english' | 'placeholder'
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
  {
    id: 'e-slang',
    name: 'E-Slang',
    tagline: 'Static English practice, mỗi lần học một nhịp khác.',
    description:
      'A private slang practice console for learning real conversational English through flashcards, fill-in-the-blank prompts, quick quizzes, and browser text-to-speech.',
    longDescription:
      'E-Slang turns a small static lesson into repeatable active recall. The content stays simple and editable, while the practice flow shuffles examples, answer choices, listening prompts, and review states on the client.',
    status: 'beta',
    platforms: ['Web', 'Static content', 'TTS'],
    hotkey: [
      { keys: ['S'], label: 'Shuffle session' },
      { keys: ['Space'], label: 'Reveal answer' },
      { keys: ['N'], label: 'Next slang' },
    ],
    features: [
      'Flashcards for meaning, examples, and quick recall.',
      'Fill-in-the-blank practice generated from real example sentences.',
      'Multiple-choice and listening prompts with randomized answer order.',
      'Browser speech synthesis for repeating sentences out loud.',
      'Hard-card marking for a short personal review loop.',
    ],
    stats: [
      { label: 'Lesson type', value: 'Slang' },
      { label: 'Entries', value: '5' },
      { label: 'Storage', value: 'Static' },
      { label: 'Mode', value: 'Practice' },
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Web Speech API', 'Static data'],
    links: {
      app: APP_ROUTE.APPS_ENGLISH,
    },
    accent: 'emerald',
    visual: 'english',
  },
]
