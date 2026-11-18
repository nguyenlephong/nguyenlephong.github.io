import type { CSSProperties } from 'react'
import type { AdminPostRow } from '@/lib/admin/insights.mjs'

// Category identity, one fixed hue per category. Validated with the dataviz
// palette checker for light and dark surfaces (CVD and normal-vision separation
// pass). Numbers and dates are formatted per language in admin-i18n.ts.
const CATEGORY_COLORS: Record<string, string> = {
  architecture: '#0d9488',
  culture: '#7c5cff',
  ai: '#c98500',
  perspectives: '#d9467a',
  'ways-of-working': '#2563eb',
  notes: '#a8541a',
}

export const categoryStyle = (category: string): CSSProperties =>
  ({ '--cat': CATEGORY_COLORS[category] ?? 'var(--admin-other)' }) as CSSProperties

export function postHref(post: AdminPostRow, localeById: ReadonlyMap<string, string>): string | null {
  if (!post.listed) return null
  const locale = localeById.get(post.id) ?? 'en'
  const slug = post.id.slice(post.id.indexOf('__') + 2)
  return post.category === 'notes' ? `/${locale}/notes/${slug}` : `/${locale}/blog/${post.category}/${slug}`
}
