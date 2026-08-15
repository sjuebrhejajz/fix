import type { Metadata } from 'next'
import { BioProfile } from '@/components/bio-profile'

// This used to be the root layout's metadata (before / became the portal
// hub) — moved here so this page keeps its own identity when visited
// directly, instead of inheriting the hub's title/description.
export const metadata: Metadata = {
  title: 'insanity',
  description: 'click to enter.',
  openGraph: {
    title: 'insanity',
    description: 'click to enter.',
    siteName: 'insanity',
    images: [{ url: '/images/avatar.jpg', width: 512, height: 512 }],
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'insanity',
    description: 'click to enter.',
    images: ['/images/avatar.jpg'],
  },
}

export default function InsanityPage() {
  return <BioProfile />
}
