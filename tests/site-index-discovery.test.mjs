import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  FEED_ITEM_LIMIT,
  escapeXml,
  renderRssFeed,
  toRfc822,
} from '../src/lib/seo/feed.ts'
import {
  SITE_INDEX_PATH,
  archivePageNumbers,
  groupNotesByTopic,
  groupPostsByCategory,
} from '../src/lib/seo/site-index.ts'

const LOCALES = ['en', 'vi', 'fr', 'ja', 'ko', 'zh']
const read = (path) => readFile(path, 'utf8')

test('RSS renderer escapes text and emits the required item fields', () => {
  const xml = renderRssFeed({
    title: 'Blog & "Notes"',
    description: 'A <b>feed</b>',
    link: 'https://example.com/en/blog',
    selfUrl: 'https://example.com/en/blog/feed.xml',
    language: 'en',
    items: [
      {
        title: 'One & only',
        link: 'https://example.com/en/blog/a/one',
        date: '2026-03-02',
        description: 'Summary with <tag>',
        categories: ['Culture', '', 'tag-1'],
      },
    ],
  })

  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/)
  assert.match(xml, /<title>Blog &amp; &quot;Notes&quot;<\/title>/)
  assert.match(xml, /<language>en<\/language>/)
  assert.match(
    xml,
    /<atom:link href="https:\/\/example.com\/en\/blog\/feed.xml" rel="self" type="application\/rss\+xml" \/>/,
  )
  assert.match(xml, /<title>One &amp; only<\/title>/)
  assert.match(xml, /<guid isPermaLink="true">https:\/\/example.com\/en\/blog\/a\/one<\/guid>/)
  assert.match(xml, /<pubDate>Mon, 02 Mar 2026 00:00:00 GMT<\/pubDate>/)
  assert.match(xml, /<description>Summary with &lt;tag&gt;<\/description>/)
  assert.equal((xml.match(/<category>/g) ?? []).length, 2)
  assert.doesNotMatch(xml, /<tag>/)
})

test('RSS helpers drop invalid dates and illegal control characters', () => {
  assert.equal(toRfc822('not a date'), null)
  assert.equal(escapeXml('a\u0000b\u000Bc'), 'abc')
  const xml = renderRssFeed({
    title: 't',
    description: 'd',
    link: 'https://example.com/',
    selfUrl: 'https://example.com/feed.xml',
    language: 'vi',
    items: [
      {
        title: 'x',
        link: 'https://example.com/x',
        date: 'nope',
        description: '',
        categories: [],
      },
    ],
  })
  assert.doesNotMatch(xml, /<pubDate>/)
  assert.doesNotMatch(xml, /<lastBuildDate>/)
  assert.ok(FEED_ITEM_LIMIT >= 50)
})

test('site index groups every post, including ones with an unknown category', () => {
  const categories = [
    { slug: 'a', title: 'A' },
    { slug: 'empty', title: 'Empty' },
    { slug: 'b', title: 'B' },
  ]
  const posts = [
    { slug: 'p1', category: 'b', title: 'P1' },
    { slug: 'p2', category: 'a', title: 'P2' },
    { slug: 'p3', category: 'ghost', title: 'P3' },
  ]
  const groups = groupPostsByCategory(posts, categories)

  assert.deepEqual(
    groups.map((group) => group.category.slug),
    ['a', 'b', 'ghost'],
  )
  assert.equal(
    groups.reduce((total, group) => total + group.posts.length, 0),
    posts.length,
  )
})

test('site index groups notes with hub topics first and keeps untopiced notes', () => {
  const topics = [
    { id: 'misc', label: 'Misc' },
    { id: 'sach', label: 'Books' },
  ]
  const notes = [
    { slug: 'n1', title: 'N1', topic: 'misc' },
    { slug: 'n2', title: 'N2', topic: 'sach' },
    { slug: 'n3', title: 'N3' },
    { slug: 'n4', title: 'N4', topic: 'unlisted' },
  ]
  const groups = groupNotesByTopic(notes, topics, ['sach'])

  assert.deepEqual(
    groups.map((group) => [group.topic, group.hasHub]),
    [
      ['sach', true],
      ['misc', false],
      ['unlisted', false],
      [null, false],
    ],
  )
  assert.equal(
    groups.reduce((total, group) => total + group.notes.length, 0),
    notes.length,
  )
})

test('archive page numbers cover pages 2..N only', () => {
  assert.deepEqual(archivePageNumbers(1), [])
  assert.deepEqual(archivePageNumbers(0), [])
  assert.deepEqual(archivePageNumbers(4), [2, 3, 4])
})

test('site index is wired into sitemap, footer, analytics and feeds', async () => {
  const [sitemap, footer, analytics, tracker, page, blogPage, notesPage] =
    await Promise.all([
      read('src/app/sitemap.ts'),
      read('src/components/AppFooter.tsx'),
      read('src/lib/analytics.ts'),
      read('src/components/analytics/PageTracker.tsx'),
      read('src/app/[locale]/(site)/sitemap/page.tsx'),
      read('src/app/[locale]/(site)/blog/page.tsx'),
      read('src/app/[locale]/(site)/notes/page.tsx'),
    ])

  assert.equal(SITE_INDEX_PATH, '/sitemap')
  assert.match(sitemap, /path: SITE_INDEX_PATH/)
  assert.match(footer, /href=\{SITE_INDEX_PATH\}/)
  assert.match(footer, /t\('sitemap'\)/)
  assert.match(analytics, /'sitemap_view'/)
  assert.match(tracker, /'sitemap'/)
  assert.match(tracker, /'sitemap_view'/)
  assert.match(page, /PageTracker page="sitemap" eventName="sitemap_view"/)
  assert.match(page, /localeAlternates\(SITE_INDEX_PATH\)/)
  assert.match(blogPage, /feedAlternateTypes\('blog', locale\)/)
  assert.match(notesPage, /feedAlternateTypes\('notes', locale\)/)

  for (const kind of ['blog', 'notes']) {
    const route = await read(`src/app/[locale]/(site)/${kind}/feed.xml/route.ts`)
    assert.match(route, /export const dynamic = 'force-static'/)
    assert.match(route, new RegExp(`feedStaticParams\\('${kind}'\\)`))
    assert.match(route, new RegExp(`buildFeedResponse\\('${kind}', locale\\)`))
  }
})

test('site index and feed copy exist for every locale with matching shape', async () => {
  const messages = Object.fromEntries(
    await Promise.all(
      LOCALES.map(async (locale) => [
        locale,
        JSON.parse(await read(`messages/${locale}.json`)),
      ]),
    ),
  )
  const flatten = (value, prefix = '') =>
    Object.entries(value).flatMap(([key, child]) =>
      child && typeof child === 'object'
        ? flatten(child, `${prefix}${key}.`)
        : [[`${prefix}${key}`, child]],
    )
  const placeholders = (text) =>
    [...text.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort()

  const reference = new Map([
    ...flatten(messages.en.SiteIndex, 'SiteIndex.'),
    ...flatten(messages.en.Feeds, 'Feeds.'),
    ['Footer.sitemap', messages.en.Footer.sitemap],
  ])
  assert.ok(reference.size > 20)

  for (const locale of LOCALES) {
    const actual = new Map([
      ...flatten(messages[locale].SiteIndex, 'SiteIndex.'),
      ...flatten(messages[locale].Feeds, 'Feeds.'),
      ['Footer.sitemap', messages[locale].Footer.sitemap],
    ])
    assert.deepEqual([...actual.keys()].sort(), [...reference.keys()].sort(), locale)
    for (const [key, text] of actual) {
      assert.equal(typeof text, 'string', `${locale} ${key}`)
      assert.ok(text.trim().length > 0, `${locale} ${key}`)
      assert.ok(!text.includes('—'), `${locale} ${key} must not use an em-dash`)
      assert.deepEqual(
        placeholders(text),
        placeholders(reference.get(key)),
        `${locale} ${key} placeholders`,
      )
    }
  }
})
