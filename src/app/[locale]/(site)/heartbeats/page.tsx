import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import HeartbeatsClient from './HeartbeatsClient'
import { familyMembers } from './family.data'
import './heartbeats.css'

export function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Heartbeats',
  description: 'Private page.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-snippet': 0,
      'max-image-preview': 'none',
      'max-video-preview': 0,
    },
  },
  alternates: { canonical: undefined },
  openGraph: undefined,
  twitter: undefined,
}

type Props = { params: Promise<{ locale: string }> }

export default async function HeartbeatsPage({ params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  return <HeartbeatsClient members={familyMembers} />
}
