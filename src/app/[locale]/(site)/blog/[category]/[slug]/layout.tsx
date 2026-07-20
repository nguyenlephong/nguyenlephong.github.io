import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import ArticleReaderTools from '@/components/blog/ArticleReaderTools'
import { routing } from '@/i18n/routing'
import '../../reader.css'

type BlogArticleLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function BlogArticleLayout({
  children,
  params,
}: BlogArticleLayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <>
      {children}
      <ArticleReaderTools locale={locale} />
    </>
  )
}
