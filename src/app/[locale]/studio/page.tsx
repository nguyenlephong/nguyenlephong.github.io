import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PAGE_SEO, SITE, SITE_URL, absoluteUrl } from "@/app/seo.config";
import PageTracker from "@/components/analytics/PageTracker";
import { routing, type Locale } from "@/i18n/routing";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { localizedPageIdentity } from "@/lib/seo/locale";
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
  if (process.env.NODE_ENV === "development") return [];
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const identity = localizedPageIdentity(locale, seo.path);
  const localizedSeo = getStudioSeo(locale);
  const socialImage = absoluteUrl("/opengraph-image.png");

  return {
    title: localizedSeo.title,
    description: localizedSeo.description,
    keywords: localizedSeo.keywords,
    alternates: { canonical: identity.canonical, languages: identity.languages },
    openGraph: {
      type: "website",
      url: identity.canonical,
      title: localizedSeo.title,
      description: localizedSeo.description,
      siteName: SITE.name,
      locale: identity.ogLocale,
      alternateLocale: identity.alternateOgLocales,
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
  const identity = localizedPageIdentity(locale, seo.path);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${identity.canonical}#studio`,
    name: localizedSeo.title,
    description: localizedSeo.description,
    url: identity.canonical,
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

            body:has(.studio-route-shell) [data-studio-shadow-host][data-shadow-ready="true"],
            body.studio-app-shell-active [data-studio-shadow-host][data-shadow-ready="true"] {
              height: 100vh !important;
              min-height: 100vh !important;
              overflow: hidden !important;
            }

            [data-studio-shadow-host][data-shadow-ready="false"] {
              height: 100vh;
              overflow: auto !important;
              color: #171717;
              background:
                radial-gradient(circle at top right, rgba(23, 23, 23, 0.06), transparent 34rem),
                #fafafa;
              font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }

            [data-studio-shadow-host] > .studio-page-heading {
              box-sizing: border-box;
              color: inherit;
            }

            [data-studio-shadow-host][data-shadow-ready="false"] > .studio-page-heading {
              width: min(72rem, 100%);
              margin-inline: auto;
              padding: clamp(2rem, 6vw, 5.5rem) clamp(1.25rem, 5vw, 4rem) 0;
            }

            .studio-page-heading__eyebrow {
              margin: 0 0 0.9rem;
              color: #525252;
              font-size: 0.78rem;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
            }

            .studio-page-heading h1 {
              margin: 0;
              font-size: clamp(2.25rem, 7vw, 5.25rem);
              letter-spacing: -0.055em;
              line-height: 0.98;
            }

            [data-studio-shadow-host][data-shadow-ready="true"] > .studio-page-heading {
              display: block;
              max-width: min(28vw, 18rem);
              overflow: hidden;
            }

            [data-studio-shadow-host][data-shadow-ready="true"] .studio-page-heading__eyebrow {
              display: none;
            }

            [data-studio-shadow-host][data-shadow-ready="true"] .studio-page-heading__title {
              overflow: hidden;
              font-size: 0.875rem;
              font-weight: 650;
              letter-spacing: 0;
              line-height: 1.2;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            @media (prefers-color-scheme: dark) {
              [data-studio-shadow-host][data-shadow-ready="false"] {
                color: #f5f5f5;
                background: #0a0a0a;
              }

              [data-studio-shadow-host][data-shadow-ready="false"] .studio-page-heading__eyebrow {
                color: #a3a3a3;
              }
            }

          `
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionLd) }}
      />
      <PageTracker page="studio" eventName="studio_view" section="notes_admin" />
      <StudioWorkspace
        locale={locale}
        heading={(
          <div
            slot="studio-page-heading"
            className="studio-page-heading"
            data-studio-page-heading="true"
          >
            <p className="studio-page-heading__eyebrow">{staticContent.eyebrow}</p>
            <h1 className="studio-page-heading__title">{staticContent.title}</h1>
          </div>
        )}
        fallback={<StudioStaticOverview locale={locale} />}
      />
    </div>
  );
}
