/** Client-side search helpers shared by the blog/notes explorers. */

/** Diacritic- and case-insensitive normaliser (so "kien truc" matches "kiến trúc"). */
export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
}

/** Reads a query-string param on the client; returns null during SSR. */
export function readUrlParam(key: string): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(key)
}
