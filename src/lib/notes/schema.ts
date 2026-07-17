import { z } from 'zod'

/**
 * Zod schemas for the canonical notes content files (`_index.json`,
 * `posts/<slug>.json`). Locale overrides use strict partial schemas so omitted
 * translated fields can inherit canonical values without accepting malformed
 * or unknown data.
 */

const topic = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  color: z.string(),
}).strict()

const contentLocale = z.enum(['en', 'vi'])

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
  baseLocale: contentLocale.optional(),
  locales: z.array(contentLocale).optional(),
}).strict()

const indexedNoteMeta = noteMeta.extend({
  baseLocale: contentLocale,
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

export const notesIndexSchema = z.object({
  topics: z.array(topic),
  posts: z.array(indexedNoteMeta),
})

export const noteSchema = noteMeta.extend({
  html: z.string(),
  book: book.optional(),
  faqs: z.array(faq).optional(),
}).strict()

const topicOverride = topic.partial().extend({ id: z.string() }).strict()
const noteMetaOverride = noteMeta.partial().extend({ slug: z.string() }).strict()

export const notesIndexOverrideSchema = z
  .object({
    topics: z.array(topicOverride).optional(),
    posts: z.array(noteMetaOverride).optional(),
  })
  .strict()

export const noteOverrideSchema = noteSchema.partial().strict()
