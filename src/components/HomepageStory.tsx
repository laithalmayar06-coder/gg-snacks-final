import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageStory } from '../data/homepageStory'
import '../styles/homepage-story.css'

const art = '/our-story/'
const pillarIcons = [
  'M13 3c1 5 6 7 6 12a7 7 0 0 1-14 0c0-4 2-6 4-8v6c4-2 5-5 4-10Z',
  'm12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Zm-4 10 3 3 5-6',
  'M7 7h10c3 0 5 10 4 12s-4-2-6-3H9c-2 1-5 5-6 3S4 7 7 7Zm0 3v5m-2-2h4m7-2h.01m2 3h.01',
]

function StoryEnvironment() {
  return <div className="story-environment" aria-hidden="true">
    <div className="story-scene">
      {/* Supplied architectural signs are generated artwork, pending official branding review. */}
      <picture className="story-background">
        <source media="(max-width: 767px)" srcSet={art + 'our-story-background-mobile.webp'} width={768} height={1320} />
        <img src={art + 'our-story-background-desktop.webp'} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
      </picture>
      <img className="story-overlay story-ambient" src={art + 'our-story-ambient-glow.svg'} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
      <img className="story-overlay story-trails" src={art + 'our-story-light-trails.svg'} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
      <img className="story-overlay story-fog" src={art + 'our-story-fog-overlay.svg'} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
    </div>
  </div>
}

export default function HomepageStory() {
  const { language } = useLanguage()
  const copy = homepageStory[language]
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element)
      let visible = false
      let entered = false
      const fog = gsap.to(select('.story-fog'), { x: 10, y: -4, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const trails = gsap.to(select('.story-trails'), { opacity: .85, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const sync = () => {
        const active = visible && !document.hidden
        if (!entered) { if (active) entrance.play(); else entrance.pause() }
        for (const tween of [fog, trails]) { if (active && entered) tween.play(); else tween.pause() }
      }
      const entrance = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: () => { entered = true; sync() } })
        .from(select('.story-environment'), { opacity: 0, duration: 1.2 }, 0)
        .from(select('.story-kicker'), { opacity: 0, y: 8, duration: .6, clearProps: 'transform,opacity' }, .12)
        .from(select('.story-heading, .story-subtitle'), { opacity: 0, y: 14, duration: .8, stagger: .1, clearProps: 'transform,opacity' }, .22)
        .from(select('.story-description > p'), { opacity: 0, y: 10, duration: .7, stagger: .08, clearProps: 'transform,opacity' }, .48)
        .from(select('.story-pillars > li'), { opacity: 0, y: 10, duration: .65, stagger: .12, clearProps: 'transform,opacity' }, .72)
        .from(select('.story-cta'), { opacity: 0, y: 8, duration: .6, clearProps: 'transform,opacity' }, 1.12)
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: .1 })
      observer.observe(element)
      document.addEventListener('visibilitychange', sync)
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
    }, root)
    return () => media.revert()
  }, [language])

  return <section id="gg-universe" className="gg-story" ref={root} aria-labelledby="story-title" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <StoryEnvironment />
    <div className="story-layout">
      <div className="story-copy">
        <header className="story-heading-group">
          <p className="story-kicker">{copy.label}</p>
          <h2 className="story-heading" id="story-title">{copy.heading}</h2>
          <p className="story-subtitle">{copy.subtitle}</p>
        </header>
        <div className="story-mobile-window" aria-hidden="true" />
        <div className="story-description">
          {copy.description.split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <ul className="story-pillars">
          {copy.pillars.map((pillar, index) => <li key={pillar}>
            <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={pillarIcons[index]} /></svg>
            <span className="story-pillar-title">{pillar}</span>
            <span className="story-pillar-description">{copy.pillarDescriptions[index]}</span>
          </li>)}
        </ul>
        <Link to="/business" className="story-cta">
          <span>{copy.cta}</span>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10" /></svg>
        </Link>
      </div>
    </div>
  </section>
}
