import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const extensionCandidates = ['.ts', '.tsx', '.js', '.mjs']

function resolveWithProjectExtensions(url) {
  const basePath = fileURLToPath(url)
  if (existsSync(basePath)) return url.href

  for (const extension of extensionCandidates) {
    const candidate = `${basePath}${extension}`
    if (existsSync(candidate)) return pathToFileURL(candidate).href
  }

  for (const extension of extensionCandidates) {
    const candidate = path.join(basePath, `index${extension}`)
    if (existsSync(candidate)) return pathToFileURL(candidate).href
  }

  return null
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const resolved = resolveWithProjectExtensions(
        new URL(`../src/${specifier.slice(2)}`, import.meta.url),
      )
      if (resolved) return { url: resolved, shortCircuit: true }
    }

    if (
      context.parentURL?.startsWith('file:') &&
      (specifier.startsWith('./') || specifier.startsWith('../'))
    ) {
      const resolved = resolveWithProjectExtensions(
        new URL(specifier, context.parentURL),
      )
      if (resolved) return { url: resolved, shortCircuit: true }
    }

    return nextResolve(specifier, context)
  },
})

const { getPostContentLocales, listBlogPostParams } = await import(
  new URL('../src/lib/blog/data.ts', import.meta.url)
)
const { getNoteContentLocales, listNoteParams } = await import(
  new URL('../src/lib/notes/data.ts', import.meta.url)
)
const { localeSwitchPath } = await import(
  new URL('../src/lib/content/locale-navigation.ts', import.meta.url)
)
const { default: buildSitemap } = await import(
  new URL('../src/app/sitemap.ts', import.meta.url)
)
const { isContentPublished } = await import(
  new URL('../src/lib/content/publication.ts', import.meta.url)
)

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'))
}

test('article static params contain authored locale routes only', () => {
  const blogIndex = readJson('../public/blog-data/_index.json')
  const notesIndex = readJson('../public/notes-data/_index.json')
  const blogParams = listBlogPostParams()
  const noteParams = listNoteParams()
  const expectedBlogRoutes = blogIndex.posts
    .filter((post) => isContentPublished(post))
    .reduce(
      (total, post) => total + post.locales.length,
      0,
    )
  const expectedNoteRoutes = notesIndex.posts
    .filter((note) => isContentPublished(note))
    .reduce(
      (total, note) => total + note.locales.length,
      0,
    )

  assert.equal(blogParams.length, expectedBlogRoutes)
  assert.equal(noteParams.length, expectedNoteRoutes)
  assert.equal(new Set(blogParams.map((param) => JSON.stringify(param))).size, blogParams.length)
  assert.equal(new Set(noteParams.map((param) => JSON.stringify(param))).size, noteParams.length)

  for (const param of blogParams) {
    assert.ok(getPostContentLocales(param.slug).includes(param.locale))
  }
  for (const param of noteParams) {
    assert.ok(getNoteContentLocales(param.slug).includes(param.locale))
  }

  assert.ok(blogParams.length < blogIndex.posts.length * 6)
  assert.ok(noteParams.length < notesIndex.posts.length * 6)
})

test('sitemap article URLs equal generated authored routes', () => {
  const sitemapUrls = new Set(buildSitemap().map((entry) => entry.url))

  for (const param of listBlogPostParams()) {
    assert.ok(
      sitemapUrls.has(
        `https://nguyenlephong.github.io/${param.locale}/blog/${param.category}/${param.slug}`,
      ),
    )
  }

  for (const param of listNoteParams()) {
    assert.ok(
      sitemapUrls.has(
        `https://nguyenlephong.github.io/${param.locale}/notes/${param.slug}`,
      ),
    )
  }

  assert.equal(
    sitemapUrls.has(
      'https://nguyenlephong.github.io/zh/blog/architecture/rate-limiting-and-throttling',
    ),
    false,
  )
  assert.equal(
    sitemapUrls.has(
      'https://nguyenlephong.github.io/zh/notes/tri-tue-can-duc-hanh',
    ),
    false,
  )
})

test('locale switching never fabricates an untranslated article path', () => {
  const route = { availableLocales: ['en', 'vi'], fallbackPath: '/blog' }
  const pathname = '/blog/architecture/rate-limiting-and-throttling'

  assert.equal(localeSwitchPath(pathname, 'vi', route), pathname)
  assert.equal(localeSwitchPath(pathname, 'zh', route), '/blog')
  assert.equal(localeSwitchPath('/about', 'zh', null), '/about')
})

test('article pages keep production static params while development resolves them on demand', async () => {
  const [blogPage, notePage, localeSwitcher] = await Promise.all([
    readFile('src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx', 'utf8'),
    readFile('src/app/[locale]/(site)/notes/[slug]/page.tsx', 'utf8'),
    readFile('src/components/LocaleSwitcher.tsx', 'utf8'),
  ])

  for (const page of [blogPage, notePage]) {
    assert.match(
      page,
      /generateStaticParams\(\) \{\s+if \(process\.env\.NODE_ENV === ["']development["']\) return \[\]/,
    )
    assert.doesNotMatch(page, /export const dynamicParams = false/)
    assert.match(page, /data-content-locales/)
    assert.match(page, /data-content-locale-fallback/)
  }
  assert.match(blogPage, /return listBlogPostParams\(\)/)
  assert.match(notePage, /return listNoteParams\(\)/)
  assert.match(localeSwitcher, /localeSwitchPath/)
  assert.match(localeSwitcher, /track\('locale_change'/)
})

test('artifact budgets are rebased below the previous near-limit output', () => {
  const budget = readJson('../config/static-artifact-budgets.json')

  assert.equal(budget.warnAtPercent, 75)
  assert.equal(budget.limits.fileCount, 20_000)
  assert.equal(budget.limits.totalBytes, 600 * 1024 * 1024)
  assert.equal(Object.hasOwn(budget.limits, 'minimumSitemapUrls'), false)
})
