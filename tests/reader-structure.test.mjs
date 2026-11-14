import assert from "node:assert/strict";
import test from "node:test";

import {
  buildArticleOutline,
  MIN_OUTLINE_ITEMS,
  opensWithPunctuation
} from "../src/lib/content/article-outline.ts";
import { enhanceArticleTables } from "../src/lib/content/article-html.ts";
import { renderRssFeed, uniqueFeedCategories } from "../src/lib/seo/feed.ts";
import { subscribeWindowScroll } from "../src/components/blog/windowScroll.ts";

test("article outline is built on the server and keeps authored ids (MEP-37)", () => {
  const { html, items } = buildArticleOutline(
    [
      '<h2 id="kept">Kept &amp; named</h2>',
      "<p>Body</p>",
      "<h3>Tiếng <em>Việt</em> đây</h3>",
      "<h2>  </h2>",
      '<h2 class="x">Kept &amp; named</h2>'
    ].join("")
  );

  assert.deepEqual(items, [
    { id: "kept", text: "Kept & named", level: 2 },
    { id: "tieng-viet-day", text: "Tiếng Việt đây", level: 3 },
    { id: "kept-and-named", text: "Kept & named", level: 2 }
  ]);
  assert.match(html, /<h2 id="kept">Kept &amp; named<\/h2>/);
  assert.match(html, /<h3 id="tieng-viet-day">Tiếng <em>Việt<\/em> đây<\/h3>/);
  assert.match(html, /<h2 id="kept-and-named" class="x">/);
  assert.match(html, /<h2>  <\/h2>/, "an untitled heading is left alone");
  assert.equal(MIN_OUTLINE_ITEMS, 2);
});

test("generated heading ids never collide with authored ids", () => {
  const { items } = buildArticleOutline('<p id="intro">x</p><h2>Intro</h2><h2>Intro</h2>');
  assert.deepEqual(
    items.map((item) => item.id),
    ["intro-2", "intro-3"]
  );
  const shell = buildArticleOutline("<h2>Article TOC</h2><h2>Main content</h2>");
  assert.deepEqual(
    shell.items.map((item) => item.id),
    ["article-toc-2", "main-content-2"],
    "page shell ids are reserved"
  );
});

test("drop cap is skipped only when the first paragraph opens with punctuation (MEP-52)", () => {
  assert.equal(opensWithPunctuation("<p>“Ok.” Chỉ hai ký tự.</p>"), true);
  assert.equal(opensWithPunctuation('<p class="lead"><em>&ldquo;Ok.&rdquo;</em> two</p>'), true);
  assert.equal(opensWithPunctuation("<p>(Aside) text</p>"), true);
  assert.equal(opensWithPunctuation("<p>Something strange</p>"), false);
  assert.equal(opensWithPunctuation("<pre>“code”</pre><p>Đây là</p>"), false);
  assert.equal(opensWithPunctuation("<h2>No paragraph</h2>"), false);
});

test("scrolling tables become named focusable regions; empty headers become cells (MEP-79)", () => {
  const html = enhanceArticleTables(
    `<div class="blog-table-wrap"><table><thead><tr><th width="22%">&nbsp;</th><th>Sync &amp; async</th><th>B</th><th>C</th><th>D</th></tr></thead></table></div>` +
      `<div class='blog-table-wrap'><table><tbody><tr><td>x</td></tr></tbody></table></div>`,
    "vi"
  );

  assert.match(html, /<td width="22%"><\/td>/);
  assert.doesNotMatch(html, /<th[^>]*>(?:\s|&nbsp;)*<\/th>/);
  assert.match(
    html,
    /<div class="blog-table-wrap" tabindex="0" role="region" aria-label="Bảng: Sync &amp; async, B, C">/
  );
  assert.match(html, /<div class="blog-table-wrap" tabindex="0" role="region" aria-label="Bảng">/);
  assert.match(enhanceArticleTables('<div class="blog-table-wrap"></div>', "xx"), /aria-label="Table"/);
});

test("feed items never repeat a category (MEP-41)", () => {
  assert.deepEqual(uniqueFeedCategories(["Ways of Working", "ways of working ", "", "Process"]), [
    "Ways of Working",
    "Process"
  ]);
  const xml = renderRssFeed({
    title: "t",
    link: "https://example.com",
    description: "d",
    language: "en",
    selfUrl: "https://example.com/rss.xml",
    items: [
      {
        title: "a",
        link: "https://example.com/a",
        date: "2026-01-01",
        description: "a",
        categories: ["Ways of Working", "Ways of Working", "Teams"]
      }
    ]
  });
  assert.equal((xml.match(/<category>Ways of Working<\/category>/g) ?? []).length, 1);
});

test("article widgets share one window scroll listener (MEP-72)", () => {
  const added = [];
  const removed = [];
  const previousWindow = globalThis.window;
  globalThis.window = {
    addEventListener: (type, fn) => added.push([type, fn]),
    removeEventListener: (type, fn) => removed.push([type, fn])
  };
  try {
    const calls = [];
    const offA = subscribeWindowScroll(() => calls.push("a"));
    const offB = subscribeWindowScroll(() => calls.push("b"));
    assert.equal(added.length, 1);
    assert.equal(added[0][0], "scroll");
    added[0][1]();
    assert.deepEqual(calls, ["a", "b"]);
    offA();
    assert.equal(removed.length, 0);
    offB();
    assert.equal(removed.length, 1);
  } finally {
    globalThis.window = previousWindow;
  }
});
