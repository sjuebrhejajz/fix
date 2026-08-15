import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

// Discord's own embed color values (decimal, not hex string) — one per event
// type just to make scanning the channel visually easier at a glance.
const COLORS: Record<string, number> = {
  page_view: 0x5865f2, // Discord blurple
  click: 0x22c55e, // green
  time_on_page: 0xf59e0b, // amber
}

const MAX_FIELD_VALUE = 1000 // Discord's own embed field limit is 1024

export async function POST(req: NextRequest) {
  try {
    // Railway/Vercel both set x-forwarded-for; fall back to a shared bucket
    // if it's ever missing so the limiter still does something.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    // 20 events per minute per visitor is generous for real page activity
    // (one page_view, one time_on_page, and a couple of clicks) while still
    // stopping a script from flooding the webhook past Discord's own limit.
    if (!rateLimit(`log:${ip}`, 20, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      // Not configured — fail silently rather than erroring the page for
      // visitors just because analytics logging isn't set up yet.
      return NextResponse.json({ ok: true })
    }

    const body = await req.json().catch(() => null)
    const type = typeof body?.type === "string" ? body.type : "unknown"
    const data = body?.data && typeof body.data === "object" ? body.data : {}

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
