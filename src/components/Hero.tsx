import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageContent } from '../data/homepage'
import { FamilyAsset, homeFamilies } from './HomepageSections'

export default function Hero() {
  const { language, t } = useLanguage()
  const c = homepageContent[language]
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    // One short entrance sequence; mobile and reduced-motion users see a static composition.
    media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .from('.gg-hero-portal', { opacity: 0, duration: .55 })
        .from('.gg-hero-logo', { opacity: 0, duration: .4 }, .15)
        .from('.gg-hero-family', { opacity: 0, y: 12, duration: .6, stagger: .08 }, .3)
        .from('.headline-line', { opacity: 0, y: 20, duration: .65, stagger: .1 }, .45)
        .from('.hero-actions', { opacity: 0, y: 10, duration: .5 }, .8)
    }, root)
    return () => media.revert()
  }, [language])
  return <section id="home-hero" aria-label={t.home} ref={root} className="hero" tabIndex={-1}>
    <div className="hero-layout"><div className="hero-copy"><p className="eyebrow"><span className="status-dot" />{t.location}</p>
      <h1>{c.headline.map((line, index) => <span className="headline-mask" key={line}><span className={`headline-line ${index === 1 ? 'chrome-text' : ''}`}>{line}</span></span>)}</h1>
      <p className="hero-description">{t.description}</p><div className="hero-actions"><Link to="/products" className="gg-button gg-button-primary">{c.explore}<span aria-hidden="true">↗</span></Link></div>
    </div><div className="gg-hero-portal"><div className="gg-hero-logo" aria-hidden="true"><span className="brand-symbol">GG<span>◆</span></span><span className="brand-sub">SNACKS</span></div><div className="gg-hero-families">{homeFamilies.map(family => <div className="gg-hero-family" key={family.id}><FamilyAsset family={family} /></div>)}</div><span className="gg-portal-caption">{c.preview}</span></div></div>
    <div className="hero-footer"><span>{t.bottom}</span><span className="footer-rule" /><span>{t.origin}</span></div>
  </section>
}
