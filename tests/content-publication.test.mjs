import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

process.env.CONTENT_BUILD_DATE = "2026-07-18";

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

const {
  getPostContentLocales,
  getPostsByCategory,
  getSeriesContext,
  listBlogPostParams,
  listCategoryPostPairs,
  listPosts,
  loadPost
} = await import(new URL("../src/lib/blog/data.ts", import.meta.url));
const { listNotes } = await import(
  new URL("../src/lib/notes/data.ts", import.meta.url)
);
const { getContentBuildDate, isContentPublished, resolveContentBuildDate } =
  await import(new URL("../src/lib/content/publication.ts", import.meta.url));
const { default: buildSitemap } = await import(
  new URL("../src/app/sitemap.ts", import.meta.url)
);
const { toBlogSearchItem } = await import(
  new URL("../src/lib/content/search-index.ts", import.meta.url)
);
const { createSearchIndex } = await import(
  new URL("../src/lib/content/search-index.server.ts", import.meta.url)
);

const requiredRegressionSlugs = [
  "designing-defaults-that-fail-safely",
  "protecting-attention-in-a-busy-team",
  "letting-ai-speed-up-the-search-not-the-judgment",
  "what-thirty-days-of-small-notes-can-teach",
  "turning-review-evidence-into-team-memory"
];

test("publication contract is deterministic at date, embargo, and draft boundaries", () => {
  assert.equal(getContentBuildDate(), "2026-07-18");
  assert.equal(isContentPublished({ date: "2026-07-18" }), true);
  assert.equal(isContentPublished({ date: "2026-07-19" }), false);
  assert.equal(isContentPublished({ date: "2026-07-19" }, "2026-07-19"), true);
  assert.equal(
    isContentPublished({ date: "2020-01-01", publishAt: "2026-07-19" }),
    false
  );
  assert.equal(
    isContentPublished(
      { date: "2020-01-01", publishAt: "2026-07-19" },
      "2026-07-19"
    ),
    true
  );
  assert.equal(
    isContentPublished({ date: "2026-07-19", publishAt: "2020-01-01" }),
    false
  );
  assert.equal(
    isContentPublished({ date: "2020-01-01", status: "draft" }),
    false
  );

  assert.equal(
    resolveContentBuildDate(undefined, new Date("2026-07-18T23:59:59Z")),
    "2026-07-18"
  );
  assert.equal(
    resolveContentBuildDate("2026-07-17", new Date("2026-07-18T23:59:59Z")),
    "2026-07-17"
  );
  assert.throws(
    () => resolveContentBuildDate("2026-02-30"),
    /CONTENT_BUILD_DATE must be a real UTC date/
  );
});

test("all unpublished blog posts stay out of every public route and discovery consumer", () => {
  const source = JSON.parse(
    readFileSync(
      new URL("../content/blog-data/_index.json", import.meta.url),
      "utf8"
    )
  );
  const unpublishedPosts = source.posts.filter(
    (post) => !isContentPublished(post)
  );
  const unpublishedSlugs = new Set(unpublishedPosts.map((post) => post.slug));
  for (const slug of requiredRegressionSlugs) {
    assert.equal(unpublishedSlugs.has(slug), true, `${slug} regression fixture`);
  }

  const visiblePosts = listPosts("en");
  const visibleSlugs = new Set(visiblePosts.map((post) => post.slug));
  const staticSlugs = new Set(listBlogPostParams().map((post) => post.slug));
  const categoryPairSlugs = new Set(
    listCategoryPostPairs().map((post) => post.slug)
  );
  const sitemapUrls = buildSitemap().map((entry) => entry.url);
  const searchIndex = createSearchIndex(visiblePosts.map(toBlogSearchItem));
  const searchSlugs = new Set(searchIndex.items.map((post) => post.slug));

  for (const { slug } of unpublishedPosts) {
    assert.equal(visibleSlugs.has(slug), false, `${slug} list`);
    assert.equal(staticSlugs.has(slug), false, `${slug} static params`);
    assert.equal(categoryPairSlugs.has(slug), false, `${slug} sitemap source`);
    assert.equal(searchSlugs.has(slug), false, `${slug} search`);
    assert.equal(
      sitemapUrls.some((url) => url.endsWith(`/${slug}`)),
      false,
      `${slug} sitemap`
    );
    assert.deepEqual(getPostContentLocales(slug), [], `${slug} locales`);
    assert.equal(loadPost(slug, "en"), null, `${slug} body`);
    assert.equal(getSeriesContext(slug, "en"), null, `${slug} series`);
  }

  assert.equal(
    getPostsByCategory("architecture", "en").some(
      (post) => post.slug === requiredRegressionSlugs[0]
    ),
    false
  );
  assert.equal(searchIndex.items.length, visiblePosts.length);
});

test("static OG listing uses the same unpublished corpus boundary", () => {
  const source = JSON.parse(
    readFileSync(
      new URL("../content/blog-data/_index.json", import.meta.url),
      "utf8"
    )
  );
  const unpublishedSlugs = new Set(
    source.posts
      .filter((post) => !isContentPublished(post))
      .map((post) => post.slug)
  );
  const output = execFileSync(
    process.execPath,
    ["scripts/generate-static-og.mjs", "--surface", "blog", "--list"],
    {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      encoding: "utf8",
      env: { ...process.env, CONTENT_BUILD_DATE: getContentBuildDate() }
    }
  );
  const listedSlugs = new Set(
    output
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((file) => path.basename(file, path.extname(file)))
  );

  assert.equal(listedSlugs.size, listPosts("en").length);
  for (const slug of unpublishedSlugs) {
    assert.equal(listedSlugs.has(slug), false, `${slug} OG source`);
  }
});

test("all visible blog and note collection entries satisfy the same contract", () => {
  for (const entry of [...listPosts("en"), ...listNotes("en")]) {
    assert.equal(isContentPublished(entry), true, entry.slug);
  }
});
