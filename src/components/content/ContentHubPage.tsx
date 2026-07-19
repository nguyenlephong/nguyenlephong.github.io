import ContentHubPageTracker from '@/components/analytics/ContentHubPageTracker'
import { collectionPagePath } from '@/lib/content/pagination'
import { serializeJsonLd } from '@/lib/seo/json-ld'

type HubKind = 'blog_series' | 'notes_topic'

interface HubCard {
  slug: string
  title: string
  summary: string
  kicker: string
  contentCategory: string
  href: string
  date: string
  readingLabel: string
  position: number
}

interface ContentHubPageProps {
  kind: HubKind
  locale: 'en' | 'vi'
  hubId: string
  title: string
  intro: string
  eyebrow: string
  backHref: string
  backLabel: string
  pageLabel?: string
  currentPage: number
  totalPages: number
  basePath: string
  cards: HubCard[]
  emptyLabel: string
  pagination: {
    label: string
    previous: string
    next: string
    goToPage: string
  }
  collectionJsonLd: Record<string, unknown>
  breadcrumbJsonLd: Record<string, unknown>
}

function localizedHref(locale: string, path: string): string {
  return `/${locale}${path}`
}

function paginationLink(
  locale: 'en' | 'vi',
  kind: HubKind,
  hubId: string,
  currentPage: number,
  page: number,
  basePath: string,
  className: string,
  label: string,
) {
  const path = collectionPagePath(basePath, page)
  return (
    <a
      href={localizedHref(locale, path)}
      className={className}
      aria-label={label}
      aria-current={page === currentPage ? 'page' : undefined}
      data-content-hub-action="pagination"
      data-content-hub-kind={kind}
      data-content-hub-id={hubId}
      data-content-hub-page={currentPage}
      data-content-hub-destination-page={page}
    >
      {page}
    </a>
  )
}

export default function ContentHubPage({
  kind,
  locale,
  hubId,
  title,
  intro,
  eyebrow,
  backHref,
  backLabel,
  pageLabel,
  currentPage,
  totalPages,
  basePath,
  cards,
  emptyLabel,
  pagination,
  collectionJsonLd,
  breadcrumbJsonLd,
}: ContentHubPageProps) {
  const previousPage = currentPage - 1
  const nextPage = currentPage + 1

  return (
    <main className={`content-hub content-hub--${kind}`}>
      <ContentHubPageTracker
        page={kind}
        eventName="content_hub_view"
        section={currentPage === 1 ? 'index' : `page_${currentPage}`}
        context={{
          content_surface: kind === 'blog_series' ? 'blog' : 'notes',
          content_hub_kind: kind,
          content_hub_id: hubId,
          content_hub_page: currentPage,
          total_pages: totalPages,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <nav className="content-hub__breadcrumb" aria-label="Breadcrumb">
        <a
          href={localizedHref(locale, backHref)}
          data-content-hub-action="archive"
          data-content-hub-kind={kind}
          data-content-hub-id={hubId}
          data-content-hub-page={currentPage}
          data-source="content_hub_breadcrumb"
        >
          {backLabel}
        </a>
        <span aria-hidden="true">/</span>
        <span>{title}</span>
      </nav>

      <header className="content-hub__header">
        <p className="content-hub__eyebrow">{eyebrow}</p>
        <h1 className="content-hub__title">{title}</h1>
        <p className="content-hub__intro">{intro}</p>
        {pageLabel && <p className="content-page-label">{pageLabel}</p>}
      </header>

      {cards.length > 0 ? (
        <div className="blog-post-list content-hub__cards">
          {cards.map((card) => (
            <article className="blog-card blog-card--ocean" key={card.slug}>
              <a
                className="blog-card__link"
                href={localizedHref(locale, card.href)}
                data-content-hub-action="article"
                data-content-hub-kind={kind}
                data-content-hub-id={hubId}
                data-content-hub-page={currentPage}
                data-content-slug={card.slug}
                data-content-category={card.contentCategory}
                data-content-position={card.position}
              >
                <div className="blog-card__body">
                  <span className="blog-card__kicker">{card.kicker}</span>
                  <h2 className="blog-card__title">{card.title}</h2>
                  <p className="blog-card__summary">{card.summary}</p>
                  <div className="blog-card__meta">
                    <time dateTime={card.date}>{card.date}</time>
                    <span aria-hidden="true">·</span>
                    <span>{card.readingLabel}</span>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="blog-empty">{emptyLabel}</p>
      )}

      {totalPages > 1 && (
        <nav className="blog-pager" aria-label={pagination.label}>
          {previousPage >= 1 ? (
            <a
              href={localizedHref(
                locale,
                collectionPagePath(basePath, previousPage),
              )}
              className="blog-pager__edge"
              data-content-hub-action="pagination"
              data-content-hub-kind={kind}
              data-content-hub-id={hubId}
              data-content-hub-page={currentPage}
              data-content-hub-destination-page={previousPage}
            >
              ←{' '}
              <span className="blog-pager__edge-text">
                {pagination.previous}
              </span>
            </a>
          ) : (
            <span className="blog-pager__edge is-disabled" aria-disabled="true">
              ←{' '}
              <span className="blog-pager__edge-text">
                {pagination.previous}
              </span>
            </span>
          )}

          <ul className="blog-pager__pages">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <li key={page}>
                  {paginationLink(
                    locale,
                    kind,
                    hubId,
                    currentPage,
                    page,
                    basePath,
                    `blog-pager__page${page === currentPage ? ' is-active' : ''}`,
                    pagination.goToPage.replace('{page}', String(page)),
                  )}
                </li>
              ),
            )}
          </ul>

          {nextPage <= totalPages ? (
            <a
              href={localizedHref(
                locale,
                collectionPagePath(basePath, nextPage),
              )}
              className="blog-pager__edge"
              data-content-hub-action="pagination"
              data-content-hub-kind={kind}
              data-content-hub-id={hubId}
              data-content-hub-page={currentPage}
              data-content-hub-destination-page={nextPage}
            >
              <span className="blog-pager__edge-text">{pagination.next}</span> →
            </a>
          ) : (
            <span className="blog-pager__edge is-disabled" aria-disabled="true">
              <span className="blog-pager__edge-text">{pagination.next}</span> →
            </span>
          )}
        </nav>
      )}
    </main>
  )
}
