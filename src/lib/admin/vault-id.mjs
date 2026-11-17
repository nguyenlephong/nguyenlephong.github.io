/**
 * MEP-90: the one admin vault id derivation, shared by the /admin page (browser)
 * and scripts/admin-vault-id.mjs (Node). Both run it through WebCrypto, so the
 * id the owner stores as a GitHub secret always matches what the page derives.
 *
 * The salt is public on purpose: the password's strength (16+ random characters)
 * is the secret, and 600k PBKDF2 rounds make each guess expensive.
 */
export const ADMIN_VAULT_SALT = 'nguyenlephong.github.io/admin-vault/v1'
export const ADMIN_VAULT_ITERATIONS = 600_000
export const ADMIN_VAULT_COLLECTION = 'adminVault'

const VAULT_ID_PATTERN = /^[0-9a-f]{64}$/

/** Same shape the Firestore rules accept for adminVault/{vaultId}. */
export function isAdminVaultId(value) {
  return typeof value === 'string' && VAULT_ID_PATTERN.test(value)
}

/** hex(PBKDF2-SHA256(NFC(password), ADMIN_VAULT_SALT, 600000, 32 bytes)). */
export async function deriveAdminVaultId(password, subtle = globalThis.crypto?.subtle) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new TypeError('A password is required')
  }
  if (!subtle) throw new Error('WebCrypto is not available in this environment')

  const encoder = new TextEncoder()
  const key = await subtle.importKey(
    'raw',
    encoder.encode(password.normalize('NFC')),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(ADMIN_VAULT_SALT),
      iterations: ADMIN_VAULT_ITERATIONS,
    },
    key,
    256,
  )
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
