import { ICDN_BASE_URL } from "@/app/app.conf";

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

export function icdnAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const base = ICDN_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function localContentAssetToIcdn(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const mapping = CONTENT_ASSET_MAPPINGS.find(({ from }) =>
    normalizedPath.startsWith(from)
  );
  if (!mapping) return path;

  const semanticPath = replaceExtension(
    `${mapping.to}${normalizedPath.slice(mapping.from.length)}`,
    mapping.extension
  );

  return icdnAssetUrl(semanticPath);
}

export function rewriteContentAssetUrls(html: string): string {
  return html.replace(
    /(["'(])\/((?:assets\/(?:blog|notes)|og\/(?:blog|notes))\/[^"')\s<>]+)/g,
    (_match, prefix: string, assetPath: string) =>
      `${prefix}${localContentAssetToIcdn(`/${assetPath}`)}`
  );
}
