import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const siteViews = pgTable("site_views", {
  ipHash: text("ip_hash").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
