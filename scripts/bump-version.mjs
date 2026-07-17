#!/usr/bin/env node
/**
 * Bumps the patch version in app-version.json.
 * Run explicitly by `npm run deploy:legacy:build` before its production build.
 *
 *   1.0.0 → 1.0.1 → 1.0.2 → ...
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { URL } from 'node:url'

const file = new URL('../app-version.json', import.meta.url)
const data = JSON.parse(readFileSync(file, 'utf-8'))

const [major, minor, patch] = data.version.split('.').map(Number)
data.version = `${major}.${minor}.${patch + 1}`

writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
console.log(`version bumped → v${data.version}`)
