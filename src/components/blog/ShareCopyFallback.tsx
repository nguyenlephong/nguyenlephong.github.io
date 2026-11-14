'use client'

import { useEffect, useRef } from 'react'

/** Clipboard refused: hand the reader the link already selected in a field. */
export default function ShareCopyFallback({
  url,
  message,
  onDismiss,
}: {
  url: string
  message: string
  /** Called when focus leaves the field: the reader has the link or moved on. */
  onDismiss: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return (
    <div className="blog-share-fallback">
      <p className="blog-share-fallback__message" role="status">
        {message}
      </p>
      <input
        ref={inputRef}
        className="blog-share-fallback__field"
        type="text"
        readOnly
        value={url}
        aria-label={message}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={onDismiss}
      />
    </div>
  )
}
