import { z } from 'zod'

/**
 * Zod schemas for the canonical blog content files. Used by the data layer to
 * validate `_index.json` and `posts/<slug>.json` at build time so a malformed
 * shape fails the build with a clear message. Per-locale override files are
 * partial translations and are intentionally not validated here.
 */

const accent = z.enum(['ocean', 'gold', 'violet', 'dark', 'light'])

const category = z.object({
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  accent,
  order: z.number(),
})

const postMeta = z.object({
  slug: z.string(),
  category: z.string(),
  title: z.string(),
  summary: z.string(),
  date: z.string(),
  updated: z.string().optional(),
  readingMinutes: z.number(),
  tags: z.array(z.string()),
  author: z.string(),
  featured: z.boolean().optional(),
  series: z.string().optional(),
  seriesOrder: z.number().optional(),
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

export const blogIndexSchema = z.object({
  categories: z.array(category),
  posts: z.array(postMeta),
})

export const blogPostSchema = postMeta.extend({
  html: z.string(),
  book: book.optional(),
  faqs: z.array(faq).optional(),
})
