import { z, type RefinementCtx } from 'zod'
import {
  CONTENT_PUBLICATION_STATUSES,
  isRealContentDate,
} from '@/lib/content/publication-contract.mjs'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const contentSlugSchema = z
  .string()
  .regex(SLUG_PATTERN, 'Use a lowercase kebab-case content identifier')

export const contentDateSchema = z
  .string()
  .refine(isRealContentDate, 'Use a real ISO date in YYYY-MM-DD format')

export const contentPublicationStatusSchema = z.enum(
  CONTENT_PUBLICATION_STATUSES,
)

export const contentModeSchema = z.enum([
  'technical',
  'reflective',
  'book-reflection',
  'decision-guide',
])

export const seoTitleSchema = z
  .string()
  .trim()
  .min(1, 'SEO title must not be empty')

export const seoDescriptionSchema = z
  .string()
  .trim()
  .min(1, 'SEO description must not be empty')

export const readingMinutesSchema = z
  .number()
  .int('Reading time must be a whole number')
  .positive('Reading time must be greater than zero')

export function reportDuplicateValues<T>(
  items: readonly T[],
  key: (item: T) => string,
  ctx: RefinementCtx,
  pathPrefix: string,
): void {
  const firstIndex = new Map<string, number>()
  items.forEach((item, index) => {
    const value = key(item)
    const previous = firstIndex.get(value)
    if (previous === undefined) {
      firstIndex.set(value, index)
      return
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [pathPrefix, index],
      message: `Duplicate identifier "${value}" (first declared at index ${previous})`,
    })
  })
}
