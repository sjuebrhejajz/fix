'use client'

// This must be a client component: PORTALS below holds actual icon
// component references (FolderOpen, Video), and passing a raw function
// reference as a prop from a Server Component into a Client Component
// (PortalLink) isn't allowed — only serializable data can cross that
// boundary. This page does no server-only work (no data fetching at render
// time), so there's no downside to it being fully client-rendered.
import { useEffect, useState } from 'react'
import { FolderOpen, Video } from 'lucide-react'
import { PortalLink } from '@/components/portal-link'
import { AnalyticsLogger } from '@/components/analytics-logger'
import { AmbientBackground } from '@/components/ambient-background'

const ACCENT = '#ffe6a3'

const PORTALS = [
  {
    href: 'https://files.uncertain.uk',
    icon: FolderOpen,
    title: 'files.uncertain.uk',
    description: 'Private file hosting with instant, shareable links.',
  },
  {
    href: 'https://convert.uncertain.uk',
    icon: Video,
    title: 'convert.uncertain.uk',
    description: 'YouTube \u2192 MP3 / MP4 converter.',
  },
]

export default function Page() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, number> = {}
        for (const t of data.totals ?? []) map[t.portal] = t.count
        setCounts(map)
      })
      .catch(() => {})
  }, [])

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-10 px-4 py-16 font-mono text-white">
      <AmbientBackground />
      <AnalyticsLogger />

      <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center gap-2 text-center">
        <h1
          className="font-display text-3xl tracking-widest sm:text-4xl"
          style={{ textShadow: `0 0 18px ${ACCENT}` }}
        >
          uncertain.uk
        </h1>
        <p className="text-sm text-white/50">Two tools. Pick one.</p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        {PORTALS.map((p, i) => (
          <PortalLink key={p.href} {...p} count={counts[p.title]} delayMs={i * 100} />
        ))}
      </div>

      <p className="animate-in fade-in text-sm text-white/50" style={{ animationDelay: '250ms', animationFillMode: 'backwards' }}>
        Want to advertise here? DM <span className="text-white/80">9qhn</span> on Discord
      </p>
    </main>
  )
}
