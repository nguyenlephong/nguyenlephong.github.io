type RouteParams = Record<string, string>

type OgBuildMode = 'full' | 'targeted' | 'skip'
type FilterOptions = { keepFirstWhenEmpty?: boolean }

function getOgBuildMode(): OgBuildMode {
  const raw = process.env['OG_BUILD_MODE']?.trim().toLowerCase()
  if (raw === 'targeted' || raw === 'skip') return raw
  return 'full'
}

function normalizeTarget(target: string): string {
  const trimmed = target.trim()
  if (!trimmed) return ''

  let normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  normalized = normalized.replace(/\/+$/, '')
  normalized = normalized.replace(/\/opengraph-image(?:\.png)?$/i, '')
  normalized = normalized.replace(/\/twitter-image(?:\.png)?$/i, '')

  return normalized || '/'
}

function parseTargets(): Set<string> {
  return new Set(
    (process.env['OG_TARGETS'] ?? '')
      .split(',')
      .map(normalizeTarget)
      .filter(Boolean),
  )
}

export function shouldBuildOgPath(path: string): boolean {
  const mode = getOgBuildMode()
  if (mode === 'full') return true
  if (mode === 'skip') return false

  const targets = parseTargets()
  if (targets.size === 0) return false

  return targets.has(normalizeTarget(path))
}

export function filterOgStaticParams<T extends RouteParams>(
  params: T[],
  toPath: (param: T) => string,
  options: FilterOptions = {},
): T[] {
  if (getOgBuildMode() === 'full') return params
  const filtered = params.filter((param) => shouldBuildOgPath(toPath(param)))
  if (filtered.length > 0) return filtered
  if (options.keepFirstWhenEmpty && params.length > 0) return [params[0]]
  return []
}
