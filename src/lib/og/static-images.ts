import { icdnAssetUrl } from '@/lib/assets/icdn'

export function staticOgUrl(path: string): string {
  return icdnAssetUrl(path)
}

export function blogPostOgImagePath(slug: string): string {
  return `/og/blogs/${slug}.jpg`
}

export function noteOgImagePath(slug: string): string {
  return `/og/notes/${slug}.jpg`
}

export function blogPostOgImageUrl(slug: string): string {
  return staticOgUrl(blogPostOgImagePath(slug))
}

export function noteOgImageUrl(slug: string): string {
  return staticOgUrl(noteOgImagePath(slug))
}
