import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

test("content assets route through the semantic icdn namespace", () => {
  const appConf = readFileSync("src/app/app.conf.ts", "utf8");
  const icdn = readFileSync("src/lib/assets/icdn.ts", "utf8");
  const gallery = readFileSync("src/content/gallery.ts", "utf8");

  assert.match(
    appConf,
    /ICDN_BASE_URL\s*=\s*"https:\/\/cdn\.jsdelivr\.net\/gh\/nguyenlephong\/dom-pub@main\/icdn"/
  );
  assert.match(icdn, /from:\s*"\/assets\/blog\/",\s*to:\s*"\/blogs\/"/);
  assert.match(icdn, /from:\s*"\/assets\/notes\/",\s*to:\s*"\/notes\/"/);
  assert.match(icdn, /from:\s*"\/assets\/photos\/",\s*to:\s*"\/gallery\/photos\/"/);
  assert.match(gallery, /icdnAssetUrl\("\/gallery\/certificates\/very-good-degree\.webp"\)/);
  assert.doesNotMatch(gallery, /CDN_PATH/);
  assert.doesNotMatch(gallery, /"\/assets\/photos\//);
});

test("pages deploy removes media that is served by dom-pub icdn", () => {
  const deployPages = readFileSync("scripts/deploy-pages.mjs", "utf8");
  const postbuildOffline = readFileSync("scripts/postbuild-offline.mjs", "utf8");

  assert.match(deployPages, /'og', 'assets\/blog', 'assets\/notes', 'assets\/photos'/);
  assert.match(postbuildOffline, /CDN_BACKED_EXPORT_PATHS\s*=\s*\['og', 'assets\/blog', 'assets\/notes', 'assets\/photos'\]/);
  assert.match(postbuildOffline, /removeCdnBackedExportAssets/);
  assert.match(postbuildOffline, /icdnAssetUrl\\\(\\s\*\["'\]\(\[\^"'\]\+\)\["'\]\\s\*\\\)/);
  assert.match(postbuildOffline, /\/gh\/nguyenlephong\/dom-pub/);
});
