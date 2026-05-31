import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { SITE, SITE_URL } from '@/app/seo.config'
import { buildDescription } from '@/lib/blog/seo'
import { listNoteSlugs, loadNote } from '@/lib/notes/data'
import BlogContent from '@/components/blog/BlogContent'
import BlogToc from '@/components/blog/BlogToc'
import BlogViewCount from '@/components/blog/BlogViewCount'
import BlogShareDock from '@/components/blog/BlogShareDock'
import BlogReactions from '@/components/blog/BlogReactions'
import { EngagementProvider } from '@/components/blog/EngagementProvider'
import '../notes.css'
import '../../blog/blog.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return listNoteSlugs().map((slug) => ({ locale: 'vi', slug }))
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const note = loadNote(slug)
  if (!note) return { title: 'Không tìm thấy' }

  const title = note.title
  const description = note.summary || buildDescription(note.html)
  const canonical = `${SITE_URL}/vi/notes/${slug}`

  return {
    title,
    description,
    keywords: note.tags,
    alternates: {
      canonical,
      languages: { vi: canonical, 'x-default': canonical },
    },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: 'vi_VN',
      publishedTime: note.date,
      modifiedTime: note.updated ?? note.date,
      authors: [SITE_URL],
      tags: note.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE.twitter,
      creator: SITE.twitter,
    },
    robots: { index: true, follow: true },
  }
}

export default async function NotePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  if (locale !== 'vi') redirect(`/vi/notes/${slug}`)

  const note = loadNote(slug)
  if (!note) redirect('/vi/notes')

  const canonical = `${SITE_URL}/vi/notes/${slug}`
  const description = note.summary || buildDescription(note.html)

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': canonical + '#article',
    headline: note.title,
    description,
    inLanguage: 'vi',
    url: canonical,
    mainEntityOfPage: canonical,
    datePublished: note.date,
    dateModified: note.updated ?? note.date,
    keywords: note.tags.join(', '),
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Nguyen Le Phong',
      url: SITE_URL,
    },
  }

  return (
    <main className="blog-article blog-article--ocean notes-accent">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <EngagementProvider category="notes" slug={slug}>
        <BlogShareDock
          url={canonical}
          title={note.title}
          labels={{
            share: 'Chia sẻ',
            copyLink: 'Sao chép liên kết',
            copied: 'Đã sao chép!',
            close: 'Đóng',
          }}
        />

        <div className="blog-article__main">
          <nav className="blog-breadcrumb" aria-label="Breadcrumb">
            <Link href="/notes">Ghi chú</Link>
            <span aria-hidden="true">/</span>
            <span>{note.title}</span>
          </nav>

          <header className="blog-article__head">
            <h1 className="blog-article__title">{note.title}</h1>
            <p className="blog-article__summary">{note.summary}</p>
            <div className="blog-article__meta">
              <time dateTime={note.date}>{formatDate(note.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{note.readingMinutes} phút đọc</span>
              <BlogViewCount label="lượt xem" />
            </div>
            {note.tags.length > 0 && (
              <ul className="blog-article__tags">
                {note.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </header>

          <BlogContent html={note.html} />

          <BlogReactions
            prompt="Bài này có hữu ích không?"
            reactionLabels={{
              like: 'Thích',
              love: 'Yêu thích',
              insightful: 'Sâu sắc',
              clap: 'Tuyệt vời',
            }}
          />

          <footer className="blog-article__footer">
            <Link href="/notes" className="blog-back">
              ← Quay lại Ghi chú
            </Link>
          </footer>
        </div>

        <aside className="blog-article__toc">
          <BlogToc label="Trong bài này" />
        </aside>
      </EngagementProvider>
    </main>
  )
}
