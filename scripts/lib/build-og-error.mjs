const MAX_DEPTH = 8
const MAX_ENTRIES = 24
const MAX_FIELD_LENGTH = 4 * 1024
const MAX_OUTPUT_LENGTH = 64 * 1024

function boundedText(value, limit = MAX_FIELD_LENGTH) {
  if (value.length <= limit) return value
  const marker = `\n... [string truncated: ${value.length - limit} character(s) omitted]`
  return `${value.slice(0, Math.max(0, limit - marker.length))}${marker}`
}

function readString(error, property, fallback = '') {
  try {
    return typeof error[property] === 'string' ? error[property] : fallback
  } catch {
    return fallback
  }
}

function readOwnDataProperty(error, property) {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(error, property)
    return descriptor && 'value' in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function primitiveDescription(value) {
  if (typeof value === 'string') return JSON.stringify(boundedText(value))
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return String(value)
  }
  if (typeof value === 'symbol') return boundedText(String(value))
  return `[non-Error ${typeof value}]`
}

export function formatBuildOgError(error) {
  const lines = []
  const seen = new WeakSet()
  let entries = 0
  let entryLimitReported = false

  const addEntryLimit = (depth) => {
    if (entryLimitReported) return
    entryLimitReported = true
    lines.push(`${'  '.repeat(depth)}[entry limit reached: ${MAX_ENTRIES}]`)
  }

  const visit = (value, depth, label = '') => {
    const indent = '  '.repeat(Math.min(depth, MAX_DEPTH + 1))
    if (value instanceof Error && seen.has(value)) {
      lines.push(`${indent}${label}[circular error reference]`)
      return
    }
    if (depth > MAX_DEPTH) {
      lines.push(`${indent}${label}[depth limit reached: ${MAX_DEPTH}]`)
      return
    }
    if (entries >= MAX_ENTRIES) {
      addEntryLimit(depth)
      return
    }
    entries += 1

    if (!(value instanceof Error)) {
      lines.push(`${indent}${label}${primitiveDescription(value)}`)
      return
    }
    seen.add(value)

    const name = boundedText(readString(value, 'name', 'Error') || 'Error')
    const message = boundedText(readString(value, 'message'))
    const header = message ? `${name}: ${message}` : name
    lines.push(`${indent}${label}${header}`)

    const stack = boundedText(readString(value, 'stack'))
    if (stack) {
      const stackLines = stack.split('\n')
      if (stackLines[0] === `${readString(value, 'name', 'Error')}: ${readString(value, 'message')}`) {
        stackLines.shift()
      }
      for (const line of stackLines) lines.push(`${indent}  ${line}`)
    }

    const cause = readOwnDataProperty(value, 'cause')
    if (cause !== undefined) visit(cause, depth + 1, 'cause: ')

    if (!(value instanceof AggregateError)) return
    const children = readOwnDataProperty(value, 'errors')
    if (!Array.isArray(children)) return
    for (let index = 0; index < children.length; index += 1) {
      if (entries >= MAX_ENTRIES) {
        addEntryLimit(depth + 1)
        break
      }
      visit(children[index], depth + 1, `errors[${index}]: `)
    }
  }

  visit(error, 0)
  return boundedText(lines.join('\n'), MAX_OUTPUT_LENGTH)
}

export function reportBuildOgFailure(
  error,
  write = (message) => console.error(message),
) {
  write(`[build-og] failed:\n${formatBuildOgError(error)}`)
}
