import { Fragment, type ReactNode } from 'react'

/** Slot marker for dictionary strings: `slot(0)` in the text is replaced by `values[0]`. */
export const slot = (index: number) => `\u0000${index}\u0000`

/** Renders a dictionary string with styled values (bold numbers) in its slots. */
export function Rich({ text, values }: { text: string; values: ReactNode[] }) {
  return (
    <>
      {text.split(/\u0000(\d)\u0000/).map((part, index) => (
        <Fragment key={index}>{index % 2 === 1 ? values[Number(part)] : part}</Fragment>
      ))}
    </>
  )
}
