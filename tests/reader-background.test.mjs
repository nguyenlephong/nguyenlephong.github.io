import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const root = new URL("../", import.meta.url);

function read(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("reader background preferences are available from the floating tools", () => {
  const script = read("src/components/reading/ReadingBackgroundScript.tsx");
  const tools = read("src/components/blog/BlogReaderTools.tsx");
  const siteLayout = read("src/app/[locale]/(site)/layout.tsx");
  const articleTools = read("src/components/blog/ArticleReaderTools.tsx");
  const blogArticleLayout = read(
    "src/app/[locale]/(site)/blog/[category]/[slug]/layout.tsx"
  );
  const notesArticleLayout = read(
    "src/app/[locale]/(site)/notes/[slug]/layout.tsx"
  );
  const globals = read("src/app/globals.css");
  const notesCss = read("src/app/[locale]/(site)/notes/notes.css");

  assert.match(script, /READING_BACKGROUND_STORAGE_KEY = 'reading_background_preference'/);
  for (const background of [
    "plain",
    "parchment",
    "linen",
    "sepia",
    "sage",
    "mist",
    "night",
  ]) {
    assert.match(script, new RegExp(`'${background}'`));
    assert.match(globals, new RegExp(`data-reading-background='${background}'`));
  }

  assert.match(tools, /ReadingBackgroundSwitcher/);
  assert.match(tools, /blog-reader-tools__trigger/);
  assert.match(tools, /aria-expanded=\{expanded\}/);
  assert.match(tools, /expanded &&/);
  assert.match(tools, /const pathname = usePathname\(\)/);
  assert.match(tools, /<ReaderTools key=\{pathname\} \{\.\.\.props\} \/>/);
  assert.doesNotMatch(tools, /expandedPathname/);
  assert.match(articleTools, /namespace: 'ReaderTools'/);
  assert.match(articleTools, /background: t\('background'\)/);
  assert.match(articleTools, /<BlogReaderTools/);
  assert.match(blogArticleLayout, /<ArticleReaderTools locale=\{locale\} \/>/);
  assert.match(notesArticleLayout, /<ArticleReaderTools locale=\{locale\} \/>/);
  assert.doesNotMatch(siteLayout, /\bArticleReaderTools\b|\bBlogReaderTools\b/);
  assert.match(siteLayout, /<FontScript \/>/);
  assert.match(siteLayout, /<ReadingBackgroundScript \/>/);
  assert.match(globals, /\.blog-reader-tools__controls \{[^}]*flex-direction: column/s);
  assert.match(notesCss, /html\[data-reading-background\] \.notes-reading/);
});

test("reader background inherits active theme until the reader chooses a material", () => {
  const script = read("src/components/reading/ReadingBackgroundScript.tsx");
  const switcher = read("src/components/reading/ReadingBackgroundSwitcher.tsx");

  assert.match(script, /removeAttribute\('data-reading-background'\)/);
  assert.doesNotMatch(script, /value = allowed\.indexOf\(stored\) >= 0 \? stored : 'plain'/);
  assert.match(switcher, /removeAttribute\('data-reading-background'\)/);
});

test("reader background labels exist for blog and notes in every locale", () => {
  for (const locale of ["en", "vi", "fr", "ja", "ko", "zh"]) {
    const messages = JSON.parse(read(`messages/${locale}.json`));

    assert.equal(typeof messages.Nav.background.label, "string");
    assert.equal(typeof messages.Pages.blog.readerTools.background, "string");
    assert.equal(typeof messages.Pages.notes.readerTools.background, "string");
  }
});
