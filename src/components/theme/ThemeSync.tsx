'use client'
import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  parseThemeSetting,
  resolveTheme,
  THEME_MEDIA_QUERY,
  THEME_STORAGE_KEY,
} from './theme-preference'

function applyStoredTheme(): void {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const setting = parseThemeSetting(stored)
    const theme = resolveTheme(
      setting,
      window.matchMedia(THEME_MEDIA_QUERY).matches,
    )
    document.documentElement.setAttribute('data-theme', theme)
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
