import type { BookSource, Faq } from "@/lib/content/types";

/** @see {@link Faq} — shared with blog. */
export type NoteFaq = Faq;

/** @see {@link BookSource} — shared with blog. */
export type NoteBookSource = BookSource;

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
  /** Language the canonical note body is authored in. */
  baseLocale?: string;
  /** Content locales served for this shared note slug. */
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
