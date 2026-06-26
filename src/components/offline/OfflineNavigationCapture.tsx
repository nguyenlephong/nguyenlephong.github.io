'use client'

import { useEffect } from 'react'

function isPlainLeftClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

export default function OfflineNavigationCapture() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (typeof navigator === 'undefined' || navigator.onLine) return
      if (!isPlainLeftClick(event)) return

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return

      const current = new URL(window.location.href)
      const sameDocument =
        url.pathname === current.pathname &&
        url.search === current.search &&
        Boolean(url.hash)
      if (sameDocument) return

      event.preventDefault()
      window.location.assign(`${url.pathname}${url.search}${url.hash}`)
    }

    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
