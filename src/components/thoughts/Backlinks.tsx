'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import type { BacklinkEntry } from '@/lib/thoughts/types'

interface BacklinksProps {
  items: BacklinkEntry[]
}

export default function Backlinks({ items }: BacklinksProps) {
  const t = useTranslations('Pages.thoughts')
  const locale = useLocale()
  const [open, setOpen] = useState(true)

  if (items.length === 0) return null

  return (
    <section className="thought-backlinks">
      <button
        type="button"
        className="thought-backlinks__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? '▾' : '▸'} {t('backlinks')} ({items.length})
      </button>
      {open && (
        <ul className="thought-backlinks__list">
          {items.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/${locale}/thoughts/${b.slug}`}
                className="thought-backlinks__link"
              >
                {b.title}
              </Link>
              <div
                className="thought-backlinks__context"
                dangerouslySetInnerHTML={{ __html: b.context }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
