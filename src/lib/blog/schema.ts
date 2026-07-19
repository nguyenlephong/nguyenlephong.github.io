import { z } from 'zod'
import {
  contentDateSchema,
  contentModeSchema,
  contentPublicationStatusSchema,
  contentSlugSchema,
  readingMinutesSchema,
  reportDuplicateValues,
  seoDescriptionSchema,
  seoTitleSchema,
} from '@/lib/content/schema'
import {
  BLOG_RESERVED_ARTICLE_SEGMENTS,
  BLOG_RESERVED_CATEGORY_SEGMENTS,
  BLOG_RESERVED_SERIES_SEGMENTS,
} from '@/lib/content/route-contract'

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
  slug: contentSlugSchema,
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  accent,
  order: z.number().int(),
}).strict()

const series = z.object({
  id: contentSlugSchema,
  title: z.string().trim().min(1),
  intro: z.string().trim().min(1),
  order: z.number().int().positive(),
}).strict()

const postMeta = z.object({
  slug: contentSlugSchema,
  category: contentSlugSchema,
  title: z.string(),
  summary: z.string(),
  date: contentDateSchema,
  updated: contentDateSchema.optional(),
  publishAt: contentDateSchema.optional(),
  status: contentPublicationStatusSchema.optional(),
  readingMinutes: readingMinutesSchema,
  tags: z.array(z.string()),
  author: z.string(),
  contentMode: contentModeSchema.optional(),
  seoTitle: seoTitleSchema.optional(),
  seoDescription: seoDescriptionSchema.optional(),
  reviewedAt: contentDateSchema.optional(),
  featured: z.boolean().optional(),
  series: z.string().optional(),
  seriesOrder: z.number().int().positive().optional(),
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

export const blogIndexSchema = z
  .object({
    series: z.array(series).default([]),
    categories: z.array(category),
    posts: z.array(indexedPostMeta),
  })
  .superRefine((index, ctx) => {
    reportDuplicateValues(index.series, (entry) => entry.id, ctx, 'series')
    reportDuplicateValues(
      index.series,
      (entry) => String(entry.order),
      ctx,
      'series',
    )
    reportDuplicateValues(index.categories, (entry) => entry.slug, ctx, 'categories')
    reportDuplicateValues(index.posts, (entry) => entry.slug, ctx, 'posts')
    const expectedOrders = index.series.map((_, entryIndex) => entryIndex + 1)
    const actualOrders = index.series
      .map((entry) => entry.order)
      .sort((a, b) => a - b)
    if (
      actualOrders.some(
        (order, entryIndex) => order !== expectedOrders[entryIndex],
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['series'],
        message: 'Blog series order must be contiguous from 1',
      })
    }
    const categories = new Set(index.categories.map((entry) => entry.slug))
    const seriesIds = new Set(index.series.map((entry) => entry.id))
    index.categories.forEach((entry, categoryIndex) => {
      if (BLOG_RESERVED_CATEGORY_SEGMENTS.has(entry.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categories', categoryIndex, 'slug'],
          message: `Category slug "${entry.slug}" collides with a static Blog route`,
        })
      }
    })
    index.series.forEach((entry, seriesIndex) => {
      if (BLOG_RESERVED_SERIES_SEGMENTS.has(entry.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['series', seriesIndex, 'id'],
          message: `Series id "${entry.id}" collides with a static Blog route`,
        })
      }
    })
    const ordersBySeries = new Map<string, Map<number, number>>()
    index.posts.forEach((post, postIndex) => {
      if (BLOG_RESERVED_ARTICLE_SEGMENTS.has(post.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['posts', postIndex, 'slug'],
          message: `Post slug "${post.slug}" collides with a static Blog route`,
        })
      }
      if (!categories.has(post.category)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['posts', postIndex, 'category'],
          message: `Unknown category "${post.category}"`,
        })
      }
      if (post.series && !seriesIds.has(post.series)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['posts', postIndex, 'series'],
          message: `Unknown series "${post.series}"`,
        })
      }
      if (post.series && post.seriesOrder === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['posts', postIndex, 'seriesOrder'],
          message: 'A series post must declare seriesOrder',
        })
      }
      if (!post.series && post.seriesOrder !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['posts', postIndex, 'seriesOrder'],
          message: 'seriesOrder requires a series',
        })
      }
      if (post.series && post.seriesOrder !== undefined) {
        const usedOrders =
          ordersBySeries.get(post.series) ?? new Map<number, number>()
        const previousPost = usedOrders.get(post.seriesOrder)
        if (previousPost !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['posts', postIndex, 'seriesOrder'],
            message: `Duplicate seriesOrder ${post.seriesOrder} (first declared at posts.${previousPost})`,
          })
        } else {
          usedOrders.set(post.seriesOrder, postIndex)
          ordersBySeries.set(post.series, usedOrders)
        }
      }
    })
    for (const seriesId of seriesIds) {
      const orders = [...(ordersBySeries.get(seriesId)?.keys() ?? [])].sort(
        (a, b) => a - b,
      )
      if (orders.length === 0) continue
      if (orders.some((order, orderIndex) => order !== orderIndex + 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['series'],
          message: `Series "${seriesId}" post order must be contiguous from 1`,
        })
      }
    }
  })

export const blogPostSchema = postMeta.extend({
  html: z.string(),
  book: book.optional(),
  faqs: z.array(faq).optional(),
}).strict()

const categoryOverride = category
  .pick({
    slug: true,
    title: true,
    tagline: true,
    description: true,
    accent: true,
    order: true,
  })
  .partial()
  .extend({ slug: contentSlugSchema })
  .strict()
const seriesOverride = series
  .pick({ id: true, title: true, intro: true, order: true })
  .partial()
  .extend({ id: contentSlugSchema })
  .strict()
const postMetaOverride = postMeta
  .pick({
    slug: true,
    category: true,
    title: true,
    summary: true,
    date: true,
    updated: true,
    publishAt: true,
    status: true,
    readingMinutes: true,
    tags: true,
    author: true,
    contentMode: true,
    seoTitle: true,
    seoDescription: true,
    reviewedAt: true,
    featured: true,
    series: true,
    seriesOrder: true,
  })
  .partial()
  .extend({ slug: contentSlugSchema })
  .strict()

export const blogIndexOverrideSchema = z
  .object({
    series: z.array(seriesOverride).optional(),
    categories: z.array(categoryOverride).optional(),
    posts: z.array(postMetaOverride).optional(),
  })
  .strict()

export const blogPostOverrideSchema = blogPostSchema
  .pick({
    slug: true,
    category: true,
    title: true,
    summary: true,
    date: true,
    updated: true,
    publishAt: true,
    status: true,
    readingMinutes: true,
    tags: true,
    author: true,
    contentMode: true,
    seoTitle: true,
    seoDescription: true,
    reviewedAt: true,
    featured: true,
    series: true,
    seriesOrder: true,
    html: true,
    book: true,
    faqs: true,
  })
  .partial()
  .strict()
