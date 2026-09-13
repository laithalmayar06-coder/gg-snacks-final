import { useEffect } from 'react'
import { useLocation } from 'react-router'

export default function RoutePosition() {
  const { pathname, hash, key } = useLocation()
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let target: HTMLElement | null = null
      if (hash) {
        try { target = document.getElementById(decodeURIComponent(hash.slice(1))) } catch { /* Ignore malformed anchors. */ }
      }
      if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
      else { window.scrollTo({ top: 0, behavior: 'instant' }); target = document.querySelector('main h1, main') }
      if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }) }
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key])
  return null
}
