import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

const {
  blogIndexOverrideSchema,
  blogIndexSchema,
  blogPostOverrideSchema,
  blogPostSchema
} = await import(
  new URL("../src/lib/blog/schema.ts", import.meta.url)
);
const {
  noteOverrideSchema,
  notesIndexOverrideSchema,
  notesIndexSchema,
  noteSchema
} = await import(
  new URL("../src/lib/notes/schema.ts", import.meta.url)
);
const { loadNote } = await import(
  new URL("../src/lib/notes/data.ts", import.meta.url)
);
const { getPostContentLocales, listPosts, listBlogArchiveLocales } = await import(
  new URL("../src/lib/blog/data.ts", import.meta.url)
);
const { getNoteContentLocales, listNotesArchiveLocales } = await import(
  new URL("../src/lib/notes/data.ts", import.meta.url)
);
const { localeAlternates, preferredContentLocale } = await import(
  new URL("../src/lib/blog/seo.ts", import.meta.url)
);
const { latestNonFutureDate } = await import(
  new URL("../src/lib/seo/dates.ts", import.meta.url)
);
const { getContentBuildDate, isContentPublished } = await import(
  new URL("../src/lib/content/publication.ts", import.meta.url)
);
const { listBlogPostParams } = await import(
  new URL("../src/lib/blog/data.ts", import.meta.url)
);
const { listNoteParams } = await import(
  new URL("../src/lib/notes/data.ts", import.meta.url)
);
const { default: buildSitemap } = await import(
  new URL("../src/app/sitemap.ts", import.meta.url)
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
const validCategory = {
  slug: "c",
  title: "Category",
  tagline: "Tagline",
  description: "Description",
  accent: "ocean",
  order: 1
};

test("blog post schema accepts a valid post", () => {
  assert.equal(blogPostSchema.safeParse(validPost).success, true);
  assert.equal(
    blogPostSchema.safeParse({
      ...validPost,
      status: "draft",
      publishAt: "2026-07-19"
    }).success,
    true
  );
  assert.equal(
    blogPostSchema.safeParse({ ...validPost, status: "scheduled" }).success,
    false
  );
  assert.equal(
    blogPostSchema.safeParse({ ...validPost, publishAt: "2026-02-30" }).success,
    false
  );
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
  const { html: _html, ...validMeta } = validPost;
  const good = {
    categories: [validCategory],
    posts: [{ ...validMeta, locales: ["en", "vi"] }]
  };
  assert.equal(blogIndexSchema.safeParse(good).success, true);
  assert.equal(
    blogIndexSchema.safeParse({
      categories: [validCategory],
      posts: [{ ...validMeta, locales: ["en", "en"] }]
    }).success,
    false
  );
  assert.equal(
    blogIndexSchema.safeParse({
      categories: [],
      posts: [{ ...validMeta, locales: ["en", "xx"] }]
    }).success,
    false
  );
  const bad = { categories: [validCategory], posts: [{ slug: "x" }] };
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
  assert.equal(
    noteSchema.safeParse({
      ...note,
      status: "published",
      publishAt: "2026-07-19"
    }).success,
    true
  );
  assert.equal(noteSchema.safeParse({ ...note, status: "scheduled" }).success, false);
  assert.equal(noteSchema.safeParse({ slug: "n" }).success, false);
});

test("all authored locale overrides satisfy strict partial schemas", () => {
  for (const locale of ["vi", "zh", "ja", "ko", "fr"]) {
    const index = readJson(`../content/blog-data/${locale}/_index.json`);
    assert.equal(blogIndexOverrideSchema.safeParse(index).success, true, `blog ${locale} index`);
    const directory = fileURLToPath(
      new URL(`../content/blog-data/${locale}/posts`, import.meta.url)
    );
    for (const file of readdirSync(directory).filter((name) => name.endsWith(".json"))) {
      const post = JSON.parse(readFileSync(path.join(directory, file), "utf8"));
      assert.equal(
        blogPostOverrideSchema.safeParse(post).success,
        true,
        `blog ${locale}/${file}`
      );
    }
  }

  assert.equal(
    notesIndexOverrideSchema.safeParse(readJson("../content/notes-data/vi/_index.json")).success,
    true
  );
  const notesDirectory = fileURLToPath(
    new URL("../content/notes-data/vi/posts", import.meta.url)
  );
  for (const file of readdirSync(notesDirectory).filter((name) => name.endsWith(".json"))) {
    const note = JSON.parse(readFileSync(path.join(notesDirectory, file), "utf8"));
    assert.equal(noteOverrideSchema.safeParse(note).success, true, `notes vi/${file}`);
  }

  assert.equal(blogPostOverrideSchema.safeParse({ title: 42 }).success, false);
  assert.equal(noteOverrideSchema.safeParse({ unknownField: "bad" }).success, false);
});

test("archive corpora and sitemap pages follow authored locale availability", () => {
  const blogIndex = readJson("../content/blog-data/_index.json");
  const expectedBlogCounts = Object.fromEntries(
    ["en", "vi", "zh", "ja", "ko", "fr"].map((locale) => [
      locale,
      blogIndex.posts.filter(
        (post) => isContentPublished(post) && post.locales.includes(locale)
      ).length
    ])
  );
  for (const [locale, count] of Object.entries(expectedBlogCounts)) {
    assert.equal(listPosts(locale).length, count, `${locale} blog archive count`);
  }
  assert.deepEqual(listBlogArchiveLocales(3), ["en", "vi", "zh", "ja", "ko", "fr"]);
  assert.deepEqual(listBlogArchiveLocales(4), ["en", "vi"]);
  assert.deepEqual(listNotesArchiveLocales(15), ["en", "vi"]);
  assert.deepEqual(listNotesArchiveLocales(16), []);
  const sitemap = buildSitemap();
  assert.equal(new Set(sitemap.map((entry) => entry.url)).size, sitemap.length);
  const sitemapUrls = new Set(sitemap.map((entry) => entry.url));
  for (const { locale, category, slug } of listBlogPostParams()) {
    assert.ok(
      sitemapUrls.has(
        `https://nguyenlephong.github.io/${locale}/blog/${category}/${slug}`
      )
    );
  }
  for (const { locale, slug } of listNoteParams()) {
    assert.ok(
      sitemapUrls.has(`https://nguyenlephong.github.io/${locale}/notes/${slug}`)
    );
  }
  const cutoff = new Date(getContentBuildDate()).getTime();
  for (const entry of sitemap) {
    if (entry.lastModified) {
      assert.ok(
        new Date(entry.lastModified).getTime() <= cutoff,
        `${entry.url} future lastmod`
      );
    }
  }
});

test("future source dates are omitted from freshness signals deterministically", () => {
  const now = new Date("2026-07-17T12:00:00.000Z");
  assert.equal(
    latestNonFutureDate(["2026-07-16", "2026-07-23", "invalid"], now)?.toISOString(),
    "2026-07-16T00:00:00.000Z"
  );
  assert.equal(latestNonFutureDate(["2026-07-23"], now), undefined);
});

test("root and localized homes split WebSite and profile schema ownership", () => {
  const rootPage = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const localizedPage = readFileSync(
    new URL("../src/app/[locale]/(site)/page.tsx", import.meta.url),
    "utf8"
  );
  const localizedLayout = readFileSync(
    new URL("../src/app/[locale]/layout.tsx", import.meta.url),
    "utf8"
  );

  assert.match(rootPage, /buildWebsiteSchema/);
  assert.doesNotMatch(localizedPage, /buildWebsiteSchema/);
  assert.match(localizedPage, /buildPersonSchema/);
  assert.match(localizedPage, /buildProfilePageSchema/);
  assert.match(localizedLayout, /languages\['x-default'\]/);
});

test("Vietnamese blog index contains the May 10-14 localized posts", () => {
  const viIndex = readJson("../content/blog-data/vi/_index.json");
  const scopedSlugs = [
    "service-mesh-do-you-need-it",
    "navigating-office-politics",
    "ai-in-cybersecurity",
    "learning-a-new-language-every-year",
    "okrs-for-engineering-teams",
  ];

  for (const slug of scopedSlugs) {
    const indexed = viIndex.posts.find((post) => post.slug === slug);
    const post = readJson(`../content/blog-data/vi/posts/${slug}.json`);

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
  const enIndex = readJson("../content/notes-data/_index.json");
  const viIndex = readJson("../content/notes-data/vi/_index.json");
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
    const enPost = readJson(`../content/notes-data/posts/${note.slug}.json`);
    const viPost = readJson(`../content/notes-data/vi/posts/${note.slug}.json`);
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
  const notePage = readFileSync(
    new URL("../src/app/[locale]/(site)/notes/[slug]/page.tsx", import.meta.url),
    "utf8"
  );
  const blogPostPage = readFileSync(
    new URL("../src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx", import.meta.url),
    "utf8"
  );
  const blogDataSource = readFileSync(
    new URL("../src/lib/blog/data.ts", import.meta.url),
    "utf8"
  );
  const notesIndex = JSON.parse(
    readFileSync(new URL("../content/notes-data/_index.json", import.meta.url), "utf8")
  );
  const canonicalSlugs = notesIndex.posts.map((post) => post.slug);

  assert.equal(new Set(canonicalSlugs).size, canonicalSlugs.length);
  assert.match(notesDataSource, /NOTE_CONTENT_LOCALES = \["en", "vi"\] as const/);
  assert.match(notesDataSource, /getNoteContentLocales/);
  assert.match(notesDataSource, /note\?\.locales/);
  assert.match(blogDataSource, /getPostContentLocales/);
  assert.match(
    blogDataSource,
    /post && isContentPublished\(post\) \? \[\.\.\.post\.locales\] : \[\]/
  );
  assert.match(sitemapSource, /for \(const note of listNotes\("en"\)\)/);
  assert.match(sitemapSource, /locales:\s*NOTE_CONTENT_LOCALES/);
  assert.match(sitemapSource, /getPostContentLocales\(slug\)/);
  assert.match(sitemapSource, /getNoteContentLocales\(note\.slug\)/);
  assert.match(sitemapSource, /lastModifiedForLocale/);
  assert.match(sitemapSource, /latestNonFutureDate/);
  assert.doesNotMatch(sitemapSource, /Vietnamese-only notes/);
  assert.match(robotsSource, /sitemap:\s*`\$\{SITE_URL\}\/sitemap\.xml`/);
  assert.doesNotMatch(robotsSource, /host:/i);
  assert.match(rootLayoutSource, /metadataBase:\s*new URL\(SITE_URL\)/);
  assert.match(notePage, /getNoteContentLocales/);
  assert.match(notePage, /canonicalLocale/);
  assert.match(notePage, /inLanguage:\s*canonicalLocale/);
  assert.match(notePage, /LocalizedArticleFallback/);
  assert.match(notePage, /hasLocalizedContent/);
  assert.doesNotMatch(notePage, /robots:\s*\{/);
  assert.match(blogPostPage, /getPostContentLocales/);
  assert.match(blogPostPage, /canonicalLocale/);
  assert.match(blogPostPage, /inLanguage:\s*canonicalLocale/);
  assert.match(blogPostPage, /LocalizedArticleFallback/);
  assert.match(blogPostPage, /hasLocalizedContent/);
  assert.doesNotMatch(blogPostPage, /robots:\s*\{/);
});

test("declared article locales match authored blog and notes files", () => {
  const blogIndex = readJson("../content/blog-data/_index.json");
  const notesIndex = readJson("../content/notes-data/_index.json");
  const optionalBlogLocales = ["vi", "zh", "ja", "ko", "fr"];

  for (const post of blogIndex.posts) {
    const expected = [
      "en",
      ...optionalBlogLocales.filter((locale) =>
        existsSync(
          new URL(
            `../content/blog-data/${locale}/posts/${post.slug}.json`,
            import.meta.url
          )
        )
      )
    ];
    assert.deepEqual(post.locales, expected, `${post.slug} blog locales`);
    assert.deepEqual(
      getPostContentLocales(post.slug),
      isContentPublished(post) ? expected : []
    );
  }

  for (const note of notesIndex.posts) {
    const expected = [
      "en",
      ...(existsSync(
        new URL(`../content/notes-data/vi/posts/${note.slug}.json`, import.meta.url)
      )
        ? ["vi"]
        : [])
    ];
    assert.equal(note.baseLocale, "en", `${note.slug} base locale`);
    assert.deepEqual(note.locales, expected, `${note.slug} note locales`);
    assert.deepEqual(
      getNoteContentLocales(note.slug),
      isContentPublished(note) ? expected : []
    );
  }
});

test("article locale clusters cover translated and untranslated variants", () => {
  const fullyTranslatedBlog = getPostContentLocales("ports-and-adapters");
  const partiallyTranslatedBlog = getPostContentLocales(
    "rate-limiting-and-throttling"
  );
  const translatedNote = getNoteContentLocales("tri-tue-can-duc-hanh");

  assert.deepEqual(fullyTranslatedBlog, ["en", "vi", "zh", "ja", "ko", "fr"]);
  assert.deepEqual(partiallyTranslatedBlog, ["en", "vi"]);
  assert.deepEqual(translatedNote, ["en", "vi"]);
  assert.equal(partiallyTranslatedBlog.includes("zh"), false);
  assert.equal(translatedNote.includes("zh"), false);

  const alternates = localeAlternates(
    "/blog/architecture/ports-and-adapters",
    fullyTranslatedBlog
  );
  assert.deepEqual(Object.keys(alternates), [
    "en",
    "vi",
    "zh",
    "ja",
    "ko",
    "fr",
    "x-default"
  ]);
  assert.equal(alternates["x-default"], alternates.en);
  assert.equal(preferredContentLocale(["vi"]), "vi");
});
