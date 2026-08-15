import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core"

export const siteViews = pgTable("site_views", {
  ipHash: text("ip_hash").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// Running click totals per portal, shown in the periodic Discord summary and
// (as a genuine, non-fabricated number) on the hub page itself. Vercel runs
// this app as stateless serverless functions — an in-memory counter would
// reset unpredictably between invocations, so this has to live in the
// database to actually persist.
export const portalClicks = pgTable("portal_clicks", {
  portal: text("portal").primaryKey(),
  count: integer("count").notNull().default(0),
})
