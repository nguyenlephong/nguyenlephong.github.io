import React, { type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'header'
}

export default function Reveal({
  children,
  className,
  as = 'div',
}: RevealProps) {
  const Tag = as as keyof React.JSX.IntrinsicElements
  return <Tag className={className}>{children}</Tag>
}

type StaggerProps = {
  children: ReactNode
  stagger?: number
  className?: string
  as?: 'div' | 'ul' | 'ol'
}

export function Stagger({
  children,
  className,
  as = 'div',
}: StaggerProps) {
  const Tag = as as keyof React.JSX.IntrinsicElements
  return <Tag className={className}>{children}</Tag>
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
  const Tag = as as keyof React.JSX.IntrinsicElements
  return (
    <Tag className={className} onMouseEnter={onMouseEnter}>
      {children}
    </Tag>
  )
}
