import fs from 'node:fs'
import path from 'node:path'
import type { Note, NoteMeta, NotesIndexFile, TopicMeta } from './types'

const DATA_DIR = path.join(process.cwd(), 'public', 'notes-data')
const EMPTY_INDEX: NotesIndexFile = { topics: [], posts: [] }

function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
}

export function loadNotesIndex(): NotesIndexFile {
  return readJson<NotesIndexFile>(path.join(DATA_DIR, '_index.json')) ?? EMPTY_INDEX
}

export function listTopics(): TopicMeta[] {
  return loadNotesIndex().topics ?? []
}

export function listNotes(): NoteMeta[] {
  return [...loadNotesIndex().posts].sort((a, b) => b.date.localeCompare(a.date))
}

export function listNotesByTopic(): Map<string, NoteMeta[]> {
  const posts = listNotes()
  const map = new Map<string, NoteMeta[]>()
  for (const post of posts) {
    const key = post.topic ?? '__uncategorized__'
    const group = map.get(key) ?? []
    group.push(post)
    map.set(key, group)
  }
  return map
}

export function listNoteSlugs(): string[] {
  return loadNotesIndex().posts.map((p) => p.slug)
}

export function loadNote(slug: string): Note | null {
  return readJson<Note>(path.join(DATA_DIR, 'posts', `${slug}.json`))
}
