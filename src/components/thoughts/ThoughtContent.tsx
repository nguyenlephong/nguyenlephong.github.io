'use client'

import { useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'

interface ThoughtContentProps {
  html: string
}

export default function ThoughtContent({ html }: ThoughtContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const locale = useLocale()

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const anchors = root.querySelectorAll<HTMLAnchorElement>('a[href^="/thoughts/"]')
    anchors.forEach((a) => {
      const href = a.getAttribute('href')
      if (!href) return
      a.setAttribute('href', `/${locale}${href}`)
    })
  }, [html, locale])

  return (
    <div
      ref={ref}
      className="thought-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
