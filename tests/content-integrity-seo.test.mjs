import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { registerHooks } from "node:module";
import { tmpdir } from "node:os";
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
  }
});

const { blogIndexSchema, blogPostSchema } = await import(
  new URL("../src/lib/blog/schema.ts", import.meta.url)
);
const { notesIndexSchema } = await import(
  new URL("../src/lib/notes/schema.ts", import.meta.url)
);
const { listPosts } = await import(
  new URL("../src/lib/blog/data.ts", import.meta.url)
);
const { listNotes, loadNote, loadNotesIndex } = await import(
  new URL("../src/lib/notes/data.ts", import.meta.url)
);
const { assertProvidedMetadataParity } = await import(
  new URL("../src/lib/content/catalog.ts", import.meta.url)
);
const { getContentVersionTracker } = await import(
  new URL("../src/lib/content/freshness.ts", import.meta.url)
);
const { readRequiredJsonValidated } = await import(
  new URL("../src/lib/content/io.ts", import.meta.url)
);
const { absoluteUrl } = await import(
  new URL("../src/app/seo.config.ts", import.meta.url)
);
const { localizedPageIdentity, OG_LOCALE_MAP } = await import(
  new URL("../src/lib/seo/locale.ts", import.meta.url)
);
const { serializeJsonLd } = await import(
  new URL("../src/lib/seo/json-ld.ts", import.meta.url)
);

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));
}

test("content schemas reject invalid identifiers, references, dates, and reading time", () => {
  const category = {
    slug: "architecture",
    title: "Architecture",
    tagline: "Tagline",
    description: "Description",
    accent: "ocean",
    order: 1
  };
  const post = {
    slug: "valid-post",
    category: category.slug,
    title: "Title",
    summary: "Summary",
    date: "2026-07-18",
    readingMinutes: 3,
    tags: [],
    author: "Nguyen Le Phong",
    locales: ["en"]
  };

  assert.equal(
    blogIndexSchema.safeParse({
      categories: [category],
      posts: [{ ...post, category: "missing" }]
    }).success,
    false
  );
  assert.equal(
    blogIndexSchema.safeParse({ categories: [category, category], posts: [post] }).success,
    false
  );
  assert.equal(
    blogPostSchema.safeParse({ ...post, html: "<p>x</p>", slug: "Not Valid" }).success,
    false
  );
  assert.equal(
    blogPostSchema.safeParse({ ...post, html: "<p>x</p>", date: "2026-02-30" }).success,
    false
  );
  assert.equal(
    blogPostSchema.safeParse({ ...post, html: "<p>x</p>", readingMinutes: 0 }).success,
    false
  );
  assert.equal(
    notesIndexSchema.safeParse({
      topics: [],
      posts: [{
        slug: "note",
        title: "Note",
        summary: "Summary",
        date: "2026-07-18",
        readingMinutes: 2,
        tags: [],
        topic: "missing",
        baseLocale: "en",
        locales: ["en"]
      }]
    }).success,
    false
  );
});

test("canonical indexes are required rather than failing open to an empty corpus", () => {
  assert.throws(
    () => readRequiredJsonValidated(
      fileURLToPath(new URL("../content/blog-data/__missing-index__.json", import.meta.url)),
      blogIndexSchema,
      "canonical blog index"
    ),
    /Missing required canonical blog index/
  );
});

test("all authored catalogs satisfy index-body parity and declared references", () => {
  for (const locale of ["en", "vi", "zh", "ja", "ko", "fr"]) {
    assert.ok(listPosts(locale).length > 0, `blog ${locale}`);
  }
  assert.ok(listNotes("en").length > 0);
  assert.ok(listNotes("vi").length > 0);
});

test("content catalogs stay memoized in development and support explicit invalidation", async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  try {
    const cacheToken = Date.now();
    const blogData = await import(
      new URL(`../src/lib/blog/data.ts?cache-test=${cacheToken}`, import.meta.url)
    );
    const notesData = await import(
      new URL(`../src/lib/notes/data.ts?cache-test=${cacheToken}`, import.meta.url)
    );

    const firstBlogIndex = blogData.loadIndex("en");
    assert.strictEqual(blogData.loadIndex("en"), firstBlogIndex);
    blogData.invalidateBlogContentCatalog();
    assert.notStrictEqual(blogData.loadIndex("en"), firstBlogIndex);

    const firstNotesIndex = notesData.loadNotesIndex("en");
    assert.strictEqual(notesData.loadNotesIndex("en"), firstNotesIndex);
    notesData.invalidateNotesContentCatalog();
    assert.notStrictEqual(notesData.loadNotesIndex("en"), firstNotesIndex);
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

test("development content freshness observes an edited JSON file without rescanning per call", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "content-freshness-"));
  const dataDirectory = path.join(projectRoot, "content", "blog-data");
  const postsDirectory = path.join(dataDirectory, "posts");
  const indexPath = path.join(dataDirectory, "_index.json");
  const bodyPath = path.join(postsDirectory, "fixture-post.json");
  mkdirSync(postsDirectory, { recursive: true });

  const category = {
    slug: "architecture",
    title: "Architecture",
    tagline: "Systems",
    description: "Architecture notes",
    accent: "ocean",
    order: 1
  };
  const metadata = {
    slug: "fixture-post",
    category: "architecture",
    title: "Before edit",
    summary: "Fixture summary",
    date: "2026-07-18",
    readingMinutes: 1,
    tags: [],
    author: "Nguyen Le Phong"
  };
  writeFileSync(indexPath, JSON.stringify({
    categories: [category],
    posts: [{ ...metadata, locales: ["en"] }]
  }));
  writeFileSync(bodyPath, JSON.stringify({ ...metadata, html: "<p>Fixture</p>" }));

  const tracker = getContentVersionTracker(dataDirectory, { pollIntervalMs: 10 });
  const originalCwd = process.cwd();
  let fixtureBlogData;
  process.chdir(projectRoot);
  try {
    fixtureBlogData = await import(
      new URL(`../src/lib/blog/data.ts?freshness-test=${Date.now()}`, import.meta.url)
    );
  } finally {
    process.chdir(originalCwd);
  }

  try {
    const first = fixtureBlogData.loadIndex("en");
    assert.strictEqual(fixtureBlogData.loadIndex("en"), first);

    const updatedMetadata = { ...metadata, title: "After on-disk edit" };
    writeFileSync(indexPath, JSON.stringify({
      categories: [category],
      posts: [{ ...updatedMetadata, locales: ["en"] }]
    }));
    writeFileSync(bodyPath, JSON.stringify({
      ...updatedMetadata,
      html: "<p>Fixture</p>"
    }));

    const deadline = Date.now() + 1_000;
    let refreshed = fixtureBlogData.loadIndex("en");
    while (refreshed === first && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      refreshed = fixtureBlogData.loadIndex("en");
    }

    assert.notStrictEqual(refreshed, first);
    assert.equal(refreshed.posts[0].title, "After on-disk edit");
    assert.strictEqual(fixtureBlogData.loadIndex("en"), refreshed);
  } finally {
    tracker.close();
    rmSync(projectRoot, { recursive: true, force: true });
  }
});

test("localized catalog retries when the base snapshot invalidates before overlay", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "content-snapshot-race-"));
  const dataDirectory = path.join(projectRoot, "content", "blog-data");
  const postsDirectory = path.join(dataDirectory, "posts");
  const viPostsDirectory = path.join(dataDirectory, "vi", "posts");
  const indexPath = path.join(dataDirectory, "_index.json");
  const bodyPath = path.join(postsDirectory, "fixture-post.json");
  mkdirSync(postsDirectory, { recursive: true });
  mkdirSync(viPostsDirectory, { recursive: true });

  const category = {
    slug: "architecture",
    title: "Architecture",
    tagline: "Systems",
    description: "Architecture notes",
    accent: "ocean",
    order: 1
  };
  const metadata = {
    slug: "fixture-post",
    category: "architecture",
    title: "Old base title",
    summary: "Fixture summary",
    date: "2026-07-18",
    readingMinutes: 1,
    tags: [],
    author: "Nguyen Le Phong"
  };
  const writeBase = (title) => {
    const nextMetadata = { ...metadata, title };
    writeFileSync(indexPath, JSON.stringify({
      categories: [category],
      posts: [{ ...nextMetadata, locales: ["en", "vi"] }]
    }));
    writeFileSync(bodyPath, JSON.stringify({
      ...nextMetadata,
      html: "<p>English fixture</p>"
    }));
  };
  writeBase(metadata.title);
  writeFileSync(
    path.join(dataDirectory, "vi", "_index.json"),
    JSON.stringify({ posts: [{ slug: metadata.slug }] })
  );
  writeFileSync(
    path.join(viPostsDirectory, `${metadata.slug}.json`),
    JSON.stringify({ html: "<p>Vietnamese fixture</p>" })
  );

  const tracker = getContentVersionTracker(dataDirectory, {
    pollIntervalMs: 60_000
  });
  const originalCwd = process.cwd();
  let fixtureBlogData;
  process.chdir(projectRoot);
  try {
    fixtureBlogData = await import(
      new URL(`../src/lib/blog/data.ts?snapshot-race=${Date.now()}`, import.meta.url)
    );
  } finally {
    process.chdir(originalCwd);
  }

  const currentVersion = tracker.currentVersion.bind(tracker);
  let versionReads = 0;
  let injected = false;
  tracker.currentVersion = () => {
    versionReads += 1;
    const version = currentVersion();
    if (!injected && versionReads === 3) {
      writeBase("New base title");
      tracker.invalidate();
      tracker.close();
      injected = true;
      return currentVersion();
    }
    return version;
  };

  try {
    const localized = fixtureBlogData.loadIndex("vi");
    assert.equal(
      injected,
      true,
      `expected third version read, observed ${versionReads}`
    );
    assert.equal(localized.posts[0].title, "New base title");
    assert.strictEqual(fixtureBlogData.loadIndex("vi"), localized);
  } finally {
    tracker.close();
    rmSync(projectRoot, { recursive: true, force: true });
  }
});

test("raw locale metadata drift cannot be hidden by a merged catalog", () => {
  assert.throws(
    () => assertProvidedMetadataParity(
      "Localized note body (vi)",
      { slug: "note", topic: "engineering" },
      { slug: "note", topic: "career" },
      "/content/vi/note.json",
      ["slug", "topic"]
    ),
    /override drift.*topic/
  );
});

test("localized indexes cannot override canonical publication lifecycle fields", async () => {
  const projectRoot = mkdtempSync(path.join(tmpdir(), "content-publication-override-"));
  const blogDirectory = path.join(projectRoot, "content", "blog-data");
  const notesDirectory = path.join(projectRoot, "content", "notes-data");
  for (const directory of [
    path.join(blogDirectory, "posts"),
    path.join(blogDirectory, "vi", "posts"),
    path.join(notesDirectory, "posts"),
    path.join(notesDirectory, "vi", "posts")
  ]) {
    mkdirSync(directory, { recursive: true });
  }

  const publicationMetadata = {
    slug: "fixture-post",
    title: "Fixture title",
    summary: "Fixture summary",
    date: "2020-01-01",
    publishAt: "2020-01-01",
    status: "published",
    readingMinutes: 1,
    tags: []
  };
  const blogMetadata = {
    ...publicationMetadata,
    category: "architecture",
    author: "Nguyen Le Phong"
  };
  const noteMetadata = {
    ...publicationMetadata,
    topic: "engineering"
  };

  writeFileSync(path.join(blogDirectory, "_index.json"), JSON.stringify({
    categories: [{
      slug: "architecture",
      title: "Architecture",
      tagline: "Systems",
      description: "Architecture notes",
      accent: "ocean",
      order: 1
    }],
    posts: [{ ...blogMetadata, locales: ["en", "vi"] }]
  }));
  writeFileSync(
    path.join(blogDirectory, "posts", "fixture-post.json"),
    JSON.stringify({ ...blogMetadata, html: "<p>English fixture</p>" })
  );
  writeFileSync(
    path.join(blogDirectory, "vi", "posts", "fixture-post.json"),
    JSON.stringify({ slug: "fixture-post", html: "<p>Vietnamese fixture</p>" })
  );

  writeFileSync(path.join(notesDirectory, "_index.json"), JSON.stringify({
    topics: [{
      id: "engineering",
      label: "Engineering",
      description: "Engineering notes",
      color: "teal"
    }],
    posts: [{ ...noteMetadata, baseLocale: "en", locales: ["en", "vi"] }]
  }));
  writeFileSync(
    path.join(notesDirectory, "posts", "fixture-post.json"),
    JSON.stringify({ ...noteMetadata, html: "<p>English fixture</p>" })
  );
  writeFileSync(
    path.join(notesDirectory, "vi", "posts", "fixture-post.json"),
    JSON.stringify({ slug: "fixture-post", html: "<p>Vietnamese fixture</p>" })
  );

  const originalCwd = process.cwd();
  const originalNodeEnv = process.env.NODE_ENV;
  let fixtureBlogData;
  let fixtureNotesData;
  process.chdir(projectRoot);
  process.env.NODE_ENV = "production";
  try {
    const cacheKey = Date.now();
    [fixtureBlogData, fixtureNotesData] = await Promise.all([
      import(new URL(`../src/lib/blog/data.ts?publication-guard=${cacheKey}`, import.meta.url)),
      import(new URL(`../src/lib/notes/data.ts?publication-guard=${cacheKey}`, import.meta.url))
    ]);
  } finally {
    process.chdir(originalCwd);
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }

  const maliciousValues = [
    ["date", "2020-01-02"],
    ["publishAt", "2020-01-03"],
    ["status", "draft"]
  ];

  try {
    for (const [field, value] of maliciousValues) {
      writeFileSync(
        path.join(blogDirectory, "vi", "_index.json"),
        JSON.stringify({ posts: [{ slug: "fixture-post", [field]: value }] })
      );
      fixtureBlogData.invalidateBlogContentCatalog();
      assert.throws(
        () => fixtureBlogData.loadIndex("vi"),
        new RegExp(`Localized blog index .*override drift.*for ${field}:`)
      );

      writeFileSync(
        path.join(notesDirectory, "vi", "_index.json"),
        JSON.stringify({ posts: [{ slug: "fixture-post", [field]: value }] })
      );
      fixtureNotesData.invalidateNotesContentCatalog();
      assert.throws(
        () => fixtureNotesData.loadNotesIndex("vi"),
        new RegExp(`Localized notes index .*override drift.*for ${field}:`)
      );

      writeFileSync(
        path.join(blogDirectory, "vi", "_index.json"),
        JSON.stringify({ posts: [{ slug: "fixture-post" }] })
      );
      writeFileSync(
        path.join(blogDirectory, "vi", "posts", "fixture-post.json"),
        JSON.stringify({
          slug: "fixture-post",
          [field]: value,
          html: "<p>Vietnamese fixture</p>"
        })
      );
      fixtureBlogData.invalidateBlogContentCatalog();
      assert.throws(
        () => fixtureBlogData.loadIndex("vi"),
        new RegExp(`Localized blog body .*override drift.*for ${field}:`)
      );

      writeFileSync(
        path.join(notesDirectory, "vi", "_index.json"),
        JSON.stringify({ posts: [{ slug: "fixture-post" }] })
      );
      writeFileSync(
        path.join(notesDirectory, "vi", "posts", "fixture-post.json"),
        JSON.stringify({
          slug: "fixture-post",
          [field]: value,
          html: "<p>Vietnamese fixture</p>"
        })
      );
      fixtureNotesData.invalidateNotesContentCatalog();
      assert.throws(
        () => fixtureNotesData.loadNotesIndex("vi"),
        new RegExp(`Localized note body .*override drift.*for ${field}:`)
      );

      writeFileSync(
        path.join(blogDirectory, "vi", "posts", "fixture-post.json"),
        JSON.stringify({ slug: "fixture-post", html: "<p>Vietnamese fixture</p>" })
      );
      writeFileSync(
        path.join(notesDirectory, "vi", "posts", "fixture-post.json"),
        JSON.stringify({ slug: "fixture-post", html: "<p>Vietnamese fixture</p>" })
      );
    }
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
});

test("choice-or-fate metadata stays aligned across indexes and localized bodies", () => {
  const expectedTag = "Choice and Circumstance";
  const enIndex = readJson("../content/notes-data/_index.json");
  const viIndex = readJson("../content/notes-data/vi/_index.json");
  assert.ok(enIndex.posts.find((post) => post.slug === "choice-or-fate").tags.includes(expectedTag));
  assert.ok(viIndex.posts.find((post) => post.slug === "choice-or-fate").tags.includes(expectedTag));
  assert.ok(loadNote("choice-or-fate", "en")?.tags.includes(expectedTag));
  assert.ok(loadNote("choice-or-fate", "vi")?.tags.includes(expectedTag));
});

test("note card summaries and topics have one shared index-body value", () => {
  const enIndex = readJson("../content/notes-data/_index.json");
  const viIndex = loadNotesIndex("vi");

  for (const indexedNote of enIndex.posts) {
    const body = readJson(`../content/notes-data/posts/${indexedNote.slug}.json`);
    assert.equal(body.cardSummary, indexedNote.cardSummary, `${indexedNote.slug} EN cardSummary`);
    assert.equal(body.topic, indexedNote.topic, `${indexedNote.slug} EN topic`);
  }

  for (const indexedNote of viIndex.posts) {
    const body = readJson(`../content/notes-data/vi/posts/${indexedNote.slug}.json`);
    assert.equal(body.cardSummary, indexedNote.cardSummary, `${indexedNote.slug} VI cardSummary`);
    assert.equal(loadNote(indexedNote.slug, "vi")?.topic, indexedNote.topic);
  }
});

test("localized page identity aligns canonical, alternates, and Open Graph locales", () => {
  const locales = ["en", "vi", "zh", "ja", "ko", "fr"];
  for (const locale of locales) {
    const identity = localizedPageIdentity(locale, "/about");
    assert.equal(identity.canonical, `https://nguyenlephong.github.io/${locale}/about`);
    assert.equal(identity.languages[locale], identity.canonical);
    assert.equal(identity.languages["x-default"], "https://nguyenlephong.github.io/en/about");
    assert.equal(identity.ogLocale, OG_LOCALE_MAP[locale]);
    assert.equal(identity.alternateOgLocales.length, locales.length - 1);
  }
});

test("static pages resolve authored identity and Studio uses a published social image", () => {
  for (const page of ["about", "apps", "gallery"]) {
    const pagePath = `../src/app/[locale]/(site)/${page}/page.tsx`;
    const source = readFileSync(new URL(pagePath, import.meta.url), "utf8");
    assert.match(
      source,
      new RegExp(`resolveStaticPageLocalization\\('${page}', locale\\)`),
      pagePath
    );
    assert.match(source, /buildStaticPageMetadata\(/, pagePath);
    assert.match(source, /url:\s*localization\.canonical/, pagePath);
  }

  const studio = readFileSync(
    new URL("../src/app/[locale]/studio/page.tsx", import.meta.url),
    "utf8"
  );
  assert.match(studio, /localizedPageIdentity\(locale, seo\.path\)/);
  assert.match(studio, /canonical:\s*identity\.canonical/);
  assert.match(studio, /url:\s*identity\.canonical/);
  assert.match(studio, /absoluteUrl\("\/opengraph-image\.png"\)/);
  assert.doesNotMatch(studio, /blogPostOgImageUrl/);
  assert.doesNotMatch(studio, /\$\{locale\}\/opengraph-image/);
  assert.equal(
    absoluteUrl("/opengraph-image.png"),
    "https://nguyenlephong.github.io/opengraph-image.png"
  );
  assert.equal(
    existsSync(new URL("../src/app/opengraph-image.tsx", import.meta.url)),
    true
  );
});

test("every JSON-LD script uses the script-safe serializer", () => {
  const roots = ["../src/app", "../src/components"];
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(file);
    }
  };
  for (const root of roots) walk(fileURLToPath(new URL(root, import.meta.url)));

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    if (!source.includes('type="application/ld+json"')) continue;
    assert.match(source, /serializeJsonLd\(/, file);
    assert.doesNotMatch(source, /__html:\s*JSON\.stringify/, file);
  }

  const serialized = serializeJsonLd({ value: "</script><script>alert(1)</script>" });
  assert.doesNotMatch(serialized, /</);
  assert.deepEqual(JSON.parse(serialized), {
    value: "</script><script>alert(1)</script>"
  });
});
