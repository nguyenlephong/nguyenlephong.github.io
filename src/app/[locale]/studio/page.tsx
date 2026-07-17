import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PAGE_SEO, SITE, SITE_URL, absoluteUrl } from "@/app/seo.config";
import PageTracker from "@/components/analytics/PageTracker";
import { routing, type Locale } from "@/i18n/routing";
import StudioStaticOverview from "./StudioStaticOverview";
import StudioWorkspace from "./StudioWorkspace";
import {
  getStudioStaticContent,
  getStudioStaticModuleHref
} from "./studio-static-content";

const seo = PAGE_SEO.studio;

const studioSeoByLocale: Record<string, { title: string; description: string; keywords: string[] }> = {
  en: {
    title: "Studio — Engineering Notes, Checklists, and System Flows",
    description:
      "A public workspace for the notes, checklists, and visual flows I use to review architecture, prepare releases, set up tools, and work with AI responsibly.",
    keywords: ["engineering notes", "software checklists", "system design flows", "AI-assisted engineering"]
  },
  vi: {
    title: "Studio — Ghi chú kỹ thuật, Checklists và System Flows",
    description:
      "Không gian công khai tập hợp ghi chú, checklists và system flows tôi dùng để review architecture, chuẩn bị release, setup công cụ và làm việc với AI có trách nhiệm.",
    keywords: ["ghi chú kỹ thuật", "engineering checklists", "system design flows", "AI-assisted engineering"]
  }
};

function getStudioSeo(locale: string) {
  const localized = studioSeoByLocale[locale];
  const staticContent = getStudioStaticContent(locale);
  return localized
    ? { ...localized, keywords: [...(seo.keywords ?? []), ...localized.keywords] }
    : { title: staticContent.title, description: staticContent.intro, keywords: seo.keywords ?? [] };
}

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function localeAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `/${locale}${path}`;
  }
  languages["x-default"] = `/${routing.defaultLocale}${path}`;
  return languages;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `/${locale}${seo.path}`;
  const localizedSeo = getStudioSeo(locale);
  const socialImage = absoluteUrl(`/${locale}/opengraph-image`);

  return {
    title: localizedSeo.title,
    description: localizedSeo.description,
    keywords: localizedSeo.keywords,
    alternates: { canonical, languages: localeAlternates(seo.path) },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonical),
      title: localizedSeo.title,
      description: localizedSeo.description,
      siteName: SITE.name,
      locale: locale === "vi" ? "vi_VN" : locale === "en" ? "en_US" : locale.replace("-", "_"),
      images: [{ url: socialImage, width: 1200, height: 630, alt: localizedSeo.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: localizedSeo.title,
      description: localizedSeo.description,
      site: SITE.twitter,
      creator: SITE.twitter,
      images: [socialImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" }
    }
  };
}

export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const localizedSeo = getStudioSeo(locale);
  const staticContent = getStudioStaticContent(locale);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/${locale}/studio#studio`,
    name: localizedSeo.title,
    description: localizedSeo.description,
    url: `${SITE_URL}/${locale}/studio`,
    inLanguage: locale as Locale,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    author: { "@type": "Person", "@id": `${SITE_URL}/#person` },
    hasPart: staticContent.modules.map((module) => ({
      "@type": "CreativeWork",
      "@id": absoluteUrl(getStudioStaticModuleHref(locale, module)),
      name: module.title,
      description: module.description,
      url: absoluteUrl(getStudioStaticModuleHref(locale, module)),
      inLanguage: locale as Locale
    }))
  };

  return (
    <div className="studio-route-shell">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body:has(.studio-route-shell),
            body.studio-app-shell-active {
              overflow: hidden;
              background: var(--bg, #fafafa) !important;
            }

            body:has(.studio-route-shell) .studio-route-shell,
            body.studio-app-shell-active .studio-route-shell {
              height: 100vh !important;
              min-height: 100vh !important;
              overflow: hidden !important;
              padding-top: 0 !important;
              padding-bottom: 0 !important;
            }

            body:has(.studio-route-shell) [data-studio-shadow-host],
            body.studio-app-shell-active [data-studio-shadow-host] {
              height: 100vh !important;
              min-height: 100vh !important;
              overflow: hidden !important;
            }

          `
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <PageTracker page="studio" eventName="studio_view" section="notes_admin" />
      <StudioWorkspace locale={locale} fallback={<StudioStaticOverview locale={locale} />} />
    </div>
  );
}
