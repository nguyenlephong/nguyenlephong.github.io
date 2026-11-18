import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Metadata, Viewport } from 'next'
import { SITE_URL } from '@/app/seo.config'
import PostHogBootstrap from '@/components/analytics/PostHogBootstrap'
import AdminGate from '@/components/admin/AdminGate'
import ThemeScript from '@/components/theme/ThemeScript'
import type { AdminCatalogProps } from '@/components/admin/catalog-props'
import { createAdminLocaleScript } from '@/components/admin/admin-locale'
import '../document.css'
import './admin-sections.css'
import './admin.css'

export const dynamic = 'force-static'

// MEP-90: owner-only page. Kept out of the sitemap, the navigation and search
// engines, and it carries no social card.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Admin | Nguyen Le Phong',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  openGraph: null,
  twitter: null,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1115' },
  ],
}

interface RawIndexPost {
  slug: string
  category?: string
  title: string
  date: string
  locales?: string[]
}

const readIndex = (directory: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), 'content', directory, '_index.json'), 'utf8')) as {
    categories?: Array<{ slug: string; title: string }>
    posts: RawIndexPost[]
  }

// Only the fields the dashboard needs leave the build, and only on this page.
const trimPost = ({ slug, category, title, date, locales }: RawIndexPost) => ({
  slug,
  category: category ?? 'notes',
  title,
  date,
  ...(locales && !locales.includes('en') && locales[0] ? { locale: locales[0] } : {}),
})

/** VI title of every post that has a /vi page, read at build time so it never reaches a public route. */
function readVietnamese(blog: ReturnType<typeof readIndex>, notes: ReturnType<typeof readIndex>): AdminCatalogProps['vi'] {
  const viBlog = readIndex(path.join('blog-data', 'vi'))
  const viNotes = readIndex(path.join('notes-data', 'vi'))
  const english = new Map([...blog.posts, ...notes.posts].map((post) => [`${post.category ?? 'notes'}__${post.slug}`, post.title]))
  const titles: Record<string, string> = {}
  for (const post of [...viBlog.posts, ...viNotes.posts]) {
    const id = `${post.category ?? 'notes'}__${post.slug}`
    if (english.has(id)) titles[id] = post.title
  }
  const categories: Record<string, string> = { notes: 'Ghi chép' }
  for (const category of viBlog.categories ?? []) categories[category.slug] = category.title
  return { titles, categories }
}

function readCatalog(): AdminCatalogProps {
  const blog = readIndex('blog-data')
  const notes = readIndex('notes-data')
  return {
    vi: readVietnamese(blog, notes),
    blog: {
      categories: (blog.categories ?? []).map(({ slug, title }) => ({ slug, title })),
      posts: blog.posts.map(trimPost),
    },
    notes: { posts: notes.posts.map(trimPost) },
  }
}

export default function AdminPage() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script dangerouslySetInnerHTML={{ __html: createAdminLocaleScript() }} />
      </head>
      <body className="admin-body">
        <PostHogBootstrap locale="en" surface="admin" />
        <AdminGate catalog={readCatalog()} />
      </body>
    </html>
  )
}
