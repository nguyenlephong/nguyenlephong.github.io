/**
 * Minimal RSS 2.0 renderer for the static blog and notes feeds. Kept free of
 * app imports so node:test can exercise it directly.
 */

export interface FeedItem {
  title: string
  /** Absolute canonical URL; also used as the permalink guid. */
  link: string
  /** ISO date (yyyy-mm-dd or full timestamp). */
  date: string
  description: string
  categories: readonly string[]
}

export interface FeedChannel {
  title: string
  description: string
  /** Absolute URL of the HTML page this feed mirrors. */
  link: string
  /** Absolute URL of the feed document itself. */
  selfUrl: string
  /** BCP 47 language tag, e.g. "vi". */
  language: string
  items: readonly FeedItem[]
}

/** Latest items kept per feed; older entries stay reachable via the site index. */
export const FEED_ITEM_LIMIT = 100

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

// Control characters that are illegal in XML 1.0.
const XML_ILLEGAL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g

export function escapeXml(value: string): string {
  return value
    .replace(XML_ILLEGAL_CHARS, '')
    .replace(/[&<>"']/g, (char) => XML_ESCAPES[char])
}

/** RFC 822 date as required by RSS; invalid input yields null. */
export function toRfc822(value: string): string | null {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toUTCString()
}

function renderItem(item: FeedItem): string {
  const pubDate = toRfc822(item.date)
  return [
    '    <item>',
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${escapeXml(item.link)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
    ...(pubDate ? [`      <pubDate>${pubDate}</pubDate>`] : []),
    `      <description>${escapeXml(item.description)}</description>`,
    ...item.categories
      .filter(Boolean)
      .map((category) => `      <category>${escapeXml(category)}</category>`),
    '    </item>',
  ].join('\n')
}

export function renderRssFeed(channel: FeedChannel): string {
  const newest = channel.items
    .map((item) => toRfc822(item.date))
    .find((value): value is string => value !== null)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <language>${escapeXml(channel.language)}</language>`,
    ...(newest ? [`    <lastBuildDate>${newest}</lastBuildDate>`] : []),
    `    <atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml" />`,
    ...channel.items.map(renderItem),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
