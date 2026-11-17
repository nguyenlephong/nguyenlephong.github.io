import assert from "node:assert/strict";
import test from "node:test";
import { planLocale } from "../scripts/sync-blog-index-metadata.mjs";

const base = { a: { slug: "a", title: "New", summary: "S", readingMinutes: 9, tags: ["x"] } };

test("en and vi index entries follow the body", () => {
  const index = [{ slug: "a", title: "Old", summary: "S", readingMinutes: 14, tags: ["x"] }];
  assert.deepEqual(planLocale("en", index, base, {}).indexUpdates, [
    { slug: "a", fields: { title: "New", readingMinutes: 9 } }
  ]);
  const vi = { a: { slug: "a", title: "Mới", summary: "Tóm tắt" } };
  assert.deepEqual(planLocale("vi", index, base, vi).indexUpdates, [
    { slug: "a", fields: { title: "Mới", summary: "Tóm tắt", readingMinutes: 9 } }
  ]);
  const inherits = [{ slug: "a", title: "Mới", summary: "Tóm tắt", tags: ["x"] }];
  assert.deepEqual(planLocale("vi", inherits, base, vi).indexUpdates, []);
});

test("legacy locales pin their old reading time instead of changing the index", () => {
  const index = [{ slug: "a", title: "旧", readingMinutes: 14 }];
  const plan = planLocale("zh", index, base, { a: { slug: "a" } });
  assert.deepEqual(plan, { indexUpdates: [], overrideUpdates: [{ slug: "a", readingMinutes: 14 }] });
  assert.deepEqual(planLocale("zh", index, base, { a: { slug: "a", readingMinutes: 14 } }).overrideUpdates, []);
});
