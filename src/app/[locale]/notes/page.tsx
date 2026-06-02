import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { SITE, SITE_URL } from '@/app/seo.config'
import { listNotes, listTopics, listNotesByTopic } from '@/lib/notes/data'
import type { NoteMeta, TopicMeta } from '@/lib/notes/types'
import { routing } from '@/i18n/routing'
import NotesChamberNav, { type ChamberNavItem } from '@/components/notes/NotesChamberNav'
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
  'mua-xe': '🚗',
  'su-nghiep': '💼',
  'cong-nghe': '💻',
  'suc-khoe': '🌱',
}

/** One catalog entry — numbered automatically via CSS counters. */
function Entry({ post }: { post: NoteMeta }) {
  return (
    <li className="entry">
      <Link href={`/notes/${post.slug}`} className="entry__link">
        <span className="entry__no" aria-hidden="true" />
        <div className="entry__body">
          <h3 className="entry__title">{post.title}</h3>
          <p className="entry__summary">{post.summary}</p>
          <div className="entry__meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} phút đọc</span>
          </div>
          {post.tags.length > 0 && (
            <ul className="entry__tags" aria-label="Tags">
              {post.tags.slice(0, 4).map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </li>
  )
}

/** A chamber = one knowledge category. Roman numeral comes from CSS counter. */
function Chamber({ topic, posts }: { topic: TopicMeta; posts: NoteMeta[] }) {
  const icon = TOPIC_ICONS[topic.id] ?? '📝'
  return (
    <section
      id={`chamber-section-${topic.id}`}
      data-topic={topic.id}
      className="chamber"
      aria-labelledby={`chamber-${topic.id}`}
      style={{ '--topic-color': topic.color } as React.CSSProperties}
    >
      <header className="chamber__head">
        <span className="chamber__numeral" aria-hidden="true" />
        <div className="chamber__heading">
          <p className="chamber__kicker">
            <span className="chamber__icon" aria-hidden="true">
              {icon}
            </span>
            <span className="chamber__count">
              {posts.length} mục
            </span>
          </p>
          <h2 className="chamber__label" id={`chamber-${topic.id}`}>
            {topic.label}
          </h2>
          <p className="chamber__desc">{topic.description}</p>
        </div>
      </header>
      <ol className="chamber__entries">
        {posts.map((post) => (
          <Entry key={post.slug} post={post} />
        ))}
      </ol>
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

  const allPosts = listNotes()
  const topics = listTopics()
  const byTopic = listNotesByTopic()
  const uncategorized = byTopic.get('__uncategorized__') ?? []

  const visibleTopics = topics.filter(
    (topic) => (byTopic.get(topic.id) ?? []).length > 0,
  )
  const chamberCount = visibleTopics.length + (uncategorized.length > 0 ? 1 : 0)
  const latestDate = allPosts[0]?.date

  const navItems: ChamberNavItem[] = [
    ...visibleTopics.map((topic) => ({
      id: topic.id,
      label: topic.label,
      color: topic.color,
    })),
    ...(uncategorized.length > 0
      ? [{ id: '__uncategorized__', label: 'Khác', color: '#8a7d65' }]
      : []),
  ]

  return (
    <main className="notes-archive">
      <header className="notes-archive__title-page">
        <p className="notes-archive__eyebrow">Personal encyclopedia</p>
        <h1 className="notes-archive__title">Ghi chép</h1>
        <p className="notes-archive__subtitle">
          Một kho lưu trữ riêng — nơi tôi cất giữ những gì đã học, đã trải và muốn
          nhớ. Mời bạn lạc vào và đọc theo nhịp của riêng mình.
        </p>
        <div className="notes-archive__rule" aria-hidden="true" />
        <dl className="notes-archive__stats">
          <div>
            <dt>Chuyên mục</dt>
            <dd>{chamberCount}</dd>
          </div>
          <div>
            <dt>Bài viết</dt>
            <dd>{allPosts.length}</dd>
          </div>
          {latestDate && (
            <div>
              <dt>Cập nhật</dt>
              <dd>{formatDate(latestDate)}</dd>
            </div>
          )}
        </dl>
      </header>

      <NotesChamberNav chambers={navItems} />

      <div className="notes-chambers">
        {visibleTopics.map((topic) => (
          <Chamber key={topic.id} topic={topic} posts={byTopic.get(topic.id) ?? []} />
        ))}

        {uncategorized.length > 0 && (
          <Chamber
            topic={{
              id: '__uncategorized__',
              label: 'Khác',
              description: 'Những ghi chú chưa được phân loại.',
              color: '#8a7d65',
            }}
            posts={uncategorized}
          />
        )}
      </div>
    </main>
  )
}
