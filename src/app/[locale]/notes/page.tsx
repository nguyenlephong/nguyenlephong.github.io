import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { SITE, SITE_URL } from '@/app/seo.config'
import { listNotes, listTopics, listNotesByTopic } from '@/lib/notes/data'
import type { NoteMeta, TopicMeta } from '@/lib/notes/types'
import { routing } from '@/i18n/routing'
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

const TOPIC_ICONS: Record<string, string> = {
  'mua-nha': '🏠',
  'tiet-kiem': '💰',
  'cong-nghe': '💻',
  'suc-khoe': '🌱',
}

function NoteCard({ post }: { post: NoteMeta }) {
  return (
    <li className="notes-card">
      <Link href={`/notes/${post.slug}`} className="notes-card__link">
        <h3 className="notes-card__title">{post.title}</h3>
        <p className="notes-card__summary">{post.summary}</p>
        <div className="notes-card__meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} phút đọc</span>
        </div>
        {post.tags.length > 0 && (
          <ul className="notes-card__tags" aria-label="Tags">
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </Link>
    </li>
  )
}

function TopicSection({
  topic,
  posts,
}: {
  topic: TopicMeta
  posts: NoteMeta[]
}) {
  const icon = TOPIC_ICONS[topic.id] ?? '📝'
  return (
    <section
      className="notes-topic"
      aria-labelledby={`topic-${topic.id}`}
      style={{ '--topic-color': topic.color } as React.CSSProperties}
    >
      <header className="notes-topic__head">
        <div className="notes-topic__icon" aria-hidden="true">{icon}</div>
        <div className="notes-topic__info">
          <h2 className="notes-topic__label" id={`topic-${topic.id}`}>
            {topic.label}
          </h2>
          <p className="notes-topic__desc">{topic.description}</p>
        </div>
        <span className="notes-topic__count">{posts.length} bài</span>
      </header>
      <ul className="notes-list">
        {posts.map((post) => (
          <NoteCard key={post.slug} post={post} />
        ))}
      </ul>
    </section>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function NotesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  if (locale !== 'vi') redirect('/vi/notes')

  const topics = listTopics()
  const byTopic = listNotesByTopic()
  const uncategorized = byTopic.get('__uncategorized__') ?? []

  return (
    <main className="notes-home">
      <header className="notes-home__head">
        <h1 className="notes-home__title">Ghi chú</h1>
        <p className="notes-home__desc">
          Kinh nghiệm thực tế, góc nhìn cá nhân — những thứ tôi muốn ghi lại để không quên.
        </p>
      </header>

      <div className="notes-topics">
        {topics.map((topic) => {
          const posts = byTopic.get(topic.id) ?? []
          if (posts.length === 0) return null
          return <TopicSection key={topic.id} topic={topic} posts={posts} />
        })}

        {uncategorized.length > 0 && (
          <TopicSection
            topic={{
              id: '__uncategorized__',
              label: 'Khác',
              description: 'Những ghi chú chưa được phân loại.',
              color: '#6b7280',
            }}
            posts={uncategorized}
          />
        )}
      </div>
    </main>
  )
}
