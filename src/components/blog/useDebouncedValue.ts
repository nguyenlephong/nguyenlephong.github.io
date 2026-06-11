"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * quiet. Keeps the blog search responsive without re-filtering on every
 * keystroke (lower main-thread churn → better INP/TBT).
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
