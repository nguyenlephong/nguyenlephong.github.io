export interface NoteMeta {
  slug: string
  title: string
  summary: string
  date: string
  updated?: string
  readingMinutes: number
  tags: string[]
  author?: string
}

export interface Note extends NoteMeta {
  html: string
}

export interface NotesIndexFile {
  posts: NoteMeta[]
}
