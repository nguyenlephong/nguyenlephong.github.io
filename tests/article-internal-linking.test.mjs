import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

function resolveProjectModule(url) {
  const basePath = fileURLToPath(url);
  if (existsSync(basePath)) return url.href;
  for (const extension of [".ts", ".tsx", ".js", ".mjs"]) {
    const candidate = basePath + extension;
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveProjectModule(
        new URL("../src/" + specifier.slice(2), import.meta.url)
      );
      if (resolved) return { url: resolved, shortCircuit: true };
    }
    if (
      context.parentURL?.startsWith("file:") &&
      (specifier.startsWith("./") || specifier.startsWith("../"))
    ) {
      const resolved = resolveProjectModule(new URL(specifier, context.parentURL));
      if (resolved) return { url: resolved, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  }
});

const { rankRelated } = await import("../src/lib/content/related.ts");
const { getRelatedPosts } = await import("../src/lib/blog/related.ts");
const { getCategoryNeighbors } = await import("../src/lib/blog/neighbors.ts");
const { getRelatedNotes } = await import("../src/lib/notes/related.ts");
const { buildArticleDescription } = await import(
  "../src/lib/seo/article-description.ts"
);
const blogData = await import("../src/lib/blog/data.ts");
const notesData = await import("../src/lib/notes/data.ts");

const item = (slug, date, tags, extra = {}) => ({ slug, date, tags, ...extra });

test("rankRelated prefers series, then shared tags, then newest", () => {
  const current = item("a", "2026-01-01", ["Rust", "Testing"], {
    group: "g1",
    series: "s1",
    seriesOrder: 1
  });
  const pool = [
    item("same-series", "2025-01-01", [], { series: "s1", seriesOrder: 2 }),
    item("shared-tag-new", "2026-05-01", ["rust"]),
    item("shared-tag-old", "2024-05-01", ["Rust"]),
    item("same-group", "2026-06-01", [], { group: "g1" }),
    item("unrelated", "2026-07-01", ["other"])
  ];
  const slugs = rankRelated(current, pool, { limit: 4 }).map((r) => r.slug);
  assert.deepEqual(slugs, [
    "same-series",
    "shared-tag-new",
    "shared-tag-old",
    "same-group"
  ]);
});

test("rankRelated tops up with newest items and honours exclude", () => {
  const current = item("a", "2026-01-01", ["x"]);
  const pool = [
    item("old", "2020-01-01", ["y"]),
    item("mid", "2023-01-01", ["y"]),
    item("new", "2026-02-01", ["y"]),
    item("skip", "2026-03-01", ["y"])
  ];
  const slugs = rankRelated(current, pool, {
    limit: 5,
    minimum: 3,
    exclude: new Set(["skip"])
  }).map((r) => r.slug);
  assert.deepEqual(slugs, ["new", "mid", "old"]);
});

test("getCategoryNeighbors walks a category chronologically", () => {
  const posts = [
    { slug: "b", category: "c", date: "2026-02-01" },
    { slug: "a", category: "c", date: "2026-01-01" },
    { slug: "d", category: "c", date: "2026-03-01" },
    { slug: "z", category: "other", date: "2026-02-15" }
  ];
  const middle = getCategoryNeighbors("b", "c", posts);
  assert.equal(middle.prev?.slug, "a");
  assert.equal(middle.next?.slug, "d");
  assert.equal(getCategoryNeighbors("a", "c", posts).prev, null);
  assert.equal(getCategoryNeighbors("d", "c", posts).next, null);
});

test("buildArticleDescription ends on a sentence or word boundary", () => {
  const long =
    "First sentence is calm and clear, and it is long enough to be a useful snippet on its own for readers. Second sentence continues the thought for a while longer than expected, then keeps going without stopping until it overflows.";
  assert.equal(
    buildArticleDescription(long),
    "First sentence is calm and clear, and it is long enough to be a useful snippet on its own for readers."
  );
  const cut = buildArticleDescription("word ".repeat(60).trim());
  assert.ok(cut.endsWith("…") && cut.length <= 160);
  assert.ok(!/\bwor…$/.test(cut));
  assert.equal(
    buildArticleDescription("<p>Short &amp; sweet.</p>"),
    "Short & sweet."
  );
});

test("buildArticleDescription uses a tighter budget for CJK text", () => {
  const ja = "これは長い日本語の説明です、".repeat(10) + "終わり。";
  const out = buildArticleDescription(ja);
  assert.ok(out.length <= 89, "length " + out.length);
});

test("every published blog post links to enough related posts per locale", () => {
  for (const locale of ["en", "vi", "fr", "ja", "ko", "zh"]) {
    const posts = blogData.listPosts(locale);
    for (const post of posts) {
      const { prev, next } = getCategoryNeighbors(
        post.slug,
        post.category,
        posts
      );
      const exclude = new Set([prev?.slug, next?.slug].filter(Boolean));
      const related = getRelatedPosts(post, posts, 5, exclude);
      const expected = Math.min(3, posts.length - 1 - exclude.size);
      assert.ok(
        related.length >= expected,
        locale + "/" + post.slug + " has " + related.length + " related posts"
      );
      assert.ok(related.length <= 5);
      assert.ok(!related.some((entry) => entry.slug === post.slug));
    }
  }
});

test("every published note links to at least three related notes", () => {
  for (const locale of ["en", "vi"]) {
    const notes = notesData.listNotes(locale);
    for (const note of notes) {
      const context = notesData.getTopicReadingContext(note.slug, locale);
      const exclude = new Set(
        [context?.prev?.slug, context?.next?.slug].filter(Boolean)
      );
      const related = getRelatedNotes(note, notes, 5, exclude);
      assert.ok(
        related.length >= 3,
        locale + "/" + note.slug + " has " + related.length + " related notes"
      );
    }
  }
});

test("related blocks introduce no extra client component", async () => {
  const component = await readFile(
    "src/components/content/ArticleRelatedLinks.tsx",
    "utf8"
  );
  assert.doesNotMatch(component, /["']use client["']/);
  assert.match(component, /data-related-link="related"/);
});
