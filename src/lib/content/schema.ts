import { z, type RefinementCtx } from 'zod'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function isRealIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export const contentSlugSchema = z.string().regex(SLUG_PATTERN, 'Use a lowercase kebab-case content identifier')

export const contentDateSchema = z.string().refine(isRealIsoDate, 'Use a real ISO date in YYYY-MM-DD format')

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
