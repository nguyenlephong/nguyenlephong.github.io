import type { Metadata } from 'next'
import HeartbeatsClient from './HeartbeatsClient'
import { familyMembers } from './family.data'
import './heartbeats.css'

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

export default function HeartbeatsPage() {
  return <HeartbeatsClient members={familyMembers} />
}
