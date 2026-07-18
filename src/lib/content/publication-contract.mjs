const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export const CONTENT_PUBLICATION_STATUSES = Object.freeze(['published', 'draft'])

const publicationStatuses = new Set(CONTENT_PUBLICATION_STATUSES)

export function isRealContentDate(value) {
  if (typeof value !== 'string') return false
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function resolveContentBuildDate(configuredDate, now = new Date()) {
  if (configuredDate !== undefined) {
    if (!isRealContentDate(configuredDate)) {
      throw new Error(
        `CONTENT_BUILD_DATE must be a real UTC date in YYYY-MM-DD format; received ${JSON.stringify(configuredDate)}`,
      )
    }
    return configuredDate
  }

  const timestamp = now.getTime()
  if (Number.isNaN(timestamp)) {
    throw new Error('Cannot resolve CONTENT_BUILD_DATE from an invalid clock')
  }
  return now.toISOString().slice(0, 10)
}

export function isContentPublishedAtBuildDate(content, buildDate) {
  if (!isRealContentDate(buildDate)) {
    throw new Error(`Publication build date must be a real UTC date; received ${JSON.stringify(buildDate)}`)
  }
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    throw new Error('Publication metadata must be an object')
  }
  if (!isRealContentDate(content.date)) {
    throw new Error(`Content date must be a real UTC date; received ${JSON.stringify(content.date)}`)
  }
  if (content.publishAt !== undefined && !isRealContentDate(content.publishAt)) {
    throw new Error(
      `Content publishAt must be a real UTC date; received ${JSON.stringify(content.publishAt)}`,
    )
  }
  if (content.status !== undefined && !publicationStatuses.has(content.status)) {
    throw new Error(`Unsupported content publication status: ${JSON.stringify(content.status)}`)
  }
  if (content.status === 'draft') return false

  const releaseDate =
    content.publishAt && content.publishAt > content.date ? content.publishAt : content.date
  return releaseDate <= buildDate
}
