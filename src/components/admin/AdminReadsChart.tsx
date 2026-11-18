'use client'

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { AdminPostRow } from '@/lib/admin/insights.mjs'
import { categoryStyle } from './admin-format'
import { Rich, slot } from './AdminRich'
import { useAdminText } from './admin-i18n'

const HEIGHT = 300
const MARGIN = { top: 14, right: 14, bottom: 30, left: 48 }
const HIT_RADIUS = 24
const RECENT_DAYS = 90
const DAY_MS = 86_400_000
const BANDS: Array<{ min: number; max: number }> = [
  { min: 0, max: 0 },
  { min: 1, max: 9 },
  { min: 10, max: 99 },
  { min: 100, max: 499 },
  { min: 500, max: 999 },
  { min: 1000, max: Infinity },
]

interface AdminReadsChartProps {
  posts: AdminPostRow[]
  categoryTitles: ReadonlyMap<string, string>
  /** Click or Enter on a dot: show that post in the table. */
  onPick: (postId: string) => void
  /** When the counters were loaded; the x axis ends here. */
  asOf: number
}

interface Point {
  post: AdminPostRow
  x: number
  y: number
}

/** 1, 2, 2.5 or 5 times a power of ten, at or above the value. */
function niceStep(value: number): number {
  if (value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  return ([1, 2, 2.5, 5, 10].find((step) => step * power >= value) ?? 10) * power
}
const Y_TICKS = 4

const dayOf = (date: string) => Date.parse(`${date}T00:00:00Z`)

function monthTicks(start: number, end: number): number[] {
  const first = new Date(start)
  const months = (new Date(end).getUTCFullYear() - first.getUTCFullYear()) * 12 + new Date(end).getUTCMonth() - first.getUTCMonth()
  const step = [1, 2, 3, 6, 12, 24].find((candidate) => months / candidate <= 5) ?? 24
  const ticks: number[] = []
  for (let m = 1; m <= months + 1; m += 1) {
    const tick = Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + m, 1)
    if (tick > end) break
    if ((first.getUTCMonth() + m) % step === 0) ticks.push(tick)
  }
  return ticks
}

/** The dots never change on hover, so they render once per data or width change. */
const Dots = memo(function Dots({ points }: { points: Point[] }) {
  return (
    <g className="admin-chart__dots">
      {points.map(({ post, x, y }) => (
        <circle key={post.id} className="admin-dot" data-cat={post.category} cx={x} cy={y} r={4} style={categoryStyle(post.category)} />
      ))}
    </g>
  )
})

export default function AdminReadsChart({ posts, categoryTitles, onPick, asOf: today }: AdminReadsChartProps) {
  const { t, fmt } = useAdminText()
  const frameRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry?.contentRect.width ?? 0)))
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  const dated = useMemo(
    () => posts.filter((post) => post.listed && post.date).sort((a, b) => a.date!.localeCompare(b.date!)),
    [posts],
  )
  const start = dated.length ? dayOf(dated[0]!.date!) : today - 365 * DAY_MS
  const yStep = niceStep(Math.max(1, ...dated.map((post) => post.views)) / Y_TICKS)
  const yMax = Math.max(1, Math.ceil(Math.max(1, ...dated.map((post) => post.views)) / yStep)) * yStep
  const plotW = Math.max(1, width - MARGIN.left - MARGIN.right)
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom
  const xOf = (time: number) => MARGIN.left + ((time - start) / Math.max(1, today - start)) * plotW
  const yOf = (views: number) => MARGIN.top + plotH - (views / yMax) * plotH

  const points = useMemo<Point[]>(
    () => (width > 0 ? dated.map((post) => ({ post, x: xOf(dayOf(post.date!)), y: yOf(post.views) })) : []),
    // xOf/yOf derive from these inputs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dated, width, yMax, start, today],
  )
  const yTicks = Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, index) => index * yStep)
  const xTicks = useMemo(() => monthTicks(start, today), [start, today])

  const recentCut = today - RECENT_DAYS * DAY_MS
  const recent = dated.filter((post) => dayOf(post.date!) >= recentCut)
  const older = dated.filter((post) => dayOf(post.date!) < recentCut)
  const average = (list: AdminPostRow[]) => (list.length ? Math.round(list.reduce((s, p) => s + p.views, 0) / list.length) : 0)
  const bands = BANDS.map((band) => ({ ...band, count: dated.filter((p) => p.views >= band.min && p.views <= band.max).length }))
  const bandMax = Math.max(1, ...bands.map((band) => band.count))

  const nearest = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
    if (!box) return
    const px = event.clientX - box.left
    const py = event.clientY - box.top
    let best = -1
    let bestDistance = HIT_RADIUS ** 2
    points.forEach((point, index) => {
      const distance = (point.x - px) ** 2 + (point.y - py) ** 2
      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    })
    setActive(best >= 0 ? best : null)
  }

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!points.length) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const step = event.key === 'ArrowRight' ? 1 : -1
      setActive((current) => (current === null ? (step > 0 ? 0 : points.length - 1) : Math.min(points.length - 1, Math.max(0, current + step))))
    } else if (event.key === 'Enter' && active !== null) {
      onPick(points[active]!.post.id)
    } else if (event.key === 'Escape') {
      setActive(null)
    }
  }

  const focus = active !== null ? points[active] : undefined
  const tipStyle = focus
    ? ({ '--tip-x': `${focus.x}px`, '--tip-y': `${focus.y}px`, ...categoryStyle(focus.post.category) } as CSSProperties)
    : undefined
  const flip = focus ? focus.x > width * 0.62 : false

  return (
    <div className="admin-chart">
      <figure className="admin-chart__figure">
        <div ref={frameRef} className="admin-chart__frame">
          {width > 0 ? (
            <svg
              width={width}
              height={HEIGHT}
              className="admin-chart__svg"
              tabIndex={0}
              role="group"
              aria-label={t.chart.label(fmt.number(dated.length))}
              onKeyDown={onKeyDown}
              onBlur={() => setActive(null)}
            >
              <g className="admin-chart__grid" aria-hidden="true">
                {yTicks.map((tick) => (
                  <g key={tick}>
                    <line x1={MARGIN.left} x2={width - MARGIN.right} y1={yOf(tick)} y2={yOf(tick)} />
                    <text x={MARGIN.left - 8} y={yOf(tick)} dy="0.32em" textAnchor="end">
                      {fmt.compact(tick)}
                    </text>
                  </g>
                ))}
                {xTicks.map((tick) => (
                  <text key={tick} x={xOf(tick)} y={HEIGHT - 8} textAnchor="middle">
                    {fmt.month(tick)}
                  </text>
                ))}
                <rect
                  className="admin-chart__recent"
                  x={xOf(recentCut)}
                  y={MARGIN.top}
                  width={Math.max(0, width - MARGIN.right - xOf(recentCut))}
                  height={plotH}
                />
              </g>
              <Dots points={points} />
              {focus ? <circle className="admin-dot admin-dot--active" cx={focus.x} cy={focus.y} r={6.5} style={categoryStyle(focus.post.category)} aria-hidden="true" /> : null}
              <rect
                className="admin-chart__hit"
                x={MARGIN.left - HIT_RADIUS / 2}
                y={0}
                width={plotW + HIT_RADIUS}
                height={HEIGHT - MARGIN.bottom + HIT_RADIUS / 2}
                onPointerMove={nearest}
                onPointerLeave={() => setActive(null)}
                onClick={() => {
                  if (focus) onPick(focus.post.id)
                }}
                style={{ cursor: focus ? 'pointer' : 'default' }}
              />
            </svg>
          ) : null}
          {focus ? (
            <div className={flip ? 'admin-tip is-flipped' : 'admin-tip'} style={tipStyle} role="status">
              <strong>{t.chart.tipReads(fmt.number(focus.post.views))}</strong>
              <span className="admin-tip__title">{focus.post.title}</span>
              <span className="admin-tip__meta">
                <span className="admin-tip__key" aria-hidden="true" />
                {categoryTitles.get(focus.post.category) ?? focus.post.category}, {fmt.date(focus.post.date)}
              </span>
            </div>
          ) : null}
        </div>
        <figcaption className="admin-chart__caption">
          <Rich
            text={t.chart.caption(fmt.number(RECENT_DAYS), slot(0), slot(1))}
            values={[<b key="recent">{fmt.number(average(recent))}</b>, <b key="older">{fmt.number(average(older))}</b>]}
          />
        </figcaption>
      </figure>
      <div className="admin-bands" aria-labelledby="admin-bands-title">
        <h3 id="admin-bands-title" className="admin-bands__title">{t.chart.bandsTitle}</h3>
        <ul className="admin-bands__list">
          {bands.map((band) => (
            <li key={band.min} className="admin-band" style={{ '--ratio': band.count / bandMax } as CSSProperties}>
              <span className="admin-band__label">
                {band.max === 0
                  ? t.chart.bandNone
                  : band.max === Infinity
                    ? t.chart.bandAtLeast(fmt.number(band.min))
                    : t.chart.bandRange(fmt.number(band.min), fmt.number(band.max))}
              </span>
              <span className="admin-band__value">{fmt.number(band.count)}</span>
              <span className="admin-band__bar" aria-hidden="true">
                <span className="admin-band__fill" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
