import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  hasArticleWorkflowCanvas,
  localizeArticleHtmlLinks
} from "../src/lib/content/article-html.ts";

test("localizes only repository-authored article links for the active locale", () => {
  const html = [
    '<a href="/blog/architecture/static-export?from=article#tradeoffs">Blog</a>',
    "<a href='/notes/quiet-systems'>Notes</a>",
    '<a href="/thoughts/system-boundaries">Thoughts</a>',
    '<a href="/en/blog/already-localized">Localized</a>',
    '<a href="https://example.com/blog/external">External</a>',
    '<a data-href="/blog/not-an-anchor" href="/about">About</a>'
  ].join("");

  const localized = localizeArticleHtmlLinks(html, "vi");

  assert.match(
    localized,
    /href="\/vi\/blog\/architecture\/static-export\?from=article#tradeoffs"/
  );
  assert.match(localized, /href="\/vi\/notes\/quiet-systems"/);
  assert.match(localized, /href="\/vi\/thoughts\/system-boundaries"/);
  assert.match(localized, /href="\/en\/blog\/already-localized"/);
  assert.match(localized, /href="https:\/\/example\.com\/blog\/external"/);
  assert.match(localized, /data-href="\/blog\/not-an-anchor"/);
  assert.match(localized, /href="\/about"/);
});

test("localizes article hub roots without changing protocol-relative URLs", () => {
  const html = [
    '<a href="/blog">Blog</a>',
    '<a href="/notes?topic=systems">Notes</a>',
    '<a href="//cdn.example.com/blog/image.webp">Asset</a>'
  ].join("");

  assert.equal(
    localizeArticleHtmlLinks(html, "en"),
    [
      '<a href="/en/blog">Blog</a>',
      '<a href="/en/notes?topic=systems">Notes</a>',
      '<a href="//cdn.example.com/blog/image.webp">Asset</a>'
    ].join("")
  );
});

test("uses HTML attribute semantics without rewriting code, comments, or raw text", () => {
  const html = [
    "<a href=/notes/quiet-systems>Unquoted</a>",
    '<a href="&#47;blog/culture/calm-review?from=a&amp;to=b">Entity</a>',
    '<a title=\'example href="/blog/not-the-href"\' href="/notes/real">Real</a>',
    '<code>href="/blog/not-an-attribute"</code>',
    '<!-- <a href="/blog/not-visible">Comment</a> -->',
    '<script>const example = `<a href="/blog/not-runtime">`;</script>'
  ].join("");

  const localized = localizeArticleHtmlLinks(html, "vi");

  assert.match(localized, /href="\/vi\/notes\/quiet-systems"/);
  assert.match(
    localized,
    /href="\/vi\/blog\/culture\/calm-review\?from=a&amp;to=b"/
  );
  assert.match(
    localized,
    /title='example href="\/blog\/not-the-href"' href="\/vi\/notes\/real"/
  );
  assert.match(localized, /<code>href="\/blog\/not-an-attribute"<\/code>/);
  assert.match(localized, /<!-- <a href="\/blog\/not-visible">/);
  assert.match(localized, /<script>.*href="\/blog\/not-runtime".*<\/script>/);
});

test("preserves first-attribute-wins and malformed start-tag semantics", () => {
  const html = [
    '<a href href="/blog/ignored">Boolean first</a>',
    '<a href="/about" href="/blog/ignored">Non-local first</a>',
    '<a href="/blog/first" href="/notes/ignored">Local first</a>',
    '<a href="/blog/unterminated'
  ].join("");

  assert.equal(
    localizeArticleHtmlLinks(html, "vi"),
    [
      '<a href href="/blog/ignored">Boolean first</a>',
      '<a href="/about" href="/blog/ignored">Non-local first</a>',
      '<a href="/vi/blog/first" href="/notes/ignored">Local first</a>',
      '<a href="/blog/unterminated'
    ].join("")
  );
});

test("leaves legacy raw-text containers byte-identical", () => {
  const iframe =
    '<iframe><a href="/blog/not-visible"><canvas data-blog-workflow></canvas></a></iframe>';
  const pseudoSelfClosingIframe =
    '<iframe/><a href="/blog/not-visible"><canvas data-blog-workflow></canvas></a></iframe>';
  const plaintext =
    '<plaintext></plaintext><a href="/blog/still-plain"><canvas data-blog-workflow></canvas></a>';

  for (const html of [iframe, pseudoSelfClosingIframe, plaintext]) {
    assert.equal(localizeArticleHtmlLinks(html, "vi"), html);
    assert.equal(hasArticleWorkflowCanvas(html), false);
  }
});

test("resumes article transforms after a slash-delimited raw-text closing tag", () => {
  const html = [
    '<script>const example = `<a href="/blog/not-runtime">`;</script/>',
    '<a href="/blog/visible">Visible</a>',
    '<canvas data-blog-workflow="trekking"></canvas>'
  ].join("");

  assert.equal(
    localizeArticleHtmlLinks(html, "vi"),
    [
      '<script>const example = `<a href="/blog/not-runtime">`;</script/>',
      '<a href="/vi/blog/visible">Visible</a>',
      '<canvas data-blog-workflow="trekking"></canvas>'
    ].join("")
  );
  assert.equal(hasArticleWorkflowCanvas(html), true);
});

test("rejects a locale that cannot be a safe URL path segment", () => {
  assert.throws(
    () => localizeArticleHtmlLinks('<a href="/blog">Blog</a>', "../vi"),
    /Invalid article locale/
  );
});

test("detects workflow canvases without treating unrelated canvas markup as interactive", () => {
  assert.equal(
    hasArticleWorkflowCanvas(
      '<canvas class="blog-workflow" data-blog-workflow="trekking"></canvas>'
    ),
    true
  );
  assert.equal(
    hasArticleWorkflowCanvas(
      '<canvas data-kind="chart" DATA-BLOG-WORKFLOW = "trekking"></canvas>'
    ),
    true
  );
  assert.equal(
    hasArticleWorkflowCanvas('<canvas data-kind="chart"></canvas>'),
    false
  );
  assert.equal(
    hasArticleWorkflowCanvas(
      '<canvas data-blog-workflow-disabled="true"></canvas>'
    ),
    false
  );
  assert.equal(
    hasArticleWorkflowCanvas(
      '<canvas title="data-blog-workflow=trekking"></canvas>'
    ),
    false
  );
  assert.equal(
    hasArticleWorkflowCanvas(
      '<code>&lt;canvas data-blog-workflow="trekking"&gt;</code>'
    ),
    false
  );
});

test("keeps article HTML server-rendered and canvas drawing behind a second lazy boundary", () => {
  const content = readFileSync("src/components/blog/BlogContent.tsx", "utf8");
  const enhancer = readFileSync(
    "src/components/blog/BlogWorkflowEnhancer.tsx",
    "utf8"
  );
  const canvas = readFileSync(
    "src/components/blog/blog-workflow-canvas.ts",
    "utf8"
  );
  const blogPage = readFileSync(
    "src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx",
    "utf8"
  );
  const notesPage = readFileSync(
    "src/app/[locale]/(site)/notes/[slug]/page.tsx",
    "utf8"
  );

  assert.doesNotMatch(content, /^["']use client["']/m);
  assert.match(content, /localizeArticleHtmlLinks\(html, locale\)/);
  assert.match(
    content,
    /needsWorkflowEnhancer && <BlogWorkflowEnhancer locale=\{locale\} \/>/
  );
  assert.match(enhancer, /^["']use client["']/m);
  assert.match(
    enhancer,
    /import \{ usePathname \} from ["']next\/navigation["']/
  );
  assert.match(enhancer, /const pathname = usePathname\(\)/);
  assert.match(enhancer, /import\(["']\.\/blog-workflow-canvas["']\)/);
  assert.match(enhancer, /\}, \[locale, pathname\]\)/);
  assert.doesNotMatch(enhancer, /Small pace, real summit/);
  assert.match(canvas, /Small pace, real summit/);
  assert.match(
    blogPage,
    /<BlogContent html=\{post\.html\} locale=\{locale\} \/>/
  );
  assert.match(blogPage, /__html:\s*localizeArticleHtmlLinks\(f\.a, locale\)/);
  assert.match(
    notesPage,
    /<BlogContent html=\{note\.html\} locale=\{locale\} \/>/
  );
  assert.match(notesPage, /__html:\s*localizeArticleHtmlLinks\(f\.a, locale\)/);
});
