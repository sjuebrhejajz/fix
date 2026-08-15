import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const SITE_URL = 'https://uncertain.uk'
const SITE_DESCRIPTION = 'Portals to files.uncertain.uk and convert.uncertain.uk.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'uncertain.uk',
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'uncertain.uk',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'uncertain.uk',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'uncertain.uk',
    description: SITE_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${orbitron.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-black antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
