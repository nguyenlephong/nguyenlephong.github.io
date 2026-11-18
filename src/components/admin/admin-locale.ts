/** Locale resolution for /admin, shared by the inline bootstrap and React. No 'use client': the server page builds the script. */
export type AdminLocale = 'en' | 'vi'
export const ADMIN_LOCALE_KEY = 'admin_locale'

/** Stored choice first, then the browser language. Shared with the inline bootstrap. */
export function resolveAdminLocale(stored: string | null, browserLanguage: string): AdminLocale {
  if (stored === 'en' || stored === 'vi') return stored
  return browserLanguage.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

/** Runs before paint: sets <html lang> so the prerendered English never flashes for a VI reader. */
export function createAdminLocaleScript(): string {
  const run = (key: string, resolve: typeof resolveAdminLocale) => {
    try {
      const locale = resolve(localStorage.getItem(key), navigator.language || '')
      document.documentElement.lang = locale
      document.documentElement.setAttribute('data-admin-lang', locale)
    } catch {
      /* keep English */
    }
  }
  return `(${run.toString()})(${JSON.stringify(ADMIN_LOCALE_KEY)},${resolveAdminLocale.toString()});`
}


/** The reader's language for this browser. A per-viewer convenience, so localStorage is fine here. */
export function readAdminLocale(): AdminLocale {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(ADMIN_LOCALE_KEY)
  } catch {
    // Storage blocked: fall back to the browser language.
  }
  return resolveAdminLocale(stored, navigator.language || '')
}

export function storeAdminLocale(locale: AdminLocale): void {
  try {
    localStorage.setItem(ADMIN_LOCALE_KEY, locale)
  } catch {
    // Storage blocked: the choice lasts for this visit.
  }
}
