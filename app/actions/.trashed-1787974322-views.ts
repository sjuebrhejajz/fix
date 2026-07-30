"use server"

import { createHash } from "crypto"
import { headers } from "next/headers"
import { sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteViews } from "@/lib/db/schema"

const BASE_VIEWS = 590

async function getClientIp() {
  const h = await headers()
  const forwarded = h.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : h.get("x-real-ip") || "unknown"
  return ip
}

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex")
}

async function countViews() {
  const rows = await db.select({ count: sql<number>`count(*)::int` }).from(siteViews)
  return BASE_VIEWS + (rows[0]?.count ?? 0)
}

// Reads the current total without recording a new visit.
export async function getViews() {
  try {
    return await countViews()
  } catch {
    return BASE_VIEWS
  }
}

// Records one view per unique IP address (deduplicated), then returns the total.
export async function recordView() {
  try {
    const ipHash = hashIp(await getClientIp())
    await db.insert(siteViews).values({ ipHash }).onConflictDoNothing()
    return await countViews()
  } catch {
    return BASE_VIEWS
  }
}
