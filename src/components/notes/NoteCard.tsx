"use client";

import { LuEye } from "react-icons/lu";
import IntentPrefetchLink from "@/components/navigation/IntentPrefetchLink";
import { track } from "@/lib/analytics";
import { formatCount } from "@/lib/firebase/postStats";
import type { NoteSearchItem } from "@/lib/content/search-index";

interface NoteCardProps {
  note: NoteSearchItem;
  /** Translated topic name shown as a chip */
  topicLabel: string;
  /** Topic accent colour (drives chip + hover) */
  topicColor: string;
  /** Active locale, used to format the publish date */
  locale: string;
  /** Locale that owns the linked article body. Defaults to the active locale. */
  contentLocale?: string;
  /** Pre-translated reading-time string, e.g. "12 min read" */
  readingLabel: string;
  /** View count injected client-side; shown only when >= 100 */
  viewCount?: number;
  /** Translated "views" label */
  viewsLabel?: string;
  /** Listing surface that produced this card click. */
  source?: string;
}

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export default function NoteCard({
  note,
  topicLabel,
  topicColor,
  locale,
  contentLocale = locale,
  readingLabel,
  viewCount,
  viewsLabel,
  source = "notes_explorer"
}: NoteCardProps) {
  return (
    <article
      className="blog-card"
      style={{ "--blog-accent": topicColor } as React.CSSProperties}
    >
      <IntentPrefetchLink
        href={`/notes/${note.slug}`}
        locale={contentLocale}
        className="blog-card__link"
        onClick={() => {
          track("notes_card_click", {
            content_surface: "notes",
            content_category: note.topic ?? null,
            content_slug: note.slug,
            source
          });
        }}
      >
        <div className="blog-card__body">
          <span className="blog-card__kicker">{topicLabel}</span>
          <h3 className="blog-card__title">{note.title}</h3>
          <p className="blog-card__summary">{note.cardSummary ?? note.summary}</p>
          <div className="blog-card__meta">
            <time dateTime={note.date}>{formatDate(note.date, locale)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingLabel}</span>
            {typeof viewCount === "number" && viewCount >= 100 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="blog-card__views">
                  <LuEye aria-hidden="true" />
                  {formatCount(viewCount)}
                  {viewsLabel ? ` ${viewsLabel}` : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </IntentPrefetchLink>
    </article>
  );
}
