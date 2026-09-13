import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import ProductStage from './ProductStage'

export default function Hero() {
  const { language, t } = useLanguage()
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 900px) and (pointer: fine)' }, context => {
      if (!context.conditions?.motion) return
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline.from('.headline-line', { yPercent: 105, opacity: 0, duration: 1.05, stagger: 0.13 })
        .from('.hero-description', { y: 15, opacity: 0, duration: 0.7 }, '-=0.55')
        .from('.hero-actions', { y: 18, opacity: 0, duration: 0.7 }, '-=0.4')
      if (!context.conditions.desktop) return
      gsap.to('.floating-stage', { y: -12, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to('.scanner-outer', { rotation: 360, duration: 85, repeat: -1, ease: 'none' })
      gsap.to('.scanner-inner', { rotation: -360, duration: 65, repeat: -1, ease: 'none' })
      gsap.to('.stage-glow', { opacity: 0.45, scale: 1.12, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to('.ambient-light', { x: 35, y: -25, duration: 12, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      const x = gsap.quickTo('.parallax-stage', 'x', { duration: 1.4, ease: 'power3.out' })
      const y = gsap.quickTo('.parallax-stage', 'y', { duration: 1.4, ease: 'power3.out' })
      const element = root.current!
      const move = (event: PointerEvent) => { const bounds = element.getBoundingClientRect(); x(((event.clientX - bounds.left) / bounds.width - 0.5) * 16); y(((event.clientY - bounds.top) / bounds.height - 0.5) * 12) }
      const reset = () => { x(0); y(0) }
      element.addEventListener('pointermove', move)
      element.addEventListener('pointerleave', reset)
      return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', reset) }
    }, root)
    return () => media.revert()
  }, [language])
  return <section id="home-hero" aria-label={t.home} ref={root} className="hero" tabIndex={-1}>
    <div className="ambient-light" aria-hidden="true" />
    <div className="hero-layout">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" />{t.location}</p>
        <h1>{t.headline.map((line, index) => <span className="headline-mask" key={line}><span className={`headline-line ${index === 1 ? 'chrome-text' : ''}`}>{line}</span></span>)}</h1>
        <p className="hero-description">{t.description}</p>
        <div className="hero-actions"><Link to="/products" className="cta cta-primary">{t.explore}<span aria-hidden="true">↗</span></Link><Link to="/#rate-your-snack" className="cta cta-secondary">{t.rateCta}<span aria-hidden="true">+</span></Link></div>
      </div>
      <ProductStage />
    </div>
    <div className="hero-footer"><span><span className="tiny-cross" aria-hidden="true">+</span>{t.bottom}</span><span className="footer-rule" /><span>{t.origin}</span><span className="footer-code" aria-hidden="true">GG—001</span></div>
  </section>
}
