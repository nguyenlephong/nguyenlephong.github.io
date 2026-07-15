import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const extensionCandidates = [".ts", ".tsx", ".js", ".mjs"];

function resolveWithProjectExtensions(url) {
  const basePath = fileURLToPath(url);
  if (existsSync(basePath)) return url.href;

  for (const extension of extensionCandidates) {
    const candidate = `${basePath}${extension}`;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }

  for (const extension of extensionCandidates) {
    const candidate = path.join(basePath, `index${extension}`);
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }

  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveWithProjectExtensions(
        new URL(`../src/${specifier.slice(2)}`, import.meta.url)
      );
      if (resolved) return { url: resolved, shortCircuit: true };
    }

    if (
      context.parentURL?.startsWith("file:") &&
      (specifier.startsWith("./") || specifier.startsWith("../"))
    ) {
      const resolved = resolveWithProjectExtensions(
        new URL(specifier, context.parentURL)
      );
      if (resolved) return { url: resolved, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },
});

const { blogIndexSchema, blogPostSchema } = await import(
  new URL("../src/lib/blog/schema.ts", import.meta.url)
);
const { notesIndexSchema, noteSchema } = await import(
  new URL("../src/lib/notes/schema.ts", import.meta.url)
);
const { loadNote } = await import(
  new URL("../src/lib/notes/data.ts", import.meta.url)
);

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));
}

const validPost = {
  slug: "x",
  category: "c",
  title: "t",
  summary: "s",
  date: "2024-01-01",
  readingMinutes: 3,
  tags: ["a"],
  author: "me",
  html: "<p>x</p>"
};

test("blog post schema accepts a valid post", () => {
  assert.equal(blogPostSchema.safeParse(validPost).success, true);
});

test("blog post schema rejects a missing required field", () => {
  const { html, category, ...missing } = validPost;
  assert.equal(blogPostSchema.safeParse(missing).success, false);
});

test("blog post schema rejects a wrong field type", () => {
  assert.equal(
    blogPostSchema.safeParse({ ...validPost, readingMinutes: "three" }).success,
    false
  );
});

test("blog index schema validates nested posts", () => {
  const good = { categories: [], posts: [{ ...validPost }] };
  assert.equal(blogIndexSchema.safeParse(good).success, true);
  const bad = { categories: [], posts: [{ slug: "x" }] };
  assert.equal(blogIndexSchema.safeParse(bad).success, false);
});

test("notes schemas accept minimal valid shapes", () => {
  const index = {
    topics: [{ id: "t", label: "L", description: "d", color: "#000" }],
    posts: []
  };
  assert.equal(notesIndexSchema.safeParse(index).success, true);

  const note = {
    slug: "n",
    title: "t",
    summary: "s",
    date: "2024-01-01",
    readingMinutes: 2,
    tags: [],
    html: "<p>n</p>"
  };
  assert.equal(noteSchema.safeParse(note).success, true);
  assert.equal(noteSchema.safeParse({ slug: "n" }).success, false);
});

test("Vietnamese blog index contains the May 10-14 localized posts", () => {
  const viIndex = readJson("../public/blog-data/vi/_index.json");
  const scopedSlugs = [
    "service-mesh-do-you-need-it",
    "navigating-office-politics",
    "ai-in-cybersecurity",
    "learning-a-new-language-every-year",
    "okrs-for-engineering-teams",
  ];

  for (const slug of scopedSlugs) {
    const indexed = viIndex.posts.find((post) => post.slug === slug);
    const post = readJson(`../public/blog-data/vi/posts/${slug}.json`);

    assert.ok(indexed, `${slug} should be listed in the Vietnamese blog index`);
    assert.deepEqual(
      {
        slug: indexed.slug,
        category: indexed.category,
        title: indexed.title,
        summary: indexed.summary,
        date: indexed.date,
        readingMinutes: indexed.readingMinutes,
        tags: indexed.tags,
        author: indexed.author,
      },
      {
        slug: post.slug,
        category: post.category,
        title: post.title,
        summary: post.summary,
        date: post.date,
        readingMinutes: post.readingMinutes,
        tags: post.tags,
        author: post.author,
      }
    );
  }
});

test("scoped notes keep filename slug and localized index dates aligned", () => {
  const enIndex = readJson("../public/notes-data/_index.json");
  const viIndex = readJson("../public/notes-data/vi/_index.json");
  const scopedNotes = [
    {
      slug: "the-trap-of-information-consumption",
      date: "2026-05-27",
      readingMinutes: { en: 2 },
    },
    {
      slug: "work-messages-aggressive-bias",
      date: "2026-05-27",
      readingMinutes: { en: 2 },
    },
    {
      slug: "tao-niem-tin-khong-phai-tao-ao-giac",
      date: "2026-05-12",
      readingMinutes: { en: 4, vi: 7 },
    },
    {
      slug: "su-ro-rang-la-mot-dang-noi-luc",
      date: "2026-05-13",
      readingMinutes: { en: 4, vi: 6 },
    },
    {
      slug: "tri-tue-can-duc-hanh",
      date: "2026-05-14",
      readingMinutes: { en: 4, vi: 6 },
    },
  ];

  for (const note of scopedNotes) {
    const enPost = readJson(`../public/notes-data/posts/${note.slug}.json`);
    const viPost = readJson(`../public/notes-data/vi/posts/${note.slug}.json`);
    const enIndexed = enIndex.posts.find((post) => post.slug === note.slug);
    const viIndexed = viIndex.posts.find((post) => post.slug === note.slug);

    assert.equal(enPost.slug, note.slug);
    assert.equal(viPost.slug, note.slug);
    assert.equal(enPost.date, note.date);
    assert.equal(viPost.date, note.date);
    assert.equal(enIndexed?.date, note.date);
    assert.equal(viIndexed?.date, note.date);
    assert.equal(enIndexed?.readingMinutes, note.readingMinutes.en);

    if (note.readingMinutes.vi) {
      assert.equal(viIndexed?.readingMinutes, note.readingMinutes.vi);
    }
  }
});

test("loadNote overlays localized Vietnamese reading minutes", () => {
  const scopedNotes = [
    ["tao-niem-tin-khong-phai-tao-ao-giac", 4, 7],
    ["su-ro-rang-la-mot-dang-noi-luc", 4, 6],
    ["tri-tue-can-duc-hanh", 4, 6],
  ];

  for (const [slug, enReadingMinutes, viReadingMinutes] of scopedNotes) {
    assert.equal(loadNote(slug, "en")?.readingMinutes, enReadingMinutes);
    assert.equal(loadNote(slug, "vi")?.readingMinutes, viReadingMinutes);
  }
});

test("notes expose one canonical slug set across English and Vietnamese", () => {
  const notesDataSource = readFileSync(
    new URL("../src/lib/notes/data.ts", import.meta.url),
    "utf8"
  );
  const sitemapSource = readFileSync(
    new URL("../src/app/sitemap.ts", import.meta.url),
    "utf8"
  );
  const robotsSource = readFileSync(
    new URL("../src/app/robots.ts", import.meta.url),
    "utf8"
  );
  const rootLayoutSource = readFileSync(
    new URL("../src/app/layout.tsx", import.meta.url),
    "utf8"
  );
  const notesIndexPage = readFileSync(
    new URL("../src/app/[locale]/notes/page.tsx", import.meta.url),
    "utf8"
  );
  const notePage = readFileSync(
    new URL("../src/app/[locale]/notes/[slug]/page.tsx", import.meta.url),
    "utf8"
  );
  const blogPostPage = readFileSync(
    new URL("../src/app/[locale]/blog/[category]/[slug]/page.tsx", import.meta.url),
    "utf8"
  );
  const blogDataSource = readFileSync(
    new URL("../src/lib/blog/data.ts", import.meta.url),
    "utf8"
  );
  const notesIndex = JSON.parse(
    readFileSync(new URL("../public/notes-data/_index.json", import.meta.url), "utf8")
  );
  const canonicalSlugs = notesIndex.posts.map((post) => post.slug);

  assert.equal(new Set(canonicalSlugs).size, canonicalSlugs.length);
  assert.match(notesDataSource, /NOTE_CONTENT_LOCALES = \["en", "vi"\] as const/);
  assert.match(notesDataSource, /getNoteContentLocales/);
  assert.match(notesDataSource, /return \[\.\.\.NOTE_CONTENT_LOCALES\]/);
  assert.match(blogDataSource, /getPostContentLocales/);
  assert.match(sitemapSource, /for \(const note of listNotes\("en"\)\)/);
  assert.match(sitemapSource, /locales:\s*NOTE_CONTENT_LOCALES/);
  assert.match(sitemapSource, /getPostContentLocales\(slug\)/);
  assert.match(sitemapSource, /getNoteContentLocales\(note\.slug\)/);
  assert.match(sitemapSource, /lastModifiedForLocale/);
  assert.match(sitemapSource, /latestDate/);
  assert.doesNotMatch(sitemapSource, /const now = new Date\(\)/);
  assert.doesNotMatch(sitemapSource, /Vietnamese-only notes/);
  assert.match(robotsSource, /sitemap:\s*`\$\{SITE_URL\}\/sitemap\.xml`/);
  assert.doesNotMatch(robotsSource, /host:/i);
  assert.match(rootLayoutSource, /metadataBase:\s*new URL\(SITE_URL\)/);
  assert.match(notesIndexPage, /NOTE_CONTENT_LOCALES/);
  assert.match(notesIndexPage, /collectionLocale/);
  assert.match(notesIndexPage, /locale:\s*OG_LOCALE_MAP\[canonicalLocale as Locale\]/);
  assert.match(notesIndexPage, /getNoteContentLocales\(n\.slug\)/);
  assert.match(notesIndexPage, /index:\s*indexable/);
  assert.match(notePage, /getNoteContentLocales/);
  assert.match(notePage, /canonicalLocale/);
  assert.match(notePage, /inLanguage:\s*canonicalLocale/);
  assert.match(notePage, /index:\s*indexable/);
  assert.match(blogPostPage, /getPostContentLocales/);
  assert.match(blogPostPage, /canonicalLocale/);
  assert.match(blogPostPage, /inLanguage:\s*canonicalLocale/);
  assert.match(blogPostPage, /index:\s*indexable/);
});
