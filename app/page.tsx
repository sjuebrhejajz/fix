import Link from 'next/link'
import { FolderOpen, Video } from 'lucide-react'

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
      <h1
        className="font-display text-3xl tracking-widest sm:text-4xl"
        style={{ textShadow: `0 0 18px ${ACCENT}` }}
      >
        uncertain.uk
      </h1>

      <div className="flex w-full max-w-md flex-col gap-4">
        {PORTALS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-lg transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 transition-transform group-hover:scale-110"
              style={{ boxShadow: `0 0 14px ${ACCENT}40` }}
            >
              <p.icon className="size-5" style={{ color: ACCENT }} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-base tracking-wide">{p.title}</p>
              <p className="text-sm text-white/60">{p.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-white/50">
        Want to advertise here? DM <span className="text-white/80">9qhn</span> on Discord
      </p>
    </main>
  )
}
