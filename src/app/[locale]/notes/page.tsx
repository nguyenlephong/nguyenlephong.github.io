import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SITE, SITE_URL } from "@/app/seo.config";
import { OG_LOCALE_MAP, canonicalFor, localeAlternates } from "@/lib/blog/seo";
import {
  getNoteContentLocales,
  listNotes,
  listTopics,
  NOTE_CONTENT_LOCALES
} from "@/lib/notes/data";
import { noteOgImageUrl } from "@/lib/og/static-images";
import PageTracker from "@/components/analytics/PageTracker";
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
  const indexable = NOTE_CONTENT_LOCALES.includes(locale as "en" | "vi");
  const canonicalLocale = indexable ? locale : "en";

  const title = `${t("title")} — ${t("eyebrow")}`;
  const description = t("intro");
  const canonical = canonicalFor(canonicalLocale, "/notes");
  const languages = localeAlternates("/notes", NOTE_CONTENT_LOCALES);

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
      locale: OG_LOCALE_MAP[canonicalLocale as Locale] ?? OG_LOCALE_MAP.en
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SITE.twitter,
      creator: SITE.twitter
    },
    robots: {
      index: indexable,
      follow: true,
      googleBot: {
        index: indexable,
        follow: true,
        "max-image-preview": "large"
      }
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
  const collectionLocale = NOTE_CONTENT_LOCALES.includes(locale as "en" | "vi")
    ? locale
    : "en";
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
    "@id": canonicalFor(collectionLocale, "/notes") + "#notes",
    name: `${t("title")} — ${t("eyebrow")}`,
    description: t("intro"),
    url: canonicalFor(collectionLocale, "/notes"),
    inLanguage: collectionLocale,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    author: { "@type": "Person", "@id": `${SITE_URL}/#person` },
    hasPart: notes.map((n) => {
      const noteLocale = getNoteContentLocales(n.slug).includes(collectionLocale)
        ? collectionLocale
        : "en";

      return {
        "@type": "Article",
        headline: n.title,
        url: canonicalFor(noteLocale, `/notes/${n.slug}`),
        image: noteOgImageUrl(n.slug),
        datePublished: n.date
      };
    })
  };

  return (
    <main className="notes-archive notes-home">
      <PageTracker page="notes" eventName="notes_view" section="index" />
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
