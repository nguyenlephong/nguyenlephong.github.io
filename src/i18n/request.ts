import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

function deepMerge<T extends Record<string, unknown>>(base: T, override: T): T {
  const out: Record<string, unknown> = { ...base }
  for (const [k, v] of Object.entries(override)) {
    const b = out[k]
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      b &&
      typeof b === 'object' &&
      !Array.isArray(b)
    ) {
      out[k] = deepMerge(
        b as Record<string, unknown>,
        v as Record<string, unknown>,
      )
    } else {
      out[k] = v
    }
  }
  return out as T
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const fallback = (await import(`../../messages/${routing.defaultLocale}.json`))
    .default as Record<string, unknown>

  const messages =
    locale === routing.defaultLocale
      ? fallback
      : deepMerge(
          fallback,
          (await import(`../../messages/${locale}.json`)).default as Record<
            string,
            unknown
          >,
        )

  return {
    locale,
    messages,
    onError(error) {
      if (error.code === 'MISSING_MESSAGE') return
      console.error(error)
    },
    getMessageFallback({ key }) {
      return key
    },
  }
})
