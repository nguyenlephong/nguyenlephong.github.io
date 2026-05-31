export interface NoteMeta {
  slug: string
  title: string
  summary: string
  date: string
  updated?: string
  readingMinutes: number
  tags: string[]
  topic?: string
  author?: string
}

export interface Note extends NoteMeta {
  html: string
}

export interface TopicMeta {
  id: string
  label: string
  description: string
  color: string
}

export interface NotesIndexFile {
  topics: TopicMeta[]
  posts: NoteMeta[]
}
