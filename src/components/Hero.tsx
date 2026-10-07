import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { heroPreviewLogo } from '../data/heroPreview'
import { heroLayers, heroContent } from '../data/heroLayers'
import '../styles/hero-preview.css'

export default function Hero() {
  const { language, t } = useLanguage()
  const content = heroContent[language]
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const media = gsap.matchMedia()
    media.add({ motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 767px)' }, context => {
      if (!context.conditions?.motion) return
      const mobile = Boolean(context.conditions.mobile)
      const travel = mobile ? .55 : 1
      const drift = mobile ? .65 : 1
      const select = gsap.utils.selector(element)
      const header = element.closest('.site-shell')?.querySelector<HTMLElement>(':scope > .site-header')
      let visible = false
      let entered = false
      // Each nested layer has its own repeat cycle, independent of the entrance.
      const idle = [
        gsap.to(select('.prepared-controller .prepared-float'), { y: mobile ? -6 : -8, duration: 4.4, paused: true, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
        gsap.to(select('.prepared-chip-one .prepared-float'), { x: -5 * drift, y: -9 * drift, rotation: -2.2 * drift, duration: 5.3, paused: true, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
        gsap.to(select('.prepared-chip-two .prepared-float'), { x: 6 * drift, y: 7 * drift, rotation: 2.5 * drift, duration: 6.7, paused: true, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
        gsap.to(select('.prepared-popcorn-one .prepared-float'), { x: 4 * drift, y: -6 * drift, rotation: 1.8 * drift, duration: 4.9, paused: true, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
        gsap.to(select('.prepared-popcorn-two .prepared-float'), { x: -5 * drift, y: 8 * drift, rotation: -2 * drift, duration: 6.1, paused: true, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
      ]
      const sync = () => {
        idle.forEach(tween => { if (entered && visible && !document.hidden) tween.play(); else tween.pause() })
      }
      const entrance = gsap.timeline({
        defaults: { ease: 'power2.out', clearProps: 'transform,opacity' },
        onComplete: () => { entered = true; sync() },
      })
        .from(select('.prepared-environment'), { opacity: 0, scale: 1.025, duration: 1.4, ease: 'sine.out' }, 0)
      if (header) entrance.from(header, { y: -12 * travel, opacity: 0, duration: .55 }, .08)
      entrance
        .from(select('.prepared-signature'), { opacity: 0, scale: .97, duration: .55 }, .18)
        .from(select('.prepared-eyebrow'), { x: -12 * travel, opacity: 0, duration: .6 }, .3)
        .from(select('.prepared-headline > span'), { y: 22 * travel, opacity: 0, duration: .72, stagger: .18, ease: 'power3.out' }, .55)
        .from(select('.prepared-description'), { y: 14 * travel, opacity: 0, duration: .55 }, 1.65)
        .from(select('.prepared-action'), { y: 14 * travel, scale: .985, opacity: 0, duration: .7, ease: 'back.out(.5)', transformOrigin: 'center center' }, 2.18)
        .from(select('.prepared-controller .prepared-entrance'), { y: 44 * travel, scale: .94, opacity: 0, duration: 1.1, ease: 'power3.out', transformOrigin: '50% 90%' }, 1.05)
        .from(select('.prepared-chip-one .prepared-entrance'), { x: -12 * travel, y: 16 * travel, rotation: -3 * travel, scale: .96, opacity: 0, duration: .85 }, 1.6)
        .from(select('.prepared-popcorn-one .prepared-entrance'), { x: -6 * travel, y: 12 * travel, rotation: 2 * travel, scale: .97, opacity: 0, duration: .8 }, 1.72)
        .from(select('.prepared-chip-two .prepared-entrance'), { x: 10 * travel, y: 14 * travel, rotation: 3 * travel, scale: .96, opacity: 0, duration: .9 }, 1.84)
        .from(select('.prepared-popcorn-two .prepared-entrance'), { x: 7 * travel, y: 10 * travel, rotation: -2 * travel, scale: .97, opacity: 0, duration: .85 }, 1.96)
        .from(select('.prepared-crumbs'), { opacity: 0, duration: .6 }, 2.08)

      if (mobile) entrance.timeScale(1.25)

      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
      observer.observe(element)
      document.addEventListener('visibilitychange', sync)
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
    }, root)
    return () => media.revert()
  }, [language])

  return <section id="home-hero" ref={root} className="hero prepared-hero" aria-label={t.home} tabIndex={-1}>
    <div className="prepared-scene" aria-hidden="true" dir="ltr">
      <img className="prepared-environment" src="/hero/hero bg.png" alt="" width={1672} height={941} fetchPriority="high" decoding="async" />
      {heroLayers.map(layer => <div key={layer.id} className={`prepared-layer prepared-${layer.id}${layer.id.startsWith('chip') || layer.id.startsWith('popcorn') ? ' prepared-snack' : ''}`}>
        <div className="prepared-entrance"><div className="prepared-float">
          <img src={layer.src} alt="" width={layer.width} height={layer.height} decoding="async" draggable={false} />
        </div></div>
      </div>)}
    </div>
    <div className="prepared-content" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <img className="prepared-signature" src={heroPreviewLogo} alt={t.brandName} width={356} height={440} decoding="async" />
      <p className="prepared-eyebrow" dir="ltr">GG SNACKS</p>
      <h1 className="prepared-headline">{content.headline.map((line, index) =>
        <span key={line} className={index === 2 ? 'prepared-gradient' : undefined}>{line}</span>
      )}</h1>
      <p className="prepared-description">{content.copy.map(line => <span key={line}>{line}</span>)}</p>
      <div className="prepared-action hero-actions">
        <Link to="/products" className="prepared-cta">{content.cta}<span aria-hidden="true">→</span></Link>
      </div>
    </div>
  </section>
}
