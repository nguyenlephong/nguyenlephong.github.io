import { decodeHTMLAttribute } from 'entities'
import ts from 'typescript'

const HTML_SIMPLE_URL_ATTRIBUTES = new Set(['content', 'href', 'src'])
const HTML_SRCSET_ATTRIBUTES = new Set(['imagesrcset', 'srcset'])
const HTML_STYLE_ATTRIBUTE = 'style'
const RAW_TEXT_HTML_ELEMENTS = new Set(['script', 'style'])
const STRUCTURAL_PREFIXES = new Set(['[', '(', '{', ',', ':'])
const STRUCTURAL_SUFFIXES = new Set([']', ')', '}', ',', ':'])

function applyReplacements(content, replacements) {
  if (replacements.length === 0) return content
  let next = content
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    next = `${next.slice(0, replacement.start)}${replacement.value}${next.slice(replacement.end)}`
  }
  return next
}

function firstRawSuffixIndex(rawValue) {
  const literal = rawValue.search(/[?#]/)
  const encoded = rawValue.search(/\\u00(?:23|3f)/i)
  if (literal === -1) return encoded
  if (encoded === -1) return literal
  return Math.min(literal, encoded)
}

function encodeStringContent(value, quote, escapedSlashes) {
  let encoded = value
    .replaceAll('\\', '\\\\')
    .replaceAll('\b', '\\b')
    .replaceAll('\f', '\\f')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
    .replaceAll('\t', '\\t')
    .replaceAll(quote, `\\${quote}`)
  if (escapedSlashes) encoded = encoded.replaceAll('/', '\\/')
  return encoded
}

function encodeReplacementLike(rawValue, decodedValue, replacement, quote) {
  const rawSuffixIndex = firstRawSuffixIndex(rawValue)
  const decodedSuffixIndex = decodedValue.search(/[?#]/)
  const escapedSlashes = rawValue.slice(0, rawSuffixIndex === -1 ? undefined : rawSuffixIndex).includes('\\/')

  if (rawSuffixIndex !== -1 && decodedSuffixIndex !== -1) {
    const prefix = encodeStringContent(
      replacement.slice(0, replacement.search(/[?#]/)),
      quote,
      escapedSlashes,
    )
    return `${prefix}${rawValue.slice(rawSuffixIndex)}`
  }
  return encodeStringContent(replacement, quote, escapedSlashes)
}

function decodeJsonString(rawToken) {
  try {
    return JSON.parse(rawToken)
  } catch {
    return null
  }
}

function decodeLooseString(rawValue, quote) {
  if (quote === '"') return decodeJsonString(`"${rawValue}"`)
  try {
    return JSON.parse(`"${rawValue.replaceAll('\\\'', "'").replaceAll('"', '\\"')}"`)
  } catch {
    return null
  }
}

function transformValue(rawValue, decodedValue, quote, transform) {
  if (decodedValue === null) return rawValue
  const replacement = transform(decodedValue)
  if (typeof replacement !== 'string' || replacement === decodedValue) return rawValue
  return encodeReplacementLike(rawValue, decodedValue, replacement, quote)
}

function findHtmlTagEnd(content, start) {
  let quote = null
  for (let index = start + 1; index < content.length; index += 1) {
    const character = content[index]
    if (quote) {
      if (character === quote) quote = null
      continue
    }
    if (character === '"' || character === "'") quote = character
    else if (character === '>') return index + 1
  }
  return content.length
}

function isAsciiWhitespace(character) {
  return character === ' ' || character === '\t' || character === '\n' || character === '\f' || character === '\r'
}

function encodeHtmlAttributeValue(value, quote) {
  let encoded = ''
  for (const character of value) {
    if (character === '&') encoded += '&amp;'
    else if (character === '<') encoded += '&lt;'
    else if (character === '>') encoded += '&gt;'
    else if (character === '"' && quote !== "'") encoded += '&quot;'
    else if (character === "'" && quote !== '"') encoded += '&apos;'
    else if (!quote && character === '`') encoded += '&#96;'
    else if (!quote && character === '=') encoded += '&#61;'
    else if (!quote && isAsciiWhitespace(character)) {
      encoded += `&#${character.codePointAt(0)};`
    } else encoded += character
  }
  return encoded
}

function parseSrcsetDescriptor(rawDescriptor, currentKind) {
  const descriptors = rawDescriptor.trim().split(/[\t\n\f\r ]+/).filter(Boolean)
  if (descriptors.length === 0) return currentKind
  if (descriptors.length !== 1) throw new Error('invalid srcset: multiple descriptors')
  const descriptor = descriptors[0]
  let kind
  if (/^\d+w$/.test(descriptor) && Number.parseInt(descriptor, 10) > 0) {
    kind = 'w'
  } else if (descriptor.endsWith('x')) {
    const density = descriptor.slice(0, -1)
    const validFloatingPoint = /^(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(density)
    const value = Number(density)
    if (!validFloatingPoint || !Number.isFinite(value) || value <= 0) {
      throw new Error(`invalid srcset descriptor: ${descriptor}`)
    }
    kind = 'x'
  } else {
    throw new Error(`invalid srcset descriptor: ${descriptor}`)
  }
  if (currentKind && currentKind !== kind) throw new Error('invalid srcset: mixed x and w descriptors')
  return kind
}

function srcsetUrlSpans(rawValue) {
  const spans = []
  let cursor = 0
  let descriptorKind = null

  while (cursor < rawValue.length) {
    while (
      cursor < rawValue.length &&
      (isAsciiWhitespace(rawValue[cursor]) || rawValue[cursor] === ',')
    ) {
      cursor += 1
    }
    if (cursor >= rawValue.length) break

    const start = cursor
    while (cursor < rawValue.length && !isAsciiWhitespace(rawValue[cursor])) cursor += 1
    let end = cursor
    while (end > start && rawValue[end - 1] === ',') end -= 1
    if (end === start) throw new Error('invalid srcset: empty URL candidate')
    spans.push({ end, start })

    if (end !== cursor) continue
    while (cursor < rawValue.length && isAsciiWhitespace(rawValue[cursor])) cursor += 1
    const descriptorStart = cursor
    let parentheses = 0
    while (cursor < rawValue.length) {
      const character = rawValue[cursor]
      if (character === '(') parentheses += 1
      else if (character === ')') {
        if (parentheses === 0) throw new Error('invalid srcset: unmatched descriptor parenthesis')
        parentheses -= 1
      } else if (character === ',' && parentheses === 0) {
        break
      }
      cursor += 1
    }
    if (parentheses !== 0) throw new Error('invalid srcset: unclosed descriptor parenthesis')
    descriptorKind = parseSrcsetDescriptor(rawValue.slice(descriptorStart, cursor), descriptorKind)
    if (rawValue[cursor] === ',') cursor += 1
  }

  return spans
}

function transformSrcset(rawValue, quote, transform, decodedAttribute = false) {
  const replacements = []
  for (const { end, start } of srcsetUrlSpans(rawValue)) {
    const rawUrl = rawValue.slice(start, end)
    const decodedUrl = rawUrl.replaceAll('\\/', '/')
    const transformed = transform(decodedUrl)
    const next =
      typeof transformed !== 'string' || transformed === decodedUrl
        ? rawUrl
        : decodedAttribute
          ? transformed
          : transformValue(rawUrl, decodedUrl, quote, () => transformed)
    if (next !== rawUrl) replacements.push({ end, start, value: next })
  }
  return applyReplacements(rawValue, replacements)
}

function transformHtmlTag(tag, transform) {
  if (/^<\s*[!/?]/.test(tag)) return tag
  const tagName = /^<\s*([^\s/>]+)/.exec(tag)?.[1]
  if (!tagName) return tag
  let cursor = tag.indexOf(tagName) + tagName.length
  const replacements = []

  while (cursor < tag.length - 1) {
    while (/\s|\//.test(tag[cursor] ?? '')) cursor += 1
    if (cursor >= tag.length - 1 || tag[cursor] === '>') break
    const nameStart = cursor
    while (cursor < tag.length && !/[\s=/>]/.test(tag[cursor])) cursor += 1
    const name = tag.slice(nameStart, cursor).toLowerCase()
    while (/\s/.test(tag[cursor] ?? '')) cursor += 1
    if (tag[cursor] !== '=') continue
    cursor += 1
    while (/\s/.test(tag[cursor] ?? '')) cursor += 1

    let quote = ''
    let valueStart = cursor
    let valueEnd
    if (tag[cursor] === '"' || tag[cursor] === "'") {
      quote = tag[cursor]
      valueStart = cursor + 1
      valueEnd = tag.indexOf(quote, valueStart)
      if (valueEnd === -1) break
      cursor = valueEnd + 1
    } else {
      while (cursor < tag.length && !/[\s>]/.test(tag[cursor])) cursor += 1
      valueEnd = cursor
    }

    if (
      !HTML_SIMPLE_URL_ATTRIBUTES.has(name) &&
      !HTML_SRCSET_ATTRIBUTES.has(name) &&
      name !== HTML_STYLE_ATTRIBUTE
    ) {
      continue
    }
    const rawValue = tag.slice(valueStart, valueEnd)
    const decodedValue = decodeHTMLAttribute(rawValue)
    let next
    if (HTML_SRCSET_ATTRIBUTES.has(name)) {
      next = transformSrcset(decodedValue, quote || '"', transform, true)
    } else if (name === HTML_STYLE_ATTRIBUTE) {
      next = transformCss(decodedValue, transform)
    } else {
      const transformed = transform(decodedValue.replaceAll('\\/', '/'))
      next = typeof transformed === 'string' ? transformed : decodedValue
    }
    if (next !== decodedValue) {
      replacements.push({
        end: valueEnd,
        start: valueStart,
        value: encodeHtmlAttributeValue(next, quote),
      })
    }
  }
  return applyReplacements(tag, replacements)
}

function isNextFlightPushCall(node) {
  if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression)) return false
  const push = node.expression
  if (push.name.text !== 'push' || !ts.isPropertyAccessExpression(push.expression)) return false
  const flight = push.expression
  return (
    flight.name.text === '__next_f' &&
    ts.isIdentifier(flight.expression) &&
    flight.expression.text === 'self'
  )
}

function parseHexEscape(raw, start, length) {
  const value = raw.slice(start, start + length)
  if (value.length !== length || !/^[0-9a-f]+$/i.test(value)) return null
  return Number.parseInt(value, 16)
}

function decodeJsStringLiteral(rawToken) {
  const quote = rawToken[0]
  if ((quote !== '"' && quote !== "'") || rawToken.at(-1) !== quote) return null
  const raw = rawToken.slice(1, -1)
  const boundaries = [0]
  let decoded = ''
  let cursor = 0

  function append(value, rawEnd) {
    decoded += value
    for (let index = 0; index < value.length; index += 1) boundaries.push(rawEnd)
  }

  while (cursor < raw.length) {
    if (raw[cursor] !== '\\') {
      append(raw[cursor], cursor + 1)
      cursor += 1
      continue
    }

    const escapeStart = cursor
    cursor += 1
    if (cursor >= raw.length) return null
    const escaped = raw[cursor]
    cursor += 1
    const simple = new Map([
      ['b', '\b'],
      ['f', '\f'],
      ['n', '\n'],
      ['r', '\r'],
      ['t', '\t'],
      ['v', '\v'],
      ['0', '\0'],
    ])
    if (simple.has(escaped)) {
      append(simple.get(escaped), cursor)
      continue
    }
    if (escaped === '\n') continue
    if (escaped === '\r') {
      if (raw[cursor] === '\n') cursor += 1
      continue
    }
    if (escaped === 'x') {
      const value = parseHexEscape(raw, cursor, 2)
      if (value === null) return null
      cursor += 2
      append(String.fromCharCode(value), cursor)
      continue
    }
    if (escaped === 'u') {
      if (raw[cursor] === '{') {
        const close = raw.indexOf('}', cursor + 1)
        if (close === -1) return null
        const digits = raw.slice(cursor + 1, close)
        if (!/^[0-9a-f]{1,6}$/i.test(digits)) return null
        const value = Number.parseInt(digits, 16)
        if (value > 0x10ffff) return null
        cursor = close + 1
        append(String.fromCodePoint(value), cursor)
      } else {
        const value = parseHexEscape(raw, cursor, 4)
        if (value === null) return null
        cursor += 4
        append(String.fromCharCode(value), cursor)
      }
      continue
    }
    if (escapeStart + 1 === cursor) return null
    append(escaped, cursor)
  }

  return { boundaries, decoded, quote }
}

function encodeJsStringFragment(value, quote) {
  let encoded = ''
  for (const character of value) {
    const codePoint = character.codePointAt(0)
    if (character === '\\') encoded += '\\\\'
    else if (character === quote) encoded += `\\${quote}`
    else if (character === '\b') encoded += '\\b'
    else if (character === '\f') encoded += '\\f'
    else if (character === '\n') encoded += '\\n'
    else if (character === '\r') encoded += '\\r'
    else if (character === '\t') encoded += '\\t'
    else if (character === '\v') encoded += '\\v'
    else if (codePoint === 0x2028 || codePoint === 0x2029) {
      encoded += `\\u${codePoint.toString(16).padStart(4, '0')}`
    } else if (codePoint < 0x20) {
      encoded += `\\x${codePoint.toString(16).padStart(2, '0')}`
    } else encoded += character
  }
  return encoded
}

function nextFlightScriptReplacements(script, transform) {
  if (!script.includes('self.__next_f')) return []
  const source = ts.createSourceFile(
    'next-flight-inline.js',
    script,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  )
  const calls = []
  function collectCalls(node) {
    if (isNextFlightPushCall(node)) calls.push(node)
    ts.forEachChild(node, collectCalls)
  }
  collectCalls(source)
  if (calls.length === 0) return []
  if (source.parseDiagnostics.length > 0) {
    const diagnostic = ts.flattenDiagnosticMessageText(
      source.parseDiagnostics[0].messageText,
      ' ',
    )
    throw new Error(`cannot parse recognized Next Flight script: ${diagnostic}`)
  }

  const stringLiterals = new Map()
  function collectStrings(node) {
    if (ts.isStringLiteral(node)) {
      stringLiterals.set(`${node.getStart(source)}:${node.getEnd()}`, node)
      return
    }
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      throw new Error('cannot parse recognized Next Flight script: template payload is unsupported')
    }
    ts.forEachChild(node, collectStrings)
  }
  for (const call of calls) {
    for (const argument of call.arguments) collectStrings(argument)
  }

  const replacements = []
  for (const literal of stringLiterals.values()) {
    const tokenStart = literal.getStart(source)
    const tokenEnd = literal.getEnd()
    const decoded = decodeJsStringLiteral(script.slice(tokenStart, tokenEnd))
    if (!decoded || decoded.decoded !== literal.text) {
      throw new Error('cannot parse recognized Next Flight script: string decoding mismatch')
    }
    for (const replacement of planLooseTextReplacements(decoded.decoded, transform)) {
      const rawStart = decoded.boundaries[replacement.start]
      const rawEnd = decoded.boundaries[replacement.end]
      if (rawStart === undefined || rawEnd === undefined) {
        throw new Error('cannot parse recognized Next Flight script: invalid string offset')
      }
      replacements.push({
        end: tokenStart + 1 + rawEnd,
        start: tokenStart + 1 + rawStart,
        value: encodeJsStringFragment(replacement.value, decoded.quote),
      })
    }
  }
  return replacements
}

function transformNextFlightScript(script, transform) {
  return applyReplacements(script, nextFlightScriptReplacements(script, transform))
}

function transformHtml(content, transform) {
  const lower = content.toLowerCase()
  const replacements = []
  let cursor = 0

  while (cursor < content.length) {
    const start = content.indexOf('<', cursor)
    if (start === -1) break
    if (content.startsWith('<!--', start)) {
      const end = content.indexOf('-->', start + 4)
      cursor = end === -1 ? content.length : end + 3
      continue
    }
    const end = findHtmlTagEnd(content, start)
    const tag = content.slice(start, end)
    const next = transformHtmlTag(tag, transform)
    if (next !== tag) replacements.push({ end, start, value: next })

    const opening = /^<\s*([^\s/>]+)/.exec(tag)?.[1]?.toLowerCase()
    if (opening && RAW_TEXT_HTML_ELEMENTS.has(opening) && !/\/\s*>$/.test(tag)) {
      const closing = lower.indexOf(`</${opening}`, end)
      const bodyEnd = closing === -1 ? content.length : closing
      if (opening === 'script') {
        const body = content.slice(end, bodyEnd)
        const nextBody = transformNextFlightScript(body, transform)
        if (nextBody !== body) replacements.push({ end: bodyEnd, start: end, value: nextBody })
      } else if (opening === 'style') {
        const body = content.slice(end, bodyEnd)
        const nextBody = transformCss(body, transform)
        if (nextBody !== body) replacements.push({ end: bodyEnd, start: end, value: nextBody })
      }
      if (closing === -1) break
      cursor = closing
      continue
    }
    cursor = end
  }
  return applyReplacements(content, replacements)
}

function jsonStringTokens(content) {
  const tokens = []
  let cursor = 0
  while (cursor < content.length) {
    if (content[cursor] !== '"') {
      cursor += 1
      continue
    }
    const start = cursor
    cursor += 1
    while (cursor < content.length) {
      if (content[cursor] === '\\') {
        cursor += 2
      } else if (content[cursor] === '"') {
        cursor += 1
        break
      } else {
        cursor += 1
      }
    }
    if (content[cursor - 1] !== '"') break
    let next = cursor
    while (/\s/.test(content[next] ?? '')) next += 1
    tokens.push({ end: cursor, isKey: content[next] === ':', start })
  }
  return tokens
}

function transformJson(content, transform) {
  const replacements = []
  for (const token of jsonStringTokens(content)) {
    if (token.isKey) continue
    const rawToken = content.slice(token.start, token.end)
    const decoded = decodeJsonString(rawToken)
    if (decoded === null) continue
    const rawValue = rawToken.slice(1, -1)
    const next = transformValue(rawValue, decoded, '"', transform)
    if (next !== rawValue) {
      replacements.push({ end: token.end - 1, start: token.start + 1, value: next })
    }
  }
  return applyReplacements(content, replacements)
}

function precedingBackslashes(content, quoteIndex) {
  let count = 0
  for (let index = quoteIndex - 1; index >= 0 && content[index] === '\\'; index -= 1) count += 1
  return count
}

function previousSignificant(content, index) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (!/\s/.test(content[cursor])) return content[cursor]
  }
  return null
}

function nextSignificant(content, index) {
  for (let cursor = index; cursor < content.length; cursor += 1) {
    if (!/\s/.test(content[cursor])) return content[cursor]
  }
  return null
}

function hasStructuralBoundaries(content, start, end, escapeLevel) {
  const prefixIndex = start - escapeLevel
  const before = previousSignificant(content, prefixIndex)
  const after = nextSignificant(content, end + 1)
  return (
    (before === null || STRUCTURAL_PREFIXES.has(before)) &&
    (after === null || STRUCTURAL_SUFFIXES.has(after))
  )
}

function looseStringTokens(content, occupied, escapeLevel) {
  const tokens = []
  for (let cursor = 0; cursor < content.length; cursor += 1) {
    if (occupied[cursor]) continue
    const quote = content[cursor]
    if ((quote !== '"' && quote !== "'") || precedingBackslashes(content, cursor) !== escapeLevel) {
      continue
    }
    let end = cursor + 1
    while (end < content.length) {
      if (
        !occupied[end] &&
        content[end] === quote &&
        precedingBackslashes(content, end) === escapeLevel
      ) {
        break
      }
      end += 1
    }
    if (end >= content.length || !hasStructuralBoundaries(content, cursor, end, escapeLevel)) continue
    const rangeStart = cursor - escapeLevel
    const rangeEnd = end + 1
    tokens.push({
      end,
      escapeLevel,
      quote,
      start: cursor,
    })
    occupied.fill(true, rangeStart, rangeEnd)
    cursor = rangeEnd - 1
  }
  return tokens
}

function planLooseTextReplacements(content, transform) {
  const occupied = new Uint8Array(content.length)
  const tokens = [
    ...looseStringTokens(content, occupied, 0),
    ...looseStringTokens(content, occupied, 1),
  ]
  const replacements = []
  for (const token of tokens) {
    const rawValue = content.slice(token.start + 1, token.end - token.escapeLevel)
    const decoded = decodeLooseString(rawValue, token.quote)
    const next = transformValue(rawValue, decoded, token.quote, transform)
    if (next !== rawValue) {
      replacements.push({
        end: token.end - token.escapeLevel,
        start: token.start + 1,
        value: next,
      })
    }
  }
  return replacements
}

function transformLooseText(content, transform) {
  return applyReplacements(content, planLooseTextReplacements(content, transform))
}

function cssUrlValueSpans(content) {
  const spans = []
  let cursor = 0
  let stringQuote = null
  let comment = false
  while (cursor < content.length) {
    if (comment) {
      const end = content.indexOf('*/', cursor)
      if (end === -1) break
      cursor = end + 2
      comment = false
      continue
    }
    if (stringQuote) {
      if (content[cursor] === '\\') cursor += 2
      else if (content[cursor] === stringQuote) {
        stringQuote = null
        cursor += 1
      } else cursor += 1
      continue
    }
    if (content.startsWith('/*', cursor)) {
      comment = true
      cursor += 2
      continue
    }
    if (content[cursor] === '"' || content[cursor] === "'") {
      stringQuote = content[cursor]
      cursor += 1
      continue
    }
    const urlMatch = /^url\s*\(/i.exec(content.slice(cursor))
    if (!urlMatch) {
      cursor += 1
      continue
    }
    let valueStart = cursor + urlMatch[0].length
    while (/\s/.test(content[valueStart] ?? '')) valueStart += 1
    const quote = content[valueStart] === '"' || content[valueStart] === "'" ? content[valueStart] : ''
    if (quote) valueStart += 1
    let valueEnd = valueStart
    while (valueEnd < content.length) {
      if (content[valueEnd] === '\\') valueEnd += 2
      else if ((quote && content[valueEnd] === quote) || (!quote && content[valueEnd] === ')')) break
      else valueEnd += 1
    }
    if (valueEnd >= content.length) break
    let rawEnd = valueEnd
    if (!quote) {
      while (rawEnd > valueStart && /\s/.test(content[rawEnd - 1])) rawEnd -= 1
    }
    spans.push({ end: rawEnd, quote, start: valueStart })
    const close = quote ? content.indexOf(')', valueEnd + 1) : valueEnd
    cursor = close === -1 ? valueEnd + 1 : close + 1
  }
  return spans
}

function transformCss(content, transform) {
  const replacements = []
  for (const span of cssUrlValueSpans(content)) {
    const rawValue = content.slice(span.start, span.end)
    const next = transformValue(
      rawValue,
      rawValue.replaceAll('\\/', '/'),
      span.quote || '"',
      transform,
    )
    if (next !== rawValue) replacements.push({ ...span, value: next })
  }
  return applyReplacements(content, replacements)
}

export function transformConsumerUrls(content, extension, transform) {
  switch (extension.toLowerCase()) {
    case '.html':
    case '.htm':
      return transformHtml(content, transform)
    case '.json':
    case '.webmanifest':
      return transformJson(content, transform)
    case '.rsc':
    case '.txt':
      return transformLooseText(content, transform)
    case '.css':
      return transformCss(content, transform)
    default:
      return content
  }
}

export function visitConsumerUrls(content, extension, visitor) {
  transformConsumerUrls(content, extension, (value) => {
    visitor(value)
    return value
  })
}
