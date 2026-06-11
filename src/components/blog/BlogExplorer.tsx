"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LuSearch, LuX } from "react-icons/lu";
import { getPostStats, postStatsId } from "@/lib/firebase/postStats";
import BlogPostCard from "./BlogPostCard";
import BlogPagination from "./BlogPagination";
import { useDebouncedValue } from "./useDebouncedValue";
import type { BlogAccent, BlogPostMeta } from "@/lib/blog/types";

interface CardMeta {
  post: BlogPostMeta;
  accent: BlogAccent;
  categoryTitle: string;
  readingLabel: string;
}

interface CategoryOption {
  slug: string;
  title: string;
}

interface BlogExplorerProps {
  cards: CardMeta[];
  categories: CategoryOption[];
  popularTags: string[];
  locale: string;
  pageSize?: number;
  /** Threshold below which the view badge is hidden (default 100). */
  viewThreshold?: number;
}

/** The filter/search/page state, mirrored to the URL query string. */
interface ExplorerView {
  query: string;
  category: string | null;
  tag: string | null;
  page: number;
}

const INITIAL_VIEW: ExplorerView = {
  query: "",
  category: null,
  tag: null,
  page: 1
};

/** Diacritic- and case-insensitive normaliser (so "kien truc" matches "kiến trúc"). */
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
 * Client-side blog index: instant search, category + tag filters, and numbered
 * pagination over a pre-rendered post list. All posts ship in the initial HTML
 * (SEO + no-JS friendly); JS only narrows what is shown. Filter/search/page
 * state is mirrored to the URL (?q=&cat=&tag=&page=) so views are shareable.
 */
export default function BlogExplorer({
  cards,
  categories,
  popularTags,
  locale,
  pageSize = 9,
  viewThreshold = 100
}: BlogExplorerProps) {
  const t = useTranslations("Pages.blog");

  // SSR renders the default view (page 1, no filters); the URL is applied once
  // after mount so the first client render matches the server (no mismatch).
  const [view, setView] = useState<ExplorerView>(INITIAL_VIEW);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  const debouncedQuery = useDebouncedValue(view.query, 200);
  const listTopRef = useRef<HTMLDivElement>(null);
  const hydratedFromUrl = useRef(false);

  // Precompute a normalised search blob per card once.
  const searchable = useMemo(
    () =>
      cards.map((card) => ({
        card,
        blob: normalize(
          [
            card.post.title,
            card.post.summary,
            card.categoryTitle,
            card.post.tags.join(" ")
          ].join(" ")
        )
      })),
    [cards]
  );

  // Restore state from the URL on mount so deep links / bookmarks work. Reading
  // window.location is an external-system sync — the one-shot setState is
  // intentional here.
  useEffect(() => {
    const q = readParam("q") ?? "";
    const cat = readParam("cat");
    const tg = readParam("tag");
    const pg = Number(readParam("page"));
    const next: ExplorerView = {
      query: q,
      category: cat && categories.some((c) => c.slug === cat) ? cat : null,
      tag: tg && popularTags.includes(tg) ? tg : null,
      page: Number.isInteger(pg) && pg > 1 ? pg : 1
    };
    hydratedFromUrl.current = true;
    if (next.query || next.category || next.tag || next.page > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch per-post view counts once after mount (parallel), badge the popular ones.
  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      const entries = await Promise.all(
        cards.map(async ({ post }) => {
          const stats = await getPostStats(
            postStatsId(post.category, post.slug)
          );
          return stats ? ([post.slug, stats.views] as const) : null;
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
        .filter(
          ({ card }) => !view.category || card.post.category === view.category
        )
        .filter(({ card }) => !view.tag || card.post.tags.includes(view.tag))
        .filter(({ blob }) => queryTerms.every((term) => blob.includes(term)))
        .map(({ card }) => card),
    [searchable, view.category, view.tag, queryTerms]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(view.page, totalPages);
  const pageCards = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Keep the URL in sync with the active view (skip the first render so we don't
  // clobber an incoming deep link before it's been read).
  useEffect(() => {
    if (!hydratedFromUrl.current) return;
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (view.category) params.set("cat", view.category);
    if (view.tag) params.set("tag", view.tag);
    if (safePage > 1) params.set("page", String(safePage));
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    );
  }, [debouncedQuery, view.category, view.tag, safePage]);

  const scrollToTop = () => {
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSearch = (value: string) =>
    setView((v) => ({ ...v, query: value, page: 1 }));
  const selectAllCategories = () =>
    setView((v) => ({ ...v, category: null, page: 1 }));
  const toggleCategory = (slug: string) =>
    setView((v) => ({
      ...v,
      category: v.category === slug ? null : slug,
      page: 1
    }));
  const toggleTag = (value: string) =>
    setView((v) => ({ ...v, tag: v.tag === value ? null : value, page: 1 }));
  const clearAll = () => setView(INITIAL_VIEW);
  const changePage = (next: number) => {
    setView((v) => ({ ...v, page: next }));
    scrollToTop();
  };

  const hasFilters = Boolean(view.query || view.category || view.tag);

  return (
    <div className="blog-explorer">
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
            className={`blog-chip${!view.category ? " is-active" : ""}`}
            onClick={selectAllCategories}
            aria-pressed={!view.category}
          >
            {t("controls.allCategories")}
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`blog-chip${view.category === c.slug ? " is-active" : ""}`}
              onClick={() => toggleCategory(c.slug)}
              aria-pressed={view.category === c.slug}
            >
              {c.title}
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
            {pageCards.map(({ post, accent, categoryTitle, readingLabel }) => (
              <BlogPostCard
                key={post.slug}
                post={post}
                accent={accent}
                categoryTitle={categoryTitle}
                locale={locale}
                readingLabel={readingLabel}
                viewCount={viewCounts[post.slug]}
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
