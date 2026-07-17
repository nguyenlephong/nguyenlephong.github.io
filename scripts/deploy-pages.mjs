#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const LEGACY_PAGES_BRANCH = 'gh-pages'

function createCommandRunner(root, env) {
  function invoke(command, args, options = {}) {
    const result = spawnSync(command, args, {
      cwd: options.cwd ?? root,
      encoding: options.capture ? 'utf8' : undefined,
      env: options.env ?? env,
      maxBuffer: 1024 * 1024 * 20,
      shell: false,
      stdio: options.capture ? undefined : 'inherit',
    })

    if (result.error) throw result.error
    if (result.status !== 0) {
      throw new Error(`${command} exited with status ${result.status ?? 'unknown'}`)
    }
    return options.capture ? result.stdout.trim() : undefined
  }

  return {
    run(command, args, options) {
      console.log(`$ ${[command, ...args].join(' ')}`)
      invoke(command, args, options)
    },
    output(command, args, options) {
      return invoke(command, args, { ...options, capture: true })
    },
  }
}

export function resolveLegacyDeployConfig({ root = process.cwd(), env = process.env } = {}) {
  if (env.ALLOW_LEGACY_PAGES_DEPLOY !== '1') {
    throw new Error(
      'blocked: pushes to main use the GitHub Pages Actions workflow. ' +
        'Run `npm run deploy:legacy` only for an explicit emergency fallback.',
    )
  }

  if (Object.hasOwn(env, 'PAGES_BRANCH')) {
    throw new Error(
      `PAGES_BRANCH overrides are not supported. The legacy publisher is fixed to ${LEGACY_PAGES_BRANCH}.`,
    )
  }

  return {
    root,
    outDir: path.join(root, 'out'),
    cacheDir: path.join(root, '.cache'),
    remote: env.PAGES_REMOTE ?? 'origin',
    branch: LEGACY_PAGES_BRANCH,
    commitMessage:
      env.PAGES_COMMIT_MESSAGE ?? `deploy: update GitHub Pages (${new Date().toISOString()})`,
    env,
  }
}

export function publishLegacyPages(options = {}) {
  const config = resolveLegacyDeployConfig(options)
  const { root, outDir, cacheDir, remote, branch, commitMessage, env: processEnv } = config
  const commandRunner = options.commandRunner ?? createCommandRunner(root, processEnv)
  const indexFile = path.join(cacheDir, 'deploy-pages.index')
  const verifierPath = path.join(root, 'scripts', 'verify-static-artifact.mjs')

  if (!existsSync(outDir)) {
    throw new Error('missing out directory. Run `npm run build` first.')
  }

  writeFileSync(path.join(outDir, '.nojekyll'), '')

  const exportedOgCache = path.join(outDir, 'og-cache')
  if (existsSync(exportedOgCache)) {
    rmSync(exportedOgCache, { recursive: true, force: true })
    console.log('[deploy-pages] removed build-only out/og-cache')
  }

  for (const relativePath of ['og', 'assets/blog', 'assets/notes', 'assets/photos']) {
    const exportedContentAsset = path.join(outDir, relativePath)
    if (!existsSync(exportedContentAsset)) continue

    rmSync(exportedContentAsset, { recursive: true, force: true })
    console.log(`[deploy-pages] removed CDN-backed out/${relativePath}`)
  }

  // This must remain after every out/ mutation. The tree verified here is the
  // exact tree staged and force-pushed below; do not write to out/ after it.
  const verificationEnv = { ...processEnv }
  delete verificationEnv.STATIC_ARTIFACT_BUDGET_CONFIG
  delete verificationEnv.STATIC_ARTIFACT_OUTPUT_DIR
  commandRunner.run(process.execPath, [verifierPath], { cwd: root, env: verificationEnv })

  const gitDir = commandRunner.output('git', ['rev-parse', '--absolute-git-dir'])
  const outputTreeGitArgs = ['--git-dir', gitDir, '--work-tree', outDir]
  mkdirSync(cacheDir, { recursive: true })
  rmSync(indexFile, { force: true })
  rmSync(`${indexFile}.lock`, { force: true })

  const gitEnv = { ...processEnv, GIT_INDEX_FILE: indexFile }
  commandRunner.run('git', [...outputTreeGitArgs, 'read-tree', '--empty'], { cwd: outDir, env: gitEnv })
  commandRunner.run('git', [...outputTreeGitArgs, 'add', '-A', '.'], { cwd: outDir, env: gitEnv })

  const tree = commandRunner.output('git', [...outputTreeGitArgs, 'write-tree'], {
    cwd: outDir,
    env: gitEnv,
  })
  const commit = commandRunner.output(
    'git',
    [...outputTreeGitArgs, 'commit-tree', tree, '-m', commitMessage],
    { cwd: outDir, env: gitEnv },
  )
  const refs = commandRunner.output('git', ['ls-remote', '--heads', remote, branch])
  const [remoteSha] = refs.split(/\s+/)
  const pushArgs = ['push', remote, `${commit}:refs/heads/${branch}`]

  if (remoteSha) {
    pushArgs.push(`--force-with-lease=refs/heads/${branch}:${remoteSha}`)
  } else {
    // Empty expected SHA means the lease succeeds only while the branch is
    // still absent, protecting a concurrently created branch from overwrite.
    pushArgs.push(`--force-with-lease=refs/heads/${branch}:`)
  }

  commandRunner.run('git', pushArgs)
  console.log(`[deploy-pages] published ${commit} to ${remote}/${branch}`)
  return { branch, commit, remote }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  try {
    publishLegacyPages()
  } catch (error) {
    console.error(`[deploy-pages] ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
