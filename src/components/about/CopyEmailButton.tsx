'use client'

import { useEffect, useRef, useState } from 'react'
import { LuCheck, LuCopy } from 'react-icons/lu'
import { track } from '@/lib/analytics'

type CopyState = 'idle' | 'copied' | 'failed'

// Failed stays longer so the manual-copy instruction can be read.
const RESET_MS = { copied: 2000, failed: 4000 } as const

interface CopyEmailButtonProps {
  email: string
  /** id of the visible address, selected when the clipboard is not available. */
  targetId: string
  source: string
  labels: { copy: string; copied: string; copiedStatus: string; copyFailed: string }
}

/** Labels come in as props, so this works on routes that ship no client messages. */
export default function CopyEmailButton({ email, targetId, source, labels }: CopyEmailButtonProps) {
  const [state, setState] = useState<CopyState>('idle')
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  // Clipboard can be missing (http, old WebView) or denied; then select the address so it can be copied by hand.
  const selectAddress = (): void => {
    const node = document.getElementById(targetId)
    const selection = window.getSelection()
    if (!node || !selection) return
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const copy = async (): Promise<void> => {
    let next: keyof typeof RESET_MS = 'copied'
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      next = 'failed'
      selectAddress()
    }
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setState('idle'), RESET_MS[next])
    setState(next)
    track('cv_email_copy', { source, result: next })
  }

  return (
    <>
      <button type="button" className="about-copy" data-state={state} onClick={copy}>
        {state === 'copied' ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
        {state === 'copied' ? labels.copied : labels.copy}
      </button>
      <p className="about-copy-status" role="status" aria-live="polite">
        {state === 'copied' && labels.copiedStatus}
        {state === 'failed' && labels.copyFailed}
      </p>
    </>
  )
}
