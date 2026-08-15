import { NextRequest, NextResponse } from "next/server"
import { rateLimit, globalRateLimit } from "@/lib/rate-limit"
import { incrementClick } from "@/lib/db/clicks"

// Discord's own embed color values (decimal, not hex string) — one per event
// type just to make scanning the channel visually easier at a glance.
const COLORS: Record<string, number> = {
  page_view: 0x5865f2, // Discord blurple
  click: 0x22c55e, // green
  time_on_page: 0xf59e0b, // amber
}

const MAX_FIELD_VALUE = 1000 // Discord's own embed field limit is 1024

// Explicit allowlist rather than comparing against request.nextUrl.origin —
// that value reflects whatever Vercel's edge/proxy layer reports internally,
// which doesn't reliably match the public domain a browser is actually on
// (this exact mismatch caused a real bug on convert.uncertain.uk once
// already). Comparing against a known-correct fixed value sidesteps that
// entirely.
const ALLOWED_ORIGINS = new Set<string>([
  "https://uncertain.uk",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
])

function isSameSiteRequest(req: NextRequest): boolean {
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")
  // A real page load always sends one of these. Someone curling the
  // endpoint directly, or a basic script, usually sends neither — so
  // treating "neither header present" as a fail (unlike a normal browser
  // navigation, where that's normal and allowed) is the right call
  // specifically for this route, since it's only ever meant to be called
  // by JS already running on the page, not via direct navigation.
  if (origin) return ALLOWED_ORIGINS.has(origin)
  if (referer) return [...ALLOWED_ORIGINS].some((o) => referer.startsWith(o))
  return false
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameSiteRequest(req)) {
      // 404 rather than 403 — doesn't confirm to a prober that this route
      // exists and is specifically rejecting them, just looks like nothing's there.
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Railway/Vercel both set x-forwarded-for; fall back to a shared bucket
    // if it's ever missing so the limiter still does something.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    // Tightened from 20/min: real page activity is one page_view, one
    // time_on_page, and at most a couple of clicks — comfortably under 10.
    if (!rateLimit(`log:${ip}`, 10, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }
    // Backstop against a flood spread across many different IPs — see
    // lib/rate-limit.ts for what this does and doesn't actually guarantee.
    if (!globalRateLimit(60, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const type = typeof body?.type === "string" ? body.type : "unknown"
    const data = body?.data && typeof body.data === "object" ? body.data : {}

    if (type === "click" && typeof data.portal === "string") {
      try {
        await incrementClick(data.portal)
      } catch (err) {
        console.error("[api/log] click count update failed:", err)
      }
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      // Not configured — fail silently rather than erroring the page for
      // visitors just because analytics logging isn't set up yet.
      return NextResponse.json({ ok: true })
    }

    const fields = Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .slice(0, 25) // Discord's own field-count limit per embed
      .map(([key, value]) => ({
        name: key,
        value: String(value).slice(0, MAX_FIELD_VALUE),
        inline: true,
      }))

    const embed = {
      title: `uncertain.uk — ${type}`,
      color: COLORS[type] ?? 0x6b7280,
      fields,
      footer: { text: ip },
      timestamp: new Date().toISOString(),
    }

    // Fire-and-forget from the caller's perspective — don't let a slow or
    // failing Discord webhook add latency to the visitor's page. Errors are
    // logged server-side only, never surfaced to the client.
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    }).catch((err) => console.error("[api/log] webhook delivery failed:", err))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/log]", err)
    // Still 200 — a broken analytics pipe should never look like a broken
    // site to whoever (or whatever) is calling this.
    return NextResponse.json({ ok: true })
  }
}
