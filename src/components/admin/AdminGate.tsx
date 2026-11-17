'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { track } from '@/lib/analytics'
import type { AdminSnapshot } from '@/lib/admin/snapshot-types'
import { fetchAdminSnapshot, type AdminVaultLookup } from '@/lib/admin/vault-repository'
import { deriveAdminVaultId, isAdminVaultId } from '@/lib/admin/vault-id.mjs'

// The dashboard (tables, sorting, formatting) only downloads after an unlock.
const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  ssr: false,
  loading: () => <p className="admin-gate__status">Loading the dashboard…</p>,
})

// sessionStorage, not localStorage: the vault id dies with the tab.
const SESSION_KEY = 'admin_vault_id'

type GateState =
  | { phase: 'checking' }
  | { phase: 'locked'; message: string | null }
  | { phase: 'unlocking' }
  | { phase: 'open'; snapshot: AdminSnapshot }

const UNAVAILABLE_MESSAGES: Record<
  Extract<AdminVaultLookup, { status: 'unavailable' }>['reason'],
  string
> = {
  not_configured: 'Firestore is not configured in this build.',
  request_failed: 'Could not reach Firestore. Check the connection and try again.',
  unsupported: 'The snapshot has an unexpected format. Re-run the snapshot workflow.',
}

function readSession(): string | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY)
    return isAdminVaultId(value) ? value : null
  } catch {
    return null
  }
}

function writeSession(vaultId: string | null): void {
  try {
    if (vaultId) sessionStorage.setItem(SESSION_KEY, vaultId)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Private mode without storage: the session just does not persist.
  }
}

export default function AdminGate() {
  const [state, setState] = useState<GateState>({ phase: 'checking' })
  const [password, setPassword] = useState('')

  const openVault = useCallback(
    async (vaultId: string, method: 'session' | 'password') => {
      const lookup = await fetchAdminSnapshot(vaultId)
      if (lookup.status === 'found') {
        writeSession(vaultId)
        setState({ phase: 'open', snapshot: lookup.snapshot })
        track('admin_opened', { method })
        return
      }
      writeSession(null)
      if (lookup.status === 'not_found') {
        // A stored session that no longer resolves (password rotated) is not a failed login.
        if (method === 'password') {
          track('admin_login_failed', { reason: 'wrong_password' })
        }
        setState({
          phase: 'locked',
          message: method === 'password' ? 'Wrong password.' : null,
        })
        return
      }
      track('admin_login_failed', { reason: 'unavailable' })
      setState({ phase: 'locked', message: UNAVAILABLE_MESSAGES[lookup.reason] })
    },
    [],
  )

  // sessionStorage only exists after hydration (the page is prerendered), so the
  // stored session is read once on mount, outside the synchronous effect body.
  useEffect(() => {
    queueMicrotask(() => {
      const stored = readSession()
      if (stored) void openVault(stored, 'session')
      else setState({ phase: 'locked', message: null })
    })
  }, [openVault])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password) return
    setState({ phase: 'unlocking' })
    try {
      const vaultId = await deriveAdminVaultId(password)
      setPassword('')
      await openVault(vaultId, 'password')
    } catch {
      setState({ phase: 'locked', message: 'This browser cannot derive the key (WebCrypto is unavailable).' })
    }
  }

  const signOut = () => {
    writeSession(null)
    setState({ phase: 'locked', message: null })
  }

  if (state.phase === 'open') {
    return <AdminDashboard snapshot={state.snapshot} onSignOut={signOut} />
  }

  const busy = state.phase !== 'locked'
  return (
    <main className="admin-gate" aria-busy={busy}>
      <h1 className="admin-gate__title">Site insights</h1>
      <p className="admin-gate__lede">Owner access. Enter the admin password to open the latest snapshot.</p>
      <form className="admin-gate__form" onSubmit={onSubmit}>
        <label className="admin-gate__label" htmlFor="admin-password">
          Password
        </label>
        <div className="admin-gate__row">
          <input
            id="admin-password"
            className="admin-gate__input"
            type="password"
            name="password"
            autoComplete="current-password"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={password}
            disabled={busy}
            aria-invalid={state.phase === 'locked' && state.message ? true : undefined}
            aria-describedby={state.phase === 'locked' && state.message ? 'admin-gate-message' : undefined}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="admin-button admin-button--primary" type="submit" disabled={busy || !password}>
            {state.phase === 'unlocking' ? 'Unlocking…' : 'Unlock'}
          </button>
        </div>
        <p id="admin-gate-message" className="admin-gate__message" role="alert">
          {state.phase === 'locked' ? state.message : null}
        </p>
      </form>
    </main>
  )
}
