import { sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { portalClicks } from "@/lib/db/schema"

export async function incrementClick(portal: string) {
  await db
    .insert(portalClicks)
    .values({ portal, count: 1 })
    .onConflictDoUpdate({
      target: portalClicks.portal,
      set: { count: sql`${portalClicks.count} + 1` },
    })
}

export async function getClickTotals(): Promise<{ portal: string; count: number }[]> {
  return db.select().from(portalClicks)
}
