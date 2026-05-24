'use client'
import { m, useReducedMotion, type Variants } from 'framer-motion'
import React, { type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'header'
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

export default function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
  as = 'div',
}: RevealProps) {
  const reduced = useReducedMotion()
  const MotionTag = m[as] as typeof m.div

  if (reduced) {
    const Tag = as as keyof React.JSX.IntrinsicElements
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      variants={defaultVariants}
    >
      {children}
    </MotionTag>
  )
}

type StaggerProps = {
  children: ReactNode
  stagger?: number
  className?: string
  as?: 'div' | 'ul' | 'ol'
}

export function Stagger({
  children,
  stagger = 0.07,
  className,
  as = 'div',
}: StaggerProps) {
  const reduced = useReducedMotion()
  const MotionTag = m[as] as typeof m.div

  if (reduced) {
    const Tag = as as keyof React.JSX.IntrinsicElements
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
      }}
    >
      {children}
    </MotionTag>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'li' | 'article'
  onMouseEnter?: () => void
}

export function StaggerItem({
  children,
  className,
  as = 'div',
  onMouseEnter,
}: StaggerItemProps) {
  const reduced = useReducedMotion()
  const MotionTag = m[as] as typeof m.div

  if (reduced) {
    const Tag = as as keyof React.JSX.IntrinsicElements
    return (
      <Tag className={className} onMouseEnter={onMouseEnter}>
        {children}
      </Tag>
    )
  }

  return (
    <MotionTag
      className={className}
      onMouseEnter={onMouseEnter}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </MotionTag>
  )
}
