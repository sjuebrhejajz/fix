'use client'

import Link from 'next/link'
import type { ComponentType, CSSProperties } from 'react'
import { logClick } from '@/lib/log-client'

const ACCENT = '#ffe6a3'

export function PortalLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: ComponentType<{ className?: string; style?: CSSProperties }>
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      onClick={() => logClick(title)}
      className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-lg transition-colors hover:border-white/30 hover:bg-white/10"
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 transition-transform group-hover:scale-110"
        style={{ boxShadow: `0 0 14px ${ACCENT}40` }}
      >
        <Icon className="size-5" style={{ color: ACCENT }} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-base tracking-wide">{title}</p>
        <p className="text-sm text-white/60">{description}</p>
      </div>
    </Link>
  )
}
