import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SITE, SITE_URL } from "@/app/seo.config";
import { OG_LOCALE_MAP, canonicalFor, localeAlternates } from "@/lib/blog/seo";
import { listNotes, listTopics } from "@/lib/notes/data";
import NotesExplorer from "@/components/notes/NotesExplorer";
import "./notes.css";
import "../blog/blog.css";

type Props = { params: Promise<{ locale: string }> };

const FALLBACK_TOPIC_COLOR = "#b45309";
const POPULAR_TAG_LIMIT = 12;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Most-used tags across the visible note set — drives the quick-filter chips. */
function popularTags(notes: { tags: string[] }[]): string[] {
  const counts = new Map<string, number>();
  for (const n of notes) {
    for (const tag of n.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, POPULAR_TAG_LIMIT)
    .map(([tag]) => tag);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.notes" });

  const title = `${t("title")} — ${t("eyebrow")}`;
  const description = t("intro");
  const canonical = canonicalFor(locale, "/notes");
  const languages = localeAlternates("/notes");

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale as Locale] ?? OG_LOCALE_MAP.en
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export default async function NotesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Pages.notes" });
  const notes = listNotes(locale);
  const topics = listTopics(locale);
  const topicBySlug = new Map(topics.map((tp) => [tp.id, tp]));
  const latestDate = notes[0]?.date;

  const cards = notes.map((note) => {
    const topic = note.topic ? topicBySlug.get(note.topic) : undefined;
    return {
      note,
      topicLabel: topic?.label ?? note.topic ?? "",
      topicColor: topic?.color ?? FALLBACK_TOPIC_COLOR,
      readingLabel: t("readingTime", { minutes: note.readingMinutes })
    };
  });

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": canonicalFor(locale, "/notes") + "#notes",
    name: `${t("title")} — ${t("eyebrow")}`,
    description: t("intro"),
    url: canonicalFor(locale, "/notes"),
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    author: { "@type": "Person", "@id": `${SITE_URL}/#person` },
    hasPart: notes.map((n) => ({
      "@type": "Article",
      headline: n.title,
      url: canonicalFor(locale, `/notes/${n.slug}`),
      image: canonicalFor(locale, `/notes/${n.slug}/opengraph-image`),
      datePublished: n.date
    }))
  };

  return (
    <main className="notes-archive notes-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <header className="notes-archive__title-page">
        <p className="notes-archive__eyebrow">{t("eyebrow")}</p>
        <h1 className="notes-archive__title">{t("title")}</h1>
        <p className="notes-archive__subtitle">{t("intro")}</p>
        <div className="notes-archive__rule" aria-hidden="true" />
        <dl className="notes-archive__stats">
          <div>
            <dt>{t("stats.topics")}</dt>
            <dd>{topics.length}</dd>
          </div>
          <div>
            <dt>{t("stats.articles")}</dt>
            <dd>{notes.length}</dd>
          </div>
          {latestDate && (
            <div>
              <dt>{t("stats.updated")}</dt>
              <dd>{formatDate(latestDate, locale)}</dd>
            </div>
          )}
        </dl>
      </header>

      {notes.length > 0 ? (
        <NotesExplorer
          cards={cards}
          topics={topics.map((tp) => ({
            id: tp.id,
            label: tp.label,
            color: tp.color
          }))}
          popularTags={popularTags(notes)}
          locale={locale}
        />
      ) : (
        <p className="blog-empty">{t("empty")}</p>
      )}
    </main>
  );
}
