import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { useHomeFamilies } from './HomepageSections'
import { productWorldThemes, worldCoreAssets, worldSelectorCopy, WORLD_ROTATION_MS, type ProductWorldTheme } from '../data/productWorldSelector'
import '../styles/world-portals.css'

// Decode the requested artwork before switching, so slow connections keep the current scene.
const preparedImages = new Map<string, Promise<void>>()
function prepareImage(src: string) {
  let pending = preparedImages.get(src)
  if (!pending) {
    pending = new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.onload = () => { image.decode().then(resolve, reject) }
      image.onerror = () => reject(new Error('Product world asset unavailable'))
      image.src = src
    }).catch(error => { preparedImages.delete(src); throw error })
    preparedImages.set(src, pending)
  }
  return pending
}

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
  const busy = useRef(false)
  const canRotate = useRef(false)
  const idle = useRef<gsap.core.Tween[]>([])
  const [active, setActive] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
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
  const running = visible && pageVisible && !paused && !hovered && !focused && !touchingSelectors && !reduced && !error
  canRotate.current = running
  const slides = previous === null ? [active] : [previous, active]

  useEffect(() => {
    alive.current = true
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
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
      preload.disconnect(); viewport.disconnect()
      motion.removeEventListener('change', syncMotion)
      document.removeEventListener('visibilitychange', syncPage)
    }
  }, [])

  const choose = useCallback(async (index: number, manual = true) => {
    if (manual) setInteraction(value => value + 1)
    if (busy.current || index === active || worlds.length < 2) return
    busy.current = true
    setLoading(true); setError(false)
    try {
      const next = worlds[index]
      await Promise.all([next.pack, ...next.food.map(food => food.src)].map(prepareImage))
      if (!alive.current) return
      if (!manual && !canRotate.current) { busy.current = false; setLoading(false); return }
      setPrevious(active); setActive(index); setLoading(false)
      if (manual) setAnnouncement(next.name)
    } catch {
      if (alive.current) { setLoading(false); setError(true) }
      busy.current = false
    }
  }, [active, worlds])

  useEffect(() => {
    if (!running || loading || worlds.length < 2) return
    const timer = window.setTimeout(() => { void choose((active + 1) % worlds.length, false) }, WORLD_ROTATION_MS)
    return () => window.clearTimeout(timer)
  }, [running, loading, active, choose, worlds.length, interaction])

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
      const complete = () => { if (previous !== null) { busy.current = false; setPrevious(null) } }
      if (reduced) { complete(); return }
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: complete })
      if (previous !== null) {
        const outgoing = `[data-world-slide="${worlds[previous].id}"]`
        timeline.to(select(`${outgoing} .pw-pack-reveal`), { opacity: 0, y: -12 * travel, scale: .97, duration: .28 }, 0)
          .to(select(`${outgoing} .pw-food-reveal`), { opacity: 0, y: -8 * travel, duration: .25, stagger: .03 }, 0)
          .to(select(`.pw-info${outgoing}`), { opacity: 0, y: -6 * travel, duration: .2 }, 0)
          .fromTo(root.current, { '--pw-accent': worlds[previous].accent, '--pw-secondary': worlds[previous].secondary, '--pw-hue': worlds[previous].hue }, { '--pw-accent': world.accent, '--pw-secondary': world.secondary, '--pw-hue': world.hue, duration: .7 }, 0)
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
    if (!near || reduced) return
    const drift = window.matchMedia('(max-width: 767px)').matches ? .7 : 1
    const context = gsap.context(() => {
      idle.current = [gsap.to(root.current!.querySelectorAll(`[data-world-slide="${world.id}"] .pw-pack-float`), { y: -7 * drift, duration: 4.2, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })]
      root.current!.querySelectorAll(`[data-world-slide="${world.id}"] .pw-food:not(.pw-food-crumbs) .pw-food-float`).forEach((item, index) => {
        idle.current.push(gsap.to(item, { y: (index % 2 ? 5 : -6) * drift, x: (index % 2 ? -3 : 3) * drift, rotation: (index % 2 ? -1.4 : 1.2) * drift, duration: 4.4 + index * .7, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true }))
      })
    }, root)
    return () => { context.revert(); idle.current = [] }
  }, [active, near, reduced, world.id])

  useEffect(() => {
    idle.current.forEach(tween => { if (running) tween.play(); else tween.pause() })
  }, [running, active, near, reduced])

  return <section ref={root} id="product-worlds" className="gg-section world-showcase" dir={language === 'ar' ? 'rtl' : 'ltr'}
    aria-labelledby="worlds-title" aria-roledescription={c.carousel}
    style={{ '--pw-accent': world.accent, '--pw-secondary': world.secondary, '--pw-hue': world.hue } as CSSProperties}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true) }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    {near && <img className="pw-background" src={worldCoreAssets.background} width={1916} height={821} alt="" decoding="async" />}
    <div className="pw-ambient" aria-hidden="true">
      <span className="pw-environment-lines" />
      <span className="pw-environment-signals" />
      <span className="pw-environment-haze" />
      <span className="pw-environment-floor" />
    </div>
    <div className="pw-layout">
      <header className="pw-heading">
        <p className="pw-eyebrow">{c.eyebrow}</p>
        <p className="pw-mobile-index pw-index" dir="ltr"><strong>{String(active + 1).padStart(2, '0')}</strong><span>/ {String(worlds.length).padStart(2, '0')}</span></p>
        <h2 id="worlds-title">{c.heading.map(line => <span key={line}>{line}</span>)}</h2>
        <span className="pw-heading-rule" aria-hidden="true" />
      </header>
      <div className="pw-stage" aria-hidden="true" dir="ltr">
        <div className="pw-hologram">
          {near && <><img src={worldCoreAssets.hologram} width={1672} height={941} alt="" decoding="async" /><img className="pw-hologram-energy" src={worldCoreAssets.hologram} width={1672} height={941} alt="" decoding="async" /></>}
          <span className="pw-platform-glow" />
        </div>
        {slides.map(index => <div className="pw-visual" data-world-slide={worlds[index].id} key={worlds[index].id}>
          <div className="pw-pack-position"><div className="pw-pack-reveal"><div className="pw-pack-float">{near && <img src={worlds[index].pack} width={941} height={1672} alt="" decoding="async" />}</div></div></div>
          {worlds[index].food.map(food => <div className={`pw-food pw-food-${food.slot}`} key={food.src}><div className="pw-food-reveal"><div className="pw-food-float">{near && (worlds[index].id === 'x-stix' && food.slot === 'main' ? <picture style={{ display: 'contents' }}>
            <source media="(max-width: 767px)" srcSet="/product-world/x-stix/sticks-scatter.png" width={1254} height={1254} />
            <img src={food.src} width={food.width} height={food.height} alt="" decoding="async" />
          </picture> : <img src={food.src} width={food.width} height={food.height} alt="" decoding="async" />)}</div></div></div>)}
        </div>)}
      </div>
      <div className="pw-details" aria-live="off">
        <div className="pw-info-stack">
          {slides.map(index => <div className="pw-info" data-world-slide={worlds[index].id} key={worlds[index].id} inert={index !== active} aria-hidden={index !== active ? true : undefined}>
            <p className="pw-index" dir="ltr"><strong>{String(index + 1).padStart(2, '0')}</strong><span>/ {String(worlds.length).padStart(2, '0')}</span></p>
            <h3 dir="ltr">{worlds[index].name}</h3>
            <p className="pw-description">{worlds[index].description[language]}</p>
            <Link className="pw-explore" to={worlds[index].href}>{c.explore} <b dir="ltr">{worlds[index].name}</b><span aria-hidden="true">↗</span></Link>
          </div>)}
        </div>
        <div className="pw-controls">
          <div className="pw-arrows" dir="ltr">
            <button type="button" aria-label={c.previous} aria-disabled={loading || previous !== null || worlds.length < 2} onClick={() => { void choose((active - 1 + worlds.length) % worlds.length) }}>←</button>
            <button type="button" aria-label={c.next} aria-disabled={loading || previous !== null || worlds.length < 2} onClick={() => { void choose((active + 1) % worlds.length) }}>→</button>
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
      {worlds.map((item, index) => <button className="pw-selector" type="button" key={item.id} aria-pressed={active === index} aria-label={`${String(index + 1).padStart(2, '0')} / ${item.name}`} aria-disabled={loading || previous !== null} onClick={() => { void choose(index) }} style={{ '--selector-accent': item.accent } as CSSProperties}>
        <span className="pw-selector-number" aria-hidden="true">0{index + 1}</span>
        <span className="pw-selector-copy"><strong dir="ltr">{item.name}</strong><span className="pw-selected-label" aria-hidden="true">{active === index ? c.selected : '—'}</span></span>
        <img src={item.pack} alt="" width={941} height={1672} loading="lazy" decoding="async" />
      </button>)}
    </div>
    <span className="pw-sr-only" role="status">{announcement}</span>
  </section>
}