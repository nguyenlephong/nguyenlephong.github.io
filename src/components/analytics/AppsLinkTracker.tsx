'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

/**
 * Delegated click tracker for buttons/links with `data-track` attributes.
 * Captures the event name from `data-track` and forwards any
 * `data-track-*` attributes as event properties.
 */
export default function AppsLinkTracker() {
  useEffect(() => {
    const handler = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      const el = target.closest<HTMLElement>('[data-track]')
      if (!el) return
      const name = el.dataset['track']
      if (!name) return
      const props: Record<string, unknown> = {}
      for (const key in el.dataset) {
        if (key === 'track' || !key.startsWith('track')) continue
        const propKey = key
          .replace(/^track/, '')
          .replace(/^[A-Z]/, (m) => m.toLowerCase())
        props[propKey || 'value'] = el.dataset[key]
      }
      track(name, props)
    }
    document.addEventListener('click', handler, { capture: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [])

  return null
}
