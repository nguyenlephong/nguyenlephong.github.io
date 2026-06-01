'use client'

import { useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'

interface BlogContentProps {
  html: string
}

/**
 * Renders authored, in-repo HTML for a blog post. Internal links are written
 * locale-agnostic (e.g. `/blog/architecture/...`) in the source and patched
 * here to include the active locale prefix so navigation stays within-locale.
 */
export default function BlogContent({ html }: BlogContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const locale = useLocale()

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const anchors = root.querySelectorAll<HTMLAnchorElement>(
      'a[href^="/blog/"], a[href^="/thoughts/"], a[href^="/notes/"]',
    )
    anchors.forEach((a) => {
      const href = a.getAttribute('href')
      if (!href || href.startsWith(`/${locale}/`)) return
      a.setAttribute('href', `/${locale}${href}`)
    })
  }, [html, locale])

  return (
    <div
      ref={ref}
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
