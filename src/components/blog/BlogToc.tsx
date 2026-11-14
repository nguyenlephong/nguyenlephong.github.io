'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { track } from '@/lib/analytics'
import type { ArticleOutlineItem } from '@/lib/content/article-outline'

export const ARTICLE_TOC_ID = 'article-toc'

interface BlogTocProps {
  items: ArticleOutlineItem[]
  label: string
  surface?: 'blog' | 'notes'
  /**
   * `rail`: sticky outline beside the text (≥1080px).
   * `inline`: collapsed outline under the article header (<1080px), plus a
   * skip link to the rail for keyboard readers on wide screens.
   */
  variant?: 'rail' | 'inline'
  /** Inline only: the skip link text. */
  jumpLabel?: string
}

/** Move focus to the heading the reader jumped to, without a second scroll. */
function focusHeading(id: string) {
  window.requestAnimationFrame(() => {
    const heading = document.getElementById(id)
    if (!heading) return
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
  })
}

function TocList({
  items,
  activeId,
  onJump,
}: {
  items: ArticleOutlineItem[]
  activeId?: string
  onJump: (item: ArticleOutlineItem) => void
}) {
  return (
    <ul className="blog-toc__list">
      {items.map((item) => (
        <li
          key={item.id}
          className={`blog-toc__item blog-toc__item--l${item.level}${
            activeId === item.id ? ' is-active' : ''
          }`}
        >
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? 'location' : undefined}
            onClick={() => onJump(item)}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

/**
 * "On this page" outline. Items come from the server (`buildArticleOutline`),
 * so the list is in the static HTML; the client only tracks the active section,
 * reports jumps and moves focus to the target heading.
 */
export default function BlogToc({
  items,
  label,
  surface = 'blog',
  variant = 'rail',
  jumpLabel,
}: BlogTocProps) {
  const [activeId, setActiveId] = useState('')
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const eventPrefix = surface === 'notes' ? 'notes' : 'blog'

  useEffect(() => {
    if (variant !== 'rail' || items.length === 0) return
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items, variant])

  const onJump = (item: ArticleOutlineItem) => {
    track(surface === 'notes' ? 'notes_nav_jump' : 'blog_nav_jump', {
      content_surface: surface,
      target_id: item.id,
      heading_level: item.level,
      source: variant === 'inline' ? 'mobile' : 'rail',
    })
    // Collapse before the browser scrolls, so the target lands where it should.
    if (detailsRef.current) detailsRef.current.open = false
    focusHeading(item.id)
  }

  if (variant === 'rail') {
    return (
      <nav id={ARTICLE_TOC_ID} className="blog-toc" aria-label={label}>
        <p className="blog-toc__label" aria-hidden="true">
          {label}
        </p>
        <TocList items={items} activeId={activeId} onJump={onJump} />
      </nav>
    )
  }

  const jumpToRail = (event: MouseEvent<HTMLAnchorElement>) => {
    const firstLink = document.querySelector<HTMLAnchorElement>(`#${ARTICLE_TOC_ID} a`)
    if (!firstLink) return
    event.preventDefault()
    firstLink.focus()
  }

  return (
    <div className="blog-toc-inline">
      {jumpLabel && (
        <a className="blog-toc-inline__skip" href={`#${ARTICLE_TOC_ID}`} onClick={jumpToRail}>
          {jumpLabel}
        </a>
      )}
      <details
        ref={detailsRef}
        className="blog-toc-inline__details"
        onToggle={(event) => {
          if (event.currentTarget.open) {
            track(`${eventPrefix}_toc_open`, {
              content_surface: surface,
              item_count: items.length,
            })
          }
        }}
      >
        <summary className="blog-toc-inline__summary">
          <span>{label}</span>
          <span className="blog-toc-inline__count">{items.length}</span>
        </summary>
        <nav className="blog-toc blog-toc--inline" aria-label={label}>
          <TocList items={items} onJump={onJump} />
        </nav>
      </details>
    </div>
  )
}
