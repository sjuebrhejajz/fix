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
  if (origin) return ALLOWED_ORIGINS.has(origin)
  if (referer) return [...ALLOWED_ORIGINS].some((o) => referer.startsWith(o))
  return false
}

// SECURITY: this is the actual fix for the real incident — this route used
// to take whatever field names/values were in the request body and reflect
// them straight into a Discord embed with only a generic 1000-char cap per
// value. That meant anyone who could reach this endpoint (bypassing the
// origin check some other way, e.g. by spoofing headers) could put
// arbitrary text — including a paragraph-long threatening message dressed
// up as a "user_agent" field — directly into the channel. Every field below
// is now validated against a known shape for its event type; anything
// unrecognized, wrong-typed, or malformed is silently dropped rather than
// forwarded. Free-text-ish fields (referrer, user_agent) still allow
// arbitrary content by nature, but are capped far shorter than before
// (200 chars, not 1000) — long enough for any real value, short enough that
// this stops being a useful place to paste a monologue.
const SCHEMAS: Record<string, Record<string, { maxLen: number; pattern?: RegExp }>> = {
  page_view: {
    path: { maxLen: 200 },
    referrer: { maxLen: 200 },
    user_agent: { maxLen: 200 },
    language: { maxLen: 35, pattern: /^[A-Za-z0-9-]+$/ },
    timezone: { maxLen: 60, pattern: /^[A-Za-z0-9_+\-/]+$/ },
    screen: { maxLen: 20, pattern: /^\d{1,5}x\d{1,5}$/ },
    viewport: { maxLen: 20, pattern: /^\d{1,5}x\d{1,5}$/ },
    pixel_ratio: { maxLen: 10, pattern: /^\d+(\.\d+)?$/ },
    cpu_cores: { maxLen: 10, pattern: /^(\d+|unknown)$/ },
    device_memory_gb: { maxLen: 10, pattern: /^(\d+(\.\d+)?|unknown)$/ },
    connection_type: { maxLen: 20, pattern: /^[a-z0-9]+$/i },
    downlink_mbps: { maxLen: 10, pattern: /^(\d+(\.\d+)?|unknown)$/ },
    ttfb_ms: { maxLen: 10, pattern: /^(\d+|unknown)$/ },
    dom_load_ms: { maxLen: 10, pattern: /^(\d+|unknown)$/ },
    page_load_ms: { maxLen: 10, pattern: /^(\d+|unknown)$/ },
  },
  click: {
    portal: { maxLen: 60 },
    path: { maxLen: 200 },
  },
  time_on_page: {
    path: { maxLen: 200 },
    seconds: { maxLen: 10, pattern: /^\d+$/ },
  },
}

function sanitizeData(type: string, data: Record<string, unknown>): Record<string, string> {
  const schema = SCHEMAS[type]
  if (!schema) return {}

  const clean: Record<string, string> = {}
  for (const [key, spec] of Object.entries(schema)) {
    const raw = data[key]
    if (raw === undefined || raw === null || raw === "") continue
    const str = String(raw).slice(0, spec.maxLen)
    if (spec.pattern && !spec.pattern.test(str)) continue
    clean[key] = str
  }
  return clean
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameSiteRequest(req)) {
      // 404 rather than 403 — doesn't confirm to a prober that this route
      // exists and is specifically rejecting them, just looks like nothing's there.
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    if (!rateLimit(`log:${ip}`, 10, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }
    if (!globalRateLimit(60, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const type = typeof body?.type === "string" ? body.type : "unknown"

    // Only these three event types exist — anything else is either a bug on
    // our own end (shouldn't happen) or someone probing the endpoint.
    if (!SCHEMAS[type]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const rawData = body?.data && typeof body.data === "object" ? body.data : {}
    const data = sanitizeData(type, rawData)

    if (type === "click" && typeof data.portal === "string") {
      try {
        await incrementClick(data.portal)
      } catch (err) {
        console.error("[api/log] click count update failed:", err)
      }
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json({ ok: true })
    }

    const fields = Object.entries(data).map(([key, value]) => ({
      name: key,
      value,
      inline: true,
    }))

    const embed = {
      title: `uncertain.uk — ${type}`,
      color: COLORS[type] ?? 0x6b7280,
      fields,
      footer: { text: ip },
      timestamp: new Date().toISOString(),
    }

    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    }).catch((err) => console.error("[api/log] webhook delivery failed:", err))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/log]", err)
    return NextResponse.json({ ok: true })
  }
}
