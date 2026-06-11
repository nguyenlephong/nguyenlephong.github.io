"use client";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface BlogPaginationProps {
  /** 1-based current page */
  current: number;
  /** Total number of pages (>= 1) */
  total: number;
  onChange: (page: number) => void;
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
  navLabel,
  prevLabel,
  nextLabel,
  goToPageLabel
}: BlogPaginationProps) {
  if (total <= 1) return null;

  const tokens = buildPageTokens(current, total);
  const go = (page: number) => {
    const next = Math.min(Math.max(page, 1), total);
    if (next !== current) onChange(next);
  };

  return (
    <nav className="blog-pager" aria-label={navLabel}>
      <button
        type="button"
        className="blog-pager__edge"
        onClick={() => go(current - 1)}
        disabled={current <= 1}
        aria-label={prevLabel}
      >
        <LuChevronLeft aria-hidden="true" />
        <span className="blog-pager__edge-text">{prevLabel}</span>
      </button>

      <ul className="blog-pager__pages">
        {tokens.map((token) =>
          typeof token === "number" ? (
            <li key={token}>
              <button
                type="button"
                className={`blog-pager__page${
                  token === current ? " is-active" : ""
                }`}
                onClick={() => go(token)}
                aria-label={goToPageLabel.replace("{page}", String(token))}
                aria-current={token === current ? "page" : undefined}
              >
                {token}
              </button>
            </li>
          ) : (
            <li key={token} className="blog-pager__gap" aria-hidden="true">
              …
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        className="blog-pager__edge"
        onClick={() => go(current + 1)}
        disabled={current >= total}
        aria-label={nextLabel}
      >
        <span className="blog-pager__edge-text">{nextLabel}</span>
        <LuChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}
