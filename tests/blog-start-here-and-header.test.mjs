import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const LOCALES = ["en", "vi", "fr", "ja", "ko", "zh"];
const messages = Object.fromEntries(
  LOCALES.map((locale) => [locale, JSON.parse(read(`messages/${locale}.json`))])
);

const { articleDek, articleTagLinks, popularTags } = await import(
  "../src/lib/blog/article-header.ts"
);

test("articleDek keeps the first sentence and survives abbreviations and CJK", () => {
  assert.equal(
    articleDek("Joining a big company is a shock. That is the design."),
    "Joining a big company is a shock."
  );
  assert.equal(
    articleDek("Kanban vs. Scrum is a choice. Pick one."),
    "Kanban vs. Scrum is a choice."
  );
  assert.equal(
    articleDek("The U.S. Army team shipped it. Then it scaled."),
    "The U.S. Army team shipped it."
  );
  assert.equal(articleDek("Một câu thôi. Đây là câu hai."), "Một câu thôi.");
  assert.equal(articleDek("最初の文です。二番目の文です。"), "最初の文です。");
  assert.equal(articleDek("  No full stop here  "), "No full stop here");
});

test("article tags drop the category name and link into the archive", () => {
  const links = articleTagLinks(
    ["Engineering Culture", "Career", "Team Work"],
    ["engineering culture"],
    ["Career"]
  );
  assert.deepEqual(links, [
    { tag: "Career", href: "/blog?tag=Career" },
    // Not an archive chip, so the explorer gets it as a search query.
    { tag: "Team Work", href: "/blog?q=Team%20Work" },
  ]);
});

test("popularTags ranks by use, then alphabetically, and caps the list", () => {
  const posts = [{ tags: ["b", "a"] }, { tags: ["b", "c"] }, { tags: ["a"] }];
  assert.deepEqual(popularTags(posts), ["a", "b", "c"]);
  assert.deepEqual(popularTags(posts, 1), ["a"]);
});

test("Start here is curated in data with native EN and VI reasons", () => {
  const en = JSON.parse(read("content/blog-data/_index.json"));
  const vi = JSON.parse(read("content/blog-data/vi/_index.json"));
  const enSlugs = en.startHere.map((entry) => entry.slug);
  assert.ok(enSlugs.length >= 4 && enSlugs.length <= 6, "4 to 6 posts");
  assert.deepEqual(
    vi.startHere.map((entry) => entry.slug),
    enSlugs,
    "same set and order in both locales"
  );
  const posts = new Map(en.posts.map((post) => [post.slug, post]));
  for (const [locale, list] of [["en", en.startHere], ["vi", vi.startHere]]) {
    for (const { slug, reason } of list) {
      const post = posts.get(slug);
      assert.ok(post, `${slug} exists`);
      assert.ok(post.locales.includes(locale), `${slug} has a ${locale} body`);
      assert.ok(post.status !== "draft", `${slug} is published`);
      assert.ok(reason.length > 20 && reason.length <= 160, `${locale} ${slug} reason length`);
      assert.doesNotMatch(reason, /—/, "no em dash in copy");
    }
  }
  assert.notDeepEqual(
    en.startHere.map((entry) => entry.reason),
    vi.startHere.map((entry) => entry.reason)
  );
});

test("blog index strings come from messages, Start here clicks reuse blog_card_click", () => {
  const page = read("src/components/blog/BlogCollectionPage.tsx");
  assert.doesNotMatch(page, /Đọc theo loạt bài|Read by series/);
  assert.match(page, /t\('seriesHeading'\)/);
  assert.match(page, /listStartHere\(locale\)/);
  for (const locale of LOCALES) {
    const blog = messages[locale].Pages.blog;
    assert.ok(blog.seriesHeading, `${locale} seriesHeading`);
    assert.ok(blog.startHereHeading, `${locale} startHereHeading`);
  }
  assert.equal(messages.en.Pages.blog.startHereHeading, "Start here");
  assert.equal(messages.vi.Pages.blog.startHereHeading, "Nên đọc trước");

  const startHere = read("src/components/blog/BlogStartHere.tsx");
  assert.match(startHere, /track\('blog_card_click'/);
  assert.match(startHere, /source: 'blog_featured'/);

  const shell = read("src/components/explorer/ExplorerShell.tsx");
  assert.match(shell, /\{hasFilters \? null : lead\}/, "Start here hides while searching");
});

test("article tag clicks are tracked once as blog_tag_click", () => {
  assert.match(read("src/lib/analytics.ts"), /'blog_tag_click'/);
  const hook = read("src/components/analytics/useRelatedLinkClickTracking.ts");
  const tagAt = hook.indexOf("a[data-tag-link]");
  const relatedAt = hook.indexOf("a[data-related-link]");
  assert.ok(tagAt > 0 && tagAt < relatedAt, "tag branch runs before related");
  assert.match(hook.slice(tagAt, relatedAt), /track\('blog_tag_click'[\s\S]*return/);
  const post = read("src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx");
  assert.match(post, /data-tag-link=\{tag\}/);
  assert.match(post, /articleDek\(post\.summary\)/);
});

test("back to top is one tap and floating controls step aside at the footer", () => {
  const tools = read("src/components/blog/BlogReaderTools.tsx");
  const panelAt = tools.indexOf('id="blog-reader-tools-panel"');
  const topAt = tools.indexOf('className="blog-reader-tools__top"');
  assert.ok(topAt > 0 && topAt < panelAt, "top button lives outside the collapsed panel");
  assert.match(tools, /track\('reader_tool_scroll', \{ direction: 'top' \}\)/);
  assert.match(tools, /blog-reader-tools--at-footer/);
  assert.match(read("src/components/blog/BlogShareDock.tsx"), /blog-share-dock--at-footer/);

  // Faded-out controls must also leave the tab order, after the fade has played.
  const rule = (css, selector) => css.match(new RegExp(`(?:^|\\n)\\s*${selector.replace(/[.>]/g, "\\$&")} \\{([^}]*)\\}`))?.[1] ?? "";
  const readerCss = read("src/app/[locale]/(site)/blog/reader.css");
  const blogCss = read("src/app/[locale]/(site)/blog/blog.css");
  for (const [css, hidden, shown, footer] of [
    [readerCss, ".blog-reader-tools", ".blog-reader-tools--visible", ".blog-reader-tools.blog-reader-tools--at-footer"],
    [blogCss, ".blog-share-dock", ".blog-share-dock--visible", ".blog-share-dock.blog-share-dock--at-footer"]
  ]) {
    // visibility transitions discretely, so one duration keeps the fade in both directions.
    assert.match(rule(css, hidden), /visibility: hidden;[\s\S]*opacity (0\.\d+s)[\s\S]*visibility \1;/);
    assert.match(rule(css, shown), /visibility: visible;/);
    assert.match(rule(css, footer), /visibility: hidden;/);
  }
  assert.match(rule(blogCss, ".blog-share-dock--open .blog-share-dock__actions"), /visibility: inherit;/);
});
