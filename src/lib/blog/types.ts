export type BlogAccent = 'ocean' | 'gold' | 'violet' | 'dark' | 'light'

export interface BlogCategoryMeta {
  /** URL segment, e.g. "architecture" */
  slug: string
  /** Display name, e.g. "Source & Architecture" */
  title: string
  /** Short one-liner shown under the title */
  tagline: string
  /** Longer paragraph for the category landing page + meta description */
  description: string
  /** OG theme + UI accent family */
  accent: BlogAccent
  /** Lower numbers sort first */
  order: number
}

export interface BlogPostMeta {
  slug: string
  /** Owning category slug */
  category: string
  title: string
  summary: string
  /** ISO date (yyyy-mm-dd) */
  date: string
  /** ISO date of last meaningful update */
  updated?: string
  /** Estimated reading time in minutes */
  readingMinutes: number
  tags: string[]
  author: string
  featured?: boolean
}

export interface BlogPost extends BlogPostMeta {
  /** Pre-rendered HTML body (server-trusted, authored in-repo) */
  html: string
}

export interface BlogIndexFile {
  categories: BlogCategoryMeta[]
  posts: BlogPostMeta[]
}
