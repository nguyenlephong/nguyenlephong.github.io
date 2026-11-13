import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const LOCALES = ["en", "vi", "fr", "ja", "ko", "zh"];
const messages = Object.fromEntries(
  LOCALES.map((locale) => [locale, JSON.parse(read(`messages/${locale}.json`))])
);

test("authorClickProperties maps known author links and rejects the rest", async () => {
  const { authorClickProperties } = await import(
    "../src/components/analytics/article-author-click.ts"
  );
  for (const target of ["byline", "cv", "resume", "email"]) {
    assert.deepEqual(authorClickProperties("notes", "notes", "a-note", target), {
      content_surface: "notes",
      content_category: "notes",
      content_slug: "a-note",
      target
    });
  }
  assert.equal(authorClickProperties("blog", "c", "s", undefined), null);
  assert.equal(authorClickProperties("blog", "c", "s", "linkedin"), null);
});

test("author links fire one blog_author_click and never a related click", () => {
  const hook = read("src/components/analytics/useRelatedLinkClickTracking.ts");
  const authorAt = hook.indexOf("a[data-author-link]");
  const relatedAt = hook.indexOf("a[data-related-link]");
  assert.ok(authorAt > 0 && authorAt < relatedAt, "author branch runs first");
  assert.match(
    hook.slice(authorAt, relatedAt),
    /track\('blog_author_click', \{ \.\.\.properties \}\)\s*\n\s*return/
  );
  assert.match(read("src/lib/analytics.ts"), /'blog_author_click'/);
  assert.match(read("src/lib/analytics.ts"), /'content_cross_link_click'/);
});

test("byline and author box are server-rendered and link the name to the CV", () => {
  const author = read("src/components/content/ArticleAuthor.tsx");
  assert.doesNotMatch(author, /['"]use client['"]/);
  assert.match(author, /href=\{`\/\$\{locale\}`\} rel="author" data-author-link="byline"/);
  assert.match(author, /href=\{`\/\$\{locale\}`\} rel="author" data-author-link="cv"/);
  // One fact, one wording: role, claim and bio come from the homepage Hero strings.
  for (const key of ["role", "cofounder", "claim", "bio", "downloadResume", "getInTouch"]) {
    assert.match(author, new RegExp(`hero\\('${key}'\\)`));
  }

  for (const page of [
    "src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx",
    "src/app/[locale]/(site)/notes/[slug]/page.tsx"
  ]) {
    const source = read(page);
    assert.match(source, /<ArticleByline locale=\{locale\}/, page);
    assert.match(source, /<ArticleAuthorBox locale=\{locale\}/, page);
    assert.ok(
      source.indexOf("<ArticleAuthorBox") < source.indexOf("<ArticleRelatedLinks"),
      `${page}: author box sits before related reading`
    );
  }
});

test("every locale has author copy and intros that link Blog and Notes", () => {
  for (const locale of LOCALES) {
    const { Author, Pages } = messages[locale];
    assert.match(Author.byline, /<author>\{name\}<\/author>/, locale);
    assert.ok(Author.heading && Author.cvLink, locale);
    assert.match(Pages.notes.intro, /<blog>[^<]+<\/blog>/, locale);
    assert.match(Pages.blog.intro, /<notes>[^<]+<\/notes>/, locale);
    for (const text of [Author.byline, Author.heading, Author.cvLink, Pages.notes.intro, Pages.notes.eyebrow, Pages.blog.intro]) {
      assert.doesNotMatch(text, /—/, `${locale}: no em dash`);
    }
  }

  for (const [file, source] of [
    ["src/components/notes/NotesCollectionPage.tsx", "notes_intro"],
    ["src/components/blog/BlogCollectionPage.tsx", "blog_intro"]
  ]) {
    assert.match(read(file), new RegExp(`data-cross-link data-source="${source}"`), file);
  }
  assert.match(
    read("src/components/analytics/PageTracker.tsx"),
    /closest<HTMLAnchorElement>\('a\[data-cross-link\]'\)[\s\S]*'content_cross_link_click'/
  );
});
