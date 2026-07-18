#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

import { loadMediaPublicationContract } from './lib/media-publication-contract.mjs'
import {
  isContentPublishedAtBuildDate,
  resolveContentBuildDate,
} from '../src/lib/content/publication-contract.mjs'

const WIDTH = 1200
const HEIGHT = 630
const SITE = 'nguyenlephong.github.io'

const THEMES = {
  ocean: { bg: '#06131f', accent: '#14b8a6', accent2: '#38bdf8', text: '#ecfeff', muted: '#a7f3d0' },
  gold: { bg: '#130d05', accent: '#f59e0b', accent2: '#fde68a', text: '#fff7ed', muted: '#fed7aa' },
  violet: { bg: '#100b1f', accent: '#a78bfa', accent2: '#f0abfc', text: '#faf5ff', muted: '#ddd6fe' },
  dark: { bg: '#0b0f19', accent: '#60a5fa', accent2: '#c084fc', text: '#f8fafc', muted: '#cbd5e1' },
  light: { bg: '#f8fafc', accent: '#2563eb', accent2: '#db2777', text: '#0f172a', muted: '#334155' },
}

function arg(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1]
}

function hasFlag(name) {
  return process.argv.includes(name)
}

const surfaceArg = arg('--surface')
const slugArg = arg('--slug')
const contentBuildDate = resolveContentBuildDate(process.env.CONTENT_BUILD_DATE)
const publicationContract = await loadMediaPublicationContract()

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrapWords(text, maxChars, maxLines) {
  const words = String(text ?? '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  const lines = []
  let line = ''

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length <= maxChars) {
      line = next
      continue
    }
    if (line) lines.push(line)
    line = word
    if (lines.length === maxLines) break
  }

  if (line && lines.length < maxLines) lines.push(line)
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?]$/, '')}...`
  }
  return lines
}

function textBlock(lines, x, y, size, lineHeight, fill, weight = 700) {
  return lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`
    })
    .join('')
    .replace(/^/, `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}">`)
    .concat('</text>')
}

function readJson(file) {
  return fs.readFile(file, 'utf8').then((raw) => JSON.parse(raw))
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function renderSvg({ eyebrow, title, summary, tags, date, themeKey }) {
  const theme = THEMES[themeKey] ?? THEMES.dark
  const titleLines = wrapWords(title, 27, 3)
  const summaryLines = wrapWords(summary, 68, 3)
  const chipItems = tags.slice(0, 4)
  const chipSvg = chipItems
    .map((tag, index) => {
      const text = escapeXml(tag)
      const x = 72 + index * 224
      return `
        <g transform="translate(${x} 502)">
          <rect width="204" height="42" rx="12" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.14)"/>
          <text x="18" y="27" font-size="18" font-weight="650" fill="${theme.muted}">${text.length > 18 ? `${text.slice(0, 17)}...` : text}</text>
        </g>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="18%" cy="18%" r="70%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.42"/>
      <stop offset="62%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="86%" cy="78%" r="65%">
      <stop offset="0%" stop-color="${theme.accent2}" stop-opacity="0.34"/>
      <stop offset="68%" stop-color="${theme.accent2}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="line" x1="0" x2="1">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${theme.accent2}" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${theme.bg}"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <path d="M820 70 C930 140 980 230 1128 270" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="2"/>
  <path d="M840 116 C968 190 992 332 1134 394" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
  <rect x="54" y="54" width="1092" height="522" rx="30" fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.12)"/>
  <rect x="72" y="86" width="252" height="44" rx="22" fill="rgba(255,255,255,0.09)"/>
  <circle cx="96" cy="108" r="6" fill="${theme.accent}"/>
  <text x="112" y="116" font-size="18" font-weight="750" fill="${theme.muted}">${escapeXml(eyebrow)}</text>
  <text x="900" y="116" font-size="20" font-weight="760" fill="${theme.muted}">${escapeXml(SITE)}</text>
  <rect x="72" y="158" width="92" height="6" rx="3" fill="url(#line)"/>
  ${textBlock(titleLines, 72, 230, title.length > 58 ? 54 : 62, title.length > 58 ? 62 : 70, theme.text, 840)}
  ${textBlock(summaryLines, 74, 404, 25, 34, theme.muted, 520)}
  ${chipSvg}
  <text x="72" y="567" font-size="18" font-weight="650" fill="${theme.muted}">${escapeXml(formatDate(date))}</text>
  <text x="985" y="567" font-size="18" font-weight="650" fill="${theme.muted}">Static Open Graph</text>
</svg>`
}

async function writeOgImage(target) {
  const svg = renderSvg(target)
  await fs.mkdir(path.dirname(target.outfile), { recursive: true })
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(target.outfile)
  console.log(`[static-og] ${path.relative(process.cwd(), target.outfile)}`)
}

async function blogTargets(slug, publication) {
  const index = await readJson(path.join(process.cwd(), publication.sourceIndex))
  const categories = new Map(index.categories.map((category) => [category.slug, category]))
  return index.posts
    .filter((post) => isContentPublishedAtBuildDate(post, contentBuildDate))
    .filter((post) => !slug || post.slug === slug)
    .map((post) => {
      const category = categories.get(post.category)
      return {
        eyebrow: `Blog - ${category?.title ?? post.category}`,
        title: post.title,
        summary: post.summary,
        tags: post.tags,
        date: post.date,
        themeKey: category?.accent ?? 'ocean',
        outfile: path.join(
          process.cwd(),
          publication.sourceDirectory,
          `${post.slug}${publication.sourceExtension}`,
        ),
      }
    })
}

async function noteTargets(slug, publication) {
  const index = await readJson(path.join(process.cwd(), publication.sourceIndex))
  const topics = new Map(index.topics.map((topic) => [topic.id, topic]))
  return index.posts
    .filter((post) => isContentPublishedAtBuildDate(post, contentBuildDate))
    .filter((post) => !slug || post.slug === slug)
    .map((post) => ({
      eyebrow: `Notes - ${topics.get(post.topic)?.label ?? 'Reflection'}`,
      title: post.title,
      summary: post.cardSummary ?? post.summary,
      tags: post.tags,
      date: post.date,
      themeKey: 'ocean',
      outfile: path.join(
        process.cwd(),
        publication.sourceDirectory,
        `${post.slug}${publication.sourceExtension}`,
      ),
    }))
}

const targets = []
if (!surfaceArg || surfaceArg === 'blog') {
  targets.push(...(await blogTargets(slugArg, publicationContract.articleOg.blog)))
}
if (!surfaceArg || surfaceArg === 'notes') {
  targets.push(...(await noteTargets(slugArg, publicationContract.articleOg.notes)))
}

if (targets.length === 0) {
  console.error(`No OG target found${surfaceArg ? ` for ${surfaceArg}` : ''}${slugArg ? `/${slugArg}` : ''}`)
  process.exit(1)
}

if (hasFlag('--list')) {
  for (const target of targets) console.log(target.outfile)
} else {
  for (const target of targets) await writeOgImage(target)
}
