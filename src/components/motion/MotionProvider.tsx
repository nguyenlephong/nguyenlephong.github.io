'use client'
import { LazyMotion, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'

// Wraps the app in LazyMotion so only the small DOM-animation
// feature bundle of framer-motion ships in the initial JS. Pair with
// `m.*` (not `motion.*`) in components — saves ~30–40KB gzipped.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation} strict>{children}</LazyMotion>
}
