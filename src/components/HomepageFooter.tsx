import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { publicNavigation, secondaryNavigation } from '../data/publicContent'
import { homepageFooter, homepageFooterGroups, homepageFooterLegal, homepageFooterLogo } from '../data/homepageFooter'
import { homepageContactAssets } from '../data/homepageContact'
import SiteContactValue, { SocialLinks } from './SiteContactValue'
import '../styles/homepage-footer.css'

export default function HomepageFooter() {
  const { language, setLanguage, t } = useLanguage()
  const copy = homepageFooter[language]
  const root = useRef<HTMLElement>(null)
  const links = [...publicNavigation, ...secondaryNavigation]
  const backToTop = () => {
    const target = document.getElementById('main-content')
    if (!target) return
    target.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element)
      let visible = false
      let entered = false
      const fog = gsap.to(select('.closing-fog'), { x: 8, y: -3, duration: 22, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const glow = gsap.to(select('.closing-energy'), { opacity: .65, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const sync = () => {
        const active = visible && !document.hidden
        if (!entered) { if (active) entrance.play(); else entrance.pause() }
        for (const tween of [fog, glow]) { if (active && entered) tween.play(); else tween.pause() }
      }
      // Links remain visible and interactive throughout the decorative entrance.
      const entrance = gsap.timeline({ paused: true, onComplete: () => { entered = true; sync() } })
        .from(select('.closing-brand-logo'), { opacity: 0, y: 8, duration: .9, ease: 'power2.out', clearProps: 'transform,opacity' }, 0)
        .from(select('.closing-tagline'), { opacity: 0, y: 6, duration: .8, ease: 'power2.out', clearProps: 'transform,opacity' }, .15)
        .from(select('.closing-horizon'), { scaleX: .8, opacity: 0, duration: 1.2, ease: 'power2.out', clearProps: 'transform,opacity' }, .1)
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: .05 })
      observer.observe(element)
      document.addEventListener('visibilitychange', sync)
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
    }, root)
    return () => media.revert()
  }, [])

  return <footer className="home-footer" ref={root} dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <div className="closing-scene" aria-hidden="true">
      <img className="closing-background" {...homepageContactAssets.background} alt="" loading="lazy" decoding="async" />
      <div className="closing-energy" />
      <div className="closing-path" />
      <img className="closing-fog" {...homepageContactAssets.fog} alt="" loading="lazy" decoding="async" />
      <div className="closing-horizon" />
    </div>
    <div className="closing-inner">
      <div className="closing-composition">
        <div className="closing-brand">
          <div className="closing-brand-stage">
            <img className="closing-brand-halo" {...homepageContactAssets.halo} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <img className="closing-brand-platform" {...homepageContactAssets.platform} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <Link to="/" aria-label={t.brandName}><img className="closing-brand-logo" src={homepageFooterLogo} width="1268" height="1241" alt="" loading="lazy" decoding="async" /></Link>
          </div>
          <p className="closing-tagline">{copy.tagline}</p>
          <p className="closing-origin">{t.footerLocation}</p>
          <div className="closing-community">
            <h2>{copy.follow}</h2>
            <div className="closing-social"><SocialLinks fallback={t.footerSocialPending} /></div>
          </div>
        </div>
        <nav className="closing-navigation" aria-label={t.footerNavigation}>
          {homepageFooterGroups.map(group => <div className="closing-group" key={group.key}>
            <h2>{copy[group.key]}</h2>
            <ul>{group.paths.map(path => <li key={path}><Link to={path}>{links.find(link => link.path === path)!.label[language]}</Link></li>)}</ul>
          </div>)}
        </nav>
        <div className="closing-contact closing-group">
          <h2>{copy.contact}</h2>
          <dl>{(['email', 'whatsapp', 'location'] as const).map(kind => <div key={kind}>
            <dt>{t.contactItemLabels[kind]}</dt><dd><SiteContactValue kind={kind} /></dd>
          </div>)}</dl>
        </div>
      </div>
      <div className="closing-bottom">
        <p>{t.footerCopyright}</p>
        <nav aria-label={copy.information}>{homepageFooterLegal.map(path => <Link key={path} to={path}>{links.find(link => link.path === path)!.label[language]}</Link>)}</nav>
        <div className="closing-languages" role="group" aria-label={t.footerLanguage}>
          {(['en', 'ar'] as const).map(value => <button key={value} type="button" lang={value} aria-pressed={value === language} onClick={() => setLanguage(value)}>{value === 'en' ? 'English' : 'العربية'}</button>)}
        </div>
        <button className="closing-top" type="button" onClick={backToTop}>{copy.top}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 20V4m-6 6 6-6 6 6" /></svg></button>
      </div>
    </div>
  </footer>
}
