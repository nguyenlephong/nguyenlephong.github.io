#!/usr/bin/env node
// Fill every <figure data-blog-diagram="…"> in blog posts with the C4 view rendered from scripts/c4/specs.mjs.
// Usage: node scripts/render-c4-diagrams.mjs [--check]
// --check exits 1 when a post is out of sync with the specs (used by tests).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fillDiagramFigures } from './c4/render.mjs'
import { C4_SPECS } from './c4/specs.mjs'

const POST_DIRS = [
  ['en', 'content/blog-data/posts'],
  ['vi', 'content/blog-data/vi/posts'],
]

export function syncC4Posts({ check = false, root = process.cwd() } = {}) {
  const specs = new Map(C4_SPECS.map((spec) => [spec.id, spec]))
  const stale = []
  for (const [locale, dir] of POST_DIRS) {
    const absolute = path.join(root, dir)
    for (const file of readdirSync(absolute).filter((name) => name.endsWith('.json'))) {
      const filePath = path.join(absolute, file)
      const raw = readFileSync(filePath, 'utf8')
      if (!raw.includes('data-blog-diagram=')) continue
      const post = JSON.parse(raw)
      const html = fillDiagramFigures(post.html, specs, locale)
      if (html === post.html) continue
      stale.push(path.join(dir, file))
      if (!check) writeFileSync(filePath, `${JSON.stringify({ ...post, html }, null, 2)}\n`)
    }
  }
  return stale
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const check = process.argv.includes('--check')
  const stale = syncC4Posts({ check })
  if (check && stale.length > 0) {
    console.error(`[c4] out of sync, run node scripts/render-c4-diagrams.mjs:\n${stale.join('\n')}`)
    process.exit(1)
  }
  console.log(check ? '[c4] posts are in sync' : `[c4] updated ${stale.length} post file(s)`)
}
