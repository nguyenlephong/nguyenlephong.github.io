/** `data-author-link` values rendered by the article byline and author box. */
export const AUTHOR_LINK_TARGETS = ['byline', 'cv', 'resume', 'email'] as const

export type AuthorLinkTarget = (typeof AUTHOR_LINK_TARGETS)[number]

export interface AuthorClickProperties {
  content_surface: 'blog' | 'notes'
  content_category: string
  content_slug: string
  target: AuthorLinkTarget
}

/** Properties for `blog_author_click`, or null when the link target is unknown. */
export function authorClickProperties(
  surface: 'blog' | 'notes',
  category: string,
  slug: string,
  target: string | undefined,
): AuthorClickProperties | null {
  if (!(AUTHOR_LINK_TARGETS as readonly (string | undefined)[]).includes(target)) {
    return null
  }
  return {
    content_surface: surface,
    content_category: category,
    content_slug: slug,
    target: target as AuthorLinkTarget,
  }
}
