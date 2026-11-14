'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { LuSearch } from 'react-icons/lu'
import { track } from '@/lib/analytics'
import type { GlobalSearchConfig } from '@/lib/content/search-index'

// The dialog, the matcher and both index fetches stay out of the header chunk
// until the first open (MEP-48).
const GlobalSearchDialog = dynamic(() => import('./GlobalSearchDialog'), {
  ssr: false,
})

const noSubscription = () => () => {}
const isApplePlatform = () => /Mac|iPhone|iPad/.test(navigator.userAgent)

interface GlobalSearchProps {
  config: GlobalSearchConfig
  /** Leaves the tab order while the mobile menu acts as a modal. */
  muted?: boolean
}

/** Header trigger plus the Cmd K / Ctrl K shortcut for the site-wide search. */
export default function GlobalSearch({ config, muted = false }: GlobalSearchProps) {
  const t = useTranslations('Nav.search')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const openRef = useRef(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  // null on the server and during hydration, so the hint never mismatches.
  const apple = useSyncExternalStore(noSubscription, isApplePlatform, () => null)

  const openSearch = useCallback((trigger: 'button' | 'shortcut') => {
    if (openRef.current) return
    openRef.current = true
    const active = document.activeElement
    returnFocusRef.current = active instanceof HTMLElement ? active : null
    setMounted(true)
    setOpen(true)
    track('global_search_open', { trigger })
  }, [])

  const closeSearch = useCallback(() => {
    if (!openRef.current) return
    openRef.current = false
    setOpen(false)
    returnFocusRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.key.toLowerCase() !== 'k' || event.altKey || event.shiftKey) return
      if (!(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      openSearch('shortcut')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openSearch])

  return (
    <>
      <button
        type="button"
        className="nav-search-btn"
        inert={muted}
        aria-label={t('label')}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => openSearch('button')}
      >
        <LuSearch aria-hidden="true" />
        {apple !== null && (
          <kbd className="nav-search-kbd" aria-hidden="true">
            {apple ? '⌘K' : 'Ctrl K'}
          </kbd>
        )}
      </button>
      {mounted &&
        createPortal(
          <GlobalSearchDialog open={open} onClose={closeSearch} config={config} />,
          document.body,
        )}
    </>
  )
}
