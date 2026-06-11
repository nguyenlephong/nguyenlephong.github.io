export interface NoteFaq {
  /** Question (plain text) */
  q: string;
  /** Answer — may contain simple inline HTML */
  a: string;
}

export interface NoteMeta {
  slug: string;
  title: string;
  summary: string;
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
