import { getTranslations } from 'next-intl/server'
import { LuArrowRight } from 'react-icons/lu'
import { APP_ROUTE } from '@/app/app.const'
import { email } from '@/content/social'

interface ArticleAuthorProps {
  locale: string
  name: string
}

/**
 * Server-rendered byline and author box for posts and notes. Role, claim and bio
 * reuse the homepage `Hero` strings so one fact keeps one wording. Clicks are
 * measured by the delegated listener in `useRelatedLinkClickTracking`
 * (`data-author-link`), so neither piece ships client JavaScript.
 */
export async function ArticleByline({ locale, name }: ArticleAuthorProps) {
  const [t, hero] = await Promise.all([
    getTranslations({ locale, namespace: 'Author' }),
    getTranslations({ locale, namespace: 'Hero' }),
  ])

  return (
    <span className="article-byline">
      {t.rich('byline', {
        name,
        role: hero('role'),
        author: (chunks) => (
          <a href={`/${locale}`} rel="author" data-author-link="byline">
            {chunks}
          </a>
        ),
      })}
    </span>
  )
}

export async function ArticleAuthorBox({ locale, name }: ArticleAuthorProps) {
  const [t, hero] = await Promise.all([
    getTranslations({ locale, namespace: 'Author' }),
    getTranslations({ locale, namespace: 'Hero' }),
  ])

  return (
    <section className="article-author" aria-labelledby="article-author-heading">
      <h2 id="article-author-heading" className="article-author__heading">
        {t('heading')}
      </h2>
      <p className="article-author__name">
        <a href={`/${locale}`} rel="author" data-author-link="cv">
          {name}
        </a>
      </p>
      <ul className="article-author__roles">
        <li>{hero('role')} @ Zalo PC</li>
        <li>
          {hero('cofounder')} @ BonBon Mobility {hero('partTime')}
        </li>
      </ul>
      <p className="article-author__claim">{hero('claim')}</p>
      <p className="article-author__bio">{hero('bio')}</p>
      <ul className="article-author__links">
        <li>
          <a
            href={`/${locale}`}
            className="article-author__primary"
            data-author-link="cv"
          >
            {t('cvLink')} <LuArrowRight size={14} aria-hidden="true" />
          </a>
        </li>
        <li>
          <a
            href={APP_ROUTE.CV_PDF}
            target="_blank"
            rel="noopener noreferrer"
            data-author-link="resume"
          >
            {hero('downloadResume')}
          </a>
        </li>
        <li>
          <a href={`mailto:${email}`} data-author-link="email">
            {hero('getInTouch')}
          </a>
        </li>
      </ul>
    </section>
  )
}
