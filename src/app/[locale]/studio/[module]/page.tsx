import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SITE_URL } from "@/app/seo.config";
import { routing } from "@/i18n/routing";
import { BREADCRUMB_HOME_NAME } from "@/lib/seo/section-breadcrumb";
import { resolveStaticPageLocalization } from "@/lib/seo/static-page-localization";
import StudioModuleArticle from "../StudioModuleArticle";
import StudioPageFrame from "../StudioPageFrame";
import { studioCatalog, type StudioPublicModuleSlug } from "../studio-route-catalog";
import { buildStudioMetadata } from "../studio-seo";
import { getStudioStaticModule } from "../studio-static-content";

type Props = { params: Promise<{ locale: string; module: string }> };

export function generateStaticParams() {
  if (process.env.NODE_ENV === "development") return [];
  return routing.locales.flatMap((locale) =>
    studioCatalog.publicModules.map(({ slug }) => ({ locale, module: slug }))
  );
}

function resolveModulePage(locale: string, slug: string) {
  if (!hasLocale(routing.locales, locale)) notFound();
  const studioModule = getStudioStaticModule(locale, slug);
  if (!studioModule) notFound();
  const localization = resolveStaticPageLocalization(`studio/${slug as StudioPublicModuleSlug}`, locale);
  return { studioModule, localization };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, module: slug } = await params;
  const { studioModule, localization } = resolveModulePage(locale, slug);
  return buildStudioMetadata({ title: studioModule.seoTitle, description: studioModule.description, localization });
}

export default async function StudioModulePage({ params }: Props) {
  const { locale, module: slug } = await params;
  const { studioModule, localization } = resolveModulePage(locale, slug);
  setRequestLocale(locale);
  // Same locale as the overview page, so isPartOf resolves to its CollectionPage @id.
  const studioUrl = `${SITE_URL}/${locale}/studio`;

  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${localization.canonical}#webpage`,
    name: studioModule.seoTitle,
    description: studioModule.description,
    url: localization.canonical,
    inLanguage: localization.contentLocale,
    isPartOf: { "@type": "CollectionPage", "@id": `${studioUrl}#studio` },
    author: { "@type": "Person", "@id": `${SITE_URL}/#person` }
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${localization.canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: BREADCRUMB_HOME_NAME, item: `${SITE_URL}/${localization.contentLocale}` },
      { "@type": "ListItem", position: 2, name: "Studio", item: studioUrl },
      { "@type": "ListItem", position: 3, name: studioModule.title, item: localization.canonical }
    ]
  };

  return (
    <StudioPageFrame
      locale={locale}
      title={studioModule.title}
      contentLang={localization.authored ? undefined : localization.contentLocale}
      jsonLd={[pageLd, breadcrumbLd]}
      trackerContext={{ studio_module: studioModule.slug }}
    >
      <StudioModuleArticle locale={locale} module={studioModule} />
    </StudioPageFrame>
  );
}
