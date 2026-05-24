'use client'
import { useTransition, type ChangeEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing, LOCALE_LABELS, type Locale } from '@/i18n/routing'
import { LuGlobe } from 'react-icons/lu'
import { track } from '@/lib/analytics'

export default function LocaleSwitcher() {
  const t = useTranslations('Footer')
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale() as Locale
  const [isPending, startTransition] = useTransition()

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale
    track('locale_change', { from: currentLocale, to: nextLocale })
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <label className="locale-switcher" aria-label={t('language')}>
      <span className="locale-switcher-icon" aria-hidden="true">
        <LuGlobe size={14} />
      </span>
      <span className="locale-switcher-flag" aria-hidden="true">
        {LOCALE_LABELS[currentLocale].flag}
      </span>
      <select
        className="locale-switcher-select"
        value={currentLocale}
        onChange={onChange}
        disabled={isPending}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc].flag}  {LOCALE_LABELS[loc].name}
          </option>
        ))}
      </select>
    </label>
  )
}
