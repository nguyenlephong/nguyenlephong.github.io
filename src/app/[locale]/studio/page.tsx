import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PAGE_SEO, SITE, SITE_URL, absoluteUrl } from "@/app/seo.config";
import PageTracker from "@/components/analytics/PageTracker";
import { routing, type Locale } from "@/i18n/routing";
import StudioWorkspace from "./StudioWorkspace";
import { studioNotes } from "./studio.data";
import "./studio.css";

const seo = PAGE_SEO.studio;

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

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical, languages: localeAlternates(seo.path) },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonical),
      title: seo.title,
      description: seo.description,
      siteName: SITE.name,
      locale: locale.replace("-", "_")
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      site: SITE.twitter,
      creator: SITE.twitter
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
  await getTranslations({ locale, namespace: "Pages.studio" });

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/${locale}/studio#studio`,
    name: seo.title,
    description: seo.description,
    url: `${SITE_URL}/${locale}/studio`,
    inLanguage: locale as Locale,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    author: { "@type": "Person", "@id": `${SITE_URL}/#person` },
    hasPart: studioNotes.map((note) => ({
      "@type": "TechArticle",
      headline: note.title,
      description: note.summary,
      url: `${SITE_URL}/${locale}/studio#${note.id}`,
      dateModified: note.updatedAt,
      keywords: note.tags.join(", ")
    }))
  };

  return (
    <main className="studio-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <PageTracker page="studio" eventName="studio_view" section="notes_admin" />
      <StudioWorkspace />
    </main>
  );
}
