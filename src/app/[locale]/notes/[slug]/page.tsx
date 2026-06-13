import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SITE, SITE_URL } from "@/app/seo.config";
import {
  OG_LOCALE_MAP,
  buildDescription,
  canonicalFor,
  htmlToPlainText,
  localeAlternates
} from "@/lib/blog/seo";
import {
  getTopic,
  getTopicReadingContext,
  listNoteParams,
  loadNote
} from "@/lib/notes/data";
import BlogContent from "@/components/blog/BlogContent";
import BlogToc from "@/components/blog/BlogToc";
import BlogViewCount from "@/components/blog/BlogViewCount";
import BlogShareDock from "@/components/blog/BlogShareDock";
import BlogReactions from "@/components/blog/BlogReactions";
import BlogReadingTracker from "@/components/blog/BlogReadingTracker";
import { EngagementProvider } from "@/components/blog/EngagementProvider";
import "../notes.css";
import "../../blog/blog.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

const FALLBACK_TOPIC_COLOR = "#b45309";

export function generateStaticParams() {
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
  const note = loadNote(slug, locale);
  if (!note) return { title: "Not found" };

  const title = note.title;
  const description = note.summary || buildDescription(note.html);
  const canonical = canonicalFor(locale, `/notes/${slug}`);
  const imageUrl = canonicalFor(locale, `/notes/${slug}/opengraph-image`);
  const languages = localeAlternates(`/notes/${slug}`);

  return {
    title,
    description,
    keywords: note.tags,
    alternates: { canonical, languages },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale as Locale] ?? OG_LOCALE_MAP.en,
      publishedTime: note.date,
      modifiedTime: note.updated ?? note.date,
      authors: [SITE_URL],
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
    },
    robots: { index: true, follow: true }
  };
}

export default async function NotePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const note = loadNote(slug, locale);
  if (!note) notFound();

  const t = await getTranslations({ locale, namespace: "Pages.notes" });
  const canonical = canonicalFor(locale, `/notes/${slug}`);
  const imageUrl = canonicalFor(locale, `/notes/${slug}/opengraph-image`);
  const description = note.summary || buildDescription(note.html);

  const topic = note.topic ? getTopic(note.topic, locale) : null;
  const topicReading = getTopicReadingContext(slug, locale);
  const topicColor = topic?.color ?? FALLBACK_TOPIC_COLOR;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": canonical + "#article",
    headline: note.title,
    description,
    inLanguage: locale,
    url: canonical,
    image: imageUrl,
    mainEntityOfPage: canonical,
    datePublished: note.date,
    dateModified: note.updated ?? note.date,
    keywords: note.tags.join(", "),
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Nguyen Le Phong",
      url: SITE_URL
    }
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
      style={{ "--topic-color": topicColor } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <EngagementProvider category="notes" slug={slug}>
        <BlogReadingTracker
          category="notes"
          slug={slug}
          readingMinutes={note.readingMinutes}
        />
        <div className="blog-article__main">
          <div className="blog-article__reader">
            <BlogShareDock
              url={canonical}
              title={note.title}
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
                    <span>{topic.label}</span>
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

              <BlogReactions
                prompt={t("engagement.reactionsPrompt")}
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
              aria-label={topicReading.topic.label}
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
          <BlogToc label={t("onThisPage")} />
        </aside>
      </EngagementProvider>
    </main>
  );
}
