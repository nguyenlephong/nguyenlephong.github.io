/** "Section: descriptor" on page one, "Section: Page n of m" on later archive pages. */
export function collectionPageTitle(
  page: number,
  title: string,
  eyebrow: string,
  pageLabel: string,
): string {
  return `${title}: ${page === 1 ? eyebrow : pageLabel}`
}
