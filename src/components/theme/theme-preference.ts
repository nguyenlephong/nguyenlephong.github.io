export const THEME_STORAGE_KEY = 'theme_preference'
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)'
export const THEME_SETTINGS = ['light', 'system', 'dark'] as const

export type ThemeSetting = (typeof THEME_SETTINGS)[number]
export type ResolvedTheme = 'light' | 'dark'

export interface StoredThemePreference {
  theme: ResolvedTheme
  theme_setting: ThemeSetting
}

/** Parses the persisted object without trusting stale or malformed values. */
export function parseThemeSetting(value: string | null): ThemeSetting {
  if (!value) return 'system'
  try {
    const setting = (JSON.parse(value) as { theme_setting?: unknown })
      .theme_setting
    return setting === 'light' || setting === 'dark' || setting === 'system'
      ? setting
      : 'system'
  } catch {
    return 'system'
  }
}

export function resolveTheme(
  setting: ThemeSetting,
  prefersDark: boolean,
): ResolvedTheme {
  return setting === 'system' ? (prefersDark ? 'dark' : 'light') : setting
}

export function serializeThemePreference(
  setting: ThemeSetting,
  prefersDark: boolean,
): string {
  const preference: StoredThemePreference = {
    theme: resolveTheme(setting, prefersDark),
    theme_setting: setting,
  }
  return JSON.stringify(preference)
}

function bootstrapTheme(
  key: string,
  mediaQuery: string,
  parse: typeof parseThemeSetting,
  resolve: typeof resolveTheme,
): void {
  try {
    const setting = parse(localStorage.getItem(key))
    const theme = resolve(setting, window.matchMedia(mediaQuery).matches)
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}

/** Builds the pre-hydration script from the same parser and resolver used by React. */
export function createThemeBootstrapScript(): string {
  return `(${bootstrapTheme.toString()})(${JSON.stringify(THEME_STORAGE_KEY)},${JSON.stringify(THEME_MEDIA_QUERY)},${parseThemeSetting.toString()},${resolveTheme.toString()});`
}
