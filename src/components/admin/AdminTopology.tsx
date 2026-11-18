'use client'

import type { CSSProperties } from 'react'
import { categoryStyle } from './admin-format'
import { useAdminText } from './admin-i18n'
import { useCategoryFocus } from './category-focus'

export interface TopologyBranch {
  category: string
  title: string
  posts: number
  /** Missing while locked or loading: the branch draws idle and dotted. */
  views?: number
}

interface AdminTopologyProps {
  branches: TopologyBranch[]
  totalViews?: number
  /** Clicking a live node filters the post table to that category. */
  onPick?: (category: string) => void
}

/**
 * The homepage hero topology, redrawn for the blog: "Phong" is the root, each
 * category a branch. Live branches carry reads and posts on the wire and a
 * glowing share bar in the node; idle branches (locked, loading) are dotted.
 */
export default function AdminTopology({ branches, totalViews, onPick }: AdminTopologyProps) {
  const focus = useCategoryFocus()
  const { t, fmt } = useAdminText()
  const live = totalViews !== undefined
  const posts = branches.reduce((sum, branch) => sum + branch.posts, 0)
  // The branch with the most reads takes the live outline, wherever it sits.
  const lead = live ? branches.reduce<TopologyBranch | null>((best, branch) => ((branch.views ?? 0) > (best?.views ?? 0) ? branch : best), null) : null

  return (
    <figure className={live ? 'at is-live' : 'at is-idle'} aria-label={t.topology.label}>
      <p className="at-root">
        <span className="at-root-name">Phong</span>
        <span className="at-root-meta">{t.topology.root(fmt.number(posts), fmt.number(branches.length))}</span>
      </p>
      <ul className="at-list">
        {branches.map((branch, index) => {
          const views = branch.views ?? 0
          const share = live && totalViews ? views / totalViews : 0
          const perPost = branch.posts > 0 ? Math.round(views / branch.posts) : 0
          return (
            <li
              key={branch.category}
              className={branch === lead ? 'at-row is-lead' : 'at-row'}
              data-cat={branch.category}
              style={{ ...categoryStyle(branch.category), '--i': index, '--share': share } as CSSProperties}
            >
              <span className="at-wire" aria-hidden="true" />
              <span className="at-edge">
                {live ? t.topology.readsPosts(fmt.compact(views), fmt.number(branch.posts)) : t.topology.posts(fmt.number(branch.posts))}
              </span>
              {live ? (
                <button
                  type="button"
                  className="at-node"
                  aria-label={t.topology.nodeLabel(branch.title, fmt.number(views), fmt.percent(share), fmt.number(perPost))}
                  onMouseEnter={() => focus.set(branch.category)}
                  onMouseLeave={() => focus.set(null)}
                  onFocus={() => focus.set(branch.category)}
                  onBlur={() => focus.set(null)}
                  onClick={() => onPick?.(branch.category)}
                >
                  <span className="at-node-name">{branch.title}</span>
                  <span className="at-node-note">{t.topology.note(fmt.percent(share), fmt.number(perPost))}</span>
                  <span className="at-share" aria-hidden="true">
                    <span className="at-share-fill" />
                  </span>
                </button>
              ) : (
                <span className="at-node">
                  <span className="at-node-name">{branch.title}</span>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
