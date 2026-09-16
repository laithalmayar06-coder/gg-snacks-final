import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageContent } from '../data/homepage'
import { FamilyAsset, useHomeFamilies } from './HomepageSections'
import BrandMark from './BrandMark'

export default function Hero() {
  const homeFamilies = useHomeFamilies().slice(0, 4)
  const { language, t } = useLanguage()
  const c = homepageContent[language]
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    // Reveal quickly; ambient transforms run only while the hero is visible.
    media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .from('.gg-hero-portal', { opacity: 0, scale: .94, rotationY: -8, duration: .85 })
        .from('.gg-hero-logo', { opacity: 0, scale: .88, y: 12, duration: .65 }, .15)
        .from('.gg-hero-family', { opacity: 0, y: 38, rotationX: -12, duration: .75, stagger: .08 }, .3)
        .from('.headline-line', { opacity: 0, yPercent: 100, duration: .75, stagger: .08 }, .45)
        .from('.hero-actions', { opacity: 0, y: 10, duration: .5 }, .8)
      const ambient = gsap.timeline({ repeat: -1, yoyo: true, paused: true })
        .fromTo('.gg-hero-light', { x: -12, opacity: .35 }, { x: 12, opacity: .7, duration: 9, ease: 'sine.inOut' })
        .to('.gg-hero-orbit', { rotation: 18, duration: 9, ease: 'sine.inOut' }, 0)
      let visible = false
      const sync = () => { if (visible && !document.hidden) ambient.play(); else ambient.pause() }
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
      observer.observe(root.current!)
      document.addEventListener('visibilitychange', sync)
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
    }, root)
    media.add('(min-width: 1100px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const element = root.current!
      const portal = element.querySelector('.gg-hero-portal')!
      const x = gsap.quickTo(portal, 'x', { duration: .8, ease: 'power2.out' })
      const y = gsap.quickTo(portal, 'y', { duration: .8, ease: 'power2.out' })
      const move = (event: PointerEvent) => {
        const bounds = element.getBoundingClientRect()
        x(((event.clientX - bounds.left) / bounds.width - .5) * 12)
        y(((event.clientY - bounds.top) / bounds.height - .5) * 8)
      }
      const reset = () => { x(0); y(0) }
      element.addEventListener('pointermove', move)
      element.addEventListener('pointerleave', reset)
      return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', reset); x.tween.kill(); y.tween.kill() }
    }, root)
    return () => media.revert()
  }, [language])
  return <section id="home-hero" aria-label={t.home} ref={root} className="hero" tabIndex={-1}>
    <div className="gg-hero-light" aria-hidden="true" /><div className="gg-depth-lines" aria-hidden="true" />
    <div className="hero-layout">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" />{t.location}</p>
        <h1>{c.headline.map((line, index) => <span className="headline-mask" key={line}><span className={`headline-line ${index === 1 ? 'chrome-text' : ''}`}>{line}</span></span>)}</h1>
        <p className="hero-description">{t.description}</p>
        <div className="hero-actions"><Link to="/products" className="gg-button gg-button-primary">{c.explore}<span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="gg-hero-portal"><span className="gg-hero-orbit" aria-hidden="true" />
        <div className="gg-hero-logo" aria-hidden="true"><BrandMark /></div>
        <div className="gg-hero-families">{homeFamilies.map(family => <div className="gg-hero-family" key={family.id}><FamilyAsset family={family} priority /></div>)}</div>
        <span className="gg-portal-caption">{c.preview}</span>
      </div>
    </div>
    <div className="hero-footer"><span>{t.bottom}</span><span className="footer-rule" /><span>{t.origin}</span></div>
  </section>
}
