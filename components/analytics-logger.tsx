"use client"

import { useEffect, useRef } from "react"
import { logPageView, logTimeOnPage } from "@/lib/log-client"

export function AnalyticsLogger() {
  const startRef = useRef<number>(Date.now())
  const sentRef = useRef(false)

  useEffect(() => {
    startRef.current = Date.now()
    // Small delay so the Navigation Timing entries (load times etc.) are
    // actually populated by the time we read them — reading immediately on
    // mount can catch them mid-fill.
    const t = setTimeout(() => logPageView(), 300)

    const sendDuration = () => {
      if (sentRef.current) return
      sentRef.current = true
      logTimeOnPage(Math.round((Date.now() - startRef.current) / 1000))
    }

    // pagehide fires reliably on both desktop and mobile — including tab
    // close and switching apps on mobile — unlike beforeunload, which many
    // mobile browsers skip firing entirely.
    window.addEventListener("pagehide", sendDuration)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendDuration()
    })

    return () => {
      clearTimeout(t)
      window.removeEventListener("pagehide", sendDuration)
    }
  }, [])

  return null
}
