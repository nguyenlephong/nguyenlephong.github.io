'use client'

import { createContext, useContext } from 'react'

/**
 * Cross-section highlight. `set` writes one `data-focus` attribute on the report
 * container and CSS dims every `[data-cat]` outside it, so hovering never
 * re-renders a row.
 */
export interface CategoryFocus {
  set: (category: string | null) => void
}

export const CategoryFocusContext = createContext<CategoryFocus>({ set: () => undefined })

export const useCategoryFocus = () => useContext(CategoryFocusContext)
