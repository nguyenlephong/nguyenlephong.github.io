import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { SITE, SITE_URL } from '@/app/seo.config'
import { listNotes } from '@/lib/notes/data'
import './notes.css'

export const metadata: Metadata = {
  title: 'Ghi chú — Nguyen Le Phong',
  description:
    'Những kinh nghiệm và ghi chú cá nhân của Nguyen Le Phong — mua nhà, tài chính, và những góc nhìn từ thực tế cuộc sống.',
  alternates: {
    canonical: `${SITE_URL}/vi/notes`,
    languages: { vi: `${SITE_URL}/vi/notes`, 'x-default': `${SITE_URL}/vi/notes` },
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/vi/notes`,
    title: 'Ghi chú — Nguyen Le Phong',
    description:
      'Những kinh nghiệm và ghi chú cá nhân của Nguyen Le Phong — mua nhà, tài chính, và những góc nhìn từ thực tế cuộc sống.',
    siteName: SITE.name,
    locale: 'vi_VN',
  },
  robots: { index: true, follow: true },
}

type Props = { params: Promise<{ locale: string }> }

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export default async function NotesPage({ params }: Props) {
  const { locale } = await params
  if (locale !== 'vi') redirect('/vi/notes')

  const posts = listNotes()

  return (
    <main className="notes-home">
      <header className="notes-home__head">
        <h1 className="notes-home__title">Ghi chú</h1>
        <p className="notes-home__desc">
          Kinh nghiệm thực tế, góc nhìn cá nhân — những thứ tôi muốn ghi lại để không quên.
        </p>
      </header>

      <ul className="notes-list">
        {posts.map((post) => (
          <li key={post.slug} className="notes-card">
            <Link href={`/notes/${post.slug}`} className="notes-card__link">
              <h2 className="notes-card__title">{post.title}</h2>
              <p className="notes-card__summary">{post.summary}</p>
              <div className="notes-card__meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readingMinutes} phút đọc</span>
              </div>
              {post.tags.length > 0 && (
                <ul className="notes-card__tags">
                  {post.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
