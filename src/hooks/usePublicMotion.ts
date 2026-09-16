import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Scoped to public layouts; no animation is attached to admin or rating screens.
export function usePublicMotion(key: string, enabled = true) {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!enabled) return
    const media = gsap.matchMedia()
    media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const element = root.current
      if (!element) return
      gsap.from(element.querySelectorAll('.public-page-hero > *, .catalogue-content > h1'), {
        y: 14, opacity: 0, duration: .55, stagger: .07, clearProps: 'transform,opacity',
      })
      element.querySelectorAll('.gg-world-grid, .gg-featured-grid, .catalogue-grid, .public-about-grid, .gg-arena-frame, .gg-event-layout, .finder-layout').forEach(group => {
        gsap.from(group.children, {
          y: 24, opacity: 0, duration: .65, stagger: .07, ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: group, start: 'top 92%', once: true },
        })
      })
      // Observe size changes from CMS data and images without polling.
      let frame = 0
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => ScrollTrigger.refresh())
      })
      observer.observe(element)
      return () => { observer.disconnect(); cancelAnimationFrame(frame) }
    }, root)
    return () => media.revert()
  }, [key, enabled])
  return root
}
