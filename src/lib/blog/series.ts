type SeriesPost = {
  date: string
  seriesOrder?: number
}

export function compareSeriesPosts(a: SeriesPost, b: SeriesPost): number {
  const aOrder = a.seriesOrder
  const bOrder = b.seriesOrder
  const aHasOrder = typeof aOrder === 'number'
  const bHasOrder = typeof bOrder === 'number'

  if (aHasOrder && bHasOrder && aOrder !== bOrder) {
    return aOrder - bOrder
  }
  if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1
  return b.date.localeCompare(a.date)
}
