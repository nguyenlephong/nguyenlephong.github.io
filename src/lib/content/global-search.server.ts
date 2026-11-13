import { listCategories, listPosts } from '@/lib/blog/data'
import { listNotes, listTopics } from '@/lib/notes/data'
import {
  toBlogSearchItem,
  toNoteSearchItem,
  type GlobalSearchConfig,
} from '@/lib/content/search-index'
import {
  createSearchIndex,
  versionedSearchIndexUrl,
} from '@/lib/content/search-index.server'

/**
 * URLs of the existing static indexes plus section names. Only strings reach
 * the client; the indexes themselves load on the first open of the dialog.
 */
export function globalSearchConfig(uiLocale: string): GlobalSearchConfig {
  const locale = uiLocale === 'vi' ? 'vi' : 'en'
  const blog = createSearchIndex(listPosts(locale).map(toBlogSearchItem))
  const notes = createSearchIndex(listNotes(locale).map(toNoteSearchItem))
  return {
    locale,
    blogIndexUrl: versionedSearchIndexUrl(locale, 'blog', blog.revision),
    notesIndexUrl: versionedSearchIndexUrl(locale, 'notes', notes.revision),
    blogSections: Object.fromEntries(
      listCategories(locale).map((category) => [category.slug, category.title]),
    ),
    notesSections: Object.fromEntries(
      listTopics(locale).map((topic) => [topic.id, topic.label]),
    ),
  }
}
