import { z } from 'zod'
import {
  contentDateSchema,
  contentPublicationStatusSchema,
  contentSlugSchema,
  readingMinutesSchema,
  reportDuplicateValues,
} from '@/lib/content/schema'

/**
 * Zod schemas for the canonical notes content files (`_index.json`,
 * `posts/<slug>.json`). Locale overrides use strict partial schemas so omitted
 * translated fields can inherit canonical values without accepting malformed
 * or unknown data.
 */

const topic = z.object({
  id: contentSlugSchema,
  label: z.string(),
  description: z.string(),
  color: z.string(),
}).strict()

const contentLocale = z.enum(['en', 'vi'])

const noteMeta = z.object({
  slug: contentSlugSchema,
  title: z.string(),
  summary: z.string(),
  cardSummary: z.string().optional(),
  date: contentDateSchema,
  updated: contentDateSchema.optional(),
  publishAt: contentDateSchema.optional(),
  status: contentPublicationStatusSchema.optional(),
  readingMinutes: readingMinutesSchema,
  tags: z.array(z.string()),
  topic: contentSlugSchema.optional(),
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

export const notesIndexSchema = z
  .object({
    topics: z.array(topic),
    posts: z.array(indexedNoteMeta),
  })
  .superRefine((index, ctx) => {
    reportDuplicateValues(index.topics, (entry) => entry.id, ctx, 'topics')
    reportDuplicateValues(index.posts, (entry) => entry.slug, ctx, 'posts')
    const topics = new Set(index.topics.map((entry) => entry.id))
    index.posts.forEach((post, postIndex) => {
      if (post.topic && !topics.has(post.topic)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['posts', postIndex, 'topic'],
          message: `Unknown topic "${post.topic}"`,
        })
      }
    })
  })

export const noteSchema = noteMeta.extend({
  html: z.string(),
  book: book.optional(),
  faqs: z.array(faq).optional(),
}).strict()

const topicOverride = topic
  .pick({ id: true, label: true, description: true, color: true })
  .partial()
  .extend({ id: contentSlugSchema })
  .strict()
const noteMetaOverride = noteMeta
  .pick({
    slug: true,
    title: true,
    summary: true,
    cardSummary: true,
    date: true,
    updated: true,
    publishAt: true,
    status: true,
    readingMinutes: true,
    tags: true,
    topic: true,
    author: true,
    featured: true,
  })
  .partial()
  .extend({ slug: contentSlugSchema })
  .strict()

export const notesIndexOverrideSchema = z
  .object({
    topics: z.array(topicOverride).optional(),
    posts: z.array(noteMetaOverride).optional(),
  })
  .strict()

export const noteOverrideSchema = noteSchema
  .pick({
    slug: true,
    title: true,
    summary: true,
    cardSummary: true,
    date: true,
    updated: true,
    publishAt: true,
    status: true,
    readingMinutes: true,
    tags: true,
    topic: true,
    author: true,
    featured: true,
    baseLocale: true,
    locales: true,
    html: true,
    book: true,
    faqs: true,
  })
  .partial()
  .strict()
