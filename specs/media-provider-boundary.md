# Media provider boundary

## Status

Accepted design for the static site. This change adds a provider-neutral URL
boundary only; it does not deploy R2, a Worker, authentication, or credentials.

## Why

Feature code currently refers to the semantic ICDN namespace. The site must be
able to move public assets to an R2 custom domain without rewriting blog,
notes, gallery, or Open Graph call sites. Static export must remain the read
path, and private operations must never require an R2 secret in the browser.

Stable media URLs also protect SEO: existing article canonical URLs do not
change, Open Graph images retain semantic paths, and a future media-origin
migration can be performed behind one owned base URL. Old media URLs must keep
redirecting while indexed pages and social caches age out.

## Design

- `AssetRef` is the provider-neutral value: an object key plus an optional
  immutable revision/content hash.
- `MediaUrlResolver` is the only public URL constructor. It reads
  `NEXT_PUBLIC_MEDIA_BASE_URL` and defaults to the current public ICDN base.
- The build/content boundary normalizes the exact owned legacy
  `https://nguyenlephong.github.io/dom-pub/icdn/...` namespace back to semantic
  object keys. The configured base therefore applies to article/note bodies,
  metadata used by static search, gallery assets, and Open Graph images without
  mechanically rewriting the authored JSON corpus. Unrelated absolute URLs are
  preserved.
- Revisions become `?v=<revision>`. Unrevisioned semantic URLs remain byte-for-
  byte compatible with the current output.
- Keys are canonicalized exactly once. Empty segments, traversal, encoded
  separators, nested percent encoding, query strings, fragments, credentials,
  and non-HTTP(S) bases are rejected.
- Existing unrelated absolute HTTP(S) URLs remain valid legacy inputs, but URLs
  carrying user-info credentials are rejected. Signed/private query names,
  including case-insensitive or percent-encoded AWS/R2 `X-Amz-*`, Google signed
  URL parameters, `signature`, `token`, `expires`, and `credential`, fail
  closed. A public immutable `?v=<safe-content-hash>` remains supported.
  Signed/private URLs are not content references and must not be stored or
  added to the offline manifest.
- The offline build extracts the URLs actually rendered by the gallery export.
  The service worker owns only those exact URLs; it never trusts a whole R2 or
  GitHub origin.

## Future Worker signer contract

`MediaUploadPort` describes the browser side. Its implementation will call a
trusted control-plane endpoint; it must never import an S3 signing library or
hold an R2 access key.

The future Worker must:

1. Authenticate the user and validate App Check (or an equivalent attestation).
2. Authorize one exact tenant/user-scoped object key; reject caller-selected
   buckets, origins, ACLs, traversal, overwrite, and wildcard prefixes.
3. Enforce an allowlisted MIME type, maximum size, user/tenant quota, and a
   required SHA-256 checksum before issuing a grant.
4. Return a single-object presigned `PUT`, required headers, immutable
   `AssetRef`, opaque finalize token, and a short expiry (target: 5 minutes).
5. On finalize, HEAD the object and verify key, size, MIME, checksum, ownership,
   and expiry before publishing metadata. Finalization must be idempotent.
6. Issue private reads as short-lived, single-object grants. Private or signed
   URLs must use `Cache-Control: private, no-store` and must not enter the PWA
   cache, sitemap, structured data, or Open Graph metadata.
7. Keep provider credentials only in Worker secrets and audit grants/finalize
   events without logging tokens, URLs, or personal data.

## Acceptance criteria

- AC-MEDIA-1: With no environment override, existing semantic media URLs are
  unchanged.
- AC-MEDIA-2: Changing only `NEXT_PUBLIC_MEDIA_BASE_URL` moves resolved URLs in
  article/note bodies, metadata/static search values, gallery output, and Open
  Graph output to an HTTPS R2 custom domain while preserving object keys and
  unrelated absolute URLs.
- AC-MEDIA-3: A revision produces an immutable, explicitly versioned URL.
- AC-MEDIA-4: Traversal, encoded separators, nested encoding, unsafe bases,
  credential-bearing legacy URLs, and case-insensitive or encoded signed/private
  query names fail closed; a safe public `v` revision remains valid.
- AC-MEDIA-5: The offline worker caches only exact URLs emitted into its build
  manifest, including URLs on an alternate R2 custom domain, and never claims
  or caches signed/private URLs.
- AC-MEDIA-6: Browser source and public environment examples contain no R2/S3
  secret or client-side signing implementation.
- AC-MEDIA-7: Blog/note canonicals, localized routes, semantic object keys, and
  Open Graph object paths do not change. The media origin changes only when the
  environment override is explicitly configured.
