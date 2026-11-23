// Renders the C4 diagram specs in ./specs.mjs to inline SVG figures for blog posts.
// Geometry is authored by hand in the specs (editorial layout); this file only draws it
// and refuses anything that breaks the diagram rules: diagonal connectors, unknown nodes,
// labels without text, duplicate ids.

const CORNER = 8
const NODE_PAD = 16
const LEGEND_H = 56
const LABEL_FONT = 10.5
const LABEL_CHAR = 6.9
const LABEL_H = 16

const NODE_CLASS = {
  person: 'dgm-surface',
  system: 'dgm-port',
  external: 'dgm-adapter',
  container: 'dgm-port',
  component: 'dgm-port',
  store: 'dgm-driven',
}

const LEGEND_COPY = {
  en: {
    person: 'Person',
    focal: 'Focus',
    system: 'In the system',
    container: 'In the system',
    component: 'In the system',
    store: 'Data store',
    external: 'Outside',
    sync: 'Request',
    async: 'Optional, build time',
  },
  vi: {
    person: 'Người dùng',
    focal: 'Trọng tâm',
    system: 'Trong hệ thống',
    container: 'Trong hệ thống',
    component: 'Trong hệ thống',
    store: 'Lưu dữ liệu',
    external: 'Bên ngoài',
    sync: 'Gọi trực tiếp',
    async: 'Tuỳ chọn, lúc build',
  },
}

export function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

const pick = (value, locale) => (value && typeof value === 'object' && !Array.isArray(value) ? value[locale] : value)

function assertOrthogonal(points, id) {
  for (let i = 1; i < points.length; i += 1) {
    const [ax, ay] = points[i - 1]
    const [bx, by] = points[i]
    if (ax !== bx && ay !== by) throw new Error(`[c4] edge ${id} has a diagonal segment at point ${i}`)
    if (ax === bx && ay === by) throw new Error(`[c4] edge ${id} repeats point ${i}`)
  }
}

/** Orthogonal polyline with rounded corners (r = 8, smaller when a segment is short). */
export function roundedPath(points) {
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i - 1]
    const [cx, cy] = points[i]
    const [nx, ny] = points[i + 1]
    const inLen = Math.abs(cx - px) + Math.abs(cy - py)
    const outLen = Math.abs(nx - cx) + Math.abs(ny - cy)
    const r = Math.min(CORNER, inLen / 2, outLen / 2)
    const ix = cx - Math.sign(cx - px) * r
    const iy = cy - Math.sign(cy - py) * r
    const ox = cx + Math.sign(nx - cx) * r
    const oy = cy + Math.sign(ny - cy) * r
    d += ` L${ix},${iy} Q${cx},${cy} ${ox},${oy}`
  }
  const [lx, ly] = points.at(-1)
  return `${d} L${lx},${ly}`
}

function longestSegment(points) {
  let best = 0
  let bestLen = -1
  for (let i = 1; i < points.length; i += 1) {
    const len = Math.abs(points[i][0] - points[i - 1][0]) + Math.abs(points[i][1] - points[i - 1][1])
    if (len > bestLen) {
      best = i
      bestLen = len
    }
  }
  return best
}

/** Label box beside its segment: above a horizontal run, right of a vertical run, never on the stroke. */
function labelBox(points, text, edge) {
  const seg = edge.labelSegment ?? longestSegment(points)
  const [ax, ay] = points[seg - 1]
  const [bx, by] = points[seg]
  const width = Math.ceil(text.length * LABEL_CHAR + 12)
  const gap = 8
  if (ay === by) {
    const cx = (ax + bx) / 2 + (edge.labelShift ?? 0)
    const y = edge.labelSide === 'below' ? ay + gap : ay - gap - LABEL_H
    return { x: cx - width / 2, y, width, height: LABEL_H }
  }
  const cy = (ay + by) / 2 + (edge.labelShift ?? 0)
  const x = edge.labelSide === 'left' ? ax - gap - width : ax + gap
  return { x, y: cy - LABEL_H / 2, width, height: LABEL_H }
}

function renderZone(zone, locale) {
  const label = pick(zone.label, locale).toLocaleUpperCase(locale)
  const width = Math.ceil(label.length * LABEL_CHAR + 16)
  const lx = zone.labelX ?? zone.x + 16
  return [
    `<rect class="dgm-boundary" x="${zone.x}" y="${zone.y}" width="${zone.w}" height="${zone.h}" rx="10" stroke-width="1.2"/>`,
    `<rect class="dgm-mask" x="${lx}" y="${zone.y - 8}" width="${width}" height="${LABEL_H}" rx="2"/>`,
    `<text class="dgm-t-mono" x="${lx + 8}" y="${zone.y + 4}" font-size="${LABEL_FONT}" letter-spacing="0.08em">${escapeXml(label)}</text>`,
  ].join('')
}

function renderEdge(edge, diagramId, locale) {
  assertOrthogonal(edge.points, `${diagramId}:${edge.from}->${edge.to}`)
  const accent = edge.accent === true
  const cls = accent ? 'dgm-flow' : 'dgm-line'
  const marker = accent ? `c4a-${diagramId}` : `c4m-${diagramId}`
  const dash = edge.dashed ? ' stroke-dasharray="5,4"' : ''
  return `<path class="${cls}" d="${roundedPath(edge.points)}" stroke-width="${accent ? 1.8 : 1.4}"${dash} marker-end="url(#${marker})"/>`
}

function renderEdgeLabel(edge, locale) {
  const raw = pick(edge.label, locale)
  if (!raw) return ''
  const text = raw.toLocaleUpperCase(locale)
  const box = labelBox(edge.points, text, edge)
  return [
    `<rect class="dgm-mask" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="2"/>`,
    `<text class="dgm-t-mono" x="${box.x + box.width / 2}" y="${box.y + 11.5}" text-anchor="middle" font-size="${LABEL_FONT}" letter-spacing="0.06em">${escapeXml(text)}</text>`,
  ].join('')
}

function nodeShape(node, cls) {
  const { x, y, w, h } = node
  if (node.kind === 'store') {
    // A flat cylinder: the classic data-store silhouette, kept on the 4px grid.
    const r = w / 2
    return [
      `<path class="${cls}" d="M${x},${y + 8} A${r},8 0 0,1 ${x + w},${y + 8} V${y + h - 8} A${r},8 0 0,1 ${x},${y + h - 8} Z" stroke-width="1.4"/>`,
      `<path class="dgm-line" d="M${x},${y + 8} A${r},8 0 0,0 ${x + w},${y + 8}" stroke-width="1.2"/>`,
    ].join('')
  }
  const rx = node.kind === 'person' ? 18 : 8
  return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" stroke-width="${node.focal ? 1.8 : 1.4}"/>`
}

function personGlyph(node) {
  const cx = node.x + node.w - 26
  const cy = node.y + 22
  return `<circle class="dgm-line" cx="${cx}" cy="${cy}" r="6" stroke-width="1.4"/><path class="dgm-line" d="M${cx - 10},${cy + 18} a10,9 0 0,1 20,0" stroke-width="1.4"/>`
}

function renderNode(node, locale) {
  const cls = node.focal ? 'dgm-core' : NODE_CLASS[node.kind]
  if (!cls) throw new Error(`[c4] node ${node.id} has unknown kind ${node.kind}`)
  const name = pick(node.name, locale)
  const tag = pick(node.tag, locale)
  const desc = pick(node.desc, locale) ?? []
  const detail = pick(node.detail, locale)
  if (!name || !tag || !detail) throw new Error(`[c4] node ${node.id} needs name, tag and detail in ${locale}`)
  const top = node.y + (node.kind === 'store' ? 12 : 0)
  const tx = node.x + NODE_PAD
  const lines = desc
    .map(
      (line, i) =>
        `<text class="dgm-t-muted" x="${tx}" y="${top + 66 + i * 17}" font-size="12.5">${escapeXml(line)}</text>`
    )
    .join('')
  const attrs = [
    `class="c4-node"`,
    `data-c4-node="${escapeXml(node.id)}"`,
    `data-c4-kind="${node.kind}"`,
    `data-c4-name="${escapeXml(name)}"`,
    `data-c4-tag="${escapeXml(tag)}"`,
    `data-c4-detail="${escapeXml(detail)}"`,
    node.drill ? `data-c4-drill="${escapeXml(node.drill)}"` : '',
  ]
    .filter(Boolean)
    .join(' ')
  return [
    `<g ${attrs}>`,
    nodeShape(node, cls),
    node.kind === 'person' ? personGlyph(node) : '',
    `<text class="dgm-t-mono" x="${tx}" y="${top + 24}" font-size="11">${escapeXml(tag)}</text>`,
    `<text class="dgm-t-strong" x="${tx}" y="${top + 46}" font-size="16">${escapeXml(name)}</text>`,
    lines,
    `</g>`,
  ].join('')
}

function renderLegend(spec, locale, top) {
  const copy = LEGEND_COPY[locale]
  const kinds = []
  if (spec.nodes.some((n) => n.focal)) kinds.push(['focal', 'dgm-core', false])
  const seen = new Set()
  for (const node of spec.nodes) {
    if (node.focal) continue
    const label = copy[node.kind]
    if (seen.has(label)) continue
    seen.add(label)
    kinds.push([node.kind, NODE_CLASS[node.kind], node.kind === 'store'])
  }
  const items = []
  let x = 24
  for (const [kind, cls] of kinds) {
    const label = copy[kind]
    items.push(
      `<rect class="${cls}" x="${x}" y="${top + 20}" width="20" height="14" rx="${kind === 'person' ? 7 : 3}" stroke-width="1.2"/>`,
      `<text class="dgm-t-muted" x="${x + 28}" y="${top + 31}" font-size="12">${escapeXml(label)}</text>`
    )
    x += 28 + Math.ceil(label.length * 6.2) + 20
  }
  const lineKinds = [['sync', false]]
  if (spec.edges.some((e) => e.dashed)) lineKinds.push(['async', true])
  for (const [kind, dashed] of lineKinds) {
    const label = copy[kind]
    items.push(
      `<path class="dgm-line" d="M${x},${top + 27} H${x + 28}" stroke-width="1.4"${dashed ? ' stroke-dasharray="5,4"' : ''} marker-end="url(#c4m-${spec.id})"/>`,
      `<text class="dgm-t-muted" x="${x + 38}" y="${top + 31}" font-size="12">${escapeXml(label)}</text>`
    )
    x += 38 + Math.ceil(label.length * 6.2) + 20
  }
  if (x > spec.width) throw new Error(`[c4] legend of ${spec.id} is wider than the diagram (${x} > ${spec.width})`)
  return `<path class="dgm-line" d="M24,${top + 4} H${spec.width - 24}" stroke-width="1"/>${items.join('')}`
}

function validate(spec) {
  const ids = new Set()
  for (const node of spec.nodes) {
    if (ids.has(node.id)) throw new Error(`[c4] ${spec.id} repeats node id ${node.id}`)
    ids.add(node.id)
    for (const v of [node.x, node.y, node.w, node.h]) {
      if (v % 4 !== 0) throw new Error(`[c4] ${spec.id}:${node.id} is off the 4px grid (${v})`)
    }
    if (node.x + node.w > spec.width || node.y + node.h > spec.height) {
      throw new Error(`[c4] ${spec.id}:${node.id} leaves the viewBox`)
    }
  }
  for (const edge of spec.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      if (edge.from !== 'outside') throw new Error(`[c4] ${spec.id} edge ${edge.from}->${edge.to} names a missing node`)
    }
  }
  if (spec.nodes.filter((n) => n.focal).length > 2) throw new Error(`[c4] ${spec.id} has more than 2 focal nodes`)
}

/** One C4 view as a blog figure: inline SVG plus caption, with data attributes for the viewer. */
export function renderC4Figure(spec, locale) {
  validate(spec)
  const prefix = `c4-${spec.id}-${locale}`
  const height = spec.height + LEGEND_H
  const title = pick(spec.title, locale)
  const desc = pick(spec.desc, locale)
  const caption = pick(spec.caption, locale)
  const level = pick(spec.levelLabel, locale)
  const markers = [
    `<marker id="c4m-${spec.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path class="dgm-line" d="M1,1 L9,5 L1,9" stroke-width="1.6"/></marker>`,
    `<marker id="c4a-${spec.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path class="dgm-flow" d="M1,1 L9,5 L1,9" stroke-width="1.6"/></marker>`,
  ].join('')
  const svg = [
    `<svg class="dgm-svg c4-svg" viewBox="0 0 ${spec.width} ${height}" role="img" aria-labelledby="${prefix}-title ${prefix}-desc">`,
    `<title id="${prefix}-title">${escapeXml(title)}</title>`,
    `<desc id="${prefix}-desc">${escapeXml(desc)}</desc>`,
    `<defs>${markers}</defs>`,
    (spec.zones ?? []).map((z) => renderZone(z, locale)).join(''),
    spec.edges.map((e) => renderEdge(e, spec.id, locale)).join(''),
    spec.nodes.map((n) => renderNode(n, locale)).join(''),
    spec.edges.map((e) => renderEdgeLabel(e, locale)).join(''),
    renderLegend(spec, locale, spec.height),
    `</svg>`,
  ].join('')
  return [
    `<figure class="blog-figure blog-c4" id="${escapeXml(spec.id)}" data-blog-diagram="${escapeXml(spec.id)}" data-c4-group="${escapeXml(spec.group)}" data-c4-level="${escapeXml(level)}">`,
    svg,
    `<figcaption>${escapeXml(caption)}</figcaption>`,
    `</figure>`,
  ].join('')
}

const FIGURE_PATTERN = /<figure\b[^>]*\bdata-blog-diagram="([a-z0-9-]+)"[^>]*>[\s\S]*?<\/figure>/g

/** Replace every diagram figure (or its empty placeholder) in post HTML with a fresh render. */
export function fillDiagramFigures(html, specsById, locale) {
  return html.replace(FIGURE_PATTERN, (match, id) => {
    const spec = specsById.get(id)
    if (!spec) throw new Error(`[c4] post references unknown diagram ${id}`)
    return renderC4Figure(spec, locale)
  })
}
