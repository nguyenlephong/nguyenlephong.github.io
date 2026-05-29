'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface BlogTocProps {
  label: string
}

/**
 * Builds an "On this page" outline from the `h2[id]`/`h3[id]` headings that the
 * authored post HTML emits, and highlights the section currently in view. Reads
 * the DOM after mount (the article body is injected via dangerouslySetInnerHTML)
 * and renders nothing when there are too few headings to be useful.
 */
export default function BlogToc({ label }: BlogTocProps) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const article = document.querySelector('.blog-content')
    if (!article) return

    const headings = Array.from(
      article.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]'),
    )
    const next = headings.map((h) => ({
      id: h.id,
      text: h.textContent?.trim() ?? '',
      level: h.tagName === 'H3' ? 3 : 2,
    }))
    setItems(next)

    if (next.length === 0) return

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
  }, [])

  if (items.length < 2) return null

  return (
    <nav className="blog-toc" aria-label={label}>
      <p className="blog-toc__label">{label}</p>
      <ul className="blog-toc__list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`blog-toc__item blog-toc__item--l${item.level}${
              activeId === item.id ? ' is-active' : ''
            }`}
          >
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
