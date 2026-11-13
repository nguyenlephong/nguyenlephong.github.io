'use client'
import type { CSSProperties, ReactNode } from 'react'
import { track } from '@/lib/analytics'
import { openCaseFile } from './CaseFile'

export type HeroTopologyLabels = {
  label: string
  location: string
  zaloEdge: ReactNode
  zaloNote: string
  bonbonEdge: ReactNode
  bonbonNote: string
  previousEdge: ReactNode
  previousNote: string
}

type NodeId = 'zalo_pc' | 'bonbon' | 'ndsvn'

type Edge = {
  id: NodeId
  name: string
  href: string
  edge: ReactNode
  note: string
  previous?: boolean
}

/**
 * "Current deployment": Phong as the root node, live edges to the two current roles and a
 * faded dashed edge to the previous one. Plain DOM text carries every fact; the wires are
 * CSS strokes that draw in once on load from an already-complete default.
 */
export default function HeroTopology({ labels }: { labels: HeroTopologyLabels }) {
  const edges: Edge[] = [
    { id: 'zalo_pc', name: 'Zalo PC', href: '#experience', edge: labels.zaloEdge, note: labels.zaloNote },
    { id: 'bonbon', name: 'BonBon Mobility', href: '#case-bonbon', edge: labels.bonbonEdge, note: labels.bonbonNote },
    {
      id: 'ndsvn',
      name: 'NDSVN',
      href: '#experience',
      edge: labels.previousEdge,
      note: labels.previousNote,
      previous: true,
    },
  ]

  return (
    <figure className="ht" aria-label={labels.label}>
      <p className="ht-root">
        <span className="ht-root-name">Phong</span>
        <span className="ht-root-meta">
          {labels.location} · <span className="ht-mono">UTC+7</span>
        </span>
      </p>
      <ul className="ht-list">
        {edges.map((e, i) => (
          <li
            key={e.id}
            className={e.previous ? 'ht-row is-previous' : 'ht-row is-live'}
            style={{ '--i': i } as CSSProperties}
          >
            <span className="ht-wire" aria-hidden="true" />
            <span className="ht-edge">{e.edge}</span>
            <a
              className="ht-node"
              href={e.href}
              onClick={() => {
                track('cv_hero_node_select', { node: e.id, surface: 'topology' })
                if (e.id === 'bonbon') openCaseFile('bonbon', 'hero')
              }}
            >
              <span className="ht-node-name">{e.name}</span>
              <span className="ht-node-note">{e.note}</span>
            </a>
          </li>
        ))}
      </ul>
    </figure>
  )
}
