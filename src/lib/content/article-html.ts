import { decodeHTMLAttribute, escapeAttribute } from "entities";

const SAFE_LOCALE_SEGMENT = /^[a-z]{2}(?:-[a-z0-9]+)*$/i;
const LOCALIZABLE_ARTICLE_HREF = /^\/(?:blog|notes|thoughts)(?=\/|[?#]|$)/i;
const RAW_TEXT_ELEMENTS = new Set([
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "script",
  "style",
  "textarea",
  "title",
  "xmp"
]);

function findTagEnd(html: string, start: number): number {
  let quote: '"' | "'" | null = null;

  for (let index = start + 1; index < html.length; index += 1) {
    const character = html[index];
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === ">") return index;
  }

  return -1;
}

function startTagName(tag: string): string | null {
  return tag.match(/^<\s*([a-z][^\s/>]*)/i)?.[1]?.toLowerCase() ?? null;
}

function findRawTextElementEnd(
  html: string,
  lowerHtml: string,
  tagName: string,
  contentStart: number
): number {
  let searchFrom = contentStart;
  const closingPrefix = `</${tagName}`;

  while (searchFrom < html.length) {
    const closingStart = lowerHtml.indexOf(closingPrefix, searchFrom);
    if (closingStart === -1) return html.length;
    const boundary = lowerHtml[closingStart + closingPrefix.length];
    if (boundary === ">" || /\s/.test(boundary ?? "")) {
      const closingEnd = findTagEnd(html, closingStart);
      return closingEnd === -1 ? html.length : closingEnd + 1;
    }
    searchFrom = closingStart + closingPrefix.length;
  }

  return html.length;
}

function localizeAnchorTag(tag: string, locale: string): string {
  const anchorStart = tag.match(/^<\s*a(?=[\s/>])/i);
  if (!anchorStart) return tag;

  let cursor = anchorStart[0].length;
  while (cursor < tag.length) {
    while (/\s/.test(tag[cursor] ?? "")) cursor += 1;
    if (tag[cursor] === ">" || tag[cursor] === "/") break;

    const nameStart = cursor;
    while (cursor < tag.length && !/[\s="'/>]/.test(tag[cursor] ?? "")) {
      cursor += 1;
    }
    const attributeName = tag.slice(nameStart, cursor).toLowerCase();
    if (!attributeName) {
      cursor += 1;
      continue;
    }

    while (/\s/.test(tag[cursor] ?? "")) cursor += 1;
    if (tag[cursor] !== "=") {
      if (attributeName === "href") return tag;
      continue;
    }

    cursor += 1;
    while (/\s/.test(tag[cursor] ?? "")) cursor += 1;
    const tokenStart = cursor;
    const quote =
      tag[cursor] === '"' || tag[cursor] === "'" ? tag[cursor] : null;
    let valueStart = cursor;
    let valueEnd = cursor;
    let tokenEnd = cursor;

    if (quote) {
      valueStart = cursor + 1;
      valueEnd = tag.indexOf(quote, valueStart);
      if (valueEnd === -1) return tag;
      tokenEnd = valueEnd + 1;
    } else {
      while (valueEnd < tag.length && !/[\s>]/.test(tag[valueEnd] ?? "")) {
        valueEnd += 1;
      }
      tokenEnd = valueEnd;
    }

    if (attributeName === "href") {
      const href = decodeHTMLAttribute(tag.slice(valueStart, valueEnd));
      if (!LOCALIZABLE_ARTICLE_HREF.test(href)) return tag;
      const localized = escapeAttribute(`/${locale}${href}`);
      return `${tag.slice(0, tokenStart)}"${localized}"${tag.slice(tokenEnd)}`;
    }

    cursor = tokenEnd;
  }

  return tag;
}

function tagHasAttribute(tag: string, targetName: string): boolean {
  const tagStart = tag.match(/^<\s*[a-z][^\s/>]*/i);
  if (!tagStart) return false;

  let cursor = tagStart[0].length;
  while (cursor < tag.length) {
    while (/\s/.test(tag[cursor] ?? "")) cursor += 1;
    if (tag[cursor] === ">" || tag[cursor] === "/") return false;

    const nameStart = cursor;
    while (cursor < tag.length && !/[\s="'/>]/.test(tag[cursor] ?? "")) {
      cursor += 1;
    }
    const attributeName = tag.slice(nameStart, cursor).toLowerCase();
    if (!attributeName) {
      cursor += 1;
      continue;
    }
    if (attributeName === targetName) return true;

    while (/\s/.test(tag[cursor] ?? "")) cursor += 1;
    if (tag[cursor] !== "=") continue;
    cursor += 1;
    while (/\s/.test(tag[cursor] ?? "")) cursor += 1;

    const quote =
      tag[cursor] === '"' || tag[cursor] === "'" ? tag[cursor] : null;
    if (quote) {
      const valueEnd = tag.indexOf(quote, cursor + 1);
      if (valueEnd === -1) return false;
      cursor = valueEnd + 1;
      continue;
    }
    while (cursor < tag.length && !/[\s>]/.test(tag[cursor] ?? "")) {
      cursor += 1;
    }
  }

  return false;
}

function transformArticleStartTags(
  html: string,
  transform: (tag: string, tagName: string | null) => string
): string {
  const lowerHtml = html.toLowerCase();
  const output: string[] = [];
  let cursor = 0;

  while (cursor < html.length) {
    const tagStart = html.indexOf("<", cursor);
    if (tagStart === -1) {
      output.push(html.slice(cursor));
      break;
    }

    output.push(html.slice(cursor, tagStart));
    if (html.startsWith("<!--", tagStart)) {
      const commentEnd = html.indexOf("-->", tagStart + 4);
      const nextCursor = commentEnd === -1 ? html.length : commentEnd + 3;
      output.push(html.slice(tagStart, nextCursor));
      cursor = nextCursor;
      continue;
    }

    const tagEnd = findTagEnd(html, tagStart);
    if (tagEnd === -1) {
      output.push(html.slice(tagStart));
      break;
    }

    const tag = html.slice(tagStart, tagEnd + 1);
    const tagName = startTagName(tag);
    output.push(transform(tag, tagName));
    cursor = tagEnd + 1;

    if (tagName && RAW_TEXT_ELEMENTS.has(tagName)) {
      if (tagName === "plaintext") {
        output.push(html.slice(cursor));
        cursor = html.length;
        continue;
      }
      const rawTextEnd = findRawTextElementEnd(
        html,
        lowerHtml,
        tagName,
        cursor
      );
      output.push(html.slice(cursor, rawTextEnd));
      cursor = rawTextEnd;
    }
  }

  return output.join("");
}

/**
 * Article bodies are trusted repository-authored HTML. Their internal links are
 * stored without a locale so one canonical body can serve every localized route.
 * Scan real start tags so text, comments, and raw-text elements stay untouched;
 * decode href values with browser-equivalent HTML attribute semantics before
 * rewriting only root-relative Blog, Notes, and Thoughts anchors.
 */
export function localizeArticleHtmlLinks(html: string, locale: string): string {
  if (!SAFE_LOCALE_SEGMENT.test(locale)) {
    throw new Error(`Invalid article locale: ${locale}`);
  }

  return transformArticleStartTags(html, (tag, tagName) =>
    tagName === "a" ? localizeAnchorTag(tag, locale) : tag
  );
}

/** Return true only when an authored article needs the optional canvas runtime. */
export function hasArticleWorkflowCanvas(html: string): boolean {
  let found = false;
  transformArticleStartTags(html, (tag, tagName) => {
    if (tagName === "canvas" && tagHasAttribute(tag, "data-blog-workflow")) {
      found = true;
    }
    return tag;
  });
  return found;
}
