export interface NoteFaq {
  /** Question (plain text) */
  q: string;
  /** Answer — may contain simple inline HTML */
  a: string;
}

export interface NoteBookSource {
  /** Localized or commonly used title in this note. */
  title: string;
  /** Original title of the book, when different or useful for attribution. */
  originalTitle?: string;
  /** Book authors, not the author of this website note. */
  authors: string[];
  /** Named contributors credited by the source book. */
  contributors?: string[];
  publisher?: string;
  published?: string;
  isbn?: string;
  /** Short editorial note about how this article relates to the book. */
  note?: string;
}

export interface NoteMeta {
  slug: string;
  title: string;
  summary: string;
  /**
   * Short, punchy hook shown on list/index cards in place of the long SEO
   * `summary`. Keep it to one sentence so cards stay compact and uniform
   * (3-per-row). Falls back to `summary` when absent.
   */
  cardSummary?: string;
  date: string;
  updated?: string;
  readingMinutes: number;
  tags: string[];
  topic?: string;
  author?: string;
  featured?: boolean;
  /** Language the base content is authored in (default 'vi' for legacy notes). */
  baseLocale?: string;
  /** Locales this note has content for, e.g. ['en','vi']. Defaults to ['vi']. */
  locales?: string[];
}

export interface Note extends NoteMeta {
  html: string;
  /** Optional source book metadata for book reflections. */
  book?: NoteBookSource;
  /** Optional FAQ — rendered as a section and emitted as FAQPage JSON-LD */
  faqs?: NoteFaq[];
}

export interface TopicMeta {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface NotesIndexFile {
  topics: TopicMeta[];
  posts: NoteMeta[];
}
