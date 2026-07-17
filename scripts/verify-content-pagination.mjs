#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')
const PAGE_SIZE = 9
const SITE_ORIGIN = 'https://nguyenlephong.github.io'
const NOTE_ARCHIVE_LOCALES = new Set(['en', 'vi'])

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
    return parts.length === 4 && parts[2] !== 'page'
  }
  return parts[1] === 'notes' && parts.length === 3 && parts[2] !== 'page'
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

async function readSitemapArticles() {
  const xml = await readFile(path.join(OUT, 'sitemap.xml'), 'utf8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => normalizePathname(new URL(match[1]).pathname))
    .filter(articlePathname)
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

const sitemapArticles = await readSitemapArticles()
const missingInlinks = sitemapArticles.filter((article) => !allArchiveHrefs.has(article))
if (missingInlinks.length > 0) {
  fail(
    `${missingInlinks.length} indexable articles have no static archive inlink: ${missingInlinks
      .slice(0, 10)
      .join(', ')}`,
  )
}

console.log(
  JSON.stringify(
    {
      status: 'ok',
      indexableArticlesWithInlinks: sitemapArticles.length,
      locales: measurements,
    },
    null,
    2,
  ),
)
