import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LOCALE_LABELS, routing, type Locale } from "@/i18n/routing";
import { SITE, SITE_URL } from "@/app/seo.config";
import { buildDescription, htmlToPlainText } from "@/lib/blog/seo";
import {
  OG_LOCALE_MAP,
  canonicalFor,
  localeAlternates,
  preferredContentLocale
} from "@/lib/seo/locale";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import {
  getTopic,
  getNoteHub,
  getNoteContentLocales,
  getTopicReadingContext,
  listNoteParams,
  loadNote
} from "@/lib/notes/data";
import { buildNotesTopicHref } from "@/lib/notes/urls";
import { resolveNoteAuthorIdentity } from "@/lib/notes/authorship";
import { noteOgImageUrl } from "@/lib/og/static-images";
import BlogContent from "@/components/blog/BlogContent";
import BlogToc from "@/components/blog/BlogToc";
import BlogViewCount from "@/components/blog/BlogViewCount";
import BlogShareDock from "@/components/blog/BlogShareDock";
import BlogReactions from "@/components/blog/BlogReactions";
import BlogReadingTracker from "@/components/blog/BlogReadingTracker";
import ContentHubReadingTracker from "@/components/blog/ContentHubReadingTracker";
import { EngagementProvider } from "@/components/blog/EngagementProvider";
import LocalizedArticleFallback from "@/components/content/LocalizedArticleFallback";
import "../notes.css";
import "../../blog/blog.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

const FALLBACK_TOPIC_COLOR = "#b45309";

export function generateStaticParams() {
  if (process.env.NODE_ENV === "development") return [];
  return listNoteParams();
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const contentLocales = getNoteContentLocales(slug);
  const hasLocalizedContent = contentLocales.includes(locale as Locale);
  const canonicalLocale = hasLocalizedContent
    ? (locale as Locale)
    : preferredContentLocale(contentLocales);
  const note = loadNote(slug, canonicalLocale);
  if (!note) return { title: "Not found" };

  const title = note.seoTitle ?? note.title;
  const description =
    note.seoDescription ?? buildDescription(note.summary || note.html);
  const canonical = canonicalFor(canonicalLocale, `/notes/${slug}`);
  const imageUrl = noteOgImageUrl(slug);
  const languages = localeAlternates(`/notes/${slug}`, contentLocales);
  const authorIdentity = resolveNoteAuthorIdentity(note.author);

  return {
    title: { absolute: title },
    description,
    keywords: note.tags,
    alternates: {
      canonical,
      ...(hasLocalizedContent ? { languages } : {})
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[canonicalLocale as Locale] ?? OG_LOCALE_MAP.en,
      alternateLocale: contentLocales
        .filter((contentLocale) => contentLocale !== canonicalLocale)
        .map((contentLocale) => OG_LOCALE_MAP[contentLocale]),
      publishedTime: note.date,
      ...(note.updated ? { modifiedTime: note.updated } : {}),
      ...(authorIdentity?.profileUrl
        ? { authors: [authorIdentity.profileUrl] }
        : {}),
      tags: note.tags,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SITE.twitter,
      creator: SITE.twitter,
      images: [imageUrl]
    }
  };
}

export default async function NotePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const contentLocales = getNoteContentLocales(slug);
  const requestedLocale = locale as Locale;
  const hasLocalizedContent = contentLocales.includes(requestedLocale);
  const canonicalLocale = hasLocalizedContent
    ? requestedLocale
    : preferredContentLocale(contentLocales);
  const note = loadNote(slug, canonicalLocale);
  if (!note) notFound();

  if (!hasLocalizedContent) {
    const fallbackT = await getTranslations({
      locale,
      namespace: "ContentFallback"
    });
    return (
      <LocalizedArticleFallback
        articlePath={`/notes/${slug}`}
        availableVariants={contentLocales.map((contentLocale) => ({
          label: fallbackT("action", {
            language: LOCALE_LABELS[contentLocale].name
          }),
          locale: contentLocale
        }))}
        className="blog-article blog-article--ocean notes-accent notes-reading"
        requestedLocale={requestedLocale}
        slug={slug}
        surface="notes"
        title={note.title}
        titleLocale={canonicalLocale}
        labels={{
          description: fallbackT("description"),
          eyebrow: fallbackT("eyebrow")
        }}
      />
    );
  }

  const t = await getTranslations({ locale, namespace: "Pages.notes" });
  const canonical = canonicalFor(canonicalLocale, `/notes/${slug}`);
  const imageUrl = noteOgImageUrl(slug);
  const description =
    note.seoDescription ?? (note.summary || buildDescription(note.html));
  const authorIdentity = resolveNoteAuthorIdentity(note.author);

  const topic = note.topic ? getTopic(note.topic, locale) : null;
  const topicHub = note.topic ? getNoteHub(note.topic, locale) : null;
  const topicReading = getTopicReadingContext(slug, locale);
  const topicColor = topic?.color ?? FALLBACK_TOPIC_COLOR;
  const topicHref = topic ? buildNotesTopicHref(topic.id) : null;
  const bookSourceCard = note.book ? (
    <aside className="notes-source-card" aria-label={t("source.heading")}>
      <p className="notes-source-card__eyebrow">{t("source.heading")}</p>
      <dl className="notes-source-card__grid">
        <div>
          <dt>{t("source.title")}</dt>
          <dd>{note.book.title}</dd>
        </div>
        {note.book.originalTitle && (
          <div>
            <dt>{t("source.originalTitle")}</dt>
            <dd>{note.book.originalTitle}</dd>
          </div>
        )}
        <div>
          <dt>{t("source.authors")}</dt>
          <dd>{note.book.authors.join(", ")}</dd>
        </div>
        {note.book.contributors && note.book.contributors.length > 0 && (
          <div>
            <dt>{t("source.contributors")}</dt>
            <dd>{note.book.contributors.join(", ")}</dd>
          </div>
        )}
        {note.book.publisher && (
          <div>
            <dt>{t("source.publisher")}</dt>
            <dd>{note.book.publisher}</dd>
          </div>
        )}
        {note.book.published && (
          <div>
            <dt>{t("source.published")}</dt>
            <dd>{note.book.published}</dd>
          </div>
        )}
        {note.book.isbn && (
          <div>
            <dt>{t("source.isbn")}</dt>
            <dd>{note.book.isbn}</dd>
          </div>
        )}
      </dl>
      {note.book.note && (
        <p className="notes-source-card__note">{note.book.note}</p>
      )}
    </aside>
  ) : null;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": canonical + "#article",
    headline: note.title,
    description,
    inLanguage: canonicalLocale,
    url: canonical,
    image: imageUrl,
    mainEntityOfPage: canonical,
    datePublished: note.date,
    ...(note.updated ? { dateModified: note.updated } : {}),
    ...(note.contentMode ? { genre: note.contentMode } : {}),
    keywords: note.tags.join(", "),
    ...(authorIdentity ? { author: authorIdentity.structuredData } : {}),
    ...(note.book
      ? {
          about: {
            "@type": "Book",
            name: note.book.originalTitle ?? note.book.title,
            alternateName: note.book.title,
            author: note.book.authors.map((name) => ({
              "@type": "Person",
              name
            }))
          }
        }
      : {}),
    publisher: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Nguyen Le Phong",
      url: SITE_URL
    },
    isPartOf: topicHub
      ? {
          "@type": "CollectionPage",
          "@id": `${canonicalFor(
            canonicalLocale,
            `/notes/topics/${topicHub.topic}`
          )}#collection`
        }
      : {
          "@type": "CollectionPage",
          "@id": `${canonicalFor(canonicalLocale, "/notes")}#notes`
        }
  };

  const reviewedPageLd = note.reviewedAt
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: note.seoTitle ?? note.title,
        description,
        inLanguage: canonicalLocale,
        lastReviewed: note.reviewedAt,
        mainEntity: { "@id": `${canonical}#article` },
        isPartOf: { "@id": `${SITE_URL}/#website` }
      }
    : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("title"),
        item: canonicalFor(canonicalLocale, "/notes")
      },
      ...(topicHub
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: topicHub.title,
              item: canonicalFor(
                canonicalLocale,
                `/notes/topics/${topicHub.topic}`
              )
            }
          ]
        : []),
      {
        "@type": "ListItem",
        position: topicHub ? 3 : 2,
        name: note.title,
        item: canonical
      }
    ]
  };

  const faqLd =
    note.faqs && note.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": canonical + "#faq",
          mainEntity: note.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: htmlToPlainText(f.a) }
          }))
        }
      : null;

  return (
    <main
      className="blog-article blog-article--ocean notes-accent notes-reading"
      data-content-locales={contentLocales.join(" ")}
      data-content-locale-fallback="/notes"
      style={{ "--topic-color": topicColor } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
      />
      {reviewedPageLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(reviewedPageLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }}
        />
      )}

      <EngagementProvider category="notes" slug={slug}>
        {topicHub ? (
          <ContentHubReadingTracker
            category="notes"
            slug={slug}
            readingMinutes={note.readingMinutes}
            surface="notes"
          />
        ) : (
          <BlogReadingTracker
            category="notes"
            slug={slug}
            readingMinutes={note.readingMinutes}
            surface="notes"
          />
        )}
        <div className="blog-article__main">
          <div className="blog-article__reader">
            <BlogShareDock
              url={canonical}
              title={note.title}
              surface="notes"
              category="notes"
              slug={slug}
              labels={{
                share: t("engagement.share"),
                copyLink: t("engagement.copyLink"),
                copied: t("engagement.copied"),
                close: t("engagement.close")
              }}
            />
            <div className="blog-article__reader-content">
              <nav className="blog-breadcrumb" aria-label="Breadcrumb">
                <Link href="/notes">{t("title")}</Link>
                {topic && (
                  <>
                    <span aria-hidden="true">/</span>
                    {topicHub ? (
                      <Link
                        href={`/notes/topics/${topicHub.topic}`}
                        prefetch={false}
                        data-content-hub-action="hub"
                        data-content-hub-kind="notes_topic"
                        data-content-hub-id={topicHub.topic}
                        data-content-hub-page="1"
                        data-source="notes_article_breadcrumb"
                      >
                        {topic.label}
                      </Link>
                    ) : (
                      <Link href={topicHref ?? "/notes"}>{topic.label}</Link>
                    )}
                  </>
                )}
                <span aria-hidden="true">/</span>
                <span>{note.title}</span>
              </nav>

              <header className="blog-article__head">
                <h1 className="blog-article__title">{note.title}</h1>
                <p className="blog-article__summary">{note.summary}</p>
                <div className="blog-article__meta">
                  <time dateTime={note.date}>
                    {formatDate(note.date, locale)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t("readingTime", { minutes: note.readingMinutes })}
                  </span>
                  <BlogViewCount label={t("engagement.views")} />
                </div>
                {note.tags.length > 0 && (
                  <ul className="blog-article__tags">
                    {note.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                )}
              </header>

              <BlogContent html={note.html} />

              {note.faqs && note.faqs.length > 0 && (
                <section
                  className="blog-faq"
                  aria-labelledby="notes-faq-heading"
                >
                  <h2 id="notes-faq-heading" className="blog-faq__heading">
                    {t("faqHeading")}
                  </h2>
                  <dl className="blog-faq__list">
                    {note.faqs.map((f, i) => (
                      <div className="blog-faq__item" key={i}>
                        <dt className="blog-faq__q">{f.q}</dt>
                        <dd
                          className="blog-faq__a"
                          dangerouslySetInnerHTML={{ __html: f.a }}
                        />
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {bookSourceCard}

              <BlogReactions
                prompt={t("engagement.reactionsPrompt")}
                surface="notes"
                category="notes"
                slug={slug}
                reactionLabels={{
                  like: t("engagement.reactions.like"),
                  love: t("engagement.reactions.love"),
                  insightful: t("engagement.reactions.insightful"),
                  clap: t("engagement.reactions.clap")
                }}
              />
            </div>
          </div>

          {topicReading && (topicReading.prev || topicReading.next) && (
            <nav
              className="blog-series-nav"
              aria-label={
                topicReading.scope === "topic" && topicReading.topic
                  ? topicReading.topic.label
                  : t("title")
              }
            >
              {topicReading.prev ? (
                <Link
                  href={`/notes/${topicReading.prev.slug}`}
                  className="blog-series-nav__link blog-series-nav__link--prev"
                >
                  <span className="blog-series-nav__dir">
                    ← {t("previously")}
                  </span>
                  <span className="blog-series-nav__title">
                    {topicReading.prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {topicReading.next ? (
                <Link
                  href={`/notes/${topicReading.next.slug}`}
                  className="blog-series-nav__link blog-series-nav__link--next"
                >
                  <span className="blog-series-nav__dir">{t("nextUp")} →</span>
                  <span className="blog-series-nav__title">
                    {topicReading.next.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}

          <footer className="blog-article__footer">
            <Link href="/notes" className="blog-back">
              ← {t("backToNotes")}
            </Link>
          </footer>
        </div>

        <aside className="blog-article__toc">
          <BlogToc label={t("onThisPage")} surface="notes" />
        </aside>
      </EngagementProvider>
    </main>
  );
}
