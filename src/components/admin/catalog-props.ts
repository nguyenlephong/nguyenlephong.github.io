import type { AdminLocale } from './admin-locale'

/** One catalog entry, trimmed at build time to what the dashboard shows. */
export interface AdminCatalogPost {
  slug: string
  category: string
  title: string
  date: string
  /** Set only when the post has no English version. */
  locale?: string
}

/** Vietnamese titles from the vi indexes, keyed by postStats id (`category__slug`) and category slug. */
export interface AdminCatalogVi {
  titles: Record<string, string>
  categories: Record<string, string>
}

/** Build-time catalog the server page hands to the client dashboard. */
export interface AdminCatalogProps {
  blog: { categories: Array<{ slug: string; title: string }>; posts: AdminCatalogPost[] }
  notes: { posts: AdminCatalogPost[] }
  vi: AdminCatalogVi
}

/**
 * The catalog in the reader's language. In Vietnamese, posts with a VI version
 * use its title and link to /vi; everything else keeps the catalog as written.
 */
export function localizeCatalog(catalog: AdminCatalogProps, locale: AdminLocale): AdminCatalogProps {
  if (locale === 'en') return catalog
  const localize = (post: AdminCatalogPost): AdminCatalogPost => {
    const title = catalog.vi.titles[`${post.category}__${post.slug}`]
    return title ? { ...post, title, locale: 'vi' } : post
  }
  return {
    ...catalog,
    blog: {
      // 'notes' is listed here so the insights builder picks up its VI name too.
      categories: [
        ...catalog.blog.categories.map((category) => ({ ...category, title: catalog.vi.categories[category.slug] ?? category.title })),
        { slug: 'notes', title: catalog.vi.categories['notes'] ?? 'Notes' },
      ],
      posts: catalog.blog.posts.map(localize),
    },
    notes: { posts: catalog.notes.posts.map(localize) },
  }
}
