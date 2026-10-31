import { Link } from '@/i18n/navigation'

export interface ArticleRelatedLinkItem {
  /** Locale-less path, for example `/notes/some-slug`. */
  href: string
  /** Descriptive anchor text: the target article title. */
  title: string
  kicker: string
  meta: string
  slug: string
  category: string
}

interface ArticleRelatedLinksProps {
  heading: string
  intro: string
  items: readonly ArticleRelatedLinkItem[]
}

/**
 * Server-rendered related reading. Plain crawlable anchors with the article
 * title as link text; clicks are measured by one delegated listener in the
 * article reading tracker (`useRelatedLinkClickTracking`), so this block ships
 * no client JavaScript of its own.
 */
export default function ArticleRelatedLinks({
  heading,
  intro,
  items,
}: ArticleRelatedLinksProps) {
  if (items.length === 0) return null

  return (
    <section className="blog-related" aria-labelledby="article-related-heading">
      <div className="blog-related__head">
        <h2 id="article-related-heading" className="blog-related__title">
          {heading}
        </h2>
        <p className="blog-related__intro">{intro}</p>
      </div>
      <ul className="blog-related__grid">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={item.href}
              className="blog-related__card"
              prefetch={false}
              data-related-link="related"
              data-related-target-category={item.category}
              data-related-target-slug={item.slug}
            >
              <span className="blog-related__body">
                <span className="blog-related__kicker">{item.kicker}</span>
                <span className="blog-related__card-title">{item.title}</span>
                <span className="blog-related__meta">{item.meta}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
