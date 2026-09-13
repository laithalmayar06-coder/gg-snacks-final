import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/gg-universe.css'
import { siteContent } from '../data/siteContent'

gsap.registerPlugin(ScrollTrigger)

export default function GGUniverse() {
  const { t, language } = useLanguage()
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
        defaults: { duration: .9, ease: 'power2.out' },
      })
        .from('.universe-heading-line', { opacity: 0, y: 16, stagger: .1 })
        .from('.universe-description', { opacity: 0, y: 10 }, '-=.65')
        .from('.universe-identity li', { opacity: 0, y: 8, stagger: .12 }, '-=.6')
        .from('.universe-media', { opacity: 0, y: 14 }, '-=.9')
    }, root)
    media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.universe-scan', { y: -25 }, {
        y: 25, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      })
    }, root)
    return () => media.revert()
  }, [])

  return <section id="gg-universe" ref={root} className="gg-universe" aria-labelledby="universe-title">
    <div className="universe-copy">
      <p className="universe-kicker">{t.universeLabel}</p>
      <h2 id="universe-title">{t.universeHeadline.map(line => <span className="universe-heading-line" key={line}>{line}</span>)}</h2>
      {siteContent.about.subheading && <p className="universe-description">{siteContent.about.subheading[language]}</p>}
      <p className="universe-description">{t.universeDescription}</p>
      <ul className="universe-identity">{t.universeIdentity.map((item, index) => <li key={item}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{item}</li>)}</ul>
    </div>
    <figure className="universe-media" aria-labelledby="universe-media-caption">
      <div className="universe-media-header"><span>{t.location}</span><span aria-hidden="true" dir="ltr">03 / GG</span></div>
      <div className="universe-media-space" aria-hidden="true">
        <div className="universe-scan" />
        <i className="universe-corner universe-corner--tl" /><i className="universe-corner universe-corner--tr" />
        <i className="universe-corner universe-corner--bl" /><i className="universe-corner universe-corner--br" />
        <span className="universe-media-cross">+</span>
        <span className="universe-media-wordmark" dir="ltr">GG</span>
      </div>
      <figcaption id="universe-media-caption"><span className="universe-media-status">{t.universeMediaStatus}</span><span>{t.universeMediaCaption}</span></figcaption>
    </figure>
  </section>
}
