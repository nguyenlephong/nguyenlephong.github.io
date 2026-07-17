import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/seo.config";
import { routing } from "@/i18n/routing";
import {
  getPostContentLocales,
  getPostsByCategory,
  listBlogArchiveLocales,
  listCategoryPostPairs,
  listCategorySlugs,
  listPosts,
  loadPost
} from "@/lib/blog/data";
import {
  getNoteContentLocales,
  listNotes,
  listNotesArchiveLocales,
  loadNote,
  NOTE_CONTENT_LOCALES
} from "@/lib/notes/data";
import { collectionPagePath, paginate } from "@/lib/content/pagination";
import { latestNonFutureDate } from "@/lib/seo/dates";

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
      latestNonFutureDate(listPosts(locale).map((post) => post.updated ?? post.date))
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
      latestNonFutureDate(listNotes(locale).map((note) => note.updated ?? note.date))
  }
];

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

  const blogPageTotal = Math.max(
    ...routing.locales.map(
      (locale) => paginate(listPosts(locale), 1)?.totalPages ?? 1
    )
  );
  for (let page = 2; page <= blogPageTotal; page += 1) {
    const pageLocales = listBlogArchiveLocales(page);
    pushPath(
      collectionPagePath("/blog", page),
      0.75,
      "weekly",
      pageLocales,
      (locale) => {
        const pageData = paginate(listPosts(locale), page);
        return latestNonFutureDate(
          pageData?.items.map((post) => post.updated ?? post.date) ?? []
        );
      }
    );
  }

  const notesPageTotal = Math.max(
    ...NOTE_CONTENT_LOCALES.map(
      (locale) => paginate(listNotes(locale), 1)?.totalPages ?? 1
    )
  );
  for (let page = 2; page <= notesPageTotal; page += 1) {
    const pageLocales = listNotesArchiveLocales(page);
    pushPath(
      collectionPagePath("/notes", page),
      0.7,
      "weekly",
      pageLocales,
      (locale) => {
        const pageData = paginate(listNotes(locale), page);
        return latestNonFutureDate(
          pageData?.items.map((note) => note.updated ?? note.date) ?? []
        );
      }
    );
  }

  for (const category of listCategorySlugs()) {
    pushPath(
      `/blog/${category}`,
      0.7,
      "weekly",
      undefined,
      (locale) =>
        latestNonFutureDate(
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
        return post
          ? latestNonFutureDate([post.updated ?? post.date])
          : undefined;
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
          ? latestNonFutureDate([localizedNote.updated ?? localizedNote.date])
          : undefined;
      }
    );
  }

  return entries;
}
