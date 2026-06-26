import { existsSync } from "node:fs";
import path from "node:path";
import { routing } from "@/i18n/routing";
import {
  byDateDesc,
  overlayByKey,
  readJson,
  readJsonValidated
} from "@/lib/content/io";
import { notesIndexSchema, noteSchema } from "./schema";
import type { Note, NoteMeta, NotesIndexFile, TopicMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "notes-data");
const EMPTY_INDEX: NotesIndexFile = { topics: [], posts: [] };

export interface TopicReadingContext {
  topic: TopicMeta | null;
  scope: "topic" | "all";
  part: number;
  total: number;
  prev: NoteMeta | null;
  next: NoteMeta | null;
}

export const NOTE_CONTENT_LOCALES = ["en", "vi"] as const;

/**
 * Notes are listed as one shared collection across English and Vietnamese.
 * English is the canonical body; Vietnamese uses locale overrides for metadata
 * and article content.
 */
function contentLocale(locale?: string): "vi" | "en" {
  return locale === "vi" ? "vi" : "en";
}

function noteLocales(): string[] {
  return [...NOTE_CONTENT_LOCALES];
}

export function getNoteContentLocales(slug: string): string[] {
  return [
    "en",
    ...(existsSync(path.join(DATA_DIR, "vi", "posts", `${slug}.json`))
      ? ["vi"]
      : [])
  ];
}

function baseIndex(): NotesIndexFile {
  return (
    readJsonValidated(path.join(DATA_DIR, "_index.json"), notesIndexSchema) ??
    EMPTY_INDEX
  );
}

/**
 * Loads the notes index for a content locale, overlaying per-locale translated
 * metadata (topic labels, note title/summary/tags) where an override exists.
 * Untranslated fields keep their base value so the index never goes blank.
 */
export function loadNotesIndex(locale?: string): NotesIndexFile {
  const base = baseIndex();
  if (contentLocale(locale) !== "vi") return base;

  const override = readJson<Partial<NotesIndexFile>>(
    path.join(DATA_DIR, "vi", "_index.json")
  );
  if (!override) return base;

  return {
    topics: overlayByKey(base.topics, override.topics, (t) => t.id),
    posts: overlayByKey(base.posts, override.posts, (p) => p.slug)
  };
}

/** Notes visible for a locale — both English and Vietnamese serve the shared set. */
export function listNotes(locale?: string): NoteMeta[] {
  const eff = contentLocale(locale);
  return loadNotesIndex(locale)
    .posts.filter(() => noteLocales().includes(eff))
    .sort(byDateDesc);
}

/** Topics that have at least one visible note for the locale. */
export function listTopics(locale?: string): TopicMeta[] {
  const visible = new Set(
    listNotes(locale).map((p) => p.topic ?? "__uncategorized__")
  );
  return loadNotesIndex(locale).topics.filter((t) => visible.has(t.id));
}

export function getTopic(id: string, locale?: string): TopicMeta | null {
  return loadNotesIndex(locale).topics.find((t) => t.id === id) ?? null;
}

export function listNotesByTopic(locale?: string): Map<string, NoteMeta[]> {
  const map = new Map<string, NoteMeta[]>();
  for (const post of listNotes(locale)) {
    const key = post.topic ?? "__uncategorized__";
    const group = map.get(key) ?? [];
    group.push(post);
    map.set(key, group);
  }
  return map;
}

export function getTopicReadingContext(
  slug: string,
  locale?: string
): TopicReadingContext | null {
  const current = loadNotesIndex(locale).posts.find((p) => p.slug === slug);
  if (!current) return null;

  const visibleNotes = listNotes(locale);
  const topic = current.topic ? getTopic(current.topic, locale) : null;
  const topicNotes = current.topic
    ? visibleNotes.filter((p) => p.topic === current.topic)
    : [];
  const scope = topicNotes.length > 1 ? "topic" : "all";
  const notes = scope === "topic" ? topicNotes : visibleNotes;
  const index = notes.findIndex((p) => p.slug === slug);

  if (index === -1) return null;

  return {
    topic,
    scope,
    part: index + 1,
    total: notes.length,
    prev: notes[index - 1] ?? null,
    next: notes[index + 1] ?? null
  };
}

/** (locale, slug) pairs for static generation — one per locale a note serves. */
export function listNoteParams(): Array<{ locale: string; slug: string }> {
  const posts = baseIndex().posts;
  const out: Array<{ locale: string; slug: string }> = [];
  for (const locale of routing.locales) {
    const eff = contentLocale(locale);
    for (const p of posts) {
      if (noteLocales().includes(eff)) out.push({ locale, slug: p.slug });
    }
  }
  return out;
}

/** Loads a single note, overlaying the Vietnamese body when serving `vi`. */
export function loadNote(slug: string, locale?: string): Note | null {
  const base = readJsonValidated(
    path.join(DATA_DIR, "posts", `${slug}.json`),
    noteSchema
  );
  if (!base) return null;
  if (contentLocale(locale) !== "vi") return base;

  const override = readJson<Partial<Note>>(
    path.join(DATA_DIR, "vi", "posts", `${slug}.json`)
  );
  if (!override) return base;

  return {
    ...base,
    title: override.title ?? base.title,
    summary: override.summary ?? base.summary,
    html: override.html ?? base.html,
    tags: override.tags ?? base.tags,
    book: override.book ?? base.book,
    faqs: override.faqs ?? base.faqs
  };
}
