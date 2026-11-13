import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/app/seo.config";
import {
  buildStaticPageMetadata,
  type StaticPageLocalization
} from "@/lib/seo/static-page-localization";

const STUDIO_SOCIAL_IMAGE = "/opengraph-image.png";

/** Focused static-page metadata plus the shared social card Studio has always used. */
export function buildStudioMetadata({
  title,
  description,
  localization
}: {
  title: string;
  description: string;
  localization: StaticPageLocalization;
}): Metadata {
  const metadata = buildStaticPageMetadata({ title, description, localization, openGraphType: "website" });
  const socialImage = absoluteUrl(STUDIO_SOCIAL_IMAGE);
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [{ url: socialImage, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      ...metadata.twitter,
      card: "summary_large_image",
      site: SITE.twitter,
      creator: SITE.twitter,
      images: [socialImage]
    }
  };
}
