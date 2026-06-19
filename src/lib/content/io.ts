import fs from 'node:fs'
import { routing } from '@/i18n/routing'

/**
 * Shared, build-time content IO for the blog / notes / thoughts data layers.
 *
 * Previously each surface kept its own byte-identical `readJson`, with no
 * caching (so a single article render reparsed the whole `_index.json` several
 * times) and an unguarded `JSON.parse` (so one malformed content file failed
 * the build with an anonymous SyntaxError). This module centralises the fix.
 */

// Content is immutable for the duration of a production static export, so
// memoising by absolute path turns the repeated full-index reparses into a
// single read. Disabled outside production so `next dev` always reflects edits.
const CACHE_ENABLED = process.env.NODE_ENV === 'production'
const cache = new Map<string, unknown>()

/**
 * Reads and parses a JSON content file, returning `null` when it is absent.
 * Throws an Error naming the offending path on malformed JSON so a content typo
 * fails the build with an actionable message instead of a bare SyntaxError.
 */
export function readJson<T>(file: string): T | null {
  if (CACHE_ENABLED && cache.has(file)) return cache.get(file) as T

  let raw: string
  try {
    raw = fs.readFileSync(file, 'utf-8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      if (CACHE_ENABLED) cache.set(file, null)
      return null
    }
    throw err
  }

  let parsed: T
  try {
    parsed = JSON.parse(raw) as T
  } catch (err) {
    throw new Error(
      `Invalid JSON in content file: ${file}\n  ${(err as Error).message}`,
    )
  }

  if (CACHE_ENABLED) cache.set(file, parsed)
  return parsed
}

/** True when no locale is given, or it is the canonical (default) locale. */
export function isDefaultLocale(locale?: string): boolean {
  return !locale || locale === routing.defaultLocale
}

/** Comparator: newest `date` first (ISO `yyyy-mm-dd` strings). */
export function byDateDesc<T extends { date: string }>(a: T, b: T): number {
  return b.date.localeCompare(a.date)
}

/**
 * Overlays per-locale translated entries onto a base list, matched by `key`.
 * Fields absent from an override keep their base value, so a partial
 * translation never blanks out an entry. Used to merge `_index.json` locale
 * overrides for both blog (key: slug) and notes (key: topic id / post slug).
 */
export function overlayByKey<T extends object>(
  base: T[],
  overrides: T[] | undefined,
  key: (item: T) => string,
): T[] {
  if (!overrides?.length) return base
  const map = new Map(overrides.map((o) => [key(o), o]))
  return base.map((item) => {
    const override = map.get(key(item))
    return override ? { ...item, ...override } : item
  })
}
