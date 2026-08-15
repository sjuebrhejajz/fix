"use client"

function send(type: string, data: Record<string, unknown>) {
  const payload = JSON.stringify({ type, data })
  // sendBeacon is the reliable choice for events fired during page unload —
  // a regular fetch() can get silently cancelled mid-flight when the tab
  // closes, which is exactly when the time-on-page event fires. It works
  // fine for normal in-page events too, so it's used everywhere here rather
  // than switching strategies per event type.
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" })
    navigator.sendBeacon("/api/log", blob)
  } else {
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }
}

export function logClick(portal: string) {
  send("click", { portal, path: window.location.pathname })
}

export function logPageView() {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
  // navigator.connection is Chrome/Edge/Android-only (not in the TS lib types) —
  // read it defensively so this never throws on Safari/Firefox.
  const conn = (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number } }).connection
  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory

  send("page_view", {
    path: window.location.pathname,
    referrer: document.referrer || "direct",
    user_agent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixel_ratio: window.devicePixelRatio,
    cpu_cores: navigator.hardwareConcurrency ?? "unknown",
    device_memory_gb: deviceMemory ?? "unknown",
    connection_type: conn?.effectiveType ?? "unknown",
    downlink_mbps: conn?.downlink ?? "unknown",
    ttfb_ms: nav ? Math.round(nav.responseStart) : "unknown",
    dom_load_ms: nav ? Math.round(nav.domContentLoadedEventEnd) : "unknown",
    page_load_ms: nav ? Math.round(nav.loadEventEnd) : "unknown",
  })
}

export function logTimeOnPage(seconds: number) {
  send("time_on_page", { path: window.location.pathname, seconds })
}
