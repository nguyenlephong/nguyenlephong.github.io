import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/seo.config";
import { routing } from "@/i18n/routing";
import {
  getPostContentLocales,
  getPostsByCategory,
  listCategoryPostPairs,
  listCategorySlugs,
  listPosts,
  loadPost
} from "@/lib/blog/data";
import {
  getNoteContentLocales,
  listNotes,
  loadNote,
  NOTE_CONTENT_LOCALES
} from "@/lib/notes/data";

export const dynamic = "force-static";

const PATHS: Array<{
  path: string;
  priority: number;
  freq: "weekly" | "monthly";
  locales?: readonly string[];
  lastModifiedForLocale?: (locale: string) => Date | undefined;
}> = [
  { path: "", priority: 1, freq: "weekly" },
  { path: "/apps", priority: 0.9, freq: "weekly" },
  {
    path: "/blog",
    priority: 0.9,
    freq: "weekly",
    lastModifiedForLocale: (locale) =>
      latestDate(listPosts(locale).map((post) => post.updated ?? post.date))
  },
  { path: "/studio", priority: 0.85, freq: "weekly" },
  { path: "/about", priority: 0.8, freq: "monthly" },
  { path: "/gallery", priority: 0.7, freq: "monthly" },
  {
    path: "/notes",
    priority: 0.85,
    freq: "weekly",
    locales: NOTE_CONTENT_LOCALES,
    lastModifiedForLocale: (locale) =>
      latestDate(listNotes(locale).map((note) => note.updated ?? note.date))
  }
];

function latestDate(values: Array<string | undefined>): Date | undefined {
  let latest: Date | undefined;

  for (const value of values) {
    if (!value) continue;
    const candidate = new Date(value);
    if (Number.isNaN(candidate.getTime())) continue;
    if (!latest || candidate > latest) latest = candidate;
  }

  return latest;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const pushPath = (
    path: string,
    priority: number,
    freq: "weekly" | "monthly",
    locales: readonly string[] = routing.locales,
    lastModifiedForLocale?: (locale: string) => Date | undefined
  ) => {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${SITE_URL}/${locale}${path}`;
    }
    languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${path}`;

    for (const locale of locales) {
      const lastModified = lastModifiedForLocale?.(locale);
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: freq,
        priority,
        alternates: { languages }
      });
    }
  };

  for (const { path, priority, freq, locales, lastModifiedForLocale } of PATHS) {
    pushPath(path, priority, freq, locales, lastModifiedForLocale);
  }

  for (const category of listCategorySlugs()) {
    pushPath(
      `/blog/${category}`,
      0.7,
      "weekly",
      undefined,
      (locale) =>
        latestDate(
          getPostsByCategory(category, locale).map((post) => post.updated ?? post.date)
        )
    );
  }

  for (const { category, slug } of listCategoryPostPairs()) {
    pushPath(
      `/blog/${category}/${slug}`,
      0.8,
      "monthly",
      getPostContentLocales(slug),
      (locale) => {
        const post = loadPost(slug, locale);
        return post ? latestDate([post.updated ?? post.date]) : undefined;
      }
    );
  }

  for (const note of listNotes("en")) {
    pushPath(
      `/notes/${note.slug}`,
      0.8,
      "monthly",
      getNoteContentLocales(note.slug),
      (locale) => {
        const localizedNote = loadNote(note.slug, locale);
        return localizedNote
          ? latestDate([localizedNote.updated ?? localizedNote.date])
          : undefined;
      }
    );
  }

  return entries;
}
