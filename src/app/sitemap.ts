import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/seo.config";
import { routing } from "@/i18n/routing";
import { listCategorySlugs, listCategoryPostPairs } from "@/lib/blog/data";
import { listNotes } from "@/lib/notes/data";

export const dynamic = "force-static";

const PATHS: Array<{
  path: string;
  priority: number;
  freq: "weekly" | "monthly";
}> = [
  { path: "", priority: 1, freq: "weekly" },
  { path: "/apps", priority: 0.9, freq: "weekly" },
  { path: "/blog", priority: 0.9, freq: "weekly" },
  { path: "/about", priority: 0.8, freq: "monthly" },
  { path: "/cv", priority: 0.8, freq: "monthly" },
  { path: "/gallery", priority: 0.7, freq: "monthly" },
  { path: "/notes", priority: 0.85, freq: "weekly" }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const pushPath = (
    path: string,
    priority: number,
    freq: "weekly" | "monthly"
  ) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${SITE_URL}/${locale}${path}`;
    }
    languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${path}`;

    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: freq,
        priority,
        alternates: { languages }
      });
    }
  };

  for (const { path, priority, freq } of PATHS) pushPath(path, priority, freq);

  // Blog category landings + per-post entries (each with hreflang cluster)
  for (const category of listCategorySlugs()) {
    pushPath(`/blog/${category}`, 0.7, "weekly");
  }
  for (const { category, slug } of listCategoryPostPairs()) {
    pushPath(`/blog/${category}/${slug}`, 0.8, "monthly");
  }

  // Notes: bilingual notes get a full hreflang cluster; Vietnamese-only notes
  // are emitted as a single /vi/notes/... canonical.
  const bilingualNotes = new Set(listNotes("en").map((n) => n.slug));
  for (const note of listNotes("vi")) {
    if (bilingualNotes.has(note.slug)) {
      pushPath(`/notes/${note.slug}`, 0.8, "monthly");
    } else {
      const canonical = `${SITE_URL}/vi/notes/${note.slug}`;
      entries.push({
        url: canonical,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.75,
        alternates: { languages: { vi: canonical, "x-default": canonical } }
      });
    }
  }

  return entries;
}
