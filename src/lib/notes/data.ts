import fs from "node:fs";
import path from "node:path";
import { routing } from "@/i18n/routing";
import type { Note, NoteMeta, NotesIndexFile, TopicMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "notes-data");
const EMPTY_INDEX: NotesIndexFile = { topics: [], posts: [] };
const TOPIC_READING_ORDERS: Record<string, string[]> = {
  "mua-nha": [
    "mua-nha-nhung-dieu-can-biet",
    "chi-phi-mua-nha-toan-bo-nhung-khoan-can-biet",
    "vay-ngan-hang-mua-nha-don-bay-thong-minh",
    "phap-ly-bat-dong-san-nhung-dieu-can-biet",
    "chon-vi-tri-va-quy-hoach-khi-mua-nha",
    "dinh-gia-va-thuong-luong-gia-mua-nha",
    "quy-trinh-mua-nha-tu-a-den-z",
    "chung-cu-vs-nha-dat-va-mua-nha-du-an",
    "doc-ban-ve-thiet-ke-nha-danh-gia-chat-luong",
    "phong-thuy-mua-nha-tieu-chi-can-biet",
    "tam-ly-mua-nha-tranh-bay-nguoi-ban",
    "bay-mat-tien-khi-mua-nha-cac-kich-ban-can-tranh"
  ]
};

export interface TopicReadingContext {
  topic: TopicMeta;
  part: number;
  total: number;
  prev: NoteMeta | null;
  next: NoteMeta | null;
}

/**
 * Notes carry content in at most two languages: a Vietnamese-native legacy set
 * and a bilingual set migrated from the blog. Every routing locale collapses to
 * one of these two "content locales": Vietnamese serves `vi`, English serves
 * everything else (the international fallback).
 */
function contentLocale(locale?: string): "vi" | "en" {
  return locale === "vi" ? "vi" : "en";
}

function noteLocales(post: NoteMeta): string[] {
  return post.locales ?? ["vi"];
}

function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
}

function byDateDesc(a: NoteMeta, b: NoteMeta): number {
  return b.date.localeCompare(a.date);
}

function baseIndex(): NotesIndexFile {
  return (
    readJson<NotesIndexFile>(path.join(DATA_DIR, "_index.json")) ?? EMPTY_INDEX
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

  const topicOverrides = new Map((override.topics ?? []).map((t) => [t.id, t]));
  const postOverrides = new Map((override.posts ?? []).map((p) => [p.slug, p]));

  return {
    topics: base.topics.map((t) => ({
      ...t,
      ...(topicOverrides.get(t.id) ?? {})
    })),
    posts: base.posts.map((p) => ({
      ...p,
      ...(postOverrides.get(p.slug) ?? {})
    }))
  };
}

/** Notes visible for a locale — those that actually have content in it. */
export function listNotes(locale?: string): NoteMeta[] {
  const eff = contentLocale(locale);
  return loadNotesIndex(locale)
    .posts.filter((p) => noteLocales(p).includes(eff))
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
  if (!current?.topic) return null;

  const orderedSlugs = TOPIC_READING_ORDERS[current.topic];
  if (!orderedSlugs) return null;

  const topic = getTopic(current.topic, locale);
  if (!topic) return null;

  const orderIndex = new Map(orderedSlugs.map((s, i) => [s, i]));
  const visibleNotes = listNotes(locale).filter(
    (p) => p.topic === current.topic
  );
  const orderedNotes = visibleNotes
    .filter((p) => orderIndex.has(p.slug))
    .sort((a, b) => orderIndex.get(a.slug)! - orderIndex.get(b.slug)!);
  const extraNotes = visibleNotes
    .filter((p) => !orderIndex.has(p.slug))
    .sort(byDateDesc);
  const notes = [...orderedNotes, ...extraNotes];
  const index = notes.findIndex((p) => p.slug === slug);

  if (index === -1) return null;

  return {
    topic,
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
      if (noteLocales(p).includes(eff)) out.push({ locale, slug: p.slug });
    }
  }
  return out;
}

/** Loads a single note, overlaying the Vietnamese body when serving `vi`. */
export function loadNote(slug: string, locale?: string): Note | null {
  const base = readJson<Note>(path.join(DATA_DIR, "posts", `${slug}.json`));
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
    faqs: override.faqs ?? base.faqs
  };
}
