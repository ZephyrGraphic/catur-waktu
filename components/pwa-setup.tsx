"use client"

import { useEffect } from "react"

export default function PWASetup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
    if ("Notification" in window && Notification.permission === "default") {
      const t = setTimeout(() => {
        Notification.requestPermission().catch(() => {})
      }, 1200)
      return () => clearTimeout(t)
    }
  }, [])
  return null
}
