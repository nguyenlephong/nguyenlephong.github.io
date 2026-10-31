import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { listCategories, listPosts } from '@/lib/blog/data'
import { listNotes, listTopics, NOTE_CONTENT_LOCALES } from '@/lib/notes/data'
import { FEED_ITEM_LIMIT, renderRssFeed, type FeedItem } from '@/lib/seo/feed'
import { canonicalFor } from '@/lib/seo/locale'

const FEED_TAG_LIMIT = 5

export type FeedKind = 'blog' | 'notes'

export function feedPath(kind: FeedKind): string {
  return `/${kind}/feed.xml`
}

/** Locales that publish a feed for the collection. */
export function feedLocales(kind: FeedKind): readonly string[] {
  return kind === 'notes' ? NOTE_CONTENT_LOCALES : routing.locales
}

/** `alternates.types` entry that advertises the feed to browsers and crawlers. */
export async function feedAlternateTypes(
  kind: FeedKind,
  locale: string,
): Promise<Record<string, Array<{ url: string; title: string }>>> {
  if (!feedLocales(kind).includes(locale)) return {}
  const t = await getTranslations({ locale, namespace: 'Feeds' })
  return {
    'application/rss+xml': [
      { url: canonicalFor(locale, feedPath(kind)), title: t(`${kind}Title`) },
    ],
  }
}

export function feedStaticParams(kind: FeedKind): Array<{ locale: string }> {
  return feedLocales(kind).map((locale) => ({ locale }))
}

async function collectItems(kind: FeedKind, locale: string): Promise<FeedItem[]> {
  if (kind === 'blog') {
    const categories = new Map(
      listCategories(locale).map((category) => [category.slug, category.title]),
    )
    return listPosts(locale)
      .slice(0, FEED_ITEM_LIMIT)
      .map((post) => ({
        title: post.title,
        link: canonicalFor(locale, `/blog/${post.category}/${post.slug}`),
        date: post.date,
        description: post.summary,
        categories: [
          categories.get(post.category) ?? post.category,
          ...post.tags.slice(0, FEED_TAG_LIMIT),
        ],
      }))
  }

  const topics = new Map(listTopics(locale).map((topic) => [topic.id, topic.label]))
  return listNotes(locale)
    .filter((note) => note.locales?.includes(locale as 'en' | 'vi') ?? true)
    .slice(0, FEED_ITEM_LIMIT)
    .map((note) => ({
      title: note.title,
      link: canonicalFor(locale, `/notes/${note.slug}`),
      date: note.date,
      description: note.summary,
      categories: [
        ...(note.topic ? [topics.get(note.topic) ?? note.topic] : []),
        ...note.tags.slice(0, FEED_TAG_LIMIT),
      ],
    }))
}

/** Builds the static RSS response for one collection and locale. */
export async function buildFeedResponse(
  kind: FeedKind,
  locale: string,
): Promise<Response> {
  if (!hasLocale(routing.locales, locale) || !feedLocales(kind).includes(locale)) {
    notFound()
  }
  const t = await getTranslations({ locale, namespace: 'Feeds' })
  const body = renderRssFeed({
    title: t(`${kind}Title`),
    description: t(`${kind}Description`),
    link: canonicalFor(locale, `/${kind}`),
    selfUrl: canonicalFor(locale, feedPath(kind)),
    language: locale,
    items: await collectItems(kind, locale),
  })
  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
