import { SITE_URL } from '@/app/seo.config'

export function staticOgUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function blogPostOgImagePath(slug: string): string {
  return `/og/blog/${slug}.png`
}

export function noteOgImagePath(slug: string): string {
  return `/og/notes/${slug}.png`
}

export function blogPostOgImageUrl(slug: string): string {
  return staticOgUrl(blogPostOgImagePath(slug))
}

export function noteOgImageUrl(slug: string): string {
  return staticOgUrl(noteOgImagePath(slug))
}
