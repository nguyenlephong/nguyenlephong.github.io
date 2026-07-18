import { icdnAssetUrl } from '@/lib/assets/icdn'
import mediaPublication from '../../../config/media-publication.json' with { type: 'json' }

type ArticleOgSurface = keyof typeof mediaPublication.articleOg

export function staticOgUrl(path: string): string {
  return icdnAssetUrl(path)
}

function articleOgImagePath(surface: ArticleOgSurface, slug: string): string {
  const publication = mediaPublication.articleOg[surface]
  return `${publication.publicPathPrefix}/${slug}${publication.publicationExtension}`
}

export function blogPostOgImagePath(slug: string): string {
  return articleOgImagePath('blog', slug)
}

export function noteOgImagePath(slug: string): string {
  return articleOgImagePath('notes', slug)
}

export function blogPostOgImageUrl(slug: string): string {
  return staticOgUrl(blogPostOgImagePath(slug))
}

export function noteOgImageUrl(slug: string): string {
  return staticOgUrl(noteOgImagePath(slug))
}
