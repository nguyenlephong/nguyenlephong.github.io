import variantManifest from "../../../config/icdn-responsive-variants.json" with { type: "json" };

// Kept free of path aliases so node:test can import it directly.

export type ResponsiveImageVariants = Readonly<
  Record<string, { width: number; height: number; widths: readonly number[] }>
>;

/** Article and note bodies: full width on phones, a 720px column otherwise. */
export const CONTENT_IMAGE_SIZES = "(max-width: 720px) 100vw, 720px";

const PUBLISHED_VARIANTS: ResponsiveImageVariants = variantManifest.images;

/**
 * srcset for a media URL whose 480w/800w variants are published (listed in
 * config/icdn-responsive-variants.json), or null so the plain src stays as is.
 */
export function responsiveSrcSet(
  src: string,
  baseUrl: string,
  variants: ResponsiveImageVariants = PUBLISHED_VARIANTS,
): string | null {
  const prefix = `${baseUrl.replace(/\/+$/, "")}/`;
  if (!src.startsWith(prefix) || !src.endsWith(".webp")) return null;
  const entry = variants[src.slice(prefix.length)];
  if (!entry || entry.widths.length === 0) return null;

  const stem = src.slice(0, -".webp".length);
  return [
    ...entry.widths.map((width) => `${stem}-${width}w.webp ${width}w`),
    `${src} ${entry.width}w`,
  ].join(", ");
}

/** Adds srcset and sizes to body <img> tags that have published variants. */
export function addResponsiveImageAttributes(
  html: string,
  baseUrl: string,
  variants: ResponsiveImageVariants = PUBLISHED_VARIANTS,
): string {
  if (!html.includes("<img")) return html;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (/\ssrcset=/i.test(tag)) return tag;
    const src = /\ssrc=(["'])([^"']*)\1/i.exec(tag)?.[2];
    const srcSet = src ? responsiveSrcSet(src, baseUrl, variants) : null;
    if (!srcSet) return tag;
    return tag.replace(
      /\s*(\/?)>$/,
      (_end, selfClosing: string) =>
        ` srcset="${srcSet}" sizes="${CONTENT_IMAGE_SIZES}"${selfClosing ? " />" : ">"}`,
    );
  });
}
