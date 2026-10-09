import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { useHomeFamilies } from './HomepageSections'
import { productWorldThemes, worldCoreAssets, worldSelectorCopy, WORLD_ROTATION_MS, type ProductWorldTheme } from '../data/productWorldSelector'
import { getWorldDelivery, getWorldThumbnail, WORLD_MOBILE_QUERY } from '../data/productWorldDelivery'
import { areWorldImagesReady, prepareWorldImages, preloadWorldImages, rememberWorldImage, releaseWorldImages } from '../lib/productWorldImages'
import { createWorldSelection } from '../lib/productWorldSelection'
import '../styles/world-portals.css'

export default function ProductWorlds() {
  const families = useHomeFamilies()
  const { language } = useLanguage()
  const worlds = productWorldThemes.filter(world => families.some(family => family.slug === world.id))
  if (!worlds.length) return null
  return <WorldSelector key={worlds.map(world => world.id).join(',')} worlds={worlds} language={language} />
}

function WorldSelector({ worlds, language }: { worlds: ProductWorldTheme[]; language: 'en' | 'ar' }) {
  const root = useRef<HTMLElement>(null)
  const alive = useRef(true)
  const selection = useRef(createWorldSelection())
  const canRotate = useRef(false)
  const idle = useRef<gsap.core.Tween[]>([])
  const preloadAbort = useRef<AbortController | null>(null)
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(WORLD_MOBILE_QUERY).matches)
  const [active, setActive] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [readyScene, setReadyScene] = useState('')
  const [readyNext, setReadyNext] = useState('')
  const [rotationDue, setRotationDue] = useState('')
  const [error, setError] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [touchingSelectors, setTouchingSelectors] = useState(false)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const [interaction, setInteraction] = useState(0)
  const [reduced, setReduced] = useState(() => typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const c = worldSelectorCopy[language]
  const world = worlds[active]
  const delivery = useMemo(() => worlds.map(item => getWorldDelivery(item, mobile)), [worlds, mobile])
  const running = visible && pageVisible && !paused && !hovered && !focused && !touchingSelectors && !reduced && !error
  const sceneKey = world.id + ':' + mobile
  const nextIndex = (active + 1) % worlds.length
  const nextKey = worlds[nextIndex].id + ':' + mobile
  const rotationKey = sceneKey + ':' + interaction
  canRotate.current = running && readyScene === sceneKey
  const slides = previous === null ? [active] : [previous, active]

  useEffect(() => {
    alive.current = true
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const breakpoint = window.matchMedia(WORLD_MOBILE_QUERY)
    const syncBreakpoint = () => setMobile(breakpoint.matches)
    syncBreakpoint()
    breakpoint.addEventListener('change', syncBreakpoint)
    const syncMotion = () => setReduced(motion.matches)
    const syncPage = () => setPageVisible(!document.hidden)
    syncMotion(); syncPage()
    motion.addEventListener('change', syncMotion)
    document.addEventListener('visibilitychange', syncPage)
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); preload.disconnect() }
    }, { rootMargin: '240px' })
    const viewport = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 })
    if (root.current) { preload.observe(root.current); viewport.observe(root.current) }
    return () => {
      alive.current = false
      preloadAbort.current?.abort()
      releaseWorldImages()
      breakpoint.removeEventListener('change', syncBreakpoint)
      preload.disconnect(); viewport.disconnect()
      motion.removeEventListener('change', syncMotion)
      document.removeEventListener('visibilitychange', syncPage)
    }
  }, [])

  const choose = useCallback(async (index: number, manual = true) => {
    if (manual) setInteraction(value => value + 1)
    const profile = window.matchMedia(WORLD_MOBILE_QUERY).matches
    // Automatic rotation never starts preparation or takes the busy guard while waiting.
    if (!manual && (!canRotate.current || profile !== mobile || !areWorldImagesReady(getWorldDelivery(worlds[index], profile).sources))) return
    if (worlds.length < 2 || !selection.current.request(index, manual)) return
    preloadAbort.current?.abort()
    if (!manual) {
      selection.current.commit(index)
      setPrevious(active); setActive(index)
      return
    }
    setError(false)
    try {
      const next = worlds[index]
      let preparedForMobile: boolean
      do {
        preparedForMobile = window.matchMedia(WORLD_MOBILE_QUERY).matches
        const sources = getWorldDelivery(next, preparedForMobile).sources
        setLoading(!areWorldImagesReady(sources))
        await prepareWorldImages(sources)
        if (!alive.current) return
      } while (preparedForMobile !== window.matchMedia(WORLD_MOBILE_QUERY).matches)
      if (!alive.current) return
      selection.current.commit(index)
      setPrevious(active); setActive(index); setLoading(false)
      if (manual) setAnnouncement(next.name)
    } catch {
      if (alive.current) { setLoading(false); setError(true) }
      selection.current.finish()
    }
  }, [active, worlds, mobile])

  // Keep the 5.8s dwell, but a late next-family decode can finish silently after it.
  useEffect(() => {
    setRotationDue('')
    if (!running || loading || readyScene !== sceneKey || worlds.length < 2) return
    const timer = window.setTimeout(() => setRotationDue(rotationKey), WORLD_ROTATION_MS)
    return () => window.clearTimeout(timer)
  }, [running, loading, readyScene, sceneKey, rotationKey, worlds.length])

  useEffect(() => {
    if (rotationDue !== rotationKey || readyNext !== nextKey || !running || loading || previous !== null) return
    void choose(nextIndex, false)
  }, [rotationDue, rotationKey, readyNext, nextKey, running, loading, previous, nextIndex, choose])

  // Drain after React removes the outgoing scene, never inside a running timeline.
  useEffect(() => {
    if (loading || previous !== null) return
    const requested = selection.current.takePending()
    if (requested !== null) void choose(requested)
  }, [loading, previous, interaction, choose])

  // The initial scene must really decode before its rotation clock can start.
  useEffect(() => {
    if (!near) return
    const controller = new AbortController()
    const images = root.current?.querySelectorAll<HTMLImageElement>(
      `.pw-background, .pw-hologram img, [data-world-slide="${world.id}"] img`,
    )
    if (!images?.length) return () => controller.abort()
    void Promise.all(Array.from(images, image => rememberWorldImage(image, controller.signal))).then(() => {
      if (!controller.signal.aborted) setReadyScene(sceneKey)
    }).catch(() => { /* Keep the current scene and manual navigation available on failure. */ })
    return () => controller.abort()
  }, [near, sceneKey, world.id])

  // Silent, sequential next-family preparation; it never owns the selection queue.
  useEffect(() => {
    if (!near || !visible || !pageVisible || paused || reduced || loading || previous !== null || readyScene !== sceneKey || worlds.length < 2) return
    const controller = new AbortController()
    preloadAbort.current = controller
    setReadyNext('')
    const sources = getWorldDelivery(worlds[nextIndex], mobile).sources
    void preloadWorldImages(sources, controller.signal).then(() => {
      if (!controller.signal.aborted && areWorldImagesReady(sources)) setReadyNext(nextKey)
    }).catch(() => { /* A speculative load failure must not interrupt the current scene. */ })
    return () => controller.abort()
  }, [near, visible, pageVisible, paused, reduced, loading, previous, readyScene, sceneKey, nextIndex, nextKey, mobile, worlds])

  // Keep the active mobile selector visible without scrolling the page vertically.
  useEffect(() => {
    if (!window.matchMedia('(max-width: 767px)').matches || touchingSelectors) return
    const rail = root.current?.querySelector<HTMLElement>('.pw-selectors')
    const selected = rail?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!rail || !selected) return
    const bounds = rail.getBoundingClientRect()
    const item = selected.getBoundingClientRect()
    const inset = 18
    const delta = item.left < bounds.left + inset ? item.left - bounds.left - inset
      : item.right > bounds.right - inset ? item.right - bounds.right + inset : 0
    if (delta) rail.scrollBy({ left: delta, behavior: reduced ? 'auto' : 'smooth' })
  }, [active, reduced])

  useLayoutEffect(() => {
    if (!root.current) return
    const travel = window.matchMedia('(max-width: 767px)').matches ? .55 : 1
    const context = gsap.context(() => {
      const select = gsap.utils.selector(root)
      const current = `[data-world-slide="${world.id}"]`
      const complete = () => { if (previous !== null) { selection.current.finish(); setPrevious(null) } }
      if (reduced) { complete(); return }
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: complete })
      if (previous !== null) {
        const outgoing = `[data-world-slide="${worlds[previous].id}"]`
        timeline.to(select(`${outgoing} .pw-pack-reveal`), { opacity: 0, y: -12 * travel, scale: .97, duration: .28 }, 0)
          .to(select(`${outgoing} .pw-food-reveal`), { opacity: 0, y: -8 * travel, duration: .25, stagger: .03 }, 0)
          .to(select(`.pw-info${outgoing}`), { opacity: 0, y: -6 * travel, duration: .2 }, 0)
        // Each layer's gradients/filters are fixed. Only opacity changes per frame.
        // Keep the old opaque environment underneath to avoid dimming the chamber.
        timeline.fromTo(select(`.pw-environment-layer[data-world-light="${world.id}"]`), { opacity: 0 }, { opacity: 1, duration: .7 }, 0)
          .to(select(`.pw-hologram [data-world-light="${worlds[previous].id}"]`), { opacity: 0, duration: .7 }, 0)
          .fromTo(select(`.pw-hologram [data-world-light="${world.id}"]:not(.pw-hologram-energy)`), { opacity: 0 }, { opacity: 1, duration: .7 }, 0)
          .fromTo(select(`.pw-hologram-energy[data-world-light="${world.id}"]`), { opacity: 0 }, { opacity: .68, duration: .7 }, 0)
      }
      const start = previous === null ? 0 : .22
      timeline.fromTo(select(`${current} .pw-pack-reveal`), { opacity: 0, y: 18 * travel, scale: .965 }, { opacity: 1, y: 0, scale: 1, duration: .65 }, start)
        .fromTo(select(`${current} .pw-food-reveal`), { opacity: 0, y: 10 * travel, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .6, stagger: .06 }, start + .1)
        .fromTo(select(`.pw-info${current} > *`), { opacity: 0, y: 9 * travel }, { opacity: 1, y: 0, duration: .45, stagger: .055 }, start + .1)
    }, root)
    return () => context.revert()
    // previous is transition bookkeeping; removing it must not replay the entrance.
  }, [active, reduced, world.id, world.accent, world.secondary, world.hue])

  useLayoutEffect(() => {
    if (!near) return
    if (reduced) {
      gsap.set(root.current!.querySelectorAll('.pw-pack-float, .pw-food-float'), { clearProps: 'transform' })
      return
    }
    const drift = window.matchMedia('(max-width: 767px)').matches ? .7 : 1
    const context = gsap.context(() => {
      idle.current = [gsap.to(root.current!.querySelectorAll(`[data-world-slide="${world.id}"] .pw-pack-float`), { y: -7 * drift, duration: 4.2, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })]
      root.current!.querySelectorAll(`[data-world-slide="${world.id}"] .pw-food:not(.pw-food-crumbs) .pw-food-float`).forEach((item, index) => {
        idle.current.push(gsap.to(item, { y: (index % 2 ? 5 : -6) * drift, x: (index % 2 ? -3 : 3) * drift, rotation: (index % 2 ? -1.4 : 1.2) * drift, duration: 4.4 + index * .7, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true }))
      })
    }, root)
    // Stop the outgoing float at its current pose instead of snapping it to zero.
    return () => { context.kill(false); idle.current = [] }
  }, [active, near, reduced, world.id])

  useEffect(() => {
    idle.current.forEach(tween => { if (running) tween.play(); else tween.pause() })
  }, [running, active, near, reduced])

  return <section ref={root} id="product-worlds" className="gg-section world-showcase" dir={language === 'ar' ? 'rtl' : 'ltr'}
    aria-labelledby="worlds-title" aria-roledescription={c.carousel} data-transitioning={previous !== null ? true : undefined}
    style={{ '--pw-accent': world.accent, '--pw-secondary': world.secondary, '--pw-hue': world.hue } as CSSProperties}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true) }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    {slides.map(index => <div className="pw-environment-layer" data-world-light={worlds[index].id} key={worlds[index].id} style={themeStyle(worlds[index])} aria-hidden="true">
      {near && <img className="pw-background" src={worldCoreAssets.background} width={1916} height={821} alt="" decoding="async" />}
      <div className="pw-ambient">
        <span className="pw-environment-lines" />
        <span className="pw-environment-signals" />
        <span className="pw-environment-haze" />
        <span className="pw-environment-floor" />
      </div>
    </div>)}
    <div className="pw-layout">
      <header className="pw-heading">
        <p className="pw-eyebrow">{c.eyebrow}</p>
        <p className="pw-mobile-index pw-index" dir="ltr"><strong>{String(active + 1).padStart(2, '0')}</strong><span>/ {String(worlds.length).padStart(2, '0')}</span></p>
        <h2 id="worlds-title">{c.heading.map(line => <span key={line}>{line}</span>)}</h2>
        <span className="pw-heading-rule" aria-hidden="true" />
      </header>
      <div className="pw-stage" aria-hidden="true" dir="ltr">
        <div className="pw-hologram">
          {near && <img src={worldCoreAssets.hologram} width={1672} height={941} alt="" decoding="async" />}
          {slides.map(index => <HologramLight key={worlds[index].id} world={worlds[index]} near={near} />)}
        </div>
        {slides.map(index => <div className="pw-visual" data-world-slide={worlds[index].id} key={worlds[index].id} style={themeStyle(worlds[index])}>
          <div className="pw-pack-position"><div className="pw-pack-reveal"><div className="pw-pack-float">{near && <img src={delivery[index].pack} width={941} height={1672} alt="" decoding="async" />}</div></div></div>
          {worlds[index].food.map((food, foodIndex) => {
            const image = delivery[index].food[foodIndex]
            return <div className={`pw-food pw-food-${food.slot}`} key={food.src}><div className="pw-food-reveal"><div className="pw-food-float">{near && image && <img src={image.src} width={image.width} height={image.height} alt="" decoding="async" />}</div></div></div>
          })}
        </div>)}
      </div>
      <div className="pw-details" aria-live="off">
        <div className="pw-info-stack">
          {slides.map(index => <div className="pw-info" data-world-slide={worlds[index].id} key={worlds[index].id} style={themeStyle(worlds[index])} inert={index !== active} aria-hidden={index !== active ? true : undefined}>
            <p className="pw-index" dir="ltr"><strong>{String(index + 1).padStart(2, '0')}</strong><span>/ {String(worlds.length).padStart(2, '0')}</span></p>
            <h3 dir="ltr">{worlds[index].name}</h3>
            <p className="pw-description">{worlds[index].description[language]}</p>
            <Link className="pw-explore" to={worlds[index].href}>{c.explore} <b dir="ltr">{worlds[index].name}</b><span aria-hidden="true">↗</span></Link>
          </div>)}
        </div>
        <div className="pw-controls">
          <div className="pw-arrows" dir="ltr">
            <button type="button" aria-label={c.previous} aria-disabled={worlds.length < 2} onClick={() => { void choose((selection.current.requested - 1 + worlds.length) % worlds.length) }}>←</button>
            <button type="button" aria-label={c.next} aria-disabled={worlds.length < 2} onClick={() => { void choose((selection.current.requested + 1) % worlds.length) }}>→</button>
          </div>
          {!reduced && worlds.length > 1 && <button className="pw-pause" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}><span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>{paused ? c.play : c.pause}</button>}
        </div>
        <p className="pw-status" role="status">{error ? c.error : loading ? c.loading : ''}</p>
      </div>
    </div>
    <div className="pw-selectors" role="group" aria-label={c.selectors}
      onTouchStart={() => { if (window.matchMedia('(max-width: 767px)').matches) { canRotate.current = false; setTouchingSelectors(true) } }}
      onTouchEnd={() => { if (touchingSelectors) { setTouchingSelectors(false); setInteraction(value => value + 1) } }}
      onTouchCancel={() => { if (touchingSelectors) { setTouchingSelectors(false); setInteraction(value => value + 1) } }}>
      {worlds.map((item, index) => <button className="pw-selector" type="button" key={item.id} aria-pressed={active === index} aria-label={`${String(index + 1).padStart(2, '0')} / ${item.name}`} onClick={() => { void choose(index) }} style={{ '--selector-accent': item.accent } as CSSProperties}>
        <span className="pw-selector-number" aria-hidden="true">0{index + 1}</span>
        <span className="pw-selector-copy"><strong dir="ltr">{item.name}</strong><span className="pw-selected-label" aria-hidden="true">{active === index ? c.selected : '—'}</span></span>
        <img src={getWorldThumbnail(item)} alt="" width={941} height={1672} loading="lazy" decoding="async" />
      </button>)}
    </div>
    <span className="pw-sr-only" role="status">{announcement}</span>
  </section>
}
function themeStyle(world: ProductWorldTheme): CSSProperties {
  return { '--pw-accent': world.accent, '--pw-secondary': world.secondary, '--pw-hue': world.hue } as CSSProperties
}

function HologramLight({ world, near }: { world: ProductWorldTheme; near: boolean }) {
  const style = themeStyle(world)
  return <>
    <span className="pw-floor-light" data-world-light={world.id} style={style} />
    {near && <img className="pw-hologram-energy" data-world-light={world.id} style={style} src={worldCoreAssets.hologram} width={1672} height={941} alt="" decoding="async" />}
    <span className="pw-platform-glow" data-world-light={world.id} style={style} />
  </>
}
