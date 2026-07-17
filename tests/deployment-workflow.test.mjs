import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const workflow = readFileSync(new URL('../.github/workflows/nextjs.yml', import.meta.url), 'utf8')
const ciWorkflow = readFileSync(new URL('../.github/workflows/ci-frontend.yml', import.meta.url), 'utf8')
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
const nodeVersion = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim()

test('workflows, package metadata, lockfile, and Node types share the Node 22 runtime contract', () => {
  assert.equal(nodeVersion, '22')

  for (const currentWorkflow of [workflow, ciWorkflow]) {
    const setupNodeCount = currentWorkflow.match(/uses: actions\/setup-node@v4/g)?.length ?? 0
    const versionFileCount = currentWorkflow.match(/node-version-file: \.nvmrc/g)?.length ?? 0
    assert.ok(setupNodeCount > 0)
    assert.equal(versionFileCount, setupNodeCount)
    assert.doesNotMatch(currentWorkflow, /node-version:\s*/)
  }

  assert.equal(pkg.engines.node, '>=22.18.0')
  assert.equal(pkg.devDependencies['@types/node'], '22')
  assert.equal(lock.packages[''].engines.node, pkg.engines.node)
  assert.equal(lock.packages[''].devDependencies['@types/node'], pkg.devDependencies['@types/node'])
  assert.match(lock.packages['node_modules/@types/node'].version, /^22\./)
})

test('Pages workflow grants deployment credentials only to the deploy job', () => {
  assert.match(workflow, /^permissions: \{\}$/m)

  const buildJob = workflow.slice(workflow.indexOf('  build:'), workflow.indexOf('  deploy:'))
  assert.match(buildJob, /permissions:\n\s+contents: read/)
  assert.doesNotMatch(buildJob, /pages: write|id-token: write/)

  const deployJob = workflow.slice(workflow.indexOf('  deploy:'))
  assert.match(deployJob, /permissions:\n\s+pages: write\n\s+id-token: write/)
  assert.doesNotMatch(deployJob, /contents: write/)
})

test('Pages workflow verifies the built out tree before uploading it', () => {
  const buildIndex = workflow.indexOf('run: npm run build')
  const verifyIndex = workflow.indexOf('run: npm run verify:artifact')
  const offlineIndex = workflow.indexOf('run: npm run verify:offline')
  const uploadIndex = workflow.indexOf('uses: actions/upload-pages-artifact@')

  assert.ok(buildIndex >= 0 && buildIndex < verifyIndex && verifyIndex < offlineIndex && offlineIndex < uploadIndex)
  assert.equal(workflow.match(/run: npm run build\s*$/gm)?.length, 1)
  assert.match(workflow, /group: pages-\$\{\{ github\.repository \}\}/)
  assert.match(workflow, /cancel-in-progress: false/)
})

test('Pages workflow refuses manual or deploy jobs outside refs/heads/main', () => {
  const buildJob = workflow.slice(workflow.indexOf('  build:'), workflow.indexOf('  deploy:'))
  const deployJob = workflow.slice(workflow.indexOf('  deploy:'))

  assert.match(buildJob, /if: github\.ref == 'refs\/heads\/main'/)
  assert.match(deployJob, /if: github\.ref == 'refs\/heads\/main' && needs\.build\.result == 'success'/)
})

test('CI is read-only, never persists checkout credentials, and scopes SONAR_TOKEN to the scan step', () => {
  assert.match(ciWorkflow, /^permissions:\n  contents: read$/m)
  const checkoutCount = ciWorkflow.match(/uses: actions\/checkout@v4/g)?.length ?? 0
  const credentialCount = ciWorkflow.match(/persist-credentials: false/g)?.length ?? 0
  assert.equal(credentialCount, checkoutCount)
  assert.equal(ciWorkflow.match(/SONAR_TOKEN:/g)?.length, 1)

  const sonarScan = ciWorkflow.slice(
    ciWorkflow.indexOf('      - name: SonarQube scan'),
    ciWorkflow.indexOf('      - name: SonarQube skipped'),
  )
  assert.match(sonarScan, /SONAR_TOKEN: \$\{\{ secrets\.SONAR_TOKEN \}\}/)
})

test('CI verifies offline browser behavior after its single smoke build', () => {
  const buildIndex = ciWorkflow.indexOf('run: npm run build:fast')
  const offlineIndex = ciWorkflow.indexOf('run: npm run verify:offline')
  assert.ok(buildIndex >= 0 && buildIndex < offlineIndex)
  assert.equal(ciWorkflow.match(/run: npm run build:fast\s*$/gm)?.length, 1)
  assert.match(ciWorkflow, /npx playwright install --with-deps chromium/)
})

test('Firebase hosting verifies the fixed out artifact immediately before publish', () => {
  assert.equal(pkg.scripts['fb-deploy'], 'npm run verify:artifact && firebase deploy --only hosting')
  assert.equal(Object.hasOwn(pkg.dependencies, 'gh-pages'), false)
})
