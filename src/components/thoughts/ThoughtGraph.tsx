'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import { select } from 'd3-selection'
import 'd3-transition'
import { drag as d3Drag } from 'd3-drag'
import type { Maturity, PublicThought, ThoughtEdge } from '@/lib/thoughts/types'

interface ForceParams {
  linkStrength: number
  linkDistance: number
  chargeStrength: number
  centerXStrength: number
  centerYStrength: number
  collisionPadX: number
  collisionPadY: number
  alphaDecay: number
  velocityDecay: number
}

const DEFAULT_FORCE_PARAMS: ForceParams = {
  linkStrength: 0.45,
  linkDistance: 30,
  chargeStrength: -60,
  centerXStrength: 0.01,
  centerYStrength: 0.04,
  collisionPadX: 8,
  collisionPadY: 14,
  alphaDecay: 0.04,
  velocityDecay: 0.45,
}

interface GraphNode extends SimulationNodeDatum {
  id: string
  title: string
  connected: boolean
  maturity: Maturity
  textWidth: number
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: GraphNode
  target: GraphNode
}

interface ThoughtGraphProps {
  thoughts: PublicThought[]
  edges: ThoughtEdge[]
  /** When true, the graph fills its container height (use with a sized parent). */
  fillViewport?: boolean
}

const MATURITY_FILL: Record<Maturity, string> = {
  evergreen: 'var(--fg)',
  budding: 'var(--fg-muted)',
  seed: 'var(--fg-subtle)',
}

function measureTextWidths(
  titles: { id: string; title: string }[],
  font: string,
): Map<string, number> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  ctx.font = font
  const widths = new Map<string, number>()
  for (const { id, title } of titles) {
    widths.set(id, ctx.measureText(title).width)
  }
  return widths
}

function forceRectCollide(nodes: GraphNode[], padX: number, padY: number) {
  const textHeight = 14
  return () => {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = (b.x ?? 0) - (a.x ?? 0)
        const dy = (b.y ?? 0) - (a.y ?? 0)
        const halfWa = a.textWidth / 2 + padX
        const halfWb = b.textWidth / 2 + padX
        const halfHa = textHeight / 2 + padY
        const halfHb = textHeight / 2 + padY
        const overlapX = halfWa + halfWb - Math.abs(dx)
        const overlapY = halfHa + halfHb - Math.abs(dy)
        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY) {
            const shift = (overlapX / 2) * Math.sign(dx || 1)
            a.x! -= shift
            b.x! += shift
          } else {
            const shift = (overlapY / 2) * Math.sign(dy || 1)
            a.y! -= shift
            b.y! += shift
          }
        }
      }
    }
  }
}

export default function ThoughtGraph({
  thoughts,
  edges,
  fillViewport = false,
}: ThoughtGraphProps) {
  const locale = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null)
  const forceParamsRef = useRef<ForceParams>({ ...DEFAULT_FORCE_PARAMS })

  const fallbackHeight = Math.max(400, Math.min(thoughts.length * 60, 640))
  const [height, setHeight] = useState(fallbackHeight)

  const measureHeight = useCallback(() => {
    if (!fillViewport) {
      return Math.max(400, Math.min(thoughts.length * 60, 640))
    }
    if (typeof window === 'undefined') return fallbackHeight
    const top = containerRef.current?.getBoundingClientRect().top ?? 0
    return Math.max(360, window.innerHeight - top - 8)
  }, [fillViewport, thoughts.length, fallbackHeight])

  const buildGraph = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const width = container.clientWidth
    if (!width) return

    const font = `0.85rem var(--font-sans), system-ui, sans-serif`
    const textWidths = measureTextWidths(
      thoughts.map((t) => ({ id: t.slug, title: t.title })),
      font,
    )

    const connectedSlugs = new Set<string>()
    for (const e of edges) {
      connectedSlugs.add(e.source)
      connectedSlugs.add(e.target)
    }

    const nodes: GraphNode[] = thoughts.map((t) => ({
      id: t.slug,
      title: t.title,
      connected: connectedSlugs.has(t.slug),
      maturity: t.maturity ?? 'seed',
      textWidth: textWidths.get(t.slug) ?? 60,
      x: Math.random() * width,
      y: height * 0.3 + Math.random() * height * 0.4,
    }))

    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    const links: GraphLink[] = edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: nodeMap.get(e.source)!,
        target: nodeMap.get(e.target)!,
      }))

    const adjacency = new Map<string, Set<string>>()
    for (const link of links) {
      const sId = link.source.id
      const tId = link.target.id
      if (!adjacency.has(sId)) adjacency.set(sId, new Set())
      if (!adjacency.has(tId)) adjacency.set(tId, new Set())
      adjacency.get(sId)!.add(tId)
      adjacency.get(tId)!.add(sId)
    }

    select(container).select('svg').remove()
    simulationRef.current?.stop()

    const svg = select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)

    const defs = svg.append('defs')
    for (const [id, stroke] of [
      ['arrowhead', 'var(--border-strong)'],
      ['arrowhead-hover', 'var(--fg)'],
    ] as const) {
      defs
        .append('marker')
        .attr('id', id)
        .attr('viewBox', '0 0 10 8')
        .attr('refX', 10)
        .attr('refY', 4)
        .attr('markerWidth', 7)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M1,1 L9,4 L1,7')
        .attr('fill', 'none')
        .attr('stroke', stroke)
        .attr('stroke-width', 1.2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
    }

    const linkGroup = svg.append('g').attr('class', 'links')
    const nodeGroup = svg.append('g').attr('class', 'nodes')

    const linkElements = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'var(--border-strong)')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.5)
      .attr('marker-end', 'url(#arrowhead)')
      .style(
        'transition',
        'stroke 450ms ease-out, stroke-width 450ms ease-out, stroke-opacity 450ms ease-out',
      )

    const nodeElements = nodeGroup
      .selectAll<SVGAElement, GraphNode>('a')
      .data(nodes, (d) => d.id)
      .enter()
      .append<SVGAElement>('a')
      .attr('href', (d) => `/${locale}/thoughts/${d.id}`)
      .attr('class', 'thought-graph-node')
      .attr('draggable', 'false')
      .style('text-decoration', 'none')
      .on('dragstart', (event) => event.preventDefault())

    nodeElements
      .append('text')
      .text((d) => d.title)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-family', 'var(--font-sans), system-ui, sans-serif')
      .style('font-size', '0.85rem')
      .style('fill', (d) => MATURITY_FILL[d.maturity])
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .style('transition', 'fill 350ms cubic-bezier(0.25, 0.1, 0.25, 1)')

    nodeElements
      .on('mouseenter', (_event, d) => {
        const neighbors = adjacency.get(d.id) ?? new Set<string>()
        const isRelevant = (n: GraphNode) => n.id === d.id || neighbors.has(n.id)

        nodeElements
          .select('text')
          .style('transition-duration', '60ms')
          .style('fill', (n) =>
            isRelevant(n as GraphNode) ? 'var(--fg)' : 'var(--fg-subtle)',
          )
          .style('font-weight', (n) => ((n as GraphNode).id === d.id ? '600' : ''))

        linkElements
          .style('transition-duration', '80ms')
          .attr('stroke', (l) =>
            l.source.id === d.id || l.target.id === d.id
              ? 'var(--fg)'
              : 'var(--border-strong)',
          )
          .attr('stroke-width', (l) =>
            l.source.id === d.id || l.target.id === d.id ? 1.5 : 1,
          )
          .attr('stroke-opacity', (l) =>
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.2,
          )
          .attr('marker-end', (l) =>
            l.source.id === d.id || l.target.id === d.id
              ? 'url(#arrowhead-hover)'
              : 'url(#arrowhead)',
          )
      })
      .on('mouseleave', () => {
        nodeElements
          .select('text')
          .style('transition-duration', '350ms')
          .style('fill', (n) => MATURITY_FILL[(n as GraphNode).maturity])
          .style('font-weight', '')

        linkElements
          .style('transition-duration', '450ms')
          .attr('stroke', 'var(--border-strong)')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.5)
          .attr('marker-end', 'url(#arrowhead)')
      })

    let dragged = false
    const dragBehavior = d3Drag<SVGAElement, GraphNode>()
      .on('start', (event, d) => {
        dragged = false
        if (!event.active) simulation.alphaTarget(0.01).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        const dx = event.x - (d.fx ?? 0)
        const dy = event.y - (d.fy ?? 0)
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragged = true
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodeElements.call(dragBehavior)
    nodeElements.on('click', function (event) {
      if (dragged) event.preventDefault()
    })

    const p = forceParamsRef.current
    const simulation = forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .strength(p.linkStrength)
          .distance(p.linkDistance),
      )
      .force('charge', forceManyBody<GraphNode>().strength(p.chargeStrength))
      .force('x', forceX<GraphNode>(width / 2).strength(p.centerXStrength))
      .force('y', forceY<GraphNode>(height / 2).strength(p.centerYStrength))
      .force('rectCollide', forceRectCollide(nodes, p.collisionPadX, p.collisionPadY))
      .alphaDecay(p.alphaDecay)
      .velocityDecay(p.velocityDecay)
      .stop()

    for (let i = 0; i < 500; i++) simulation.tick()

    simulation.on('tick', () => {
      const textHeight = 14
      const pad = 4

      function clipToBox(
        cx: number,
        cy: number,
        halfW: number,
        halfH: number,
        tx: number,
        ty: number,
      ): [number, number] {
        const dx = tx - cx
        const dy = ty - cy
        if (dx === 0 && dy === 0) return [cx, cy]
        const sx = halfW / Math.abs(dx || 1e-6)
        const sy = halfH / Math.abs(dy || 1e-6)
        const s = Math.min(sx, sy)
        return [cx + dx * s, cy + dy * s]
      }

      const edgePadY = 40
      for (const d of nodes) {
        const hw = d.textWidth / 2 + pad
        d.x = Math.max(hw, Math.min(width - hw, d.x!))
        d.y = Math.max(edgePadY, Math.min(height - edgePadY, d.y!))
      }

      linkElements
        .attr('x1', (d) =>
          clipToBox(
            d.source.x!,
            d.source.y!,
            d.source.textWidth / 2 + pad,
            textHeight / 2 + pad,
            d.target.x!,
            d.target.y!,
          )[0],
        )
        .attr('y1', (d) =>
          clipToBox(
            d.source.x!,
            d.source.y!,
            d.source.textWidth / 2 + pad,
            textHeight / 2 + pad,
            d.target.x!,
            d.target.y!,
          )[1],
        )
        .attr('x2', (d) =>
          clipToBox(
            d.target.x!,
            d.target.y!,
            d.target.textWidth / 2 + pad,
            textHeight / 2 + pad,
            d.source.x!,
            d.source.y!,
          )[0],
        )
        .attr('y2', (d) =>
          clipToBox(
            d.target.x!,
            d.target.y!,
            d.target.textWidth / 2 + pad,
            textHeight / 2 + pad,
            d.source.x!,
            d.source.y!,
          )[1],
        )

      nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    simulation.alpha(0.03).restart()
    simulationRef.current = simulation
  }, [thoughts, edges, height, locale])

  useEffect(() => {
    setHeight(measureHeight())
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(buildGraph)
    } else {
      buildGraph()
    }
    return () => {
      simulationRef.current?.stop()
    }
  }, [buildGraph, measureHeight])

  useEffect(() => {
    const onResize = () => {
      simulationRef.current?.stop()
      setHeight(measureHeight())
      buildGraph()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [buildGraph, measureHeight])

  return (
    <div
      ref={containerRef}
      className="thought-graph-container"
      style={{ width: '100%', height }}
    />
  )
}
