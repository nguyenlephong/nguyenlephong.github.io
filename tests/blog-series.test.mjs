import assert from "node:assert/strict";
import test from "node:test";

const { compareSeriesPosts } = await import(
  new URL("../src/lib/blog/series.ts", import.meta.url)
);

test("orders series posts by explicit seriesOrder before date", () => {
  const posts = [
    { slug: "latest", date: "2026-06-23", seriesOrder: 13 },
    { slug: "first", date: "2026-05-29", seriesOrder: 1 },
    { slug: "middle", date: "2026-06-04", seriesOrder: 11 }
  ];

  assert.deepEqual(posts.sort(compareSeriesPosts).map((post) => post.slug), [
    "first",
    "middle",
    "latest"
  ]);
});

test("falls back to newest date when seriesOrder is absent", () => {
  const posts = [
    { slug: "older", date: "2026-06-01" },
    { slug: "newer", date: "2026-06-03" }
  ];

  assert.deepEqual(posts.sort(compareSeriesPosts).map((post) => post.slug), [
    "newer",
    "older"
  ]);
});

test("keeps ordered series entries before unordered date fallbacks", () => {
  const posts = [
    { slug: "fallback-newer", date: "2026-06-23" },
    { slug: "ordered", date: "2026-05-29", seriesOrder: 1 },
    { slug: "fallback-older", date: "2026-06-01" }
  ];

  assert.deepEqual(posts.sort(compareSeriesPosts).map((post) => post.slug), [
    "ordered",
    "fallback-newer",
    "fallback-older"
  ]);
});
