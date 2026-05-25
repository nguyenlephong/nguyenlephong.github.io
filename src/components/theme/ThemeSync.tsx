'use client'
import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { THEME_STORAGE_KEY } from './ThemeScript'

function applyStoredTheme(): void {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const setting = stored ? (JSON.parse(stored).theme_setting ?? 'system') : 'system'
    const dark =
      setting === 'dark' ||
      (setting === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  } catch {
    /* keep current theme on parse failure */
  }
}

/**
 * Re-applies the persisted theme on every locale / route change so the saved
 * dark/light preference is never lost when the locale switcher triggers a
 * re-render of <html lang={locale}>.
 */
export default function ThemeSync() {
  const locale = useLocale()
  const pathname = usePathname()

  useEffect(() => {
    applyStoredTheme()
  }, [locale, pathname])

  return null
}
