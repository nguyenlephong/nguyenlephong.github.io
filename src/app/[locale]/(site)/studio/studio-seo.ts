import type { Metadata } from "next";
import { SITE } from "@/app/seo.config";
import {
  buildStaticPageMetadata,
  type StaticPageLocalization
} from "@/lib/seo/static-page-localization";

/** Focused static-page metadata; the social card is Studio's own (MEP-64), via the static-page policy. */
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
  return {
    ...metadata,
    twitter: {
      ...metadata.twitter,
      card: "summary_large_image",
      site: SITE.twitter,
      creator: SITE.twitter
    }
  };
}
