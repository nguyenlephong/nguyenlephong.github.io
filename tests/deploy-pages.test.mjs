import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  LEGACY_PAGES_BRANCH,
  publishLegacyPages,
  resolveLegacyDeployConfig,
} from '../scripts/deploy-pages.mjs'

function createRoot(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'legacy-pages-deploy-'))
  mkdirSync(path.join(root, 'out/og-cache'), { recursive: true })
  mkdirSync(path.join(root, 'out/assets/blog'), { recursive: true })
  mkdirSync(path.join(root, 'scripts'), { recursive: true })
  writeFileSync(path.join(root, 'out/index.html'), '<!doctype html>')
  writeFileSync(path.join(root, 'out/og-cache/generated.png'), 'generated')
  writeFileSync(path.join(root, 'out/assets/blog/cdn-backed.png'), 'remote')
  writeFileSync(path.join(root, 'scripts/verify-static-artifact.mjs'), '// fixture verifier')
  t.after(() => rmSync(root, { recursive: true, force: true }))
  return root
}

test('legacy deploy is opt-in and cannot override the gh-pages target', () => {
  assert.throws(
    () => resolveLegacyDeployConfig({ env: {} }),
    /Run `npm run deploy:legacy` only for an explicit emergency fallback/,
  )
  assert.throws(
    () =>
      resolveLegacyDeployConfig({
        env: { ALLOW_LEGACY_PAGES_DEPLOY: '1', PAGES_BRANCH: 'preview' },
      }),
    /PAGES_BRANCH overrides are not supported/,
  )
  assert.throws(
    () =>
      resolveLegacyDeployConfig({
        env: { ALLOW_LEGACY_PAGES_DEPLOY: '1', PAGES_BRANCH: LEGACY_PAGES_BRANCH },
      }),
    /PAGES_BRANCH overrides are not supported/,
  )
})

test('legacy deploy verifies the final out tree before staging and force-pushing gh-pages', (t) => {
  const root = createRoot(t)
  const calls = []
  let verifiedFinalTree = false
  const commandRunner = {
    run(command, args, options = {}) {
      calls.push({ command, args, options })
      if (command !== process.execPath) return

      verifiedFinalTree = true
      assert.equal(args[0], path.join(root, 'scripts/verify-static-artifact.mjs'))
      assert.equal(Object.hasOwn(options.env, 'STATIC_ARTIFACT_BUDGET_CONFIG'), false)
      assert.equal(Object.hasOwn(options.env, 'STATIC_ARTIFACT_OUTPUT_DIR'), false)
      assert.ok(existsSync(path.join(root, 'out/.nojekyll')))
      assert.equal(existsSync(path.join(root, 'out/og-cache')), false)
      assert.equal(existsSync(path.join(root, 'out/assets/blog')), false)
    },
    output(command, args) {
      calls.push({ command, args })
      if (args.includes('--absolute-git-dir')) return path.join(root, '.git')
      if (args.includes('write-tree')) return 'tree-sha'
      if (args.includes('commit-tree')) return 'commit-sha'
      if (args.includes('ls-remote')) return `remote-sha\trefs/heads/${LEGACY_PAGES_BRANCH}`
      throw new Error(`Unexpected command: ${command} ${args.join(' ')}`)
    },
  }

  const result = publishLegacyPages({
    root,
    env: {
      ALLOW_LEGACY_PAGES_DEPLOY: '1',
      STATIC_ARTIFACT_BUDGET_CONFIG: 'bypass.json',
      STATIC_ARTIFACT_OUTPUT_DIR: 'bypass-out',
    },
    commandRunner,
  })

  assert.equal(verifiedFinalTree, true)
  assert.equal(result.branch, LEGACY_PAGES_BRANCH)
  const verifierIndex = calls.findIndex(({ command }) => command === process.execPath)
  const stageIndex = calls.findIndex(({ args }) => args.includes('add'))
  const pushIndex = calls.findIndex(({ args }) => args[0] === 'push')
  assert.ok(verifierIndex >= 0 && verifierIndex < stageIndex && stageIndex < pushIndex)
  assert.deepEqual(calls[pushIndex].args, [
    'push',
    'origin',
    'commit-sha:refs/heads/gh-pages',
    '--force-with-lease=refs/heads/gh-pages:remote-sha',
  ])
})

test('legacy deploy protects creation of a previously absent gh-pages branch with an empty lease', (t) => {
  const root = createRoot(t)
  const calls = []
  const commandRunner = {
    run(command, args) {
      calls.push({ command, args })
    },
    output(command, args) {
      calls.push({ command, args })
      if (args.includes('--absolute-git-dir')) return path.join(root, '.git')
      if (args.includes('write-tree')) return 'tree-sha'
      if (args.includes('commit-tree')) return 'commit-sha'
      if (args.includes('ls-remote')) return ''
      throw new Error(`Unexpected command: ${command} ${args.join(' ')}`)
    },
  }

  publishLegacyPages({
    root,
    env: { ALLOW_LEGACY_PAGES_DEPLOY: '1' },
    commandRunner,
  })

  const push = calls.find(({ args }) => args[0] === 'push')
  assert.deepEqual(push.args, [
    'push',
    'origin',
    'commit-sha:refs/heads/gh-pages',
    '--force-with-lease=refs/heads/gh-pages:',
  ])
  assert.equal(push.args.includes('--force'), false)
})
