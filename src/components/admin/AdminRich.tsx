import { Fragment, type ReactNode } from 'react'

/** Slot marker for dictionary strings: `slot(0)` in the text is replaced by `values[0]`. */
export const slot = (index: number) => `{{${index}}}`

/** Renders a dictionary string with styled values (bold numbers) in its slots. */
export function Rich({ text, values }: { text: string; values: ReactNode[] }) {
  return (
    <>
      {text.split(/\{\{(\d)\}\}/).map((part, index) => (
        <Fragment key={index}>{index % 2 === 1 ? values[Number(part)] : part}</Fragment>
      ))}
    </>
  )
}
