import { getTranslations } from 'next-intl/server'
import BlogReaderTools from './BlogReaderTools'

export default async function ArticleReaderTools({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ReaderTools' })

  return (
    <BlogReaderTools
      labels={{
        label: t('label'),
        scrollTop: t('scrollTop'),
        scrollBottom: t('scrollBottom'),
        font: t('font'),
        background: t('background'),
        language: t('language'),
      }}
    />
  )
}
