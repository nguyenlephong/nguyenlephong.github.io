import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const {
  DEFAULT_MEDIA_BASE_URL,
  assertPublicAuthoredMediaUrls,
  configuredMediaBaseUrl,
  createAssetRef,
  createMediaUrlResolver,
  hasPrivateOrSignedMediaQuery,
  normalizeMediaKey,
  rewriteOwnedLegacyMediaValues,
} = await import(new URL("../src/lib/media/url-resolver.ts", import.meta.url));
const {
  extractResolvedRemoteMediaAssets,
  hasPrivateOrSignedRemoteMediaQuery,
} = await import(
  new URL("../scripts/postbuild-offline.mjs", import.meta.url)
);
const { toBlogSearchItem } = await import(
  new URL("../src/lib/content/search-index.ts", import.meta.url)
);

function readJsonCorpus(directory) {
  const values = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) values.push(...readJsonCorpus(fullPath));
    if (entry.isFile() && entry.name.endsWith(".json")) {
      values.push(JSON.parse(readFileSync(fullPath, "utf8")));
    }
  }
  return values;
}

test("default and R2 custom domains preserve semantic object keys", () => {
  const key = "/gallery/certificates/very-good-degree.webp";
  assert.equal(
    createMediaUrlResolver(DEFAULT_MEDIA_BASE_URL).resolve(key),
    "https://nguyenlephong.github.io/dom-pub/icdn/gallery/certificates/very-good-degree.webp",
  );

  const r2Base = configuredMediaBaseUrl("https://media.example.com/public/");
  assert.equal(r2Base, "https://media.example.com/public");
  assert.equal(
    createMediaUrlResolver(r2Base).resolve(key),
    "https://media.example.com/public/gallery/certificates/very-good-degree.webp",
  );
  assert.equal(
    createMediaUrlResolver(r2Base).resolve(
      `${DEFAULT_MEDIA_BASE_URL}/notes/architecture/static-first.webp`,
    ),
    "https://media.example.com/public/notes/architecture/static-first.webp",
  );
});

test("immutable revisions are explicit and legacy absolute URLs are preserved", () => {
  const resolver = createMediaUrlResolver("https://media.example.com");
  assert.equal(
    resolver.resolve(createAssetRef("og/blogs/scale.jpg", "0123456789abcdef")),
    "https://media.example.com/og/blogs/scale.jpg?v=0123456789abcdef",
  );
  assert.equal(
    resolver.resolve("https://legacy.example.com/media/scale.jpg?old=1"),
    "https://legacy.example.com/media/scale.jpg?old=1",
  );
  assert.equal(
    resolver.resolve(`${DEFAULT_MEDIA_BASE_URL}/og/blogs/scale.jpg?v=0123456789abcdef`),
    "https://media.example.com/og/blogs/scale.jpg?v=0123456789abcdef",
  );
  assert.throws(() => resolver.resolve("https://token:secret@legacy.example.com/private.jpg"));
});

test("resolver rejects encoded and case-insensitive signed/private queries", () => {
  const resolver = createMediaUrlResolver("https://media.example.com");
  const privateQueries = [
    "X-Amz-Signature=secret",
    "x%2DaMz%2DcReDeNtIaL=secret",
    "X%252DGoog%252DSignature=secret",
    "SIGNATURE=secret",
    "access_token=secret",
    "Expires=123",
    "credential=secret",
    "GoogleAccessId=account@example.com",
  ];

  for (const query of privateQueries) {
    const ownedUrl = `${DEFAULT_MEDIA_BASE_URL}/notes/public.webp?${query}`;
    assert.equal(hasPrivateOrSignedMediaQuery(ownedUrl), true, query);
    assert.equal(hasPrivateOrSignedRemoteMediaQuery(ownedUrl), true, query);
    assert.throws(() => resolver.resolve(ownedUrl), query);
  }

  const publicRevision = `${DEFAULT_MEDIA_BASE_URL}/notes/public.webp?v=0123456789abcdef`;
  assert.equal(hasPrivateOrSignedMediaQuery(publicRevision), false);
  assert.equal(hasPrivateOrSignedRemoteMediaQuery(publicRevision), false);
  assert.equal(
    resolver.resolve(publicRevision),
    "https://media.example.com/notes/public.webp?v=0123456789abcdef",
  );
  assert.throws(() =>
    resolver.resolve(`${DEFAULT_MEDIA_BASE_URL}/notes/public.webp?v=short`),
  );
});

test("authored content rejects signed/private absolute URLs from every provider", () => {
  const resolver = createMediaUrlResolver("https://media.example.com");
  const maliciousFixtures = [
    "https://third-party.example/private.webp?X-Amz-Signature=secret",
    "https://storage.googleapis.com/private.webp?x%2DgOoG%2DcReDeNtIaL=secret",
    "https://cdn.example/private.webp?width=800&amp;ACCESS_TOKEN=secret",
    "https://cdn.example/private.webp?x%252DaMz%252DsIgNaTuRe=secret",
  ];

  for (const url of maliciousFixtures) {
    const authored = `<p>Private fixture</p><img src="${url}">`;
    assert.throws(
      () => assertPublicAuthoredMediaUrls(authored),
      /Signed or private absolute URL is not allowed/,
      url,
    );
    assert.throws(
      () => rewriteOwnedLegacyMediaValues({ html: authored }, resolver),
      /Signed or private absolute URL is not allowed/,
      url,
    );
  }

  const publicExternal = "https://images.example.net/public.webp?width=800&format=webp";
  assert.doesNotThrow(() => assertPublicAuthoredMediaUrls(publicExternal));
  assert.equal(
    rewriteOwnedLegacyMediaValues(publicExternal, resolver),
    publicExternal,
  );
});

test("media keys reject traversal, encoded separators, and nested encoding", () => {
  for (const key of [
    "../secret.jpg",
    "safe/../secret.jpg",
    "safe/%2e%2e/secret.jpg",
    "safe/%252e%252e/secret.jpg",
    "safe/%2fsecret.jpg",
    "safe\\secret.jpg",
    "//evil.example/asset.jpg",
    "safe.jpg?token=secret",
  ]) {
    assert.throws(() => normalizeMediaKey(key), key);
  }

  assert.equal(normalizeMediaKey("gallery/My%20Photo.webp"), "gallery/My%20Photo.webp");
});

test("offline remote ownership comes only from exact rendered media URLs", () => {
  const html = `
    <img src="https://media.example.com/gallery/a.webp?v=0123456789abcdef">
    <a href="https://media.example.com/gallery/not-rendered.webp">link</a>
    <img src="https://token:secret@media.example.com/gallery/private.webp">
    <img src="https://media.example.com/gallery/aws.webp?x%2DaMz%2DsIgNaTuRe=secret">
    <img src="https://media.example.com/gallery/google.webp?X-Goog-Credential=secret">
    <img src="https://media.example.com/gallery/token.webp?width=800&amp;ACCESS_TOKEN=secret">
  `;
  assert.deepEqual(extractResolvedRemoteMediaAssets(html), [
    "https://media.example.com/gallery/a.webp?v=0123456789abcdef",
  ]);
});

test("content, static search metadata, and OG use the configured media domain", () => {
  const resolver = createMediaUrlResolver("https://media.r2.example.com/public");
  const externalUrl = "https://images.example.net/unrelated.webp";
  const legacyBodyUrl = `${DEFAULT_MEDIA_BASE_URL}/notes/static-first/body.webp`;
  const legacySummaryUrl = `${DEFAULT_MEDIA_BASE_URL}/notes/static-first/card.webp`;
  const fixture = {
    html: `<img src="${legacyBodyUrl}"><img src="${externalUrl}">`,
    post: {
      slug: "static-first",
      category: "architecture",
      title: "Static-first architecture",
      summary: `Diagram: ${legacySummaryUrl}`,
      date: "2026-07-17",
      readingMinutes: 8,
      tags: ["static", legacySummaryUrl],
    },
  };

  const normalized = rewriteOwnedLegacyMediaValues(fixture, resolver);
  const searchItem = toBlogSearchItem(normalized.post);
  const generated = JSON.stringify({
    renderedHtml: normalized.html,
    searchItem,
    ogImage: resolver.resolve("/og/blogs/static-first.jpg"),
  });

  assert.doesNotMatch(generated, /nguyenlephong\.github\.io\/dom-pub\/icdn/);
  assert.match(generated, /media\.r2\.example\.com\/public\/notes\/static-first\/body\.webp/);
  assert.match(generated, /media\.r2\.example\.com\/public\/notes\/static-first\/card\.webp/);
  assert.match(generated, /media\.r2\.example\.com\/public\/og\/blogs\/static-first\.jpg/);
  assert.match(generated, /images\.example\.net\/unrelated\.webp/);

  const contentBoundary = [
    readFileSync("src/lib/blog/data.ts", "utf8"),
    readFileSync("src/lib/notes/data.ts", "utf8"),
  ].join("\n");
  assert.match(contentBoundary, /rewriteContentAssetValues/);
});

test("the current authored corpus migrates through one configured media base", () => {
  const corpus = [
    ...readJsonCorpus("public/blog-data"),
    ...readJsonCorpus("public/notes-data"),
  ];
  const raw = JSON.stringify(corpus);
  const legacyCount = raw.match(
    /https:\/\/nguyenlephong\.github\.io\/dom-pub\/icdn\//g,
  )?.length ?? 0;
  assert.ok(legacyCount > 0, "fixture must exercise the owned legacy corpus");
  assert.match(raw, /https:\/\/kind\.engineering\//);

  const resolver = createMediaUrlResolver("https://media.r2.example.com/public");
  const migrated = JSON.stringify(rewriteOwnedLegacyMediaValues(corpus, resolver));
  const migratedCount = migrated.match(
    /https:\/\/media\.r2\.example\.com\/public\//g,
  )?.length ?? 0;

  assert.equal(migratedCount, legacyCount);
  assert.doesNotMatch(migrated, /nguyenlephong\.github\.io\/dom-pub\/icdn/);
  assert.match(migrated, /https:\/\/kind\.engineering\//);
});

test("browser media boundary contains no R2 secrets or client-side signer", () => {
  const browserBoundary = [
    readFileSync("src/lib/media/url-resolver.ts", "utf8"),
    readFileSync("src/lib/media/ports.ts", "utf8"),
    readFileSync(".env.example", "utf8"),
  ].join("\n");

  assert.doesNotMatch(
    browserBoundary,
    /R2_(?:ACCESS|SECRET)|AWS_(?:ACCESS|SECRET)|SignatureV4|getSignedUrl|@aws-sdk/i,
  );
  assert.match(browserBoundary, /NEXT_PUBLIC_MEDIA_BASE_URL/);
});
