import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("article metadata uses CDN-backed static OG images", () => {
  const blogPage = readFileSync(
    "src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx",
    "utf8"
  );
  const blogIndexPage = readFileSync("src/app/[locale]/(site)/blog/page.tsx", "utf8");
  const blogCollectionPage = readFileSync(
    "src/components/blog/BlogCollectionPage.tsx",
    "utf8"
  );
  const blogCategoryPage = readFileSync(
    "src/app/[locale]/(site)/blog/[category]/page.tsx",
    "utf8"
  );
  const notePage = readFileSync("src/app/[locale]/(site)/notes/[slug]/page.tsx", "utf8");
  const notesIndexPage = readFileSync("src/app/[locale]/(site)/notes/page.tsx", "utf8");
  const notesCollectionPage = readFileSync(
    "src/components/notes/NotesCollectionPage.tsx",
    "utf8"
  );
  const staticImages = readFileSync("src/lib/og/static-images.ts", "utf8");

  assert.match(blogPage, /blogPostOgImageUrl\(slug\)/);
  assert.match(blogPage, /blogPostOgImageUrl\(relatedPost\.slug\)/);
  assert.match(blogIndexPage, /BlogCollectionPage/);
  assert.match(blogCollectionPage, /blogPostOgImageUrl\(post\.slug\)/);
  assert.match(blogCategoryPage, /blogPostOgImageUrl\(p\.slug\)/);
  assert.doesNotMatch(blogPage, /\/blog\/\$\{category\}\/\$\{slug\}\/opengraph-image/);
  assert.doesNotMatch(blogCollectionPage, /\/blog\/\$\{post\.category\}\/\$\{post\.slug\}\/opengraph-image/);
  assert.doesNotMatch(blogCategoryPage, /\/blog\/\$\{p\.category\}\/\$\{p\.slug\}\/opengraph-image/);

  assert.match(notePage, /noteOgImageUrl\(slug\)/);
  assert.match(notesIndexPage, /NotesCollectionPage/);
  assert.match(notesCollectionPage, /noteOgImageUrl\(note\.slug\)/);
  assert.doesNotMatch(notePage, /\/notes\/\$\{slug\}\/opengraph-image/);
  assert.doesNotMatch(notesCollectionPage, /\/notes\/\$\{note\.slug\}\/opengraph-image/);

  assert.match(staticImages, /icdnAssetUrl\(path\)/);
  assert.match(staticImages, /\/og\/blogs\/\$\{slug\}\.jpg/);
  assert.match(staticImages, /\/og\/notes\/\$\{slug\}\.jpg/);
});

test("article dynamic OG routes are removed from the build graph", () => {
  assert.equal(
    existsSync("src/app/[locale]/(site)/blog/[category]/[slug]/opengraph-image.tsx"),
    false
  );
  assert.equal(existsSync("src/app/[locale]/(site)/notes/[slug]/opengraph-image.tsx"), false);
});
