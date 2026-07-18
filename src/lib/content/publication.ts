import {
  CONTENT_PUBLICATION_STATUSES,
  isContentPublishedAtBuildDate,
  isRealContentDate,
  resolveContentBuildDate as resolveBuildDate,
} from './publication-contract.mjs'
import type {
  ContentPublicationFields,
  ContentPublicationStatus,
} from './publication-contract.mjs'

export { CONTENT_PUBLICATION_STATUSES, isRealContentDate }
export type { ContentPublicationFields, ContentPublicationStatus }

/**
 * Resolves one UTC calendar date for a complete static build.
 *
 * CI supplies CONTENT_BUILD_DATE so tests, route generation, sitemap output,
 * and search indexes all use the same boundary even if a build crosses
 * midnight. Local builds fall back to the UTC date captured at module load.
 */
export function resolveContentBuildDate(
  configuredDate = process.env['CONTENT_BUILD_DATE'],
  now = new Date(),
): string {
  return resolveBuildDate(configuredDate, now)
}

const contentBuildDate = resolveContentBuildDate()

export function getContentBuildDate(): string {
  return contentBuildDate
}

/**
 * One visibility rule for every public content consumer.
 *
 * The later of `date` and `publishAt` wins, so an embargo may delay a
 * backdated article but can never expose an article whose displayed
 * publication date is still in the future.
 */
export function isContentPublished(
  content: ContentPublicationFields,
  buildDate = contentBuildDate,
): boolean {
  return isContentPublishedAtBuildDate(content, buildDate)
}
