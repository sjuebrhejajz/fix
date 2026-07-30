'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Eye,
  Shield,
  Crown,
  Handshake,
  Code,
  Bug,
  Flame,
  BadgeCheck,
  Gavel,
} from 'lucide-react'
import { CursorTrail } from '@/components/effects/cursor-trail'
import { recordView } from '@/app/actions/views'

const ACCENT = '#ffe6a3'

const BADGES = [
  { icon: Shield, label: 'Staff Member' },
  { icon: Crown, label: 'Owner' },
  { icon: Handshake, label: 'Partner' },
  { icon: Code, label: 'Developer' },
  { icon: Bug, label: 'Bug Bounty' },
  { icon: Flame, label: 'Hated by Guns.lol' },
  { icon: Flame, label: 'Hated by Fakecrime.bio' },
  { icon: BadgeCheck, label: 'Verified' },
  { icon: Gavel, label: 'Rule Maker' },
]

const DISCORD_URL = 'https://discord.gg/insanityz'

export function BioProfile() {
  const [started, setStarted] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const [views, setViews] = useState<number | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Typewriter animation on the browser tab title: types " insanity ",
  // holds, erases, then loops — one full cycle every 10 seconds.
  useEffect(() => {
    const text = ' insanity '
    const cycle = 10000
    const steps = text.length * 2 // type each char, then erase each char
    const stepMs = cycle / steps
    let i = 0

    const id = setInterval(() => {
      const pos = i % steps
      const count = pos < text.length ? pos + 1 : steps - pos - 1
      document.title = text.slice(0, count) || '\u200b'
      i++
    }, stepMs)

    return () => {
      clearInterval(id)
      document.title = 'insanity'
    }
  }, [])

  const handleStart = () => {
    setStarted(true)
    if (audioRef.current) audioRef.current.volume = 0.5
    audioRef.current?.play().catch(() => {})
    videoRef.current?.play().catch(() => {})
    // Record a real, IP-deduplicated view and show the authoritative total.
    recordView()
      .then((total) => setViews(total))
      .catch(() => {})
  }

  const triggerGlitch = () => {
    setGlitch(true)
    setTimeout(() => setGlitch(false), 700)
  }

  const cardBg = 'rgba(0, 0, 0, 0.7)'

  return (
    <main
      className="relative h-dvh w-full overflow-hidden font-mono text-white"
      style={
        {
          '--accent-glow': ACCENT,
        } as React.CSSProperties
      }
    >
      {/* Video background */}
      <div className="fixed inset-0 z-[1] bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover opacity-90"
          src="/media/background.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
        />
      </div>

      {/* Cursor trail */}
      {started && <CursorTrail color={ACCENT} />}

      <audio ref={audioRef} src="/media/track.mp3" loop preload="auto" aria-hidden="true" />

      {/* Start screen */}
      {!started && (
        <button
          onClick={handleStart}
          className="fixed inset-0 z-30 flex cursor-pointer flex-col items-center justify-center gap-3 bg-black/90 backdrop-blur-md"
        >
          <span className="font-display text-3xl tracking-widest name-glow">
            Insanity
          </span>
          <span className="animate-pulse text-lg text-white/80">
            [ click to enter ]
          </span>
        </button>
      )}

      {started && (
        <>
          {/* Profile card */}
          <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center p-4">
              <section
                key="profile"
                className="animate-card-pop pointer-events-auto flex w-full max-w-[820px] flex-col gap-4 rounded-2xl border p-5 backdrop-blur-lg"
                style={{ background: cardBg, borderColor: `${ACCENT}80` }}
              >
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-[130px] w-[130px] shrink-0 sm:h-[150px] sm:w-[150px]">
                    <Image
                      src="/images/avatar.jpg"
                      alt="Insanity avatar"
                      width={150}
                      height={150}
                      onClick={triggerGlitch}
                      className={`h-full w-full cursor-pointer rounded-full object-cover ${
                        glitch ? 'animate-glitch' : ''
                      }`}
                      style={{
                        boxShadow: `0 0 18px ${ACCENT}80`,
                        border: `1px solid ${ACCENT}66`,
                      }}
                    />
                  </div>

                  <div className="flex flex-1 flex-col items-center sm:items-start">
                    <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row">
                      <h1 className="font-display text-3xl font-bold tracking-widest name-glow">
                        Insanity
                      </h1>
                    </div>

                    {/* Badges */}
                    <div className="mb-3 rounded-2xl bg-white/15 p-0.5">
                      <div className="flex flex-wrap justify-center gap-2 rounded-[14px] bg-black/50 p-2 shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]">
                        {BADGES.map((b, i) => {
                          const Icon = b.icon
                          return (
                            <div key={i} className="group relative">
                              <Icon
                                className="h-5 w-5 cursor-pointer transition-transform hover:scale-125"
                                style={{ color: ACCENT }}
                              />
                              <span className="pointer-events-none absolute bottom-[140%] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                                {b.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <p className="text-center text-base leading-relaxed text-white/80 sm:text-left">
                      love my hbs
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-white/20" />

                <div className="flex flex-col gap-4">
                  <div className="group relative flex items-center gap-2 self-center rounded-full bg-white/10 px-4 py-2 text-sm sm:self-start">
                    <Eye className="h-4 w-4" style={{ color: ACCENT }} />
                    <span>{views !== null ? views.toLocaleString() : '—'}</span>
                    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                      Profile Views
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <a
                      href={DISCORD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Discord"
                      className="transition-transform hover:scale-125"
                      style={{
                        filter: `drop-shadow(0 0 8px ${ACCENT})`,
                      }}
                    >
                      <span
                        className="block h-9 w-9 bg-white"
                        style={{
                          maskImage: `url(/images/brands/discord.svg)`,
                          WebkitMaskImage: `url(/images/brands/discord.svg)`,
                          maskRepeat: 'no-repeat',
                          WebkitMaskRepeat: 'no-repeat',
                          maskPosition: 'center',
                          WebkitMaskPosition: 'center',
                          maskSize: 'contain',
                          WebkitMaskSize: 'contain',
                        }}
                      />
                    </a>
                  </div>
                </div>
              </section>
            </div>
        </>
      )}
    </main>
  )
}
