'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { LuArrowRight, LuLogOut } from 'react-icons/lu'
import { track } from '@/lib/analytics'
import AdminStage from './AdminStage'
import AdminTopology, { type TopologyBranch } from './AdminTopology'
import { ADMIN_DICTIONARIES, AdminTextContext, createAdminFormat, useAdminText, type AdminText } from './admin-i18n'
import { readAdminLocale, storeAdminLocale, type AdminLocale } from './admin-locale'
import { localizeCatalog, type AdminCatalogProps } from './catalog-props'

function OpeningDashboard() {
  const { t } = useAdminText()
  return (
    <p className="admin-gate__status" role="status">
      {t.gate.opening}
    </p>
  )
}

// The dashboard only downloads after an unlock, so no public bundle grows.
const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  ssr: false,
  loading: () => <OpeningDashboard />,
})

/** Published posts per category, straight from the build-time catalog. */
export function catalogBranches(catalog: AdminCatalogProps, today: string): TopologyBranch[] {
  const titles = new Map(catalog.blog.categories.map((category) => [category.slug, category.title]))
  const counts = new Map<string, number>()
  for (const post of [...catalog.blog.posts, ...catalog.notes.posts]) {
    if (post.date > today) continue
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1)
  }
  // Largest branch first, the same way the live topology sorts by reads.
  return [...counts]
    .sort(([, left], [, right]) => right - left)
    .map(([category, posts]) => ({
      category,
      title: titles.get(category) ?? (category === 'notes' ? 'Notes' : category),
      posts,
    }))
}

// This is a curtain, not security: every number behind it is already public
// through the postStats read rule. Only the SHA-256 of the password ships.
const PASSWORD_SHA256 = '0074de1d7052e1b11898f3aa9d14a0b52d7db438f7960c0b96cf7a55cf217341'
const SESSION_KEY = 'admin_unlocked'

type GateState = 'checking' | 'locked' | 'checking-password' | 'open'

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writeUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) sessionStorage.setItem(SESSION_KEY, '1')
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage blocked: the unlock just lasts until reload.
  }
}

export default function AdminGate({ catalog }: { catalog: AdminCatalogProps }) {
  const [state, setState] = useState<GateState>('checking')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<'wrong' | 'noCrypto' | null>(null)
  // The page is prerendered in English; the reader's language applies on mount
  // (the inline bootstrap keeps VI readers from seeing the English first).
  const [locale, setLocaleState] = useState<AdminLocale>('en')

  const text = useMemo<AdminText>(
    () => ({
      locale,
      t: ADMIN_DICTIONARIES[locale],
      fmt: createAdminFormat(locale),
      setLocale: (next) => {
        setLocaleState(next)
        storeAdminLocale(next)
      },
    }),
    [locale],
  )

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.setAttribute('data-admin-lang', locale)
  }, [locale])

  // sessionStorage and localStorage exist only after hydration (the page is prerendered).
  useEffect(() => {
    queueMicrotask(() => {
      setLocaleState(readAdminLocale())
      if (readUnlocked()) {
        setState('open')
        track('admin_opened', { method: 'session' })
      } else {
        setState('locked')
      }
    })
  }, [])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password) return
    setState('checking-password')
    let matches = false
    try {
      matches = (await sha256Hex(password)) === PASSWORD_SHA256
    } catch {
      setError('noCrypto')
      setState('locked')
      return
    }
    setPassword('')
    if (matches) {
      writeUnlocked(true)
      setError(null)
      setState('open')
      track('admin_opened', { method: 'password' })
    } else {
      setError('wrong')
      setState('locked')
      track('admin_login_failed', { reason: 'wrong_password' })
    }
  }

  const signOut = () => {
    writeUnlocked(false)
    setState('locked')
  }

  const localized = useMemo(() => localizeCatalog(catalog, locale), [catalog, locale])
  const branches = useMemo(() => catalogBranches(localized, new Date().toISOString().slice(0, 10)), [localized])
  const published = branches.reduce((sum, branch) => sum + branch.posts, 0)
  const { t, fmt } = text

  if (state === 'open') {
    return (
      <AdminTextContext.Provider value={text}>
        <AdminStage
          phase={state}
          actions={
            <button type="button" className="admin-btn admin-btn--quiet" onClick={signOut} aria-label={t.signOut}>
              <LuLogOut aria-hidden="true" />
              <span className="admin-signout__text">{t.signOut}</span>
            </button>
          }
        >
          <AdminDashboard catalog={localized} idleBranches={branches} />
        </AdminStage>
      </AdminTextContext.Provider>
    )
  }

  const busy = state !== 'locked'
  return (
    <AdminTextContext.Provider value={text}>
      <AdminStage phase={state}>
        <main className="admin-hero admin-hero--locked" aria-busy={busy}>
          <div className="admin-hero__meta">
            <h1 className="admin-display">{t.gate.title}</h1>
            <p className="admin-claim">{t.gate.claim(fmt.number(published))}</p>
            <form className="admin-gate" onSubmit={onSubmit}>
              <label className="admin-gate__label" htmlFor="admin-password">
                {t.gate.password}
              </label>
              <div className="admin-gate__field">
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
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'admin-gate-message' : undefined}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button className="admin-gate__submit" type="submit" disabled={busy || !password} aria-label={t.gate.submit}>
                  {state === 'checking-password' ? <span className="admin-gate__spinner" aria-hidden="true" /> : <LuArrowRight aria-hidden="true" />}
                </button>
              </div>
              <p id="admin-gate-message" className="admin-gate__message" role="alert">
                {error ? t.gate[error] : null}
              </p>
            </form>
          </div>
          <AdminTopology branches={branches} />
        </main>
      </AdminStage>
    </AdminTextContext.Provider>
  )
}
