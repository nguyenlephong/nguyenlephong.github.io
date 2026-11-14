import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  indexSearchFields,
  parseSearchQuery,
  topMatches
} from "../src/lib/content/search.ts";
import {
  isNotesSearchIndex,
  toNoteSearchItem
} from "../src/lib/content/search-index.ts";

const read = (path) => readFileSync(path, "utf8");
const messages = Object.fromEntries(
  ["en", "vi", "fr", "ja", "ko", "zh"].map((l) => [l, JSON.parse(read(`messages/${l}.json`))])
);

// MEP-48 ---------------------------------------------------------------------

test("topMatches keeps the Vietnamese matcher, ranks title hits first and caps the group", () => {
  const entries = [
    { id: "summary-only", fields: { title: "Kỷ luật", meta: "", summary: "Mua nhà sớm" } },
    { id: "title", fields: { title: "Mua nhà lần đầu", meta: "", summary: "" } },
    { id: "nham", fields: { title: "Những việc nhắn tin", meta: "", summary: "" } },
    { id: "title-2", fields: { title: "Vay mua nhà", meta: "", summary: "" } }
  ].map((entry) => ({ ...entry, index: indexSearchFields(entry.fields) }));
  const terms = parseSearchQuery("nhà", "vi");

  assert.deepEqual(topMatches(entries, terms, 5).map((e) => e.id), ["title", "title-2", "summary-only"]);
  assert.deepEqual(topMatches(entries, terms, 1).map((e) => e.id), ["title"]);
  assert.deepEqual(topMatches(entries, parseSearchQuery(""), 5), []);
});

test("the header opens a lazily loaded dialog with Cmd K / Ctrl K and tracks the trigger", () => {
  const trigger = read("src/components/search/GlobalSearch.tsx");
  assert.match(trigger, /dynamic\(\(\) => import\('\.\/GlobalSearchDialog'\), \{\s*ssr: false/);
  assert.doesNotMatch(trigger, /from '\.\/GlobalSearchDialog'/);
  assert.match(trigger, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(trigger, /track\('global_search_open', \{ trigger \}\)/);
  assert.match(trigger, /openSearch\('shortcut'\)/);
  assert.match(trigger, /openSearch\('button'\)/);
  assert.match(trigger, /returnFocusRef\.current\?\.focus\(\)/);
  assert.doesNotMatch(trigger, /fetch\(/, "no index request before the first open");

  const header = read("src/components/AppHeader.tsx");
  assert.match(header, /<GlobalSearch config=\{search\} muted=\{menuOpen\} \/>/);
  const layout = read("src/app/[locale]/(site)/layout.tsx");
  assert.match(layout, /<AppHeader search=\{globalSearchConfig\(locale\)\} \/>/);
});

test("the dialog is a modal combobox over a grouped listbox", () => {
  const dialog = read("src/components/search/GlobalSearchDialog.tsx");
  assert.match(dialog, /<dialog[\s\S]*aria-modal="true"/);
  assert.match(dialog, /showModal\(\)/);
  assert.match(dialog, /role="combobox"/);
  assert.match(dialog, /aria-expanded=\{hasResults\}/);
  assert.match(dialog, /aria-controls=\{listId\}/);
  assert.match(dialog, /aria-activedescendant=/);
  assert.match(dialog, /role="listbox"/);
  assert.match(dialog, /role="group"/);
  assert.match(dialog, /role="option"/);
  assert.match(dialog, /aria-selected=\{index === activeIndex\}/);
  for (const key of ["ArrowDown", "ArrowUp", "Enter"]) assert.match(dialog, new RegExp(`'${key}'`));
  assert.match(dialog, /const GROUP_LIMIT = 5/);
  assert.match(dialog, /isBlogSearchIndex/);
  assert.match(dialog, /isNotesSearchIndex/);
});

test("search analytics send lengths and counts, never the query text", () => {
  const analytics = read("src/lib/analytics.ts");
  for (const name of [
    "global_search_open",
    "global_search_query",
    "global_search_no_results",
    "global_search_result_click",
    "notes_tag_click"
  ]) {
    assert.match(analytics, new RegExp(`'${name}'`), name);
  }
  const dialog = read("src/components/search/GlobalSearchDialog.tsx");
  assert.match(
    dialog,
    /track\('global_search_result_click', \{\s*surface: entry\.surface,\s*position: index \+ 1,\s*query_length: trimmed\.length,/
  );
  assert.match(dialog, /track\('global_search_no_results', \{ query_length: settled\.length \}\)/);
  assert.match(dialog, /track\('global_search_query', \{ query_length: settled\.length, result_count: options\.length \}\)/);
  assert.doesNotMatch(dialog, /track\([^)]*\bquery:/);
});

test("search copy exists in every locale", () => {
  for (const [locale, catalog] of Object.entries(messages)) {
    const search = catalog.Nav.search;
    for (const key of ["label", "dialogLabel", "placeholder", "hint", "blog", "notes", "loading", "error", "empty", "results", "close"]) {
      assert.equal(typeof search?.[key], "string", `${locale} Nav.search.${key}`);
    }
    assert.match(search.empty, /\{query\}/, locale);
    assert.doesNotMatch(JSON.stringify(search), /—/, `${locale} has no em dash`);
  }
  assert.equal(messages.en.Nav.search.placeholder, "Search posts and notes…");
  assert.equal(messages.vi.Nav.search.placeholder, "Tìm bài viết và ghi chép…");
  assert.equal(messages.vi.Nav.search.notes, "Ghi chép");
});

// MEP-50 ---------------------------------------------------------------------

test("the notes index ships cardSummary only", () => {
  const note = {
    slug: "a",
    title: "A",
    summary: "Long SEO summary",
    cardSummary: "Short card line",
    date: "2026-01-01",
    readingMinutes: 3,
    tags: ["x"],
    topic: "thoughts"
  };
  const item = toNoteSearchItem(note);
  assert.equal("summary" in item, false);
  assert.equal(item.cardSummary, "Short card line");
  const { cardSummary, ...withoutCard } = note;
  assert.equal(cardSummary.length > 0, true);
  assert.equal(toNoteSearchItem(withoutCard).cardSummary, "Long SEO summary");

  const revision = "0123456789abcdef";
  assert.equal(isNotesSearchIndex({ version: 1, revision, items: [item] }), true);
  const { cardSummary: _dropped, ...noCard } = item;
  assert.equal(isNotesSearchIndex({ version: 1, revision, items: [noCard] }), false);

  const budgets = JSON.parse(read("config/static-artifact-budgets.json"));
  const searchJson = JSON.stringify(budgets);
  assert.match(searchJson, /"path":"vi\/search\/notes\.json","maxRawBytes":\d+,"maxGzipBytes":(\d+)/);
  const viGzip = Number(searchJson.match(/"path":"vi\/search\/notes\.json","maxRawBytes":\d+,"maxGzipBytes":(\d+)/)[1]);
  assert.ok(viGzip <= 18432, `vi notes index budget ${viGzip} must stay at or under 18 KB gzip`);
});

// MEP-51 ---------------------------------------------------------------------

// Proper names, book titles, products and loanwords Vietnamese readers use as is.
const RESERVED_ASCII_TAGS = new Set([
  "AI", "Agile", "Startup", "MBA", "C-Level", "Podcast", "Profiling", "Obsidian",
  "Bao dung", "Kinh doanh", "Khung PAIR", "#web5ngay",
  "Atomic Habits", "James Clear", "7 Habits", "Stephen Covey", "Dale Carnegie",
  "Keith Ferrazzi", "David Eagleman", "Paulo Coelho", "Katy Milkman", "Robert Greene",
  "The Visual MBA", "Jason Barron", "The World Is Flat", "Thomas Friedman",
  "Napoleon Hill", "Think and Grow Rich", "Thinking Fast and Slow", "Daniel Kahneman"
]);

test("Vietnamese notes carry Vietnamese tags and no tag that repeats the topic", () => {
  const dir = "content/notes-data/vi/posts";
  const index = JSON.parse(read("content/notes-data/vi/_index.json"));
  const offenders = new Set();
  for (const post of index.posts) {
    for (const tag of post.tags ?? []) {
      if (/^[\x20-\x7E]+$/.test(tag) && !RESERVED_ASCII_TAGS.has(tag)) offenders.add(tag);
    }
  }
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
    for (const tag of JSON.parse(read(`${dir}/${file}`)).tags ?? []) {
      if (/^[\x20-\x7E]+$/.test(tag) && !RESERVED_ASCII_TAGS.has(tag)) offenders.add(tag);
    }
  }
  assert.deepEqual([...offenders], []);
  const base = JSON.parse(read("content/notes-data/_index.json"));
  for (const post of base.posts.filter((entry) => entry.topic === "thoughts")) {
    assert.ok(!post.tags.includes("Thoughts"), post.slug);
  }
});

test("article tags on notes are archive filter links and any tag deep-links", () => {
  const page = read("src/app/[locale]/(site)/notes/[slug]/page.tsx");
  assert.match(page, /articleTagLinks\(note\.tags, topic \? \[topic\.label\] : \[\], "\/notes"\)/);
  assert.match(page, /data-tag-link=\{tag\}/);
  const hook = read("src/components/explorer/useExplorer.ts");
  assert.match(hook, /tag: tg\?\.trim\(\) \|\| null/);
  assert.doesNotMatch(hook, /popularTags\.includes/);
  const tracking = read("src/components/analytics/useRelatedLinkClickTracking.ts");
  assert.match(tracking, /if \(surface === 'notes'\) track\('notes_tag_click', properties\)/);
});

// MEP-47 ---------------------------------------------------------------------

test("Vietnamese notes controls say ghi chép, and hub strings live in messages", () => {
  assert.doesNotMatch(JSON.stringify(messages.vi.Pages.notes), /bài viết/i);
  assert.equal(messages.vi.Pages.notes.controls.filtersLabel, "Lọc theo chủ đề");
  for (const locale of ["en", "vi"]) {
    for (const key of ["heading", "eyebrow", "back", "suffix", "empty"]) {
      assert.equal(typeof messages[locale].Pages.notes.hubs?.[key], "string", `${locale} hubs.${key}`);
    }
  }
  const collection = read("src/components/notes/NotesCollectionPage.tsx");
  assert.doesNotMatch(collection, /locale === 'vi' \?/);
  assert.match(collection, /t\('hubs\.heading'\)/);
  const topic = read("src/components/notes/NotesTopicCollectionPage.tsx");
  assert.doesNotMatch(topic, /\bCOPY\b/);
  assert.match(topic, /t\('hubs\.eyebrow'\)/);
});

// MEP-53 ---------------------------------------------------------------------

test("the no-JS topic fallback renders links, not inert buttons", () => {
  const shell = read("src/components/explorer/ExplorerShell.tsx");
  const fallback = shell.slice(shell.indexOf("<noscript>"), shell.indexOf("</noscript>"));
  assert.match(fallback, /<a key=\{f\.id\} href=\{f\.href\}/);
  assert.doesNotMatch(fallback, /<button/);
  assert.match(read("src/components/blog/BlogExplorer.tsx"), /href: `\/\$\{locale\}\/blog\/\$\{c\.slug\}`/);
  assert.match(
    read("src/components/notes/NotesCollectionPage.tsx"),
    /href: `\/\$\{archiveLocale\}\/notes\/topics\/\$\{topic\.id\}`/
  );
});
