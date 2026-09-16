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
    // Finite entrance and light movement; mobile and reduced motion stay static.
    media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .from('.gg-hero-portal', { opacity: 0, duration: .55 })
        .from('.gg-hero-logo', { opacity: 0, duration: .4 }, .15)
        .from('.gg-hero-family', { opacity: 0, y: 12, duration: .6, stagger: .08 }, .3)
        .from('.headline-line', { opacity: 0, y: 20, duration: .65, stagger: .1 }, .45)
        .from('.hero-actions', { opacity: 0, y: 10, duration: .5 }, .8)
      gsap.fromTo('.gg-hero-light', { x: -25, opacity: .2 }, { x: 25, opacity: .65, duration: 4, ease: 'sine.inOut' })
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
      return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', reset) }
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
      <div className="gg-hero-portal">
        <div className="gg-hero-logo" aria-hidden="true"><BrandMark /></div>
        <div className="gg-hero-families">{homeFamilies.map(family => <div className="gg-hero-family" key={family.id}><FamilyAsset family={family} priority /></div>)}</div>
        <span className="gg-portal-caption">{c.preview}</span>
      </div>
    </div>
    <div className="hero-footer"><span>{t.bottom}</span><span className="footer-rule" /><span>{t.origin}</span></div>
  </section>
}
