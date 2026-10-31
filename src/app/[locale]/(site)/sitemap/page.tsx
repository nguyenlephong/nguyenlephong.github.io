import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SITE, SITE_URL } from '@/app/seo.config'
import PageTracker from '@/components/analytics/PageTracker'
import { routing, type Locale } from '@/i18n/routing'
import {
  getPostsBySeries,
  listBlogSeries,
  listCategories,
  listPosts,
} from '@/lib/blog/data'
import { collectionPagePath, paginate } from '@/lib/content/pagination'
import {
  getNotesByHub,
  listNoteHubs,
  listNotes,
  listTopics,
  NOTE_CONTENT_LOCALES,
} from '@/lib/notes/data'
import { feedLocales, feedPath } from '@/lib/seo/content-feeds'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import { OG_LOCALE_MAP, canonicalFor, localeAlternates } from '@/lib/seo/locale'
import {
  SITE_INDEX_PATH,
  archivePageNumbers,
  groupNotesByTopic,
  groupPostsByCategory,
} from '@/lib/seo/site-index'
import { staticPageSitemapLocales } from '@/lib/seo/static-page-localization'
import './sitemap.css'

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations({ locale, namespace: 'SiteIndex' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  const canonical = canonicalFor(locale, SITE_INDEX_PATH)

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: localeAlternates(SITE_INDEX_PATH),
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale as Locale] ?? OG_LOCALE_MAP.en,
      alternateLocale: routing.locales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => OG_LOCALE_MAP[candidate]),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      site: SITE.twitter,
      creator: SITE.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

interface HubLink {
  href: string
  label: string
}

export default async function SiteIndexPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'SiteIndex' })
  const base = `/${locale}`
  const hasCuratedHubs = locale === 'en' || locale === 'vi'
  const hasNotes = (NOTE_CONTENT_LOCALES as readonly string[]).includes(locale)
  const pageLabel = (page: number) => t('pageLabel', { page })

  // Static pages only exist as authored content in some locales; the others
  // canonicalize to the default locale, so link to the authored copy directly.
  const staticHref = (page: 'about' | 'apps' | 'gallery', path: string) => {
    const authored = staticPageSitemapLocales(page).includes(locale as Locale)
    return `/${authored ? locale : routing.defaultLocale}${path}`
  }
  const sections: HubLink[] = [
    { href: base, label: t('sections.home') },
    { href: staticHref('about', '/about'), label: t('sections.about') },
    { href: staticHref('apps', '/apps'), label: t('sections.apps') },
    { href: staticHref('gallery', '/gallery'), label: t('sections.gallery') },
    { href: `${base}/blog`, label: t('sections.blog') },
    {
      href: hasNotes ? `${base}/notes` : `/${routing.defaultLocale}/notes`,
      label: t('sections.notes'),
    },
    { href: `${base}/studio`, label: t('sections.studio') },
  ]

  const posts = listPosts(locale)
  const postGroups = groupPostsByCategory(posts, listCategories(locale))
  const series = hasCuratedHubs
    ? listBlogSeries(locale).map((entry) => ({
        ...entry,
        totalPages:
          paginate(getPostsBySeries(entry.id, locale), 1)?.totalPages ?? 1,
      }))
    : []

  const notes = hasNotes
    ? listNotes(locale).filter(
        (note) => note.locales?.includes(locale as Locale) ?? true,
      )
    : []
  const hubs = hasCuratedHubs
    ? listNoteHubs(locale).map((hub) => ({
        ...hub,
        totalPages:
          paginate(getNotesByHub(hub.topic, locale), 1)?.totalPages ?? 1,
      }))
    : []
  const hubTitles = new Map(hubs.map((hub) => [hub.topic, hub.title]))
  const noteGroups = groupNotesByTopic(
    notes,
    listTopics(locale).map((topic) => ({ id: topic.id, label: topic.label })),
    hubs.map((hub) => hub.topic),
  )

  // Pages 2..N of every paginated archive and hub, so each one is linked from
  // a plain HTML page and not only from the client-side pager.
  const archiveLinks: HubLink[] = [
    ...archivePageNumbers(paginate(posts, 1)?.totalPages ?? 1).map((page) => ({
      href: `${base}${collectionPagePath('/blog', page)}`,
      label: `${t('sections.blog')}, ${pageLabel(page)}`,
    })),
    ...(hasNotes
      ? archivePageNumbers(paginate(notes, 1)?.totalPages ?? 1).map((page) => ({
          href: `${base}${collectionPagePath('/notes', page)}`,
          label: `${t('sections.notes')}, ${pageLabel(page)}`,
        }))
      : []),
    ...series.flatMap((entry) =>
      archivePageNumbers(entry.totalPages).map((page) => ({
        href: `${base}${collectionPagePath(`/blog/series/${entry.id}`, page)}`,
        label: `${entry.title}, ${pageLabel(page)}`,
      })),
    ),
    ...hubs.flatMap((hub) =>
      archivePageNumbers(hub.totalPages).map((page) => ({
        href: `${base}${collectionPagePath(`/notes/topics/${hub.topic}`, page)}`,
        label: `${hub.title}, ${pageLabel(page)}`,
      })),
    ),
  ]

  const feeds: HubLink[] = (['blog', 'notes'] as const)
    .filter((kind) => feedLocales(kind).includes(locale))
    .map((kind) => ({
      href: `${base}${feedPath(kind)}`,
      label: t(kind === 'blog' ? 'feedBlog' : 'feedNotes'),
    }))

  const canonical = canonicalFor(locale, SITE_INDEX_PATH)
  const pageLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#collection`,
        name: t('metaTitle'),
        description: t('metaDescription'),
        url: canonical,
        inLanguage: locale,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t('sections.home'),
            item: `${SITE_URL}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t('title'),
            item: canonical,
          },
        ],
      },
    ],
  }

  return (
    <main className="site-index">
      <PageTracker page="sitemap" eventName="sitemap_view" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageLd) }}
      />

      <nav className="site-index__crumbs" aria-label={t('breadcrumbLabel')}>
        <ol>
          <li>
            <a href={base}>{t('sections.home')}</a>
          </li>
          <li aria-current="page">{t('title')}</li>
        </ol>
      </nav>

      <header>
        <p className="site-index__eyebrow">{t('eyebrow')}</p>
        <h1 className="site-index__title">{t('title')}</h1>
        <p className="site-index__intro">{t('intro')}</p>
        <ul className="site-index__jump">
          <li>
            <a href="#sections">{t('sectionsHeading')}</a>
          </li>
          <li>
            <a href="#blog">{t('blogHeading')}</a>
          </li>
          <li>
            <a href="#notes">{t('notesHeading')}</a>
          </li>
          {archiveLinks.length > 0 && (
            <li>
              <a href="#archive">{t('archiveHeading')}</a>
            </li>
          )}
          {feeds.length > 0 && (
            <li>
              <a href="#feeds">{t('feedsHeading')}</a>
            </li>
          )}
        </ul>
      </header>

      <section
        id="sections"
        className="site-index__section"
        aria-labelledby="site-index-sections"
      >
        <h2 id="site-index-sections" className="site-index__section-title">
          {t('sectionsHeading')}
        </h2>
        <ul className="site-index__list site-index__list--inline">
          {sections.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="blog"
        className="site-index__section"
        aria-labelledby="site-index-blog"
      >
        <h2 id="site-index-blog" className="site-index__section-title">
          {t('blogHeading')}
        </h2>
        <p className="site-index__lede">
          {t('blogCount', {
            count: posts.length,
            categories: postGroups.length,
          })}
        </p>

        {series.length > 0 && (
          <div className="site-index__group">
            <h3 className="site-index__group-title">{t('seriesHeading')}</h3>
            <ul className="site-index__list">
              {series.map((entry) => (
                <li key={entry.id}>
                  <a href={`${base}/blog/series/${entry.id}`}>{entry.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {postGroups.map(({ category, posts: categoryPosts }) => (
          <div key={category.slug} className="site-index__group">
            <h3 className="site-index__group-title">
              <a href={`${base}/blog/${category.slug}`}>{category.title}</a>
              <span className="site-index__group-count">
                {categoryPosts.length}
              </span>
            </h3>
            <ul className="site-index__list">
              {categoryPosts.map((post) => (
                <li key={post.slug}>
                  <a href={`${base}/blog/${post.category}/${post.slug}`}>
                    {post.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section
        id="notes"
        className="site-index__section"
        aria-labelledby="site-index-notes"
      >
        <h2 id="site-index-notes" className="site-index__section-title">
          {t('notesHeading')}
        </h2>
        {hasNotes ? (
          <>
            <p className="site-index__lede">
              {t('notesCount', { count: notes.length })}
            </p>
            {noteGroups.map((group) => (
              <div key={group.topic ?? 'other'} className="site-index__group">
                <h3 className="site-index__group-title">
                  {group.hasHub ? (
                    <a href={`${base}/notes/topics/${group.topic}`}>
                      {hubTitles.get(group.topic ?? '') ?? group.label}
                    </a>
                  ) : (
                    (group.label ?? t('notesOtherTopic'))
                  )}
                  <span className="site-index__group-count">
                    {group.notes.length}
                  </span>
                </h3>
                <ul className="site-index__list">
                  {group.notes.map((note) => (
                    <li key={note.slug}>
                      <a href={`${base}/notes/${note.slug}`}>{note.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        ) : (
          <p className="site-index__lede">
            <a href={`/${routing.defaultLocale}/notes`}>
              {t('notesUnavailable')}
            </a>
          </p>
        )}
      </section>

      {archiveLinks.length > 0 && (
        <section
          id="archive"
          className="site-index__section"
          aria-labelledby="site-index-archive"
        >
          <h2 id="site-index-archive" className="site-index__section-title">
            {t('archiveHeading')}
          </h2>
          <ul className="site-index__list site-index__list--inline">
            {archiveLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {feeds.length > 0 && (
        <section
          id="feeds"
          className="site-index__section"
          aria-labelledby="site-index-feeds"
        >
          <h2 id="site-index-feeds" className="site-index__section-title">
            {t('feedsHeading')}
          </h2>
          <ul className="site-index__list site-index__list--inline">
            {feeds.map((link) => (
              <li key={link.href}>
                <a href={link.href} type="application/rss+xml">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
