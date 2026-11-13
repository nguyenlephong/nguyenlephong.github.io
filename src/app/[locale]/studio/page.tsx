import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SITE_URL, absoluteUrl } from "@/app/seo.config";
import { routing } from "@/i18n/routing";
import { buildSectionBreadcrumb } from "@/lib/seo/section-breadcrumb";
import { resolveStaticPageLocalization } from "@/lib/seo/static-page-localization";
import StudioPageFrame from "./StudioPageFrame";
import StudioStaticOverview from "./StudioStaticOverview";
import { buildStudioMetadata } from "./studio-seo";
import {
  getStudioStaticContent,
  getStudioStaticModuleHref
} from "./studio-static-content";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  if (process.env.NODE_ENV === "development") return [];
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const content = getStudioStaticContent(locale);
  return buildStudioMetadata({
    title: content.seoTitle,
    description: content.description,
    localization: resolveStaticPageLocalization("studio", locale)
  });
}

export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const content = getStudioStaticContent(locale);
  const localization = resolveStaticPageLocalization("studio", locale);

  const breadcrumbLd = buildSectionBreadcrumb({
    locale: localization.contentLocale,
    name: "Studio",
    url: localization.canonical
  });

  // hasPart lists only the module pages this overview links to (verify-static-artifact checks the match).
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${localization.canonical}#studio`,
    name: content.seoTitle,
    description: content.description,
    url: localization.canonical,
    inLanguage: localization.contentLocale,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    author: { "@type": "Person", "@id": `${SITE_URL}/#person` },
    hasPart: content.modules.map((module) => {
      const url = absoluteUrl(getStudioStaticModuleHref(locale, module));
      return {
        "@type": "WebPage",
        "@id": url,
        name: module.seoTitle,
        description: module.description,
        url,
        inLanguage: localization.contentLocale
      };
    })
  };

  return (
    <StudioPageFrame
      locale={locale}
      title={content.title}
      contentLang={localization.authored ? undefined : localization.contentLocale}
      jsonLd={[collectionLd, breadcrumbLd]}
    >
      <StudioStaticOverview locale={locale} />
    </StudioPageFrame>
  );
}
