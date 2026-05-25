import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'vi', 'zh', 'ja', 'ko', 'fr'] as const,
  defaultLocale: 'en',
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]

export const LOCALE_LABELS: Record<Locale, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇬🇧' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  fr: { name: 'Français', flag: '🇫🇷' },
}
