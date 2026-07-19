import type { BookSource, EditorialMetadata, Faq } from "@/lib/content/types";
import type { ContentPublicationStatus } from "@/lib/content/publication";
import type { Locale } from "@/i18n/routing";

/** @see {@link Faq} — shared with blog. */
export type NoteFaq = Faq;

/** @see {@link BookSource} — shared with blog. */
export type NoteBookSource = BookSource;

export interface NoteMeta extends EditorialMetadata {
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
  /** Optional embargo date; defaults to `date`. */
  publishAt?: string;
  /** Missing means published; drafts never enter a public build. */
  status?: ContentPublicationStatus;
  readingMinutes: number;
  tags: string[];
  topic?: string;
  author?: string;
  featured?: boolean;
  /** Language the canonical note body is authored in. */
  baseLocale?: Locale;
  /** Content locales served for this shared note slug. */
  locales?: Locale[];
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

export interface NoteHubMeta {
  /** Existing topic identifier selected for an indexable static hub. */
  topic: string;
  title: string;
  intro: string;
  /** Explicit editorial order; hub membership never depends on note count. */
  order: number;
}

export interface NotesIndexFile {
  hubs: NoteHubMeta[];
  topics: TopicMeta[];
  posts: NoteMeta[];
}
