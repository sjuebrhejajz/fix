// Simple in-memory sliding-window limiter. This is best-effort, not true
// DDoS protection — Vercel's Edge Network already provides real
// network-level DDoS mitigation ahead of this code ever running; this is
// just a second, application-level layer aimed at a narrower problem: even
// a single legitimate-looking client hammering the page shouldn't be able
// to exceed Discord's own webhook rate limit (~30 messages/min) and start
// getting messages silently dropped.
//
// The "global" bucket only reflects requests seen by *this* serverless
// instance's memory — under real load Vercel can run several instances in
// parallel, each with its own counter, so a genuinely distributed flood
// could still exceed these numbers in aggregate. Worth knowing, not worth
// solving here (that needs Redis or a DB-backed counter, which adds latency
// to every request for a problem this app is unlikely to actually face).
const buckets = new Map<string, number[]>()

function checkBucket(key: string, limit: number, windowMs: number): boolean {
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

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  return checkBucket(key, limit, windowMs)
}

// One shared bucket everyone's requests count against, on top of their own
// per-IP bucket — this is the actual backstop against a distributed flood
// within a single instance.
export function globalRateLimit(limit: number, windowMs: number): boolean {
  return checkBucket("__global__", limit, windowMs)
}
