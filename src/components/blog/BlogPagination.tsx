"use client";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { collectionPagePath } from "@/lib/content/pagination";

interface BlogPaginationProps {
  /** 1-based current page */
  current: number;
  /** Total number of pages (>= 1) */
  total: number;
  /** Client-only pagination callback, used for filtered search results. */
  onChange?: (page: number) => void;
  /** Static collection path. When present, controls render crawlable links. */
  basePath?: string;
  /** Locale that owns the exported archive chain. */
  linkLocale?: Locale;
  /** Optional analytics callback for a static page navigation. */
  onNavigate?: (page: number) => void;
  navLabel: string;
  prevLabel: string;
  nextLabel: string;
  /** Template containing `{page}`, used for each numbered button's aria-label */
  goToPageLabel: string;
}

type PageToken = number | "gap-left" | "gap-right";

/**
 * Builds a windowed page list: first, last, the current page and its two
 * neighbours, with ellipsis tokens filling the rest. Keeps the control compact
 * and layout-stable even with many pages (no CLS as the count changes).
 */
function buildPageTokens(current: number, total: number): PageToken[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const tokens: PageToken[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) tokens.push("gap-left");
  for (let p = start; p <= end; p++) tokens.push(p);
  if (end < total - 1) tokens.push("gap-right");

  tokens.push(total);
  return tokens;
}

export default function BlogPagination({
  current,
  total,
  onChange,
  basePath,
  linkLocale,
  onNavigate,
  navLabel,
  prevLabel,
  nextLabel,
  goToPageLabel
}: BlogPaginationProps) {
  if (total <= 1) return null;

  const tokens = buildPageTokens(current, total);
  const go = (page: number) => {
    const next = Math.min(Math.max(page, 1), total);
    if (next !== current) onChange?.(next);
  };

  const pageHref = (page: number) => collectionPagePath(basePath ?? "", page);

  const pageControl = (page: number) => {
    const className = `blog-pager__page${page === current ? " is-active" : ""}`;
    const ariaLabel = goToPageLabel.replace("{page}", String(page));

    if (basePath) {
      return (
        <Link
          href={pageHref(page)}
          locale={linkLocale}
          prefetch={false}
          className={className}
          aria-label={ariaLabel}
          aria-current={page === current ? "page" : undefined}
          onClick={() => onNavigate?.(page)}
        >
          {page}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={className}
        onClick={() => go(page)}
        aria-label={ariaLabel}
        aria-current={page === current ? "page" : undefined}
      >
        {page}
      </button>
    );
  };

  const edgeControl = (page: number, direction: "prev" | "next") => {
    const disabled = page < 1 || page > total;
    const label = direction === "prev" ? prevLabel : nextLabel;
    const icon =
      direction === "prev" ? (
        <LuChevronLeft aria-hidden="true" />
      ) : (
        <LuChevronRight aria-hidden="true" />
      );
    const content = (
      <>
        {direction === "prev" && icon}
        <span className="blog-pager__edge-text">{label}</span>
        {direction === "next" && icon}
      </>
    );

    if (disabled) {
      return (
        <span className="blog-pager__edge is-disabled" aria-disabled="true">
          {content}
        </span>
      );
    }

    if (basePath) {
      return (
        <Link
          href={pageHref(page)}
          locale={linkLocale}
          prefetch={false}
          className="blog-pager__edge"
          aria-label={label}
          onClick={() => onNavigate?.(page)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className="blog-pager__edge"
        onClick={() => go(page)}
        aria-label={label}
      >
        {content}
      </button>
    );
  };

  return (
    <nav className="blog-pager" aria-label={navLabel}>
      {edgeControl(current - 1, "prev")}

      <ul className="blog-pager__pages">
        {tokens.map((token) =>
          typeof token === "number" ? (
            <li key={token}>{pageControl(token)}</li>
          ) : (
            <li key={token} className="blog-pager__gap" aria-hidden="true">
              …
            </li>
          )
        )}
      </ul>

      {edgeControl(current + 1, "next")}
    </nav>
  );
}
