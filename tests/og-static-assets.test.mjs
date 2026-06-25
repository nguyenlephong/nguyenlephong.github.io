import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("article metadata uses committed static OG images", () => {
  const blogPage = readFileSync(
    "src/app/[locale]/blog/[category]/[slug]/page.tsx",
    "utf8"
  );
  const notePage = readFileSync("src/app/[locale]/notes/[slug]/page.tsx", "utf8");

  assert.match(blogPage, /blogPostOgImageUrl\(slug\)/);
  assert.match(blogPage, /blogPostOgImageUrl\(relatedPost\.slug\)/);
  assert.doesNotMatch(blogPage, /\/blog\/\$\{category\}\/\$\{slug\}\/opengraph-image/);

  assert.match(notePage, /noteOgImageUrl\(slug\)/);
  assert.doesNotMatch(notePage, /\/notes\/\$\{slug\}\/opengraph-image/);
});

test("article dynamic OG routes are removed from the build graph", () => {
  assert.equal(
    existsSync("src/app/[locale]/blog/[category]/[slug]/opengraph-image.tsx"),
    false
  );
  assert.equal(existsSync("src/app/[locale]/notes/[slug]/opengraph-image.tsx"), false);
});
