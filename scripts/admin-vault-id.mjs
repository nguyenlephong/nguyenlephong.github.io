#!/usr/bin/env node
/**
 * MEP-90: print the admin vault id for a password, for the ADMIN_VAULT_ID secret.
 *
 *   node scripts/admin-vault-id.mjs
 *
 * The password is read from stdin with echo disabled (never argv, so it stays out
 * of shell history and `ps`). Piped stdin works too: the first line is used.
 * Only the derived id is printed; the password is never written anywhere.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deriveAdminVaultId } from '../src/lib/admin/vault-id.mjs'

export const MIN_PASSWORD_LENGTH = 16

function readPipedLine(input) {
  return new Promise((resolve, reject) => {
    let data = ''
    input.setEncoding('utf8')
    input.on('data', (chunk) => {
      data += chunk
    })
    input.on('end', () => resolve(data.split(/\r?\n/, 1)[0] ?? ''))
    input.on('error', reject)
  })
}

function readHiddenLine(input, output, prompt) {
  output.write(prompt)
  input.setEncoding('utf8')
  input.setRawMode(true)
  input.resume()

  return new Promise((resolve, reject) => {
    let value = ''
    const finish = (error) => {
      input.off('data', onData)
      input.setRawMode(false)
      input.pause()
      output.write('\n')
      if (error) reject(error)
      else resolve(value)
    }
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n' || char === '\u0004') return finish()
        if (char === '\u0003') return finish(new Error('Cancelled'))
        if (char === '\u007f' || char === '\b') {
          value = Array.from(value).slice(0, -1).join('')
        } else {
          value += char
        }
      }
    }
    input.on('data', onData)
  })
}

async function readPassword() {
  const { stdin, stderr } = process
  if (!stdin.isTTY) return readPipedLine(stdin)

  const password = await readHiddenLine(stdin, stderr, 'Admin password (input hidden): ')
  const confirmation = await readHiddenLine(stdin, stderr, 'Repeat the password: ')
  if (password !== confirmation) throw new Error('The two entries do not match')
  return password
}

async function main() {
  const password = await readPassword()
  if (Array.from(password).length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} random characters`)
  }
  process.stdout.write(`${await deriveAdminVaultId(password)}\n`)
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  main().catch((error) => {
    console.error(`[admin-vault-id] ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
