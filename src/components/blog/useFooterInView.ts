'use client'

import { useEffect, useState } from 'react'

/** True while the site footer is on screen, so floating controls can step aside. */
export function useFooterInView(): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const footer = document.querySelector('.app-footer')
    if (!footer || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      setInView(Boolean(entry?.isIntersecting))
    })
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return inView
}
