import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SITE, SITE_URL } from '@/app/seo.config'
import { routing, type Locale } from '@/i18n/routing'
import { OG_LOCALE_MAP, canonicalFor, localeAlternates } from '@/lib/seo/locale'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import { collectionPagePath, paginate } from '@/lib/content/pagination'
import { toNoteSearchItem } from '@/lib/content/search-index'
import {
  createSearchIndex,
  versionedSearchIndexUrl,
} from '@/lib/content/search-index.server'
import {
  getNoteContentLocales,
  listNotes,
  listNotesArchiveLocales,
  listNoteHubs,
  listTopics,
  NOTE_CONTENT_LOCALES,
} from '@/lib/notes/data'
import { noteOgImageUrl } from '@/lib/og/static-images'
import ContentHubPageTracker from '@/components/analytics/ContentHubPageTracker'
import PageTracker from '@/components/analytics/PageTracker'
import NotesExplorer from '@/components/notes/NotesExplorer'
import ScopedIntlProvider from '@/i18n/ScopedIntlProvider'

export const FALLBACK_TOPIC_COLOR = '#b45309'
const POPULAR_TAG_LIMIT = 12

function popularTags(notes: { tags: string[] }[]): string[] {
  const counts = new Map<string, number>()
  for (const note of notes) {
    for (const tag of note.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, POPULAR_TAG_LIMIT)
    .map(([tag]) => tag)
}

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function notesPageCount(locale: string): number {
  return paginate(listNotes(locale), 1)?.totalPages ?? 1
}

export async function notesCollectionMetadata(
  locale: string,
  page: number,
): Promise<Metadata> {
  if (!hasLocale(routing.locales, locale)) notFound()
  const archiveLocale = NOTE_CONTENT_LOCALES.includes(locale as 'en' | 'vi')
    ? (locale as 'en' | 'vi')
    : 'en'
  const pageData = paginate(listNotes(archiveLocale), page)
  if (!pageData) notFound()

  const t = await getTranslations({ locale, namespace: 'Pages.notes' })
  const path = collectionPagePath('/notes', page)
  const pageLabel = t('controls.pagination.pageLabel', {
    page,
    total: pageData.totalPages,
  })
  const title =
    page === 1
      ? `${t('title')} — ${t('eyebrow')}`
      : `${t('title')} — ${pageLabel}`
  const description =
    page === 1
      ? t('intro')
      : t('controls.pagination.pageDescription', {
          page,
          total: pageData.totalPages,
        })
  const canonical = canonicalFor(archiveLocale, path)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: localeAlternates(path, listNotesArchiveLocales(page)),
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[archiveLocale as Locale] ?? OG_LOCALE_MAP.en,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE.twitter,
      creator: SITE.twitter,
    },
    robots: {
      // Canonical consolidation is the indexing signal for fallback landings.
      // Combining it with noindex can prevent Google from consolidating links.
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

interface NotesCollectionPageProps {
  locale: string
  page: number
}

export default async function NotesCollectionPage({
  locale,
  page,
}: NotesCollectionPageProps) {
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Pages.notes' })
  const archiveLocale = NOTE_CONTENT_LOCALES.includes(locale as 'en' | 'vi')
    ? (locale as 'en' | 'vi')
    : 'en'
  const notes = listNotes(archiveLocale)
  const topics = listTopics(archiveLocale)
  const hasCuratedHubs = locale === 'en' || locale === 'vi'
  const hubCatalog = hasCuratedHubs ? listNoteHubs(archiveLocale) : []
  const pageData = paginate(notes, page)
  if (!pageData) notFound()
  const searchRevision = createSearchIndex(notes.map(toNoteSearchItem)).revision

  const topicBySlug = new Map(topics.map((topic) => [topic.id, topic]))
  const latestDate = notes[0]?.date
  const path = collectionPagePath('/notes', page)
  const canonical = canonicalFor(archiveLocale, path)
  const pageLabel = t('controls.pagination.pageLabel', {
    page,
    total: pageData.totalPages,
  })

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonical}#notes`,
    name: `${t('title')} — ${t('eyebrow')}`,
    description: t('intro'),
    url: canonical,
    inLanguage: archiveLocale,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: pageData.items.length,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      itemListElement: pageData.items.map((note, index) => {
        const noteLocale = getNoteContentLocales(note.slug).includes(
          archiveLocale,
        )
          ? archiveLocale
          : 'en'
        return {
          '@type': 'ListItem',
          position: pageData.startIndex + index + 1,
          item: {
            '@type': 'Article',
            headline: note.title,
            url: canonicalFor(noteLocale, `/notes/${note.slug}`),
            image: noteOgImageUrl(note.slug),
            datePublished: note.date,
          },
        }
      }),
    },
  }

  return (
    <main className="notes-archive notes-home">
      {page === 1 && hasCuratedHubs ? (
        <ContentHubPageTracker
          page="notes"
          eventName="notes_view"
          section="index"
        />
      ) : (
        <PageTracker
          page="notes"
          eventName="notes_view"
          section={page === 1 ? 'index' : `index_page_${page}`}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionLd) }}
      />
      <header className="notes-archive__title-page">
        <p className="notes-archive__eyebrow">{t('eyebrow')}</p>
        <h1 className="notes-archive__title">{t('title')}</h1>
        <p className="notes-archive__subtitle">{t('intro')}</p>
        {page > 1 && <p className="content-page-label">{pageLabel}</p>}
        <div className="notes-archive__rule" aria-hidden="true" />
        <dl className="notes-archive__stats">
          <div>
            <dt>{t('stats.topics')}</dt>
            <dd>{topics.length}</dd>
          </div>
          <div>
            <dt>{t('stats.articles')}</dt>
            <dd>{notes.length}</dd>
          </div>
          {latestDate && (
            <div>
              <dt>{t('stats.updated')}</dt>
              <dd>{formatDate(latestDate, locale)}</dd>
            </div>
          )}
        </dl>
      </header>

      {page === 1 && hubCatalog.length > 0 && (
        <section
          className="blog-home__section"
          aria-labelledby="notes-hubs-heading"
        >
          <h2 id="notes-hubs-heading" className="blog-home__section-title">
            {locale === 'vi' ? 'Đọc theo chủ đề' : 'Read by topic'}
          </h2>
          <div className="content-hub-catalog">
            {hubCatalog.map((hub) => (
              <a
                key={hub.topic}
                href={`/${archiveLocale}/notes/topics/${hub.topic}`}
                className="content-hub-catalog__link"
                data-content-hub-action="catalog"
                data-content-hub-kind="notes_topic"
                data-content-hub-id={hub.topic}
                data-content-hub-page="1"
                data-source="notes_index"
              >
                <h3 className="content-hub-catalog__title">{hub.title}</h3>
                <p className="content-hub-catalog__intro">{hub.intro}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <ScopedIntlProvider scope="notes">
        {pageData.items.length > 0 ? (
          <NotesExplorer
            cards={pageData.items.map((note) => {
              const topic = note.topic ? topicBySlug.get(note.topic) : undefined
              return {
                note,
                topicLabel: topic?.label ?? note.topic ?? '',
                topicColor: topic?.color ?? FALLBACK_TOPIC_COLOR,
                readingLabel: t('readingTime', {
                  minutes: note.readingMinutes,
                }),
              }
            })}
            topics={topics.map((topic) => ({
              id: topic.id,
              label: topic.label,
              color: topic.color,
            }))}
            popularTags={popularTags(notes)}
            locale={locale}
            archiveLocale={archiveLocale}
            currentPage={page}
            totalPages={pageData.totalPages}
            totalItems={pageData.totalItems}
            searchIndexUrl={versionedSearchIndexUrl(
              archiveLocale,
              'notes',
              searchRevision,
            )}
            fallbackTopicColor={FALLBACK_TOPIC_COLOR}
          />
        ) : (
          <p className="blog-empty">{t('empty')}</p>
        )}
      </ScopedIntlProvider>
    </main>
  )
}
