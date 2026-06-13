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

function slugifyHeading(text: string, fallback: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

function uniqueHeadingId(base: string, usedIds: Set<string>): string {
  let id = base
  let suffix = 2

  while (usedIds.has(id)) {
    id = `${base}-${suffix}`
    suffix += 1
  }

  usedIds.add(id)
  return id
}

/**
 * Builds an "On this page" outline from article `h2`/`h3` headings, assigning
 * stable anchor ids client-side when older authored HTML omitted them.
 */
export default function BlogToc({ label }: BlogTocProps) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const article = document.querySelector('.blog-content')
    if (!article) return

    const headings = Array.from(
      article.querySelectorAll<HTMLHeadingElement>('h2, h3'),
    )
    const usedIds = new Set(
      Array.from(document.querySelectorAll<HTMLElement>('[id]')).map(
        (node) => node.id,
      ),
    )
    const next = headings
      .map((h, index) => {
        const text = h.textContent?.trim() ?? ''
        if (!text) return null

        const id =
          h.id ||
          uniqueHeadingId(slugifyHeading(text, `section-${index + 1}`), usedIds)
        h.id = id

        return {
          id,
          text,
          level: h.tagName === 'H3' ? 3 : 2,
        }
      })
      .filter((item): item is TocItem => item !== null)

    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      if (!cancelled) setItems(next)
    })

    if (next.length === 0) {
      return () => {
        cancelled = true
        window.cancelAnimationFrame(frame)
      }
    }

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
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
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
