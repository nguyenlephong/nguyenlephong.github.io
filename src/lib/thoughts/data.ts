import fs from 'node:fs'
import path from 'node:path'
import type { ThoughtApiResponse, ThoughtGraphFile } from './types'

const DATA_DIR = path.join(process.cwd(), 'public', 'thoughts-data')

const EMPTY_GRAPH: ThoughtGraphFile = { thoughts: {}, edges: [] }

export function loadGraph(): ThoughtGraphFile {
  const file = path.join(DATA_DIR, '_graph.json')
  if (!fs.existsSync(file)) return EMPTY_GRAPH
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as ThoughtGraphFile
}

export function loadThought(slug: string): ThoughtApiResponse | null {
  const file = path.join(DATA_DIR, 'thoughts', `${slug}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as ThoughtApiResponse
}

export function listThoughtSlugs(): string[] {
  const dir = path.join(DATA_DIR, 'thoughts')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
}
