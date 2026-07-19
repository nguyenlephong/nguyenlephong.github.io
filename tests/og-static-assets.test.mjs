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
  const generator = readFileSync("scripts/generate-static-og.mjs", "utf8");
  const sync = readFileSync("scripts/sync-icdn-assets.mjs", "utf8");
  const publisher = readFileSync("scripts/publish-og-assets.mjs", "utf8");
  const publicationContract = JSON.parse(
    readFileSync("config/media-publication.json", "utf8")
  );
  const publicPublicationContract = JSON.parse(
    readFileSync("config/media-publication-public.json", "utf8")
  );

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
  assert.match(staticImages, /mediaPublication\.articleOg\[surface\]/);
  assert.match(staticImages, /media-publication-public\.json' with \{ type: 'json' \}/);
  assert.doesNotMatch(staticImages, /media-publication\.json' with \{ type: 'json' \}/);
  assert.equal(publicationContract.articleOg.blog.publicPathPrefix, "/og/blogs");
  assert.equal(publicationContract.articleOg.notes.publicPathPrefix, "/og/notes");
  assert.equal(publicationContract.articleOg.blog.publicationExtension, ".jpg");
  assert.equal(publicationContract.articleOg.notes.publicationExtension, ".jpg");
  assert.equal(
    publicPublicationContract.articleOg.blog.publicPathPrefix,
    publicationContract.articleOg.blog.publicPathPrefix
  );
  assert.equal(
    publicPublicationContract.articleOg.notes.publicPathPrefix,
    publicationContract.articleOg.notes.publicPathPrefix
  );
  assert.match(generator, /publication\.sourceDirectory/);
  assert.match(generator, /publication\.sourceExtension/);
  assert.match(publisher, /publication\.publicationDirectory/);
  assert.match(publisher, /publication\.publicationExtension/);
  assert.doesNotMatch(sync, /mediaPublicationContract|kind:\s*['"]og['"]/);
  assert.doesNotMatch(sync, /OWNED_DIRS\s*=\s*\[[^\]]*['"]og['"]/s);
});

test("article dynamic OG routes are removed from the build graph", () => {
  assert.equal(
    existsSync("src/app/[locale]/(site)/blog/[category]/[slug]/opengraph-image.tsx"),
    false
  );
  assert.equal(existsSync("src/app/[locale]/(site)/notes/[slug]/opengraph-image.tsx"), false);
});
