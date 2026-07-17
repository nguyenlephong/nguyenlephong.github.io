import { z } from 'zod'

/**
 * Zod schemas for the canonical blog content files. Used by the data layer to
 * validate `_index.json` and `posts/<slug>.json` at build time so a malformed
 * shape fails the build with a clear message. Locale overrides have their own
 * strict partial schemas: translated fields may be omitted, but unknown fields
 * and wrong types still fail the build instead of silently leaking into pages.
 */

const accent = z.enum(['ocean', 'gold', 'violet', 'dark', 'light'])
const contentLocale = z.enum(['en', 'vi', 'zh', 'ja', 'ko', 'fr'])

const category = z.object({
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  accent,
  order: z.number(),
}).strict()

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
}).strict()

const indexedPostMeta = postMeta.extend({
  locales: z
    .array(contentLocale)
    .min(1)
    .refine((locales) => new Set(locales).size === locales.length, {
      message: 'Content locales must be unique',
    }),
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
}).strict()

const faq = z.object({ q: z.string(), a: z.string() }).strict()

export const blogIndexSchema = z.object({
  categories: z.array(category),
  posts: z.array(indexedPostMeta),
})

export const blogPostSchema = postMeta.extend({
  html: z.string(),
  book: book.optional(),
  faqs: z.array(faq).optional(),
}).strict()

const categoryOverride = category.partial().extend({ slug: z.string() }).strict()
const postMetaOverride = postMeta.partial().extend({ slug: z.string() }).strict()

export const blogIndexOverrideSchema = z
  .object({
    categories: z.array(categoryOverride).optional(),
    posts: z.array(postMetaOverride).optional(),
  })
  .strict()

export const blogPostOverrideSchema = blogPostSchema.partial().strict()
