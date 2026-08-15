import { NextResponse } from "next/server"
import { getClickTotals } from "@/lib/db/clicks"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const totals = await getClickTotals()
    return NextResponse.json({ totals })
  } catch (err) {
    console.error("[api/stats]", err)
    return NextResponse.json({ totals: [] })
  }
}
