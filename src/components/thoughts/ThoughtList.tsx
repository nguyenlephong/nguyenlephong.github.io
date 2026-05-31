'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import type { Maturity, PublicThought } from '@/lib/thoughts/types'

interface Props {
  thoughts: PublicThought[]
}

const MATURITY_ORDER: Maturity[] = ['evergreen', 'budding', 'seed']

export default function ThoughtList({ thoughts }: Props) {
  const locale = useLocale()
  const t = useTranslations('Pages.thoughts')

  const groups = MATURITY_ORDER.map((maturity) => ({
    maturity,
    items: thoughts
      .filter((th) => th.maturity === maturity)
      .sort((a, b) => b.backlinks.length - a.backlinks.length),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="thought-list" role="list" aria-label={t('title')}>
      {groups.map(({ maturity, items }) => (
        <section key={maturity} className="thought-list__group" role="listitem">
          <h2 className="thought-list__heading">
            <span className={`thought-list__dot thought-list__dot--${maturity}`} aria-hidden />
            {t(`maturity.${maturity}`)}
            <span className="thought-list__count" aria-label={`${items.length} notes`}>
              {items.length}
            </span>
          </h2>
          <ul className="thought-list__items">
            {items.map((thought) => (
              <li key={thought.slug}>
                <Link
                  href={`/${locale}/thoughts/${thought.slug}`}
                  className="thought-list__item"
                >
                  <span className="thought-list__title">{thought.title}</span>
                  {thought.backlinks.length > 0 && (
                    <span
                      className="thought-list__links"
                      aria-label={`${thought.backlinks.length} backlinks`}
                    >
                      {thought.backlinks.length}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
