import path from "node:path";
import type { Locale } from "@/i18n/routing";
import {
  byDateDesc,
  overlayByKey,
  readRequiredJsonValidated,
  readJsonValidated
} from "@/lib/content/io";
import {
  assertExactSlugSet,
  assertIndexBodyMetadataParity,
  assertKnownKeys,
  assertProvidedMetadataParity,
  listJsonSlugs
} from "@/lib/content/catalog";
import { pageCount } from "@/lib/content/pagination";
import { getContentVersionTracker } from "@/lib/content/freshness";
import { rewriteContentAssetValues } from "@/lib/assets/icdn";
import {
  noteOverrideSchema,
  notesIndexOverrideSchema,
  notesIndexSchema,
  noteSchema
} from "./schema";
import type { Note, NoteMeta, NotesIndexFile, TopicMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "notes-data");
const contentVersionTracker =
  process.env.NODE_ENV === "production"
    ? null
    : getContentVersionTracker(DATA_DIR);
const NOTE_METADATA_FIELDS = [
  "slug",
  "title",
  "summary",
  "cardSummary",
  "date",
  "updated",
  "readingMinutes",
  "tags",
  "topic"
] as const;
const NOTE_CANONICAL_OVERRIDE_FIELDS = [
  "slug",
  "date",
  "topic",
  "featured"
] as const;

interface NotesCatalog {
  index: NotesIndexFile;
  postsBySlug: Map<string, NoteMeta>;
}

interface NotesCatalogSnapshot {
  version: number;
  catalog: NotesCatalog;
}

const MAX_STABLE_SNAPSHOT_ATTEMPTS = 3;
let baseCatalogCache: NotesCatalogSnapshot | null = null;
const localizedIndexCache = new Map<
  string,
  { version: number; index: NotesIndexFile }
>();

function currentContentVersion(): number {
  return contentVersionTracker?.currentVersion() ?? 0;
}

/** See `invalidateBlogContentCatalog`; module reloads reset this cache for HMR. */
export function invalidateNotesContentCatalog(): void {
  baseCatalogCache = null;
  localizedIndexCache.clear();
}

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

export function getNoteContentLocales(slug: string): Locale[] {
  const note = baseIndex().posts.find((entry) => entry.slug === slug);
  return note?.locales ? [...note.locales] : [];
}

function baseIndex(): NotesIndexFile {
  return baseCatalog().index;
}

/** Stable base snapshot shared by canonical and localized catalog builds. */
function baseCatalogSnapshot(): NotesCatalogSnapshot {
  for (let attempt = 1; attempt <= MAX_STABLE_SNAPSHOT_ATTEMPTS; attempt += 1) {
    const version = currentContentVersion();
    if (baseCatalogCache?.version === version) return baseCatalogCache;

    const catalog = buildBaseCatalog();
    if (currentContentVersion() !== version) continue;

    const snapshot = { version, catalog };
    baseCatalogCache = snapshot;
    localizedIndexCache.clear();
    return snapshot;
  }

  throw new Error(
    "Notes content changed repeatedly while building a stable catalog snapshot"
  );
}

function buildBaseCatalog(): NotesCatalog {
  const indexPath = path.join(DATA_DIR, "_index.json");
  const rawIndex = readRequiredJsonValidated(
    indexPath,
    notesIndexSchema,
    "canonical notes index"
  );
  const expectedSlugs = rawIndex.posts.map((post) => post.slug);
  assertExactSlugSet(
    "Canonical notes",
    expectedSlugs,
    listJsonSlugs(path.join(DATA_DIR, "posts"))
  );

  for (const entry of rawIndex.posts) {
    const bodyPath = path.join(DATA_DIR, "posts", `${entry.slug}.json`);
    const body = readRequiredJsonValidated(
      bodyPath,
      noteSchema,
      `canonical note body for "${entry.slug}"`
    );
    assertIndexBodyMetadataParity(
      "Canonical notes",
      entry as unknown as Record<string, unknown>,
      body as unknown as Record<string, unknown>,
      bodyPath,
      NOTE_METADATA_FIELDS
    );
  }

  const index = rewriteContentAssetValues(rawIndex);
  const catalog = {
    index,
    postsBySlug: new Map(index.posts.map((post) => [post.slug, post]))
  };
  return catalog;
}

function baseCatalog(): NotesCatalog {
  return baseCatalogSnapshot().catalog;
}

/**
 * Loads the notes index for a content locale, overlaying per-locale translated
 * metadata (topic labels, note title/summary/tags) where an override exists.
 * Untranslated fields keep their base value so the index never goes blank.
 */
export function loadNotesIndex(locale?: string): NotesIndexFile {
  if (contentLocale(locale) !== "vi") return baseIndex();

  for (let attempt = 1; attempt <= MAX_STABLE_SNAPSHOT_ATTEMPTS; attempt += 1) {
    const baseSnapshot = baseCatalogSnapshot();
    const { version, catalog } = baseSnapshot;
    if (currentContentVersion() !== version) continue;

    const cached = localizedIndexCache.get("vi");
    if (cached?.version === version) return cached.index;

    const override = readJsonValidated(
      path.join(DATA_DIR, "vi", "_index.json"),
      notesIndexOverrideSchema
    );
    if (!override) {
      if (currentContentVersion() === version) return catalog.index;
      continue;
    }

    assertKnownKeys(
      "Localized note topics (vi)",
      catalog.index.topics.map((topic) => topic.id),
      override.topics?.map((topic) => topic.id) ?? []
    );
    assertKnownKeys(
      "Localized notes (vi)",
      catalog.index.posts.map((post) => post.slug),
      override.posts?.map((post) => post.slug) ?? []
    );

    const index = notesIndexSchema.parse(rewriteContentAssetValues({
      topics: overlayByKey(catalog.index.topics, override.topics, (t) => t.id),
      posts: overlayByKey(catalog.index.posts, override.posts, (p) => p.slug)
    }));

    const expectedSlugs = catalog.index.posts
      .filter((post) => post.locales?.includes("vi"))
      .map((post) => post.slug);
    const bodyDirectory = path.join(DATA_DIR, "vi", "posts");
    assertExactSlugSet(
      "Localized notes (vi)",
      expectedSlugs,
      listJsonSlugs(bodyDirectory)
    );
    const indexBySlug = new Map(index.posts.map((post) => [post.slug, post]));
    for (const slug of expectedSlugs) {
      const bodyPath = path.join(bodyDirectory, `${slug}.json`);
      const body = loadNoteBody(slug, "vi");
      const indexedNote = indexBySlug.get(slug);
      if (!body || !indexedNote) {
        throw new Error(`Localized notes (vi) could not resolve "${slug}"`);
      }
      assertIndexBodyMetadataParity(
        "Localized notes (vi)",
        indexedNote as unknown as Record<string, unknown>,
        body as unknown as Record<string, unknown>,
        bodyPath,
        NOTE_METADATA_FIELDS
      );
    }

    if (currentContentVersion() !== version) continue;
    localizedIndexCache.set("vi", { version, index });
    return index;
  }

  throw new Error(
    "Notes content (vi) changed repeatedly while building a stable localized catalog"
  );
}

/** Notes visible for a locale — both English and Vietnamese serve the shared set. */
export function listNotes(locale?: string): NoteMeta[] {
  const eff = contentLocale(locale);
  return loadNotesIndex(locale)
    .posts.filter(() => noteLocales().includes(eff))
    .sort(byDateDesc);
}

/** Real note archive locales whose authored corpus reaches this page. */
export function listNotesArchiveLocales(page: number): Locale[] {
  if (!Number.isInteger(page) || page < 1) return [];
  return NOTE_CONTENT_LOCALES.filter(
    (locale) => page <= pageCount(listNotes(locale).length)
  );
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
export function listNoteParams(): Array<{ locale: Locale; slug: string }> {
  return baseIndex().posts.flatMap((note) =>
    (note.locales ?? [note.baseLocale ?? "en"]).map((locale) => ({
      locale,
      slug: note.slug
    }))
  );
}

/** Loads a single note, overlaying the Vietnamese body when serving `vi`. */
export function loadNote(slug: string, locale?: string): Note | null {
  if (!baseCatalog().postsBySlug.has(slug)) return null;
  return loadNoteBody(slug, locale);
}

function loadNoteBody(slug: string, locale?: string): Note | null {
  const base = readJsonValidated(
    path.join(DATA_DIR, "posts", `${slug}.json`),
    noteSchema
  );
  if (!base) return null;
  if (contentLocale(locale) !== "vi") {
    return rewriteContentAssetValues(base);
  }

  const override = readJsonValidated(
    path.join(DATA_DIR, "vi", "posts", `${slug}.json`),
    noteOverrideSchema
  );
  if (!override) return rewriteContentAssetValues(base);

  const overridePath = path.join(DATA_DIR, "vi", "posts", `${slug}.json`);
  assertProvidedMetadataParity(
    "Localized note body (vi)",
    base as unknown as Record<string, unknown>,
    override as unknown as Record<string, unknown>,
    overridePath,
    NOTE_CANONICAL_OVERRIDE_FIELDS
  );
  if (override.baseLocale !== undefined && override.baseLocale !== "vi") {
    throw new Error(
      `Localized note body (vi) has invalid baseLocale in ${overridePath}: expected=\"vi\" actual=${JSON.stringify(override.baseLocale)}`
    );
  }
  if (
    override.locales !== undefined &&
    (override.locales.length !== 1 || override.locales[0] !== "vi")
  ) {
    throw new Error(
      `Localized note body (vi) has invalid source locales in ${overridePath}: expected=[\"vi\"] actual=${JSON.stringify(override.locales)}`
    );
  }

  const note = {
    ...base,
    title: override.title ?? base.title,
    summary: override.summary ?? base.summary,
    cardSummary: override.cardSummary ?? base.cardSummary,
    readingMinutes: override.readingMinutes ?? base.readingMinutes,
    updated: override.updated ?? base.updated,
    html: override.html ?? base.html,
    tags: override.tags ?? base.tags,
    author: override.author ?? base.author,
    book: override.book ?? base.book,
    faqs: override.faqs ?? base.faqs
  };

  return rewriteContentAssetValues(note);
}
