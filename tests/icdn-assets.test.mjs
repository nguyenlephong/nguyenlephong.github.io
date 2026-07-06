import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function readJsonDataFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readJsonDataFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

test("content assets route through the semantic icdn namespace", () => {
  const appConf = readFileSync("src/app/app.conf.ts", "utf8");
  const icdn = readFileSync("src/lib/assets/icdn.ts", "utf8");
  const gallery = readFileSync("src/content/gallery.ts", "utf8");

  assert.match(
    appConf,
    /ICDN_BASE_URL\s*=\s*"https:\/\/nguyenlephong\.github\.io\/dom-pub\/icdn"/
  );
  assert.doesNotMatch(appConf, /cdn\.jsdelivr/);
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
  assert.match(postbuildOffline, /nguyenlephong\.github\.io/);
  assert.match(postbuildOffline, /\/dom-pub\//);
});

test("public reading data does not expose local content image paths", () => {
  const dataFiles = [
    ...readJsonDataFiles("public/blog-data"),
    ...readJsonDataFiles("public/notes-data"),
  ];
  const data = dataFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(data, /["'(]\/assets\/(?:blog|notes|photos)\//);
  assert.doesNotMatch(data, /["'(]\/og\/(?:blog|notes)\//);
  assert.doesNotMatch(data, /cdn\.jsdelivr\.net\/gh\/nguyenlephong\/dom-pub/);
  assert.match(data, /https:\/\/nguyenlephong\.github\.io\/dom-pub\/icdn\//);
});
