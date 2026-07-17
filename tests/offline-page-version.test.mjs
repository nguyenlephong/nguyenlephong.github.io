import assert from 'node:assert/strict'
import test from 'node:test'

import { assertManifestVersion, pageVersionForHtml } from '../scripts/postbuild-offline.mjs'

test('offline page versions are deterministic across repeated manifest injection', () => {
  const source = '<html><head><title>Stable</title></head><body>content</body></html>'
  const firstBuild = source.replace(
    '</head>',
    '  <meta name="offline-manifest-version" content="first-build">\n</head>',
  )
  const secondBuild = source.replace(
    '</head>',
    '  <meta name="offline-manifest-version" content="second-build">\n</head>',
  )

  const sourceVersion = pageVersionForHtml('en/example.html', source)
  assert.equal(pageVersionForHtml('en/example.html', firstBuild), sourceVersion)
  assert.equal(pageVersionForHtml('en/example.html', secondBuild), sourceVersion)
  assert.notEqual(
    pageVersionForHtml('en/example.html', source.replace('content', 'changed content')),
    sourceVersion,
  )
})

test('offline manifest validation rejects stale cache or network payloads', () => {
  const current = { version: 'current', shared: {} }
  assert.equal(assertManifestVersion(current, 'current'), current)
  assert.throws(
    () => assertManifestVersion({ version: 'stale' }, 'current'),
    /offline manifest version mismatch: expected current, received stale/,
  )
  assert.throws(
    () => assertManifestVersion({}, 'current'),
    /offline manifest version mismatch: expected current, received undefined/,
  )
})
