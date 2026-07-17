export const CONTENT_PAGE_SIZE = 9

export interface PageSlice<T> {
  items: T[]
  page: number
  totalItems: number
  totalPages: number
  startIndex: number
}

export function pageCount(totalItems: number, pageSize = CONTENT_PAGE_SIZE): number {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('pageSize must be a positive integer')
  }
  return Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize))
}

export function parsePageNumber(value: string): number | null {
  if (!/^\d+$/.test(value)) return null
  const page = Number(value)
  return Number.isSafeInteger(page) && page >= 1 ? page : null
}

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize = CONTENT_PAGE_SIZE,
): PageSlice<T> | null {
  const totalPages = pageCount(items.length, pageSize)
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return null

  const startIndex = (page - 1) * pageSize
  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page,
    totalItems: items.length,
    totalPages,
    startIndex,
  }
}

export function collectionPagePath(basePath: string, page: number): string {
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  return page <= 1 ? normalizedBase : `${normalizedBase}/page/${page}`
}
