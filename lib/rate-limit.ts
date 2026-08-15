// Simple in-memory sliding-window limiter. Good enough for a single-process
// app — the point isn't to be airtight, it's to stop one visitor (or a bot)
// from flooding the Discord webhook, which has its own hard rate limit
// (~30 messages/min) that would start silently dropping messages if hammered.
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const cutoff = now - windowMs
  const bucket = buckets.get(key) ?? []
  const recent = bucket.filter((t) => t > cutoff)

  if (recent.length >= limit) {
    buckets.set(key, recent)
    return false
  }

  recent.push(now)
  buckets.set(key, recent)
  return true
}
