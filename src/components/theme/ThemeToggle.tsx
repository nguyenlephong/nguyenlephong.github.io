'use client'
import { useEffect, useState } from 'react'
import { LuSun, LuMoon, LuMonitor } from 'react-icons/lu'
import { THEME_STORAGE_KEY } from './ThemeScript'
import { track } from '@/lib/analytics'

type ThemeSetting = 'light' | 'dark' | 'system'

function resolveTheme(setting: ThemeSetting): 'light' | 'dark' {
  if (setting === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return setting
}

function applyTheme(setting: ThemeSetting): void {
  const resolved = resolveTheme(setting)
  document.documentElement.setAttribute('data-theme', resolved)
  localStorage.setItem(
    THEME_STORAGE_KEY,
    JSON.stringify({ theme: resolved, theme_setting: setting })
  )
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [setting, setSetting] = useState<ThemeSetting>('system')

  useEffect(() => {
    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return
      setMounted(true)
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as { theme_setting?: ThemeSetting }
          if (parsed.theme_setting) setSetting(parsed.theme_setting)
        }
      } catch {
        // ignore
      }
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (setting !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setting])

  const handleChange = (next: ThemeSetting): void => {
    setSetting(next)
    applyTheme(next)
    track('cv_theme_toggle', { from: setting, to: next })
  }

  if (!mounted) {
    return <div className="theme-toggle" aria-hidden="true" />
  }

  const options: { value: ThemeSetting; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light theme', icon: <LuSun size={16} /> },
    { value: 'system', label: 'System theme', icon: <LuMonitor size={16} /> },
    { value: 'dark', label: 'Dark theme', icon: <LuMoon size={16} /> },
  ]

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Theme">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={setting === opt.value}
          aria-label={opt.label}
          className={`theme-toggle-btn${setting === opt.value ? ' is-active' : ''}`}
          onClick={() => handleChange(opt.value)}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  )
}
