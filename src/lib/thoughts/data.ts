import fs from 'node:fs'
import path from 'node:path'
import { isDefaultLocale, readJson } from '@/lib/content/io'
import type { ThoughtApiResponse, ThoughtGraphFile } from './types'

const DATA_DIR = path.join(process.cwd(), 'public', 'thoughts-data')

const EMPTY_GRAPH: ThoughtGraphFile = { thoughts: {}, edges: [] }

/**
 * Loads the canonical graph and, when a per-locale override exists, swaps in
 * translated titles (and any translated backlink titles/contexts) on top of
 * the canonical edges. Untranslated thoughts keep their English title so the
 * graph remains complete instead of going blank.
 */
export function loadGraph(locale?: string): ThoughtGraphFile {
  const base = readJson<ThoughtGraphFile>(path.join(DATA_DIR, '_graph.json'))
  if (!base) return EMPTY_GRAPH

  if (isDefaultLocale(locale)) return base

  const overrideFile = path.join(DATA_DIR, locale as string, '_graph.json')
  const override = readJson<ThoughtGraphFile>(overrideFile)
  if (!override) return base

  const merged: ThoughtGraphFile = {
    edges: base.edges,
    thoughts: { ...base.thoughts },
  }
  for (const [slug, baseThought] of Object.entries(base.thoughts)) {
    const o = override.thoughts[slug]
    merged.thoughts[slug] = {
      ...baseThought,
      title: o?.title ?? baseThought.title,
      backlinks: o?.backlinks ?? baseThought.backlinks,
    }
  }
  return merged
}

export function loadThought(
  slug: string,
  locale?: string,
): ThoughtApiResponse | null {
  const base = readJson<ThoughtApiResponse>(
    path.join(DATA_DIR, 'thoughts', `${slug}.json`),
  )
  if (!base) return null
  if (isDefaultLocale(locale)) return base

  const override = readJson<Partial<ThoughtApiResponse>>(
    path.join(DATA_DIR, locale as string, 'thoughts', `${slug}.json`),
  )
  if (!override) return base

  return {
    ...base,
    title: override.title ?? base.title,
    html: override.html ?? base.html,
    backlinks: override.backlinks ?? base.backlinks,
  }
}

export function listThoughtSlugs(): string[] {
  const dir = path.join(DATA_DIR, 'thoughts')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
}
