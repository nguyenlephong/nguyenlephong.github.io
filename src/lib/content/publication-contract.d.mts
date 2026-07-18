export const CONTENT_PUBLICATION_STATUSES: readonly ['published', 'draft']

export type ContentPublicationStatus = (typeof CONTENT_PUBLICATION_STATUSES)[number]

export interface ContentPublicationFields {
  date: string
  publishAt?: string
  status?: ContentPublicationStatus
}

export function isRealContentDate(value: unknown): value is string

export function resolveContentBuildDate(configuredDate?: string, now?: Date): string

export function isContentPublishedAtBuildDate(
  content: ContentPublicationFields,
  buildDate: string,
): boolean
