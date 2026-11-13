import type { Metadata } from 'next'
import { absoluteUrl } from '@/app/seo.config'

type OpenGraphImages = NonNullable<NonNullable<Metadata['openGraph']>['images']>

/**
 * The URL Next gives a segment's opengraph-image route: params filled in, route groups dropped,
 * and a `-<hash>` suffix when the segment path holds a group such as `(site)`. Mirrors
 * getMetadataRouteSuffix in next/dist/lib/metadata/get-metadata-route (djb2, base 36, 6 chars);
 * tests pin it against the URLs the build emits, and verify:artifact fails on a missing image.
 */
export function segmentOgImagePath(segment: string, params: Record<string, string>): string {
  const parts = segment.split('/').filter(Boolean)
  const isGroup = (part: string) => /^\(.+\)$/.test(part)
  let suffix = ''
  if (parts.some(isGroup)) {
    let hash = 5381
    for (let i = 0; i < segment.length; i += 1) {
      hash = ((hash << 5) + hash + segment.charCodeAt(i)) & 0xffffffff
    }
    suffix = `-${(hash >>> 0).toString(36).slice(0, 6)}`
  }
  const route = parts
    .filter((part) => !isGroup(part))
    .map((part) => {
      const name = /^\[(.+)\]$/.exec(part)?.[1]
      if (!name) return part
      const value = params[name]
      if (!value) throw new Error(`Missing "${name}" for OG segment ${segment}`)
      return value
    })
  return `/${[...route, `opengraph-image${suffix}`].join('/')}`
}

/**
 * The social card of an app segment with a localized alt (MEP-64). A file-based opengraph-image
 * can only export one static alt, and a child page that sets its own openGraph drops the parent's
 * card, so section pages and their paged archives attach the card explicitly.
 */
export function sectionOgImages(
  segment: string,
  params: Record<string, string>,
  alt: string,
): OpenGraphImages {
  return [{ url: absoluteUrl(segmentOgImagePath(segment, params)), width: 1200, height: 630, alt }]
}
