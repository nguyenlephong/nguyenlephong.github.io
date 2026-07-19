#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')
const PAGE_SIZE = 9
const SITE_ORIGIN = 'https://nguyenlephong.github.io'
const NOTE_ARCHIVE_LOCALES = new Set(['en', 'vi'])
const SERIES_ARTICLE_CONTRACT = {
  category: 'architecture',
  series: 'foundations',
  slug: 'ports-and-adapters',
}
const SERIES_ARTICLE_LOCALE_CASES = [
  { locale: 'en', expectsHub: true },
  { locale: 'vi', expectsHub: true },
  { locale: 'fr', expectsHub: false },
  { locale: 'ja', expectsHub: false },
]

function fail(message) {
  throw new Error(`[content-pagination] ${message}`)
}

async function localesFromRouting() {
  const source = await readFile(path.join(ROOT, 'src/i18n/routing.ts'), 'utf8')
  const list = source.match(/locales:\s*\[([^\]]+)\]/)?.[1]
  if (!list) fail('could not read locales from routing.ts')
  return [...list.matchAll(/'([^']+)'/g)].map((match) => match[1])
}

function archivePath(locale, surface, page) {
  return page === 1
    ? `/${locale}/${surface}`
    : `/${locale}/${surface}/page/${page}`
}

function archiveFile(locale, surface, page) {
  return path.join(OUT, `${archivePath(locale, surface, page).slice(1)}.html`)
}

function decodeHref(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"')
}

function decodeHtmlText(value) {
  return value
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-f]{1,6});/gi, (entity, hex) => {
      const codePoint = Number.parseInt(hex, 16)
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity
    })
    .replace(/&#([0-9]{1,7});/g, (entity, decimal) => {
      const codePoint = Number.parseInt(decimal, 10)
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity
    })
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function classElementMarkup(html, tagName, className) {
  const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (
    html.match(
      new RegExp(
        `<${tagName}\\b(?=[^>]*\\bclass="[^"]*\\b${escapedClassName}\\b[^"]*")[^>]*>[\\s\\S]*?<\\/${tagName}>`,
        'i',
      ),
    )?.[0] ?? null
  )
}

function normalizePathname(pathname) {
  return pathname === '/' ? pathname : pathname.replace(/\/$/, '')
}

function internalHrefs(html) {
  const paths = []
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const url = new URL(decodeHref(match[1]), SITE_ORIGIN)
    if (url.origin === SITE_ORIGIN) paths.push(normalizePathname(url.pathname))
  }
  return paths
}

function paginationHrefs(html, pagePath) {
  const paths = []
  for (const nav of html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)) {
    if (!/\bblog-pager\b/i.test(nav[1])) continue
    for (const match of nav[2].matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
      const url = new URL(decodeHref(match[1]), SITE_ORIGIN)
      if (url.origin !== SITE_ORIGIN) {
        fail(`${pagePath} pagination links outside the site: ${url.href}`)
      }
      paths.push(normalizePathname(url.pathname))
    }
  }
  return paths
}

function exportedHtmlFile(pathname) {
  const relative = pathname.replace(/^\/+/, '')
  const candidates = [
    path.join(OUT, `${relative}.html`),
    path.join(OUT, relative, 'index.html'),
  ]
  return candidates.find((candidate) => existsSync(candidate)) ?? null
}

function articlePathname(value) {
  const parts = value.split('/').filter(Boolean)
  if (parts[1] === 'blog') {
    return parts.length === 4 && !['page', 'series'].includes(parts[2])
  }
  return (
    parts[1] === 'notes' &&
    parts.length === 3 &&
    !['page', 'topics'].includes(parts[2])
  )
}

function hubPathInfo(value) {
  const parts = value.split('/').filter(Boolean)
  const isBlogHub = parts[1] === 'blog' && parts[2] === 'series'
  const isNotesHub = parts[1] === 'notes' && parts[2] === 'topics'
  if (!isBlogHub && !isNotesHub) return null
  if (!['en', 'vi'].includes(parts[0]) || !parts[3]) return null

  const basePath = `/${parts.slice(0, 4).join('/')}`
  if (parts.length === 4) {
    return {
      basePath,
      locale: parts[0],
      surface: parts[1],
      id: parts[3],
      page: 1,
    }
  }
  if (
    parts.length === 6 &&
    parts[4] === 'page' &&
    /^\d+$/.test(parts[5]) &&
    Number(parts[5]) >= 2
  ) {
    return {
      basePath,
      locale: parts[0],
      surface: parts[1],
      id: parts[3],
      page: Number(parts[5]),
    }
  }
  return null
}

function hubPagePath(basePath, page) {
  return page === 1 ? basePath : `${basePath}/page/${page}`
}

function cardHrefs(html) {
  const paths = []
  for (const article of html.matchAll(
    /<article\b[^>]*class="[^"]*\bblog-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
  )) {
    const href = article[1].match(/<a\b[^>]*\bhref="([^"]+)"/i)?.[1]
    if (!href) continue
    const url = new URL(decodeHref(href), SITE_ORIGIN)
    if (url.origin === SITE_ORIGIN) paths.push(normalizePathname(url.pathname))
  }
  return paths
}

function jsonLdDocuments(html, pagePath) {
  const documents = []
  for (const script of html.matchAll(
    /<script\b[^>]*\btype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      documents.push(JSON.parse(script[1]))
    } catch (error) {
      fail(`${pagePath} has invalid JSON-LD: ${error.message}`)
    }
  }
  return documents
}

async function pageNumbers(locale, surface) {
  const pagesDir = path.join(OUT, locale, surface, 'page')
  const numbers = [1]
  if (!existsSync(pagesDir)) return numbers
  for (const entry of await readdir(pagesDir)) {
    const match = entry.match(/^(\d+)\.html$/)
    if (match) numbers.push(Number(match[1]))
  }
  return [...new Set(numbers)].sort((a, b) => a - b)
}

async function readSearchIndex(locale, surface) {
  const searchFile = path.join(OUT, locale, 'search', `${surface}.json`)
  if (!existsSync(searchFile)) fail(`missing ${path.relative(OUT, searchFile)}`)
  const searchIndex = JSON.parse(await readFile(searchFile, 'utf8'))
  if (searchIndex.version !== 1 || !Array.isArray(searchIndex.items)) {
    fail(`${locale}/${surface} search index has an invalid contract`)
  }
  return searchIndex
}

async function readBlogIndex(locale) {
  const file =
    locale === 'en'
      ? path.join(ROOT, 'content/blog-data/_index.json')
      : path.join(ROOT, `content/blog-data/${locale}/_index.json`)
  if (!existsSync(file)) fail(`missing ${path.relative(ROOT, file)}`)
  return JSON.parse(await readFile(file, 'utf8'))
}

async function localizedSeriesLabel(locale, seriesId) {
  const messagesFile = path.join(ROOT, `messages/${locale}.json`)
  if (!existsSync(messagesFile)) {
    fail(`missing ${path.relative(ROOT, messagesFile)}`)
  }
  const messages = JSON.parse(await readFile(messagesFile, 'utf8'))
  const label = messages?.Pages?.blog?.seriesNames?.[seriesId]
  if (typeof label !== 'string' || label.trim() === '') {
    fail(`${locale} is missing Pages.blog.seriesNames.${seriesId}`)
  }
  return label.trim()
}

async function readSitemapPaths() {
  const xml = await readFile(path.join(OUT, 'sitemap.xml'), 'utf8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    normalizePathname(new URL(match[1]).pathname),
  )
}

function expectedPageNumbers(itemCount) {
  const total = Math.max(1, Math.ceil(itemCount / PAGE_SIZE))
  return Array.from({ length: total }, (_, index) => index + 1)
}

if (!existsSync(OUT)) fail('out/ is missing; run the production build first')

const locales = await localesFromRouting()
const allArchiveHrefs = new Set()
const measurements = {}

for (const locale of locales) {
  measurements[locale] = {}
  for (const surface of ['blog', 'notes']) {
    const searchIndex = await readSearchIndex(locale, surface)
    const fullArchive = surface === 'blog' || NOTE_ARCHIVE_LOCALES.has(locale)
    const expectedPages = fullArchive ? expectedPageNumbers(searchIndex.items.length) : [1]
    const actualPages = await pageNumbers(locale, surface)

    if (actualPages.join(',') !== expectedPages.join(',')) {
      fail(
        `${locale}/${surface} exports pages [${actualPages.join(', ')}], expected ` +
          `[${expectedPages.join(', ')}] for ${searchIndex.items.length} search items`,
      )
    }

    const expectedPaths = new Set(
      expectedPages.map((page) => archivePath(locale, surface, page)),
    )
    const pageLinks = new Map()
    const cardLinks = new Set()

    for (const page of actualPages) {
      const file = archiveFile(locale, surface, page)
      if (!existsSync(file)) fail(`missing ${path.relative(OUT, file)}`)
      const html = await readFile(file, 'utf8')
      const pagePath = archivePath(locale, surface, page)
      const links = internalHrefs(html)
      pageLinks.set(pagePath, links)

      for (const link of links) {
        allArchiveHrefs.add(link)
        if (articlePathname(link)) cardLinks.add(link)
      }

      const expectedCardCount = fullArchive
        ? Math.min(PAGE_SIZE, Math.max(0, searchIndex.items.length - (page - 1) * PAGE_SIZE))
        : Math.min(PAGE_SIZE, searchIndex.items.length)
      const cardCount = [...html.matchAll(/<article\b[^>]*class="[^"]*\bblog-card\b/gi)].length
      if (cardCount !== expectedCardCount) {
        fail(`${pagePath} has ${cardCount} cards; expected ${expectedCardCount}`)
      }
      if (!html.includes('"@type":"ItemList"')) fail(`${pagePath} has no ItemList JSON-LD`)

      const pagerLinks = paginationHrefs(html, pagePath)
      for (const pagerLink of pagerLinks) {
        if (!exportedHtmlFile(pagerLink)) {
          fail(`${pagePath} pagination href ${pagerLink} has no exported HTML`)
        }
        if (!fullArchive && surface === 'notes') {
          const isFallbackLanding = pagerLink === pagePath
          if (!isFallbackLanding && !/^\/en\/notes(?:\/page\/\d+)?$/.test(pagerLink)) {
            fail(`${pagePath} pagination href must use the canonical English archive: ${pagerLink}`)
          }
        }
      }
    }

    if (fullArchive) {
      const visited = new Set()
      const queue = [archivePath(locale, surface, 1)]
      while (queue.length > 0) {
        const current = queue.shift()
        if (!current || visited.has(current)) continue
        visited.add(current)
        for (const link of pageLinks.get(current) ?? []) {
          if (expectedPaths.has(link) && !visited.has(link)) queue.push(link)
        }
      }
      const unreachable = [...expectedPaths].filter((page) => !visited.has(page))
      if (unreachable.length > 0) {
        fail(`${locale}/${surface} has unreachable archive pages: ${unreachable.join(', ')}`)
      }
      if (searchIndex.items.length !== cardLinks.size) {
        fail(
          `${locale}/${surface} search index has ${searchIndex.items.length} items but ` +
            `the full archive links ${cardLinks.size}`,
        )
      }
    } else {
      for (const cardLink of cardLinks) {
        if (!cardLink.startsWith('/en/notes/')) {
          fail(`${archivePath(locale, surface, 1)} card must use English content: ${cardLink}`)
        }
      }
    }

    measurements[locale][surface] = {
      policy: fullArchive ? 'full' : 'landing-only',
      pages: actualPages.length,
      linkedArticles: cardLinks.size,
      searchItems: searchIndex.items.length,
    }
  }
}

const sitemapPaths = await readSitemapPaths()
const sitemapPathSet = new Set(sitemapPaths)
const sitemapArticles = sitemapPaths.filter(articlePathname)
const missingInlinks = sitemapArticles.filter((article) => !allArchiveHrefs.has(article))
if (missingInlinks.length > 0) {
  fail(
    `${missingInlinks.length} indexable articles have no static archive inlink: ${missingInlinks
      .slice(0, 10)
      .join(', ')}`,
  )
}

const canonicalBlogIndex = await readBlogIndex('en')
const canonicalSeriesTitle = canonicalBlogIndex.series?.find(
  (entry) => entry.id === SERIES_ARTICLE_CONTRACT.series,
)?.title
if (!canonicalSeriesTitle) {
  fail(`canonical blog index is missing series ${SERIES_ARTICLE_CONTRACT.series}`)
}

let linkedSeriesArticles = 0
let localizedSeriesArticles = 0
for (const { locale, expectsHub } of SERIES_ARTICLE_LOCALE_CASES) {
  const articlePath =
    `/${locale}/blog/${SERIES_ARTICLE_CONTRACT.category}/` + SERIES_ARTICLE_CONTRACT.slug
  const articleFile = exportedHtmlFile(articlePath)
  if (!articleFile) fail(`${articlePath} has no exported HTML`)
  if (!sitemapPathSet.has(articlePath)) {
    fail(`${articlePath} is missing from sitemap.xml`)
  }

  const html = await readFile(articleFile, 'utf8')
  const seriesMarkup = classElementMarkup(html, 'p', 'blog-article__series')
  if (!seriesMarkup) fail(`${articlePath} has no visible series context`)
  const renderedSeriesText = decodeHtmlText(seriesMarkup)
  const jsonLd = jsonLdDocuments(html, articlePath)
  const article = jsonLd.find((entry) => entry?.['@type'] === 'BlogPosting')
  const breadcrumb = jsonLd.find((entry) => entry?.['@type'] === 'BreadcrumbList')
  const breadcrumbParent = breadcrumb?.itemListElement?.find((entry) => entry.position === 2)
  if (!article || !breadcrumbParent) {
    fail(`${articlePath} is missing BlogPosting or parent breadcrumb JSON-LD`)
  }

  if (expectsHub) {
    const localizedIndex = await readBlogIndex(locale)
    const expectedTitle = localizedIndex.series?.find(
      (entry) => entry.id === SERIES_ARTICLE_CONTRACT.series,
    )?.title
    if (!expectedTitle) {
      fail(`${locale} blog index is missing series ${SERIES_ARTICLE_CONTRACT.series}`)
    }
    const hubPath = `/${locale}/blog/series/${SERIES_ARTICLE_CONTRACT.series}`
    const hubUrl = `${SITE_ORIGIN}${hubPath}`
    if (!internalHrefs(seriesMarkup).includes(hubPath)) {
      fail(`${articlePath} visible series label must link ${hubPath}`)
    }
    if (!renderedSeriesText.includes(expectedTitle)) {
      fail(`${articlePath} visible series label does not use its localized hub title`)
    }
    if (
      article.isPartOf?.['@type'] !== 'CollectionPage' ||
      article.isPartOf?.['@id'] !== `${hubUrl}#collection`
    ) {
      fail(`${articlePath} Article isPartOf must reference its localized series hub`)
    }
    if (breadcrumbParent.name !== expectedTitle || breadcrumbParent.item !== hubUrl) {
      fail(`${articlePath} parent breadcrumb must reference its localized series hub`)
    }
    linkedSeriesArticles += 1
    continue
  }

  const expectedLabel = await localizedSeriesLabel(locale, SERIES_ARTICLE_CONTRACT.series)
  const articleLinks = internalHrefs(html)
  const serializedJsonLd = JSON.stringify(jsonLd)
  const localizedBlogUrl = `${SITE_ORIGIN}/${locale}/blog`
  const localizedCategoryUrl = `${localizedBlogUrl}/${SERIES_ARTICLE_CONTRACT.category}`
  if (!renderedSeriesText.includes(expectedLabel)) {
    fail(`${articlePath} lost its localized non-hub series label`)
  }
  if (renderedSeriesText.includes(canonicalSeriesTitle)) {
    fail(`${articlePath} visible series context leaked the English hub title`)
  }
  if (articleLinks.some((href) => href.includes('/blog/series/'))) {
    fail(`${articlePath} must not link a series hub outside its locale contract`)
  }
  if (
    serializedJsonLd.includes('/blog/series/') ||
    serializedJsonLd.includes(canonicalSeriesTitle)
  ) {
    fail(`${articlePath} JSON-LD leaked English series hub metadata`)
  }
  if (
    article.isPartOf?.['@type'] !== 'Blog' ||
    article.isPartOf?.['@id'] !== `${localizedBlogUrl}#blog`
  ) {
    fail(`${articlePath} Article isPartOf must remain the localized Blog`)
  }
  if (breadcrumbParent.item !== localizedCategoryUrl) {
    fail(`${articlePath} parent breadcrumb must remain its localized category`)
  }
  localizedSeriesArticles += 1
}

const hubGroups = new Map()
for (const pathname of sitemapPaths) {
  const info = hubPathInfo(pathname)
  if (!info) continue
  const group = hubGroups.get(info.basePath) ?? []
  group.push({ ...info, pathname })
  hubGroups.set(info.basePath, group)
}

let verifiedHubPages = 0
for (const [basePath, pages] of hubGroups) {
  const sortedPages = pages.sort((left, right) => left.page - right.page)
  const pageNumbers = sortedPages.map(({ page }) => page)
  const expectedNumbers = Array.from({ length: pageNumbers.at(-1) ?? 0 }, (_, index) => index + 1)
  if (pageNumbers.join(',') !== expectedNumbers.join(',')) {
    fail(`${basePath} sitemap pages are not contiguous from page one`)
  }
  if (!allArchiveHrefs.has(basePath)) {
    fail(`${basePath} has no static inlink from its parent archive`)
  }

  const pageLinks = new Map()
  const linkedArticles = new Set()
  for (const { pathname, page, surface } of sortedPages) {
    const file = exportedHtmlFile(pathname)
    if (!file) fail(`${pathname} has no exported HTML`)
    const html = await readFile(file, 'utf8')
    const cards = cardHrefs(html)
    if (cards.length === 0 || cards.length > PAGE_SIZE) {
      fail(`${pathname} has ${cards.length} cards; expected between 1 and ${PAGE_SIZE}`)
    }
    for (const card of cards) {
      if (!articlePathname(card) || card.split('/').filter(Boolean)[1] !== surface) {
        fail(`${pathname} has an invalid article card href: ${card}`)
      }
      if (!sitemapPathSet.has(card)) {
        fail(`${pathname} links an article missing from sitemap.xml: ${card}`)
      }
      if (linkedArticles.has(card)) {
        fail(`${basePath} repeats article card ${card}`)
      }
      linkedArticles.add(card)
    }

    const jsonLd = jsonLdDocuments(html, pathname)
    const collection = jsonLd.find((entry) => entry?.['@type'] === 'CollectionPage')
    const itemList = collection?.mainEntity
    if (!collection || itemList?.['@type'] !== 'ItemList') {
      fail(`${pathname} has no CollectionPage with ItemList JSON-LD`)
    }
    if (!jsonLd.some((entry) => entry?.['@type'] === 'BreadcrumbList')) {
      fail(`${pathname} has no BreadcrumbList JSON-LD`)
    }
    if (itemList.numberOfItems !== cards.length) {
      fail(
        `${pathname} ItemList has ${itemList.numberOfItems} items but rendered ${cards.length} cards`,
      )
    }
    const positions = itemList.itemListElement?.map((entry) => entry.position) ?? []
    const expectedPositions = Array.from(
      { length: cards.length },
      (_, index) => (page - 1) * PAGE_SIZE + index + 1,
    )
    if (positions.join(',') !== expectedPositions.join(',')) {
      fail(`${pathname} ItemList positions are not absolute across pagination`)
    }
    if (/search\/(?:blog|notes)\.json|firebaseapp\.com|BlogExplorer|NotesExplorer/i.test(html)) {
      fail(`${pathname} includes Explorer, search-index, or Firebase payload`)
    }

    const pagerLinks = paginationHrefs(html, pathname)
    for (const pagerLink of pagerLinks) {
      if (!pagerLink.startsWith(basePath) || !exportedHtmlFile(pagerLink)) {
        fail(`${pathname} pagination href is outside its exported hub: ${pagerLink}`)
      }
    }
    pageLinks.set(pathname, pagerLinks)
    verifiedHubPages += 1
  }

  const expectedPaths = new Set(expectedNumbers.map((page) => hubPagePath(basePath, page)))
  const visited = new Set()
  const queue = [basePath]
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || visited.has(current)) continue
    visited.add(current)
    for (const link of pageLinks.get(current) ?? []) {
      if (expectedPaths.has(link) && !visited.has(link)) queue.push(link)
    }
  }
  const unreachable = [...expectedPaths].filter((page) => !visited.has(page))
  if (unreachable.length > 0) {
    fail(`${basePath} has unreachable hub pages: ${unreachable.join(', ')}`)
  }
}

console.log(
  JSON.stringify(
    {
      status: 'ok',
      indexableArticlesWithInlinks: sitemapArticles.length,
      contentHubs: {
        groups: hubGroups.size,
        pages: verifiedHubPages,
      },
      seriesArticleLocaleContracts: {
        hubLinked: linkedSeriesArticles,
        localizedWithoutHub: localizedSeriesArticles,
      },
      locales: measurements,
    },
    null,
    2,
  ),
)
