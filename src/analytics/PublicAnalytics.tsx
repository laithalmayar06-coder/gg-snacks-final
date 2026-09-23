import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { inject, pageview, track } from '@vercel/analytics'
import { analyticsPath, cleanAnalyticsUrl, routeEvents } from './policy'

let injected = false
const customEvents = import.meta.env.VITE_ANALYTICS_CUSTOM_EVENTS === 'true'
export default function PublicAnalytics() {
 const { pathname } = useLocation()
 const lastPath = useRef<string | null>(null)
 useEffect(() => {
  // Avoid local development/preview noise and loading any script on direct staff visits.
  if (!import.meta.env.PROD || window.location.hostname !== 'gg-snacks-final.vercel.app') return
  const path = analyticsPath(pathname)
  if (!path) { lastPath.current = null; return }
  try {
   if (!injected) {
    inject({ mode: 'production', debug: false, disableAutoTrack: true, beforeSend(event) {
     const url = cleanAnalyticsUrl(event.url, window.location.pathname)
     return url ? { ...event, url } : null
    } })
    injected = true
   }
   if (lastPath.current !== pathname) {
    pageview({ path, route: path })
    if (customEvents && routeEvents[pathname]) track(routeEvents[pathname])
    lastPath.current = pathname
   }
  } catch { /* Analytics must never interrupt navigation or submission. */ }
  if (!customEvents) return
  const click = (event: MouseEvent) => {
   if (!analyticsPath(window.location.pathname)) return
   const target = event.target instanceof Element ? event.target.closest('.hero-actions a') : null
   if (!(target instanceof HTMLAnchorElement)) return
   const url = new URL(target.href)
   if (url.origin === window.location.origin && url.pathname === '/products') {
    try { track('explore_products_click') } catch { /* Best-effort telemetry only. */ }
   }
  }
  document.addEventListener('click', click, true)
  return () => document.removeEventListener('click', click, true)
 }, [pathname])
 return null
}