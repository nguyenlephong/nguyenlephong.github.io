import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { pbkdf2Sync } from 'node:crypto'
import test from 'node:test'
import {
  ADMIN_VAULT_ITERATIONS,
  ADMIN_VAULT_SALT,
  deriveAdminVaultId,
  isAdminVaultId,
} from '../src/lib/admin/vault-id.mjs'

// Throwaway test vector, never a real admin password.
const VECTOR_PASSWORD = 'test-vector-not-a-real-password-42'

function independentVaultId(password) {
  return pbkdf2Sync(
    Buffer.from(password.normalize('NFC'), 'utf8'),
    Buffer.from(ADMIN_VAULT_SALT, 'utf8'),
    ADMIN_VAULT_ITERATIONS,
    32,
    'sha256',
  ).toString('hex')
}

test('the derivation parameters are the ones the vault contract promises', () => {
  assert.equal(ADMIN_VAULT_ITERATIONS, 600_000)
  assert.ok(ADMIN_VAULT_SALT.length >= 16)
})

test('WebCrypto derivation matches an independent node:crypto pbkdf2Sync vector', async () => {
  const vaultId = await deriveAdminVaultId(VECTOR_PASSWORD)
  assert.equal(vaultId, independentVaultId(VECTOR_PASSWORD))
  assert.ok(isAdminVaultId(vaultId))
})

test('NFC normalisation makes composed and decomposed input derive the same id', async () => {
  const composed = 'Phở-bò-throwaway-vector'
  const decomposed = composed.normalize('NFD')
  assert.notEqual(composed, decomposed)
  assert.equal(await deriveAdminVaultId(decomposed), independentVaultId(composed))
})

test('rejects an empty password and validates the vault id shape', async () => {
  await assert.rejects(deriveAdminVaultId(''), TypeError)
  assert.equal(isAdminVaultId('a'.repeat(64)), true)
  assert.equal(isAdminVaultId('A'.repeat(64)), false)
  assert.equal(isAdminVaultId('a'.repeat(63)), false)
  assert.equal(isAdminVaultId(undefined), false)
})

test('the CLI reads the password from stdin, never argv, and prints only the id', () => {
  const result = spawnSync(process.execPath, ['scripts/admin-vault-id.mjs'], {
    input: `${VECTOR_PASSWORD}\n`,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, `${independentVaultId(VECTOR_PASSWORD)}\n`)
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(VECTOR_PASSWORD))

  const short = spawnSync(process.execPath, ['scripts/admin-vault-id.mjs'], {
    input: 'too-short\n',
    encoding: 'utf8',
  })
  assert.equal(short.status, 1)
  assert.equal(short.stdout, '')
  assert.match(short.stderr, /at least 16/)
})
