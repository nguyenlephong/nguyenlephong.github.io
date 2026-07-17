import {
  mediaUrlResolver,
  rewriteOwnedLegacyMediaUrls,
  type MediaUrlResolver,
} from "@/lib/media/url-resolver";

const CONTENT_ASSET_MAPPINGS: Array<{
  from: string;
  to: string;
  extension: "webp" | "jpg";
}> = [
  { from: "/assets/blog/", to: "/blogs/", extension: "webp" },
  { from: "/assets/notes/", to: "/notes/", extension: "webp" },
  { from: "/assets/photos/", to: "/gallery/photos/", extension: "webp" },
  { from: "/og/blog/", to: "/og/blogs/", extension: "jpg" },
  { from: "/og/notes/", to: "/og/notes/", extension: "jpg" },
];

function splitSuffix(path: string) {
  const index = path.search(/[?#]/);
  if (index === -1) return { pathname: path, suffix: "" };
  return { pathname: path.slice(0, index), suffix: path.slice(index) };
}

function replaceExtension(path: string, extension: string): string {
  const { pathname, suffix } = splitSuffix(path);
  const slash = pathname.lastIndexOf("/");
  const dot = pathname.lastIndexOf(".");
  const base =
    dot > slash ? pathname.slice(0, dot) : pathname;

  return `${base}.${extension}${suffix}`;
}

export function icdnAssetUrl(
  path: string,
  resolver: MediaUrlResolver = mediaUrlResolver,
): string {
  return resolver.resolve(path);
}

export function localContentAssetToIcdn(
  path: string,
  resolver: MediaUrlResolver = mediaUrlResolver,
): string {
  if (/^https?:\/\//i.test(path)) return resolver.resolve(path);

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const mapping = CONTENT_ASSET_MAPPINGS.find(({ from }) =>
    normalizedPath.startsWith(from)
  );
  if (!mapping) return path;

  const semanticPath = replaceExtension(
    `${mapping.to}${normalizedPath.slice(mapping.from.length)}`,
    mapping.extension
  );

  return icdnAssetUrl(semanticPath, resolver);
}

export function rewriteContentAssetUrls(
  value: string,
  resolver: MediaUrlResolver = mediaUrlResolver,
): string {
  const withMappedLocalAssets = value.replace(
    /(["'(])\/((?:assets\/(?:blog|notes)|og\/(?:blog|notes))\/[^"')\s<>]+)/g,
    (_match, prefix: string, assetPath: string) =>
      `${prefix}${localContentAssetToIcdn(`/${assetPath}`, resolver)}`
  );

  return rewriteOwnedLegacyMediaUrls(withMappedLocalAssets, resolver);
}

/** Rewrites media references in article bodies and every metadata/search field. */
export function rewriteContentAssetValues<T>(
  value: T,
  resolver: MediaUrlResolver = mediaUrlResolver,
): T {
  if (typeof value === "string") {
    return rewriteContentAssetUrls(value, resolver) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteContentAssetValues(item, resolver)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        rewriteContentAssetValues(item, resolver),
      ]),
    ) as T;
  }
  return value;
}
