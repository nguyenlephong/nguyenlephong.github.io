import { z } from 'zod'

/**
 * Zod schemas for the canonical notes content files (`_index.json`,
 * `posts/<slug>.json`). Validated at build time; per-locale override files are
 * partial translations and are intentionally not validated here.
 */

const topic = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  color: z.string(),
})

const noteMeta = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  cardSummary: z.string().optional(),
  date: z.string(),
  updated: z.string().optional(),
  readingMinutes: z.number(),
  tags: z.array(z.string()),
  topic: z.string().optional(),
  author: z.string().optional(),
  featured: z.boolean().optional(),
  baseLocale: z.string().optional(),
  locales: z.array(z.string()).optional(),
})

const book = z.object({
  title: z.string(),
  originalTitle: z.string().optional(),
  authors: z.array(z.string()),
  contributors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  published: z.string().optional(),
  isbn: z.string().optional(),
  note: z.string().optional(),
})

const faq = z.object({ q: z.string(), a: z.string() })

export const notesIndexSchema = z.object({
  topics: z.array(topic),
  posts: z.array(noteMeta),
})

export const noteSchema = noteMeta.extend({
  html: z.string(),
  book: book.optional(),
  faqs: z.array(faq).optional(),
})
