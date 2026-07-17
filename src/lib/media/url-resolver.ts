export const DEFAULT_MEDIA_BASE_URL =
  "https://nguyenlephong.github.io/dom-pub/icdn";

export type AssetRef = Readonly<{
  /** Provider-neutral object key. It never contains a query string or fragment. */
  key: string;
  /** Immutable content revision, normally a content hash. */
  revision?: string;
}>;

export interface MediaUrlResolver {
  readonly baseUrl: string;
  resolve(asset: AssetRef | string): string;
}

const REVISION_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const OWNED_LEGACY_MEDIA_URL_PATTERN =
  /https:\/\/nguyenlephong\.github\.io\/dom-pub\/icdn\/[^\s"'<>]+/gi;
const ABSOLUTE_HTTP_URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;
const OWNED_LEGACY_MEDIA_BASE = new URL(DEFAULT_MEDIA_BASE_URL);
const OWNED_LEGACY_MEDIA_PATH_PREFIX = `${OWNED_LEGACY_MEDIA_BASE.pathname.replace(/\/+$/, "")}/`;

function normalizeBaseUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Media base URL must use HTTP or HTTPS");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("Media base URL must not contain credentials, query, or fragment");
  }
  return url.href.replace(/\/+$/, "");
}

function decodeOnce(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new Error(`Invalid percent encoding in media key: ${value}`);
  }
}

export function normalizeMediaKey(input: string): string {
  if (!input || input.length > 2048 || /[?#\\\u0000-\u001F\u007F]/.test(input)) {
    throw new Error("Media key is empty or contains unsafe characters");
  }

  const withoutLeadingSlash = input.replace(/^\/+/, "");
  if (!withoutLeadingSlash || input.startsWith("//")) {
    throw new Error("Media key must be a relative object key");
  }

  return withoutLeadingSlash
    .split("/")
    .map((segment) => {
      const decoded = decodeOnce(segment);
      if (!decoded || decoded === "." || decoded === ".." || /[\/\\\u0000-\u001F\u007F]/.test(decoded)) {
        throw new Error("Media key contains an unsafe path segment");
      }

      // Reject nested encoding such as %252e%252e. Canonical single encoding
      // below preserves already encoded keys without encoding them twice.
      if (decoded.includes("%")) {
        try {
          if (decodeURIComponent(decoded) !== decoded) {
            throw new Error("Media key must not be double encoded");
          }
        } catch (error) {
          if (error instanceof URIError) {
            // A literal percent sign is safe and becomes %25 below.
          } else {
            throw error;
          }
        }
      }

      return encodeURIComponent(decoded);
    })
    .join("/");
}

function normalizeQueryName(value: string): string {
  let normalized = value;
  for (let index = 0; index < 3; index += 1) {
    try {
      const decoded = decodeURIComponent(normalized);
      if (decoded === normalized) break;
      normalized = decoded;
    } catch {
      break;
    }
  }

  // URLs embedded in authored HTML can encode separators as `&amp;`. The URL
  // parser then exposes the next name as `amp;X-Amz-*`; strip that HTML prefix
  // before classifying the parameter.
  return normalized.trim().toLowerCase().replace(/^(?:amp;)+/, "");
}

export function hasPrivateOrSignedMediaQuery(input: string | URL): boolean {
  const url = typeof input === "string" ? new URL(input) : input;

  for (const rawName of url.searchParams.keys()) {
    const name = normalizeQueryName(rawName);
    if (
      name === "googleaccessid" ||
      /^(?:x-amz|x-goog|goog)-/.test(name) ||
      /(?:^|[-_.])(signature|token|expires|credential)(?:$|[-_.])/.test(name)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Fails the authored-content build boundary closed when any absolute public
 * URL contains a signed/private query. This applies to third-party providers
 * as well as the site's owned media namespace; normal external links remain
 * untouched.
 */
export function assertPublicAuthoredMediaUrls(value: string): void {
  for (const candidate of value.match(ABSOLUTE_HTTP_URL_PATTERN) ?? []) {
    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      continue;
    }

    if (hasPrivateOrSignedMediaQuery(url)) {
      // Never include the query or value in build output: it may contain the
      // credential this boundary is preventing from becoming public.
      throw new Error(
        `Signed or private absolute URL is not allowed in authored public content: ${url.origin}${url.pathname}`,
      );
    }
  }
}

function validatePublicRevision(url: URL): void {
  for (const [rawName, value] of url.searchParams) {
    if (normalizeQueryName(rawName) === "v" && !REVISION_PATTERN.test(value)) {
      throw new Error("Media revision must be an 8-128 character content revision");
    }
  }
}

function validateLegacyAbsoluteUrl(value: string): URL {
  const url = new URL(value);
  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
    throw new Error("Legacy media URL must be credential-free HTTP(S)");
  }
  if (hasPrivateOrSignedMediaQuery(url)) {
    throw new Error("Signed or private media URLs are not public content references");
  }
  return url;
}

function ownedLegacyMediaKey(url: URL): string | null {
  if (
    url.origin !== OWNED_LEGACY_MEDIA_BASE.origin ||
    !url.pathname.startsWith(OWNED_LEGACY_MEDIA_PATH_PREFIX)
  ) {
    return null;
  }

  const key = url.pathname.slice(OWNED_LEGACY_MEDIA_PATH_PREFIX.length);
  return key || null;
}

function appendPublicUrlSuffix(target: string, source: URL): string {
  validatePublicRevision(source);
  const resolved = new URL(target);
  resolved.search = source.search;
  resolved.hash = source.hash;
  return resolved.href;
}

function resolveRelativeAssetInput(value: string, baseUrl: string): string {
  if (value.startsWith("//")) {
    throw new Error("Media key must be a relative object key");
  }

  const queryIndex = value.search(/[?#]/);
  const key = queryIndex === -1 ? value : value.slice(0, queryIndex);
  const suffix = queryIndex === -1 ? "" : value.slice(queryIndex);
  const source = new URL(`${normalizeMediaKey(key)}${suffix}`, "https://media-key.invalid/");
  if (hasPrivateOrSignedMediaQuery(source)) {
    throw new Error("Signed or private media URLs are not public content references");
  }

  return appendPublicUrlSuffix(`${baseUrl}/${normalizeMediaKey(key)}`, source);
}

export function createAssetRef(key: string, revision?: string): AssetRef {
  const normalizedKey = normalizeMediaKey(key);
  if (revision !== undefined && !REVISION_PATTERN.test(revision)) {
    throw new Error("Media revision must be an 8-128 character content revision");
  }
  return revision === undefined
    ? { key: normalizedKey }
    : { key: normalizedKey, revision };
}

export function createMediaUrlResolver(baseUrl: string): MediaUrlResolver {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  return {
    baseUrl: normalizedBaseUrl,
    resolve(asset) {
      if (typeof asset === "string" && /^https?:\/\//i.test(asset)) {
        const legacyUrl = validateLegacyAbsoluteUrl(asset);
        const legacyKey = ownedLegacyMediaKey(legacyUrl);
        if (!legacyKey) return asset;

        const resolved = `${normalizedBaseUrl}/${normalizeMediaKey(legacyKey)}`;
        return appendPublicUrlSuffix(resolved, legacyUrl);
      }

      if (typeof asset === "string") {
        return resolveRelativeAssetInput(asset, normalizedBaseUrl);
      }

      const ref = createAssetRef(asset.key, asset.revision);
      const url = new URL(`${normalizedBaseUrl}/${ref.key}`);
      if (ref.revision) url.searchParams.set("v", ref.revision);
      return url.href;
    },
  };
}

export function configuredMediaBaseUrl(
  value = process.env["NEXT_PUBLIC_MEDIA_BASE_URL"],
): string {
  return createMediaUrlResolver(value?.trim() || DEFAULT_MEDIA_BASE_URL).baseUrl;
}

export const mediaUrlResolver = createMediaUrlResolver(configuredMediaBaseUrl());

/**
 * Rewrites only the exact media namespace owned by this site. Third-party URLs
 * are intentionally untouched; signed/private owned references fail closed.
 */
export function rewriteOwnedLegacyMediaUrls(
  value: string,
  resolver: MediaUrlResolver = mediaUrlResolver,
): string {
  assertPublicAuthoredMediaUrls(value);
  return value.replace(OWNED_LEGACY_MEDIA_URL_PATTERN, (url) => resolver.resolve(url));
}

/** Applies the owned-media rewrite at the JSON content boundary. */
export function rewriteOwnedLegacyMediaValues<T>(
  value: T,
  resolver: MediaUrlResolver = mediaUrlResolver,
): T {
  if (typeof value === "string") {
    return rewriteOwnedLegacyMediaUrls(value, resolver) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteOwnedLegacyMediaValues(item, resolver)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        rewriteOwnedLegacyMediaValues(item, resolver),
      ]),
    ) as T;
  }
  return value;
}
