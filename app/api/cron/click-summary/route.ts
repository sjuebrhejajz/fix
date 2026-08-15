import { NextRequest, NextResponse } from "next/server"
import { getClickTotals } from "@/lib/db/clicks"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Vercel Cron requests include this header automatically when CRON_SECRET
  // is set as an env var — this stops anyone else from hitting the route
  // and spamming the summary on demand.
  const auth = req.headers.get("authorization")
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ skipped: "DISCORD_WEBHOOK_URL not set" })
  }

  try {
    const totals = await getClickTotals()
    const totalClicks = totals.reduce((sum, t) => sum + t.count, 0)

    const embed = {
      title: "uncertain.uk — click totals (10 min update)",
      color: 0x5865f2,
      description: totalClicks === 0 ? "No clicks recorded yet." : undefined,
      fields: totals.map((t) => ({
        name: t.portal,
        value: t.count.toLocaleString(),
        inline: true,
      })),
      timestamp: new Date().toISOString(),
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    })

    return NextResponse.json({ ok: true, totals })
  } catch (err) {
    console.error("[cron/click-summary]", err)
    return NextResponse.json({ error: "Could not post click summary" }, { status: 500 })
  }
}
