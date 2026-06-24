import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { blogIndexSchema, blogPostSchema } = await import(
  new URL("../src/lib/blog/schema.ts", import.meta.url)
);
const { notesIndexSchema, noteSchema } = await import(
  new URL("../src/lib/notes/schema.ts", import.meta.url)
);

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

test("notes expose one canonical slug set across English and Vietnamese", () => {
  const notesDataSource = readFileSync(
    new URL("../src/lib/notes/data.ts", import.meta.url),
    "utf8"
  );
  const sitemapSource = readFileSync(
    new URL("../src/app/sitemap.ts", import.meta.url),
    "utf8"
  );
  const notesIndex = JSON.parse(
    readFileSync(new URL("../public/notes-data/_index.json", import.meta.url), "utf8")
  );
  const canonicalSlugs = notesIndex.posts.map((post) => post.slug);

  assert.equal(new Set(canonicalSlugs).size, canonicalSlugs.length);
  assert.match(notesDataSource, /NOTE_CONTENT_LOCALES = \["en", "vi"\] as const/);
  assert.match(notesDataSource, /return \[\.\.\.NOTE_CONTENT_LOCALES\]/);
  assert.match(sitemapSource, /for \(const note of listNotes\("en"\)\)/);
  assert.doesNotMatch(sitemapSource, /Vietnamese-only notes/);
});
