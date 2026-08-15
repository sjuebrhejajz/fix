import { FolderOpen, Video } from 'lucide-react'
import { PortalLink } from '@/components/portal-link'
import { AnalyticsLogger } from '@/components/analytics-logger'

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
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-10 bg-black px-4 py-16 font-mono text-white">
      <AnalyticsLogger />

      <h1
        className="font-display text-3xl tracking-widest sm:text-4xl"
        style={{ textShadow: `0 0 18px ${ACCENT}` }}
      >
        uncertain.uk
      </h1>

      <div className="flex w-full max-w-md flex-col gap-4">
        {PORTALS.map((p) => (
          <PortalLink key={p.href} {...p} />
        ))}
      </div>

      <p className="text-sm text-white/50">
        Want to advertise here? DM <span className="text-white/80">9qhn</span> on Discord
      </p>
    </main>
  )
}
