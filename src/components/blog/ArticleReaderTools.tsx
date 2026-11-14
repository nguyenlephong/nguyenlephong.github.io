import { getTranslations } from 'next-intl/server'
import BlogReaderTools from './BlogReaderTools'
import type { ArticleShareProps } from './useArticleShare'

/**
 * The article's floating reader cluster: back to top with reading progress,
 * plus one sheet for share, font, background and language. Rendered by the
 * article page after `<main>` so it is its own complementary landmark.
 */
export default async function ArticleReaderTools({
  locale,
  share,
}: {
  locale: string
  share: ArticleShareProps
}) {
  const t = await getTranslations({ locale, namespace: 'ReaderTools' })

  return (
    <BlogReaderTools
      share={share}
      labels={{
        label: t('label'),
        reading: t('reading'),
        scrollTop: t('scrollTop'),
        scrollBottom: t('scrollBottom'),
        font: t('font'),
        background: t('background'),
        language: t('language'),
      }}
    />
  )
}
