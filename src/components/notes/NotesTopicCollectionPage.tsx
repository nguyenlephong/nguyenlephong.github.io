import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SITE_URL } from '@/app/seo.config'
import ContentHubPage from '@/components/content/ContentHubPage'
import {
  getNoteHub,
  getNotesByHub,
  listNoteHubPageLocales,
} from '@/lib/notes/data'
import { noteOgImageUrl } from '@/lib/og/static-images'
import { CONTENT_HUB_LOCALES } from '@/lib/content/route-contract'
import { collectionPagePath, paginate } from '@/lib/content/pagination'
import {
  buildContentHubMetadata,
  buildContentHubStructuredData,
  resolveContentHubLocale,
} from '@/lib/content/hub-page'
import { canonicalFor } from '@/lib/seo/locale'

const COPY = {
  en: {
    eyebrow: 'Notes topic',
    back: 'Notes',
    suffix: 'Notes topic',
    empty: 'No published notes yet.',
  },
  vi: {
    eyebrow: 'Chủ đề ghi chép',
    back: 'Ghi chép',
    suffix: 'Chủ đề ghi chép',
    empty: 'Chưa có ghi chép đã xuất bản.',
  },
} as const

export async function notesTopicMetadata(
  locale: string,
  topic: string,
  page: number,
): Promise<Metadata> {
  const resolvedLocale = resolveContentHubLocale(locale, CONTENT_HUB_LOCALES)
  if (!resolvedLocale) notFound()
  const availableLocales = listNoteHubPageLocales(topic, page)
  if (!availableLocales.includes(resolvedLocale)) notFound()
  const hub = getNoteHub(topic, resolvedLocale)
  const pageData = paginate(getNotesByHub(topic, resolvedLocale), page)
  if (!hub || !pageData) notFound()

  const t = await getTranslations({
    locale: resolvedLocale,
    namespace: 'Pages.notes',
  })
  const path = collectionPagePath(`/notes/topics/${topic}`, page)
  const pageLabel = t('controls.pagination.pageLabel', {
    page,
    total: pageData.totalPages,
  })
  const title =
    page === 1
      ? `${hub.title} — ${COPY[resolvedLocale].suffix}`
      : `${hub.title} — ${pageLabel}`
  const description = page === 1 ? hub.intro : `${hub.intro} ${pageLabel}.`

  return buildContentHubMetadata({
    locale: resolvedLocale,
    availableLocales,
    path,
    title,
    description,
  })
}

export default async function NotesTopicCollectionPage({
  locale,
  topic,
  page,
}: {
  locale: string
  topic: string
  page: number
}) {
  const resolvedLocale = resolveContentHubLocale(locale, CONTENT_HUB_LOCALES)
  if (!resolvedLocale) notFound()
  setRequestLocale(resolvedLocale)

  const hub = getNoteHub(topic, resolvedLocale)
  const pageData = paginate(getNotesByHub(topic, resolvedLocale), page)
  if (!hub || !pageData) notFound()

  const t = await getTranslations({
    locale: resolvedLocale,
    namespace: 'Pages.notes',
  })
  const copy = COPY[resolvedLocale]
  const basePath = `/notes/topics/${topic}`
  const path = collectionPagePath(basePath, page)
  const canonical = canonicalFor(resolvedLocale, path)
  const pageLabel =
    page > 1
      ? t('controls.pagination.pageLabel', { page, total: pageData.totalPages })
      : undefined

  const { collectionJsonLd, breadcrumbJsonLd } =
    buildContentHubStructuredData({
      canonical,
      locale: resolvedLocale,
      title: hub.title,
      description: hub.intro,
      parent: { type: 'WebSite', id: `${SITE_URL}/#website` },
      ownerRole: 'publisher',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      items: pageData.items.map((note, index) => ({
        type: 'Article',
        headline: note.title,
        url: canonicalFor(resolvedLocale, `/notes/${note.slug}`),
        image: noteOgImageUrl(note.slug),
        datePublished: note.date,
        position: pageData.startIndex + index + 1,
      })),
      breadcrumb: {
        rootName: copy.back,
        rootUrl: canonicalFor(resolvedLocale, '/notes'),
        hubName: hub.title,
        hubUrl: canonicalFor(resolvedLocale, basePath),
      },
    })

  return (
    <ContentHubPage
      kind="notes_topic"
      locale={resolvedLocale}
      hubId={topic}
      title={hub.title}
      intro={hub.intro}
      eyebrow={copy.eyebrow}
      backHref="/notes"
      backLabel={copy.back}
      pageLabel={pageLabel}
      currentPage={page}
      totalPages={pageData.totalPages}
      basePath={basePath}
      cards={pageData.items.map((note, index) => ({
        slug: note.slug,
        title: note.title,
        summary: note.cardSummary ?? note.summary,
        kicker: hub.title,
        contentCategory: note.topic ?? topic,
        href: `/notes/${note.slug}`,
        date: note.date,
        readingLabel: t('readingTime', { minutes: note.readingMinutes }),
        position: pageData.startIndex + index + 1,
      }))}
      emptyLabel={copy.empty}
      pagination={{
        label: t('controls.pagination.label'),
        previous: t('controls.pagination.prev'),
        next: t('controls.pagination.next'),
        goToPage: t('controls.pagination.goToPage', { page: '{page}' }),
      }}
      collectionJsonLd={collectionJsonLd}
      breadcrumbJsonLd={breadcrumbJsonLd}
    />
  )
}
