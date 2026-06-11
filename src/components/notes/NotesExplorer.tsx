"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LuSearch, LuX } from "react-icons/lu";
import { getPostStats, postStatsId } from "@/lib/firebase/postStats";
import { useDebouncedValue } from "@/components/blog/useDebouncedValue";
import BlogPagination from "@/components/blog/BlogPagination";
import NoteCard from "./NoteCard";
import type { NoteMeta } from "@/lib/notes/types";

interface NoteCardMeta {
  note: NoteMeta;
  topicLabel: string;
  topicColor: string;
  readingLabel: string;
}

interface TopicOption {
  id: string;
  label: string;
  color: string;
}

interface NotesExplorerProps {
  cards: NoteCardMeta[];
  topics: TopicOption[];
  popularTags: string[];
  locale: string;
  pageSize?: number;
  /** Threshold below which the view badge is hidden (default 100). */
  viewThreshold?: number;
}

interface ExplorerView {
  query: string;
  topic: string | null;
  tag: string | null;
  page: number;
}

const INITIAL_VIEW: ExplorerView = {
  query: "",
  topic: null,
  tag: null,
  page: 1
};

/** Diacritic- and case-insensitive normaliser (so "ghi chu" matches "ghi chú"). */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function readParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * Client-side notes index: instant search, topic + tag filters, and numbered
 * pagination over a pre-rendered note list. All notes ship in the initial HTML
 * (SEO + no-JS friendly); JS only narrows what is shown. Filter/search/page
 * state is mirrored to the URL (?q=&topic=&tag=&page=) so views are shareable.
 */
export default function NotesExplorer({
  cards,
  topics,
  popularTags,
  locale,
  pageSize = 9,
  viewThreshold = 100
}: NotesExplorerProps) {
  const t = useTranslations("Pages.notes");

  const [view, setView] = useState<ExplorerView>(INITIAL_VIEW);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  const debouncedQuery = useDebouncedValue(view.query, 200);
  const listTopRef = useRef<HTMLDivElement>(null);
  const hydratedFromUrl = useRef(false);

  const searchable = useMemo(
    () =>
      cards.map((card) => ({
        card,
        blob: normalize(
          [
            card.note.title,
            card.note.summary,
            card.topicLabel,
            card.note.tags.join(" ")
          ].join(" ")
        )
      })),
    [cards]
  );

  useEffect(() => {
    const q = readParam("q") ?? "";
    const tp = readParam("topic");
    const tg = readParam("tag");
    const pg = Number(readParam("page"));
    const next: ExplorerView = {
      query: q,
      topic: tp && topics.some((x) => x.id === tp) ? tp : null,
      tag: tg && popularTags.includes(tg) ? tg : null,
      page: Number.isInteger(pg) && pg > 1 ? pg : 1
    };
    hydratedFromUrl.current = true;
    if (next.query || next.topic || next.tag || next.page > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      const entries = await Promise.all(
        cards.map(async ({ note }) => {
          const stats = await getPostStats(postStatsId("notes", note.slug));
          return stats ? ([note.slug, stats.views] as const) : null;
        })
      );
      if (cancelled) return;
      const counts: Record<string, number> = {};
      for (const entry of entries) {
        if (entry && entry[1] >= viewThreshold) counts[entry[0]] = entry[1];
      }
      setViewCounts(counts);
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewThreshold]);

  const queryTerms = useMemo(
    () => normalize(debouncedQuery).split(/\s+/).filter(Boolean),
    [debouncedQuery]
  );

  const filtered = useMemo(
    () =>
      searchable
        .filter(({ card }) => !view.topic || card.note.topic === view.topic)
        .filter(({ card }) => !view.tag || card.note.tags.includes(view.tag))
        .filter(({ blob }) => queryTerms.every((term) => blob.includes(term)))
        .map(({ card }) => card),
    [searchable, view.topic, view.tag, queryTerms]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(view.page, totalPages);
  const pageCards = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  useEffect(() => {
    if (!hydratedFromUrl.current) return;
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (view.topic) params.set("topic", view.topic);
    if (view.tag) params.set("tag", view.tag);
    if (safePage > 1) params.set("page", String(safePage));
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    );
  }, [debouncedQuery, view.topic, view.tag, safePage]);

  const scrollToTop = () => {
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSearch = (value: string) =>
    setView((v) => ({ ...v, query: value, page: 1 }));
  const selectAllTopics = () =>
    setView((v) => ({ ...v, topic: null, page: 1 }));
  const toggleTopic = (id: string) =>
    setView((v) => ({ ...v, topic: v.topic === id ? null : id, page: 1 }));
  const toggleTag = (value: string) =>
    setView((v) => ({ ...v, tag: v.tag === value ? null : value, page: 1 }));
  const clearAll = () => setView(INITIAL_VIEW);
  const changePage = (next: number) => {
    setView((v) => ({ ...v, page: next }));
    scrollToTop();
  };

  const hasFilters = Boolean(view.query || view.topic || view.tag);
  const activeColor = view.topic
    ? topics.find((x) => x.id === view.topic)?.color
    : undefined;

  return (
    <div
      className="blog-explorer notes-explorer"
      style={
        activeColor
          ? ({ "--blog-accent": activeColor } as React.CSSProperties)
          : undefined
      }
    >
      <div className="blog-explorer__controls">
        <div className="blog-search">
          <LuSearch className="blog-search__icon" aria-hidden="true" />
          <input
            type="search"
            className="blog-search__input"
            value={view.query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("controls.searchPlaceholder")}
            aria-label={t("controls.searchLabel")}
            autoComplete="off"
          />
          {view.query && (
            <button
              type="button"
              className="blog-search__clear"
              onClick={() => onSearch("")}
              aria-label={t("controls.clearSearch")}
            >
              <LuX aria-hidden="true" />
            </button>
          )}
        </div>

        <div
          className="blog-filters"
          role="group"
          aria-label={t("controls.filtersLabel")}
        >
          <button
            type="button"
            className={`blog-chip${!view.topic ? " is-active" : ""}`}
            onClick={selectAllTopics}
            aria-pressed={!view.topic}
          >
            {t("controls.allTopics")}
          </button>
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className={`blog-chip${view.topic === topic.id ? " is-active" : ""}`}
              style={{ "--blog-accent": topic.color } as React.CSSProperties}
              onClick={() => toggleTopic(topic.id)}
              aria-pressed={view.topic === topic.id}
            >
              {topic.label}
            </button>
          ))}
        </div>

        {popularTags.length > 0 && (
          <div className="blog-tags">
            <span className="blog-tags__label">
              {t("controls.popularTags")}
            </span>
            <ul className="blog-tags__list">
              {popularTags.map((tg) => (
                <li key={tg}>
                  <button
                    type="button"
                    className={`blog-tag${view.tag === tg ? " is-active" : ""}`}
                    onClick={() => toggleTag(tg)}
                    aria-pressed={view.tag === tg}
                  >
                    {tg}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="blog-explorer__status">
          <p className="blog-explorer__count" aria-live="polite">
            {t("controls.results", { count: filtered.length })}
          </p>
          {hasFilters && (
            <button
              type="button"
              className="blog-explorer__reset"
              onClick={clearAll}
            >
              {t("controls.clear")}
            </button>
          )}
        </div>
      </div>

      <div ref={listTopRef} className="blog-explorer__scroll-anchor" />

      {pageCards.length > 0 ? (
        <>
          <div className="blog-post-list">
            {pageCards.map(({ note, topicLabel, topicColor, readingLabel }) => (
              <NoteCard
                key={note.slug}
                note={note}
                topicLabel={topicLabel}
                topicColor={topicColor}
                locale={locale}
                readingLabel={readingLabel}
                viewCount={viewCounts[note.slug]}
                viewsLabel={t("engagement.views")}
              />
            ))}
          </div>

          <BlogPagination
            current={safePage}
            total={totalPages}
            onChange={changePage}
            navLabel={t("controls.pagination.label")}
            prevLabel={t("controls.pagination.prev")}
            nextLabel={t("controls.pagination.next")}
            goToPageLabel={t("controls.pagination.goToPage", {
              page: "{page}"
            })}
          />
        </>
      ) : (
        <div className="blog-explorer__empty">
          <p className="blog-explorer__empty-title">
            {t("controls.noResults")}
          </p>
          <button
            type="button"
            className="blog-explorer__reset"
            onClick={clearAll}
          >
            {t("controls.clear")}
          </button>
        </div>
      )}
    </div>
  );
}
