import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

process.env.CONTENT_BUILD_DATE = "2026-07-19";

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
  }
});

const [
  blogData,
  notesData,
  routeContract,
  pagination,
  blogSchemas,
  notesSchemas,
  quality,
  notesAuthorship,
  hubPage,
  sitemapModule
] = await Promise.all([
  import(new URL("../src/lib/blog/data.ts", import.meta.url)),
  import(new URL("../src/lib/notes/data.ts", import.meta.url)),
  import(new URL("../src/lib/content/route-contract.ts", import.meta.url)),
  import(new URL("../src/lib/content/pagination.ts", import.meta.url)),
  import(new URL("../src/lib/blog/schema.ts", import.meta.url)),
  import(new URL("../src/lib/notes/schema.ts", import.meta.url)),
  import(new URL("../src/lib/notes/content-quality.ts", import.meta.url)),
  import(new URL("../src/lib/notes/authorship.ts", import.meta.url)),
  import(new URL("../src/lib/content/hub-page.ts", import.meta.url)),
  import(new URL("../src/app/sitemap.ts", import.meta.url))
]);

const BLOG_IDS = [
  "foundations",
  "ways-of-working",
  "ai-in-practice",
  "kind-engineering",
  "lean-business-analysis",
  "data-eos-operating-system",
  "leadership-and-management"
];

const NOTE_HUB_IDS = [
  "mua-nha",
  "tiet-kiem",
  "su-nghiep",
  "sach",
  "goc-nhin",
  "thoughts"
];

function readJson(relativePath) {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8")
  );
}

test("curated hub catalogs are exact, explicitly ordered, localized, and fall back to English", () => {
  assert.deepEqual(routeContract.BLOG_SERIES_IDS, BLOG_IDS);
  assert.deepEqual(routeContract.NOTE_HUB_TOPIC_IDS, NOTE_HUB_IDS);
  assert.deepEqual(routeContract.CONTENT_HUB_LOCALES, ["en", "vi"]);

  const enSeries = blogData.listBlogSeries("en");
  const viSeries = blogData.listBlogSeries("vi");
  const fallbackSeries = blogData.listBlogSeries("zh");
  assert.deepEqual(
    enSeries.map(({ id }) => id),
    BLOG_IDS
  );
  assert.deepEqual(
    enSeries.map(({ order }) => order),
    [1, 2, 3, 4, 5, 6, 7]
  );
  assert.deepEqual(
    viSeries.map(({ id }) => id),
    BLOG_IDS
  );
  assert.deepEqual(
    fallbackSeries.map(({ title, intro }) => ({ title, intro })),
    enSeries.map(({ title, intro }) => ({ title, intro }))
  );
  for (let index = 0; index < enSeries.length; index += 1) {
    assert.ok(enSeries[index].title.length > 0);
    assert.ok(enSeries[index].intro.length > 40);
    assert.notEqual(viSeries[index].title, enSeries[index].title);
    assert.notEqual(viSeries[index].intro, enSeries[index].intro);
  }

  const enHubs = notesData.listNoteHubs("en");
  const viHubs = notesData.listNoteHubs("vi");
  const fallbackHubs = notesData.listNoteHubs("zh");
  assert.deepEqual(
    enHubs.map(({ topic }) => topic),
    NOTE_HUB_IDS
  );
  assert.deepEqual(
    enHubs.map(({ order }) => order),
    [1, 2, 3, 4, 5, 6]
  );
  assert.deepEqual(
    viHubs.map(({ topic }) => topic),
    NOTE_HUB_IDS
  );
  assert.deepEqual(
    fallbackHubs.map(({ title, intro }) => ({ title, intro })),
    enHubs.map(({ title, intro }) => ({ title, intro }))
  );
  assert.equal(
    enHubs.some(({ topic }) => topic === "mua-xe"),
    false
  );
  for (let index = 0; index < enHubs.length; index += 1) {
    assert.ok(enHubs[index].title.length > 0);
    assert.ok(enHubs[index].intro.length > 40);
    assert.notEqual(viHubs[index].title, enHubs[index].title);
    assert.notEqual(viHubs[index].intro, enHubs[index].intro);
  }
});

test("hub static params produce exactly 52 EN/VI routes with nine cards per page", () => {
  const expectedBlogCounts = new Map([
    ["foundations", { en: 15, vi: 15 }],
    ["ways-of-working", { en: 4, vi: 4 }],
    ["ai-in-practice", { en: 4, vi: 5 }],
    ["kind-engineering", { en: 5, vi: 5 }],
    ["lean-business-analysis", { en: 4, vi: 4 }],
    ["data-eos-operating-system", { en: 4, vi: 4 }],
    ["leadership-and-management", { en: 5, vi: 5 }]
  ]);
  const expectedNoteCounts = new Map([
    ["mua-nha", 12],
    ["tiet-kiem", 11],
    ["su-nghiep", 18],
    ["sach", 19],
    ["goc-nhin", 33],
    ["thoughts", 40]
  ]);

  for (const locale of routeContract.CONTENT_HUB_LOCALES) {
    for (const [series, counts] of expectedBlogCounts) {
      const count = counts[locale];
      const posts = blogData.getPostsBySeries(series, locale);
      assert.equal(posts.length, count, `${locale} blog series ${series}`);
      assert.deepEqual(
        posts.map(({ seriesOrder }) => seriesOrder),
        posts
          .map(({ seriesOrder }) => seriesOrder)
          .toSorted((left, right) => left - right)
      );
    }
    for (const [topic, count] of expectedNoteCounts) {
      assert.equal(
        notesData.getNotesByHub(topic, locale).length,
        count,
        `${locale} notes hub ${topic}`
      );
    }
  }

  const canonicalBlog = readJson("../content/blog-data/_index.json");
  for (const series of BLOG_IDS) {
    const orders = canonicalBlog.posts
      .filter((post) => post.series === series)
      .map((post) => post.seriesOrder)
      .toSorted((left, right) => left - right);
    assert.deepEqual(
      orders,
      Array.from({ length: orders.length }, (_, index) => index + 1),
      `${series} canonical series order`
    );
  }

  const blogRoots = blogData.listBlogSeriesParams();
  const blogPages = blogData.listBlogSeriesPageParams();
  const noteRoots = notesData.listNoteHubParams();
  const notePages = notesData.listNoteHubPageParams();
  assert.equal(blogRoots.length, 14);
  assert.deepEqual(blogPages, [
    { locale: "en", series: "foundations", page: "2" },
    { locale: "vi", series: "foundations", page: "2" }
  ]);
  assert.equal(noteRoots.length, 12);
  assert.equal(notePages.length, 24);
  assert.equal(
    [...blogRoots, ...blogPages, ...noteRoots, ...notePages].some(
      (entry) => entry.page === "1"
    ),
    false
  );
  assert.equal(
    blogRoots.length + blogPages.length + noteRoots.length + notePages.length,
    52
  );

  for (const locale of routeContract.CONTENT_HUB_LOCALES) {
    for (const series of BLOG_IDS) {
      const items = blogData.getPostsBySeries(series, locale);
      const pages = pagination.pageCount(items.length);
      for (let page = 1; page <= pages; page += 1) {
        const pageData = pagination.paginate(items, page);
        assert.ok(pageData);
        assert.ok(pageData.items.length <= 9);
        assert.deepEqual(
          pageData.items.map((_, index) => pageData.startIndex + index + 1),
          Array.from(
            { length: pageData.items.length },
            (_, index) => (page - 1) * 9 + index + 1
          )
        );
      }
    }
  }
});

test("one page-aware hub inventory prevents asymmetric 404 alternates", () => {
  const scenarios = [
    { counts: { en: 10, vi: 9 }, expected: ["en"] },
    { counts: { en: 9, vi: 10 }, expected: ["vi"] }
  ];

  for (const { counts, expected } of scenarios) {
    const routes = hubPage.listContentHubRoutes({
      locales: ["en", "vi"],
      listHubIds: () => ["boundary"],
      itemCount: (_hubId, locale) => counts[locale]
    });
    const pageTwo = routes.find(
      ({ hubId, page }) => hubId === "boundary" && page === 2
    );
    assert.deepEqual(pageTwo?.locales, expected);
    assert.deepEqual(
      hubPage.contentHubPageLocales(routes, "boundary", 2),
      expected
    );
    assert.deepEqual(
      hubPage.contentHubPageLocales(routes, "boundary", 3),
      []
    );

    const locale = expected[0];
    const metadata = hubPage.buildContentHubMetadata({
      locale,
      availableLocales: pageTwo.locales,
      path: "/blog/series/boundary/page/2",
      title: "Boundary page",
      description: "A page-aware locale boundary."
    });
    assert.deepEqual(Object.keys(metadata.alternates.languages).sort(), [
      locale,
      "x-default"
    ]);
    assert.equal(
      metadata.alternates.languages["x-default"],
      metadata.alternates.languages[locale]
    );
    assert.deepEqual(metadata.openGraph.alternateLocale, []);
    assert.equal(
      metadata.openGraph.images[0].url,
      "https://nguyenlephong.github.io/opengraph-image.png"
    );
    assert.deepEqual(metadata.twitter.images, [
      "https://nguyenlephong.github.io/opengraph-image.png"
    ]);
  }
});

test("shared hub structured data preserves surface-specific semantics", () => {
  for (const scenario of [
    {
      type: "BlogPosting",
      ownerRole: "author",
      order: "https://schema.org/ItemListOrderAscending",
      parentType: "Blog"
    },
    {
      type: "Article",
      ownerRole: "publisher",
      order: "https://schema.org/ItemListOrderDescending",
      parentType: "WebSite"
    }
  ]) {
    const result = hubPage.buildContentHubStructuredData({
      canonical: "https://nguyenlephong.github.io/en/blog/series/example",
      locale: "en",
      title: "Example",
      description: "Example hub",
      parent: { type: scenario.parentType, id: "https://example.com/#parent" },
      ownerRole: scenario.ownerRole,
      itemListOrder: scenario.order,
      items: [
        {
          type: scenario.type,
          headline: "One",
          url: "https://example.com/one",
          image: "https://example.com/one.jpg",
          datePublished: "2026-07-19",
          position: 1
        }
      ],
      breadcrumb: {
        rootName: "Root",
        rootUrl: "https://example.com/root",
        hubName: "Example",
        hubUrl: "https://example.com/hub"
      }
    });
    assert.equal(result.collectionJsonLd[scenario.ownerRole]["@type"], "Person");
    assert.equal(result.collectionJsonLd.isPartOf["@type"], scenario.parentType);
    assert.equal(result.collectionJsonLd.mainEntity.itemListOrder, scenario.order);
    assert.equal(
      result.collectionJsonLd.mainEntity.itemListElement[0].item["@type"],
      scenario.type
    );
    assert.equal(result.breadcrumbJsonLd.itemListElement.length, 2);
  }
});

test("sitemap contains 939 unique URLs and exactly 52 curated hub URLs", () => {
  const sitemap = sitemapModule.default();
  assert.equal(sitemap.length, 939);
  assert.equal(new Set(sitemap.map(({ url }) => url)).size, 939);

  const hubEntries = sitemap.filter(({ url }) =>
    /\/(?:en|vi)\/(?:blog\/series|notes\/topics)\//.test(url)
  );
  assert.equal(hubEntries.length, 52);
  assert.equal(
    hubEntries.some(({ url }) => url.endsWith("/page/1")),
    false
  );
  assert.equal(
    hubEntries.some(({ url }) => url.includes("/notes/topics/mua-xe")),
    false
  );

  for (const entry of hubEntries) {
    assert.deepEqual(Object.keys(entry.alternates.languages).sort(), [
      "en",
      "vi",
      "x-default"
    ]);
    assert.match(entry.alternates.languages.en, /\/en\//);
    assert.match(entry.alternates.languages.vi, /\/vi\//);
    assert.equal(
      entry.alternates.languages["x-default"],
      entry.alternates.languages.en
    );
  }

  const viOnlyArticle = sitemap.find(({ url }) =>
    url.endsWith("/vi/blog/ai/ai-ideas-bloom-inside-everyday-work")
  );
  assert.ok(viOnlyArticle);
  assert.deepEqual(
    Object.keys(viOnlyArticle.alternates.languages).sort(),
    ["vi", "x-default"]
  );
  assert.equal(
    viOnlyArticle.alternates.languages["x-default"],
    viOnlyArticle.alternates.languages.vi
  );
});

test("editorial metadata remains optional and route collisions fail schema validation", () => {
  const category = {
    slug: "architecture",
    title: "Architecture",
    tagline: "Systems",
    description: "Architecture notes",
    accent: "ocean",
    order: 1
  };
  const series = {
    id: "foundations",
    title: "Foundations",
    intro: "A sufficiently explicit introduction.",
    order: 1
  };
  const post = {
    slug: "sample-post",
    category: "architecture",
    title: "Sample",
    summary: "Summary",
    date: "2026-07-19",
    readingMinutes: 1,
    tags: [],
    author: "Nguyen Le Phong",
    locales: ["en"],
    series: "foundations",
    seriesOrder: 1,
    contentMode: "technical",
    seoTitle: "A focused SEO title",
    seoDescription: "A focused SEO description",
    reviewedAt: "2026-07-19"
  };
  assert.equal(
    blogSchemas.blogIndexSchema.safeParse({
      series: [series],
      categories: [category],
      posts: [post]
    }).success,
    true
  );
  assert.equal(
    blogSchemas.blogIndexSchema.safeParse({
      series: [series],
      categories: [category],
      posts: [{ ...post, contentMode: "marketing" }]
    }).success,
    false
  );
  assert.equal(
    blogSchemas.blogIndexSchema.safeParse({
      series: [series],
      categories: [category],
      posts: [{ ...post, seoTitle: "   " }]
    }).success,
    false
  );
  assert.equal(
    blogSchemas.blogIndexSchema.safeParse({
      series: [series],
      categories: [{ ...category, slug: "series" }],
      posts: [{ ...post, category: "series" }]
    }).success,
    false
  );
  assert.equal(
    blogSchemas.blogIndexSchema.safeParse({
      series: [{ ...series, id: "page" }],
      categories: [category],
      posts: [{ ...post, series: "page" }]
    }).success,
    false
  );
  assert.equal(
    blogSchemas.blogIndexSchema.safeParse({
      series: [series],
      categories: [category],
      posts: [{ ...post, slug: "opengraph-image" }]
    }).success,
    false
  );

  const topic = {
    id: "thoughts",
    label: "Thoughts",
    description: "Short thoughts",
    color: "#000"
  };
  const note = {
    slug: "sample-note",
    title: "Sample",
    summary: "Summary",
    date: "2026-07-19",
    readingMinutes: 1,
    tags: [],
    topic: "thoughts",
    author: "Nguyen Le Phong",
    baseLocale: "en",
    locales: ["en"]
  };
  assert.equal(
    notesSchemas.notesIndexSchema.safeParse({
      hubs: [
        {
          topic: "thoughts",
          title: "Thoughts",
          intro: "Living notes",
          order: 1
        }
      ],
      topics: [topic],
      posts: [note]
    }).success,
    true
  );
  assert.equal(
    notesSchemas.notesIndexSchema.safeParse({
      hubs: [{ topic: "page", title: "Page", intro: "Collision", order: 1 }],
      topics: [{ ...topic, id: "page" }],
      posts: []
    }).success,
    false
  );
  assert.equal(
    notesSchemas.notesIndexSchema.safeParse({
      hubs: [],
      topics: [topic],
      posts: [{ ...note, slug: "topics" }]
    }).success,
    false
  );

  for (const index of [
    readJson("../content/blog-data/_index.json"),
    readJson("../content/notes-data/_index.json")
  ]) {
    for (const entry of index.posts) {
      for (const field of [
        "contentMode",
        "seoTitle",
        "seoDescription",
        "reviewedAt"
      ]) {
        assert.equal(
          Object.hasOwn(entry, field),
          false,
          `${entry.slug} mass-assigned ${field}`
        );
      }
    }
  }
});

test("notes author quality has one exact unresolved slug and consistent explicit authors elsewhere", () => {
  const index = readJson("../content/notes-data/_index.json");
  const viIndex = readJson("../content/notes-data/vi/_index.json");
  const unresolved = new Set(quality.UNRESOLVED_NOTE_AUTHOR_SLUGS);
  assert.deepEqual(quality.UNRESOLVED_NOTE_AUTHOR_SLUGS, [
    "chi-phi-mua-nha-toan-bo-nhung-khoan-can-biet"
  ]);
  assert.deepEqual(
    index.posts
      .filter((note) => !note.author?.trim())
      .map((note) => note.slug),
    quality.UNRESOLVED_NOTE_AUTHOR_SLUGS
  );

  for (const note of index.posts) {
    const body = readJson(`../content/notes-data/posts/${note.slug}.json`);
    const viEntry = viIndex.posts.find(({ slug }) => slug === note.slug);
    const viBodyPath = new URL(
      `../content/notes-data/vi/posts/${note.slug}.json`,
      import.meta.url
    );
    const viBody = existsSync(viBodyPath) ? readJson(viBodyPath) : null;
    const declaredAuthors = [
      note.author,
      body.author,
      viEntry?.author,
      viBody?.author
    ].filter((author) => author !== undefined);

    if (unresolved.has(note.slug)) {
      assert.deepEqual(declaredAuthors, [], `${note.slug} unresolved author`);
    } else {
      assert.equal(typeof note.author, "string", `${note.slug} index author`);
      assert.equal(typeof body.author, "string", `${note.slug} body author`);
      for (const author of declaredAuthors) {
        assert.equal(typeof author, "string", `${note.slug} author type`);
        assert.ok(author.trim().length > 0, `${note.slug} empty author`);
      }
      assert.equal(
        new Set(declaredAuthors).size,
        1,
        `${note.slug} localized author parity`
      );
    }
  }

  const resolved = index.posts.find((note) => !unresolved.has(note.slug));
  const resolvedBody = readJson(
    `../content/notes-data/posts/${resolved.slug}.json`
  );
  assert.equal(
    notesSchemas.notesIndexSchema.safeParse({
      ...index,
      posts: index.posts.map((note) =>
        note.slug === resolved.slug ? { ...note, author: "Guest Author" } : note
      )
    }).success,
    true
  );
  assert.equal(
    notesSchemas.noteSchema.safeParse({
      ...resolvedBody,
      author: "Guest Author"
    }).success,
    true
  );
  assert.deepEqual(notesAuthorship.resolveNoteAuthorIdentity("Guest Author"), {
    name: "Guest Author",
    structuredData: { "@type": "Person", name: "Guest Author" }
  });
  assert.equal(
    notesAuthorship.resolveNoteAuthorIdentity("Nguyen Le Phong").profileUrl,
    "https://nguyenlephong.github.io"
  );
});

test("hub implementation stays static-first and reviewedAt never becomes dateModified", () => {
  const hubSources = [
    "../src/components/content/ContentHubPage.tsx",
    "../src/lib/content/hub-page.ts",
    "../src/components/blog/BlogSeriesCollectionPage.tsx",
    "../src/components/notes/NotesTopicCollectionPage.tsx",
    "../src/app/[locale]/(site)/blog/series/[series]/page.tsx",
    "../src/app/[locale]/(site)/blog/series/[series]/page/[page]/page.tsx",
    "../src/app/[locale]/(site)/notes/topics/[topic]/page.tsx",
    "../src/app/[locale]/(site)/notes/topics/[topic]/page/[page]/page.tsx"
  ].map((file) => readFileSync(new URL(file, import.meta.url), "utf8"));
  const sharedHub = hubSources[0];
  const sharedContract = hubSources[1];
  const collectionSources = hubSources.slice(2, 4).join("\n");
  const allHubSources = hubSources.join("\n");
  assert.match(sharedHub, /<a\b/);
  assert.doesNotMatch(sharedHub, /from ['"]next\/link['"]/);
  assert.doesNotMatch(allHubSources, /Explorer|search-index|firebase/i);
  assert.match(sharedContract, /'@type': 'CollectionPage'/);
  assert.match(sharedContract, /'@type': 'ItemList'/);
  assert.match(sharedContract, /'@type': 'BreadcrumbList'/);
  assert.match(sharedContract, /CONTENT_HUB_SOCIAL_IMAGE/);
  assert.match(collectionSources, /buildContentHubMetadata/);
  assert.match(collectionSources, /buildContentHubStructuredData/);
  assert.match(collectionSources, /pageData\.startIndex \+ index \+ 1/);
  assert.match(collectionSources, /listBlogSeriesPageLocales/);
  assert.match(collectionSources, /listNoteHubPageLocales/);
  assert.doesNotMatch(collectionSources, /localeAlternates\(/);

  for (const file of [
    "../src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx",
    "../src/app/[locale]/(site)/notes/[slug]/page.tsx"
  ]) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.match(source, /lastReviewed:\s*(?:post|note)\.reviewedAt/);
    assert.match(source, /dateModified:\s*(?:post|note)\.updated/);
    assert.doesNotMatch(source, /dateModified:\s*(?:post|note)\.reviewedAt/);
  }
});
