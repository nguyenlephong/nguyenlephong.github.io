import { decodeHTMLAttribute, escapeAttribute } from "entities";

const SAFE_LOCALE_SEGMENT = /^[a-z]{2}(?:-[a-z0-9]+)*$/i;
const LOCALIZABLE_ARTICLE_HREF = /^\/(?:blog|notes|thoughts)(?=\/|[?#]|$)/i;
const START_TAG_PATTERN = /^<\s*([a-z][^\s/>]*)/i;
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

interface StartTagAttributeValue {
  readonly tokenStart: number;
  readonly tokenEnd: number;
  readonly valueStart: number;
  readonly valueEnd: number;
}

interface StartTagAttribute {
  readonly name: string;
  readonly value: StartTagAttributeValue | null;
}

interface ScannedAttributeName {
  readonly name: string;
  readonly nextCursor: number;
}

interface ScannedStartTagAttribute {
  readonly attribute: StartTagAttribute;
  readonly malformed: boolean;
  readonly nextCursor: number;
}

interface ScannedRawTextTail {
  readonly content: string;
  readonly nextCursor: number;
}

function skipWhitespace(value: string, start: number): number {
  let cursor = start;
  while (/\s/.test(value[cursor] ?? "")) cursor += 1;
  return cursor;
}

function scanAttributeName(tag: string, start: number): ScannedAttributeName {
  let cursor = start;
  while (cursor < tag.length && !/[\s="'/>]/.test(tag[cursor] ?? "")) {
    cursor += 1;
  }
  return {
    name: tag.slice(start, cursor).toLowerCase(),
    nextCursor: cursor
  };
}

function scanStartTagAttribute(
  tag: string,
  name: string,
  start: number
): ScannedStartTagAttribute {
  let cursor = skipWhitespace(tag, start);
  if (tag[cursor] !== "=") {
    return {
      attribute: { name, value: null },
      malformed: false,
      nextCursor: cursor
    };
  }

  cursor = skipWhitespace(tag, cursor + 1);
  const tokenStart = cursor;
  const quote = tag[cursor] === '"' || tag[cursor] === "'" ? tag[cursor] : null;
  if (quote) {
    const valueStart = cursor + 1;
    const valueEnd = tag.indexOf(quote, valueStart);
    if (valueEnd === -1) {
      return {
        attribute: { name, value: null },
        malformed: true,
        nextCursor: tag.length
      };
    }
    return {
      attribute: {
        name,
        value: {
          tokenStart,
          tokenEnd: valueEnd + 1,
          valueStart,
          valueEnd
        }
      },
      malformed: false,
      nextCursor: valueEnd + 1
    };
  }

  let valueEnd = cursor;
  while (valueEnd < tag.length && !/[\s>]/.test(tag[valueEnd] ?? "")) {
    valueEnd += 1;
  }
  return {
    attribute: {
      name,
      value: { tokenStart, tokenEnd: valueEnd, valueStart: cursor, valueEnd }
    },
    malformed: false,
    nextCursor: valueEnd
  };
}

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
  return START_TAG_PATTERN.exec(tag)?.[1]?.toLowerCase() ?? null;
}

function isRawTextClosingBoundary(boundary: string | undefined): boolean {
  return boundary === ">" || boundary === "/" || /\s/.test(boundary ?? "");
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
    if (isRawTextClosingBoundary(boundary)) {
      const closingEnd = findTagEnd(html, closingStart);
      return closingEnd === -1 ? html.length : closingEnd + 1;
    }
    searchFrom = closingStart + closingPrefix.length;
  }

  return html.length;
}

function scanRawTextTail(
  html: string,
  lowerHtml: string,
  tagName: string | null,
  contentStart: number
): ScannedRawTextTail {
  if (!tagName || !RAW_TEXT_ELEMENTS.has(tagName)) {
    return { content: "", nextCursor: contentStart };
  }
  const nextCursor =
    tagName === "plaintext"
      ? html.length
      : findRawTextElementEnd(html, lowerHtml, tagName, contentStart);
  return {
    content: html.slice(contentStart, nextCursor),
    nextCursor
  };
}

function visitStartTagAttributes(
  tag: string,
  visit: (attribute: StartTagAttribute) => boolean | void
): void {
  const tagStart = START_TAG_PATTERN.exec(tag);
  if (!tagStart) return;

  let cursor = tagStart[0].length;
  while (cursor < tag.length) {
    cursor = skipWhitespace(tag, cursor);
    if (tag[cursor] === ">" || tag[cursor] === "/") break;

    const scannedName = scanAttributeName(tag, cursor);
    cursor = scannedName.nextCursor;
    if (!scannedName.name) {
      cursor += 1;
      continue;
    }

    const scannedAttribute = scanStartTagAttribute(
      tag,
      scannedName.name,
      cursor
    );
    if (visit(scannedAttribute.attribute) === false) return;
    if (scannedAttribute.malformed) return;
    cursor = scannedAttribute.nextCursor;
  }
}

function localizeAnchorTag(tag: string, locale: string): string {
  let localizedTag = tag;
  visitStartTagAttributes(tag, (attribute) => {
    if (attribute.name !== "href") return;
    if (attribute.value) {
      const { tokenStart, tokenEnd, valueStart, valueEnd } = attribute.value;
      const href = decodeHTMLAttribute(tag.slice(valueStart, valueEnd));
      if (LOCALIZABLE_ARTICLE_HREF.test(href)) {
        const localized = escapeAttribute(`/${locale}${href}`);
        localizedTag = `${tag.slice(0, tokenStart)}"${localized}"${tag.slice(tokenEnd)}`;
      }
    }
    return false;
  });
  return localizedTag;
}

function tagHasAttribute(tag: string, targetName: string): boolean {
  let found = false;
  visitStartTagAttributes(tag, ({ name }) => {
    found = name === targetName;
    return !found;
  });
  return found;
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

    const rawTextTail = scanRawTextTail(html, lowerHtml, tagName, cursor);
    output.push(rawTextTail.content);
    cursor = rawTextTail.nextCursor;
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
