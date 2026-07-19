import { readdirSync } from 'node:fs'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'

function printable(value: unknown): string {
  const serialized = JSON.stringify(value)
  return serialized === undefined ? String(value) : serialized
}

/**
 * Body metadata is canonical when it is authored in both places. Index-only
 * fields such as series placement remain valid collection concerns.
 */
export function assertIndexBodyMetadataParity(
  label: string,
  indexEntry: Record<string, unknown>,
  body: Record<string, unknown>,
  bodyPath: string,
  fields: readonly string[],
): void {
  for (const key of fields) {
    const bodyValue = body[key]
    const indexValue = indexEntry[key]
    if (!isDeepStrictEqual(indexValue, bodyValue)) {
      throw new Error(
        `${label} metadata drift in ${bodyPath} for ${key}: index=${printable(indexValue)} body=${printable(bodyValue)}`,
      )
    }
  }
}

/**
 * Validates metadata echoed by a locale body but intentionally owned by the
 * canonical body/index (for example a slug, date, category, or topic). The
 * loader does not apply these fields, so checking the raw override prevents a
 * typo from being silently hidden by the merged result.
 */
export function assertProvidedMetadataParity(
  label: string,
  canonical: Record<string, unknown>,
  override: Record<string, unknown>,
  overridePath: string,
  fields: readonly string[],
): void {
  for (const key of fields) {
    if (!Object.prototype.hasOwnProperty.call(override, key)) continue

    const canonicalValue = canonical[key]
    const overrideValue = override[key]
    if (!isDeepStrictEqual(canonicalValue, overrideValue)) {
      throw new Error(
        `${label} override drift in ${overridePath} for ${key}: canonical=${printable(canonicalValue)} override=${printable(overrideValue)}`,
      )
    }
  }
}

export function listJsonSlugs(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.basename(entry.name, '.json'))
    .sort()
}

export function assertExactSlugSet(
  label: string,
  expectedSlugs: readonly string[],
  actualSlugs: readonly string[],
): void {
  const expected = new Set(expectedSlugs)
  const actual = new Set(actualSlugs)
  const missing = [...expected].filter((slug) => !actual.has(slug))
  const orphaned = [...actual].filter((slug) => !expected.has(slug))

  if (missing.length === 0 && orphaned.length === 0) return

  throw new Error(
    `${label} body file set is inconsistent` +
      `${missing.length ? `; missing: ${missing.join(', ')}` : ''}` +
      `${orphaned.length ? `; orphaned: ${orphaned.join(', ')}` : ''}`,
  )
}

/** Fails when an explicit catalog differs from its reviewed identifier set. */
export function assertExactIdentifierSet(
  label: string,
  expectedIdentifiers: readonly string[],
  actualIdentifiers: readonly string[],
): void {
  const expected = new Set(expectedIdentifiers)
  const actual = new Set(actualIdentifiers)
  const missing = [...expected].filter((identifier) => !actual.has(identifier))
  const unexpected = [...actual].filter(
    (identifier) => !expected.has(identifier),
  )

  if (
    missing.length === 0 &&
    unexpected.length === 0 &&
    expected.size === expectedIdentifiers.length &&
    actual.size === actualIdentifiers.length
  ) {
    return
  }

  throw new Error(
    `${label} identifier set is inconsistent` +
      `${missing.length ? `; missing: ${missing.join(', ')}` : ''}` +
      `${unexpected.length ? `; unexpected: ${unexpected.join(', ')}` : ''}` +
      `${actual.size !== actualIdentifiers.length ? '; duplicates are not allowed' : ''}`,
  )
}

export function assertKnownKeys(
  label: string,
  knownKeys: readonly string[],
  candidateKeys: readonly string[],
): void {
  const known = new Set(knownKeys)
  const unknown = candidateKeys.filter((key) => !known.has(key))
  if (unknown.length > 0) {
    throw new Error(
      `${label} references unknown identifiers: ${unknown.join(', ')}`,
    )
  }
}
