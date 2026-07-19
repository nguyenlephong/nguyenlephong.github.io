/**
 * Content primitives shared across the blog and notes surfaces. Both used to
 * declare byte-identical `*Faq` / `*BookSource` interfaces; they now alias these
 * canonical definitions so the shape stays in one place.
 */

/** A question/answer pair; the answer may contain simple inline HTML. */
export interface Faq {
  /** Question (plain text) */
  q: string
  /** Answer — may contain simple inline HTML */
  a: string
}

/**
 * A small editorial classification used by metadata and structured data.
 * This is deliberately a closed vocabulary rather than a free-form theme tag.
 */
export type ContentMode =
  | 'technical'
  | 'reflective'
  | 'book-reflection'
  | 'decision-guide'

/** Optional editorial controls shared by authored Blog and Notes content. */
export interface EditorialMetadata {
  contentMode?: ContentMode
  /** Search-specific title. The visible article heading remains `title`. */
  seoTitle?: string
  /** Search-specific description. The visible summary remains `summary`. */
  seoDescription?: string
  /** Date the content was reviewed for accuracy; never an edit timestamp. */
  reviewedAt?: string
}

/** Source-book metadata for book reflections. */
export interface BookSource {
  /** Localized or commonly used title used in this piece. */
  title: string
  /** Original title of the book, when different or useful for attribution. */
  originalTitle?: string
  /** Book authors — not the author of this website. */
  authors: string[]
  /** Named contributors credited by the source book. */
  contributors?: string[]
  publisher?: string
  published?: string
  isbn?: string
  /** Short editorial note about how this piece relates to the book. */
  note?: string
}
