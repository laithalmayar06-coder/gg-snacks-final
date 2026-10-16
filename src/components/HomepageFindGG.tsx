import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageFindGG, homepageFindGGAssets as art } from '../data/homepageFindGG'
import '../styles/homepage-find-gg.css'

function GeographicAccent({ tone, position }: { tone: 'blue' | 'purple'; position: string }) {
  const pin = tone === 'blue' ? art.bluePin : art.purplePin
  const ripple = tone === 'blue' ? art.blueRipple : art.purpleRipple
  // Visual accents only: no location coordinates, store IDs, handlers or links.
  return <span className={`home-find-pin home-find-pin--${position}`} aria-hidden="true">
    <img className="home-find-ripple" {...ripple} alt="" loading="lazy" decoding="async" />
    <img className="home-find-pin-image" {...pin} alt="" loading="lazy" decoding="async" />
  </span>
}

export default function HomepageFindGG() {
  const { language } = useLanguage()
  const copy = homepageFindGG[language]
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element)
      let visible = false
      let entered = false
      const atmosphere = gsap.to(select('.home-find-light'), { opacity: .65, x: 6, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const ripples = gsap.to(select('.home-find-ripple'), { opacity: .35, scale: 1.08, duration: 3.8, stagger: .7, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const fog = gsap.to(select('.home-find-fog'), { x: 8, y: -3, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const sync = () => {
        const active = visible && !document.hidden
        if (!entered) { if (active) entrance.play(); else entrance.pause() }
        for (const tween of [atmosphere, ripples, fog]) { if (active && entered) tween.play(); else tween.pause() }
      }
      const entrance = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: () => { entered = true; sync() } })
        .from(select('.home-find-environment'), { opacity: 0, duration: 1.1 }, 0)
        .from(select('.home-find-kicker, .home-find-title > span'), { opacity: 0, y: 12, duration: .75, stagger: .1, clearProps: 'transform,opacity' }, .15)
        .from(select('.home-find-art'), { opacity: 0, scale: .96, y: 16, duration: 1.1, clearProps: 'transform,opacity' }, .2)
        .from(select('.home-find-support, .home-find-description'), { opacity: 0, y: 10, duration: .7, stagger: .08, clearProps: 'transform,opacity' }, .5)
        .from(select('.home-find-pin-image'), { opacity: 0, y: 7, duration: .65, stagger: .12, clearProps: 'transform,opacity' }, .65)
        .from(select('.home-find-fog'), { opacity: 0, duration: 1 }, .6)
        .from(select('.home-find-status'), { opacity: 0, y: 8, duration: .65, clearProps: 'transform,opacity' }, .9)
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: .08 })
      observer.observe(element)
      document.addEventListener('visibilitychange', sync)
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
    }, root)
    return () => media.revert()
  }, [language])

  return <section id="find-gg" className="home-find" ref={root} dir={language === 'ar' ? 'rtl' : 'ltr'} aria-labelledby="home-find-title">
    <div className="home-find-environment" aria-hidden="true">
      <img className="home-find-atmosphere" {...art.atmosphere} alt="" loading="lazy" decoding="async" />
      <div className="home-find-light" />
    </div>
    <div className="home-find-layout">
      <header className="home-find-copy">
        <p className="home-find-kicker">{copy.label}</p>
        <h2 className="home-find-title" id="home-find-title">{copy.headline.map(line => <span key={line}>{line}</span>)}</h2>
        <p className="home-find-support">{copy.supporting.map(line => <span key={line}>{line}</span>)}</p>
        <p className="home-find-description">{copy.description}</p>
      </header>
      <figure className="home-find-scene">
        <div className="home-find-art">
          <span className="home-find-floor" aria-hidden="true" />
          <img className="home-find-map" {...art.map} alt={copy.mapAlt} loading="lazy" decoding="async" />
          <GeographicAccent tone="blue" position="central" />
          <GeographicAccent tone="purple" position="east" />
          <GeographicAccent tone="blue" position="distant" />
          <img className="home-find-fog" {...art.fog} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        </div>
        <figcaption className="home-find-geography">{copy.geography}<span aria-hidden="true" /></figcaption>
      </figure>
      <div className="home-find-ending">
        <p className="home-find-status"><span aria-hidden="true" />{copy.soon}</p>
      </div>
    </div>
  </section>
}
