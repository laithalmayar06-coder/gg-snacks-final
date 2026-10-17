import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { useCms } from '../cms/CmsProvider'
import { siteContent } from '../data/siteContent'
import { contactItems } from '../data/contact'
import { homepageContact, homepageContactAssets as art, homepageContactSubjects } from '../data/homepageContact'
import SiteContactValue from './SiteContactValue'
import EnquiryForm from './EnquiryForm'
import '../styles/homepage-contact.css'

function ContactIcon({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    general: 'M21 11a9 9 0 0 1-9 9H4l-3 2 2-6a9 9 0 1 1 18-5ZM7 11h.01M12 11h.01M17 11h.01',
    distribution: 'm12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10M7.5 4.5l9 5v5',
    partnership: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    sponsorship: 'M8 3h8v6a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4M16 5h4v3a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6v3',
    media: 'M3 9v6h4l12 5V4L7 9H3ZM7 15l2 6h3M22 8v8',
    email: 'M3 5h18v14H3V5Zm0 0 9 8 9-8',
    whatsapp: 'M21 11a9 9 0 0 1-9 9H4l-3 2 2-6a9 9 0 1 1 18-5ZM8 7c0 5 3 8 8 8l1-3-3-1-1 2-3-3 2-1-1-3-3 1Z',
    phone: 'm6 3 4 4-2 3 6 6 3-2 4 4-3 3C9 20 4 15 3 6l3-3Z',
    location: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    social: 'M15 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM3 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM15 19a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM9 11l6-4M9 13l6 4',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind] || paths.email} /></svg>
}

export default function HomepageContact() {
  const { t, language } = useLanguage()
  const copy = homepageContact[language]
  const managedContact = useCms().contact_settings?.[0]
  const [subject, setSubject] = useState('')
  const [locked, setLocked] = useState(false)
  const root = useRef<HTMLElement>(null)

  const selectCategory = (id: string) => {
    if (locked) return
    setSubject(id)
    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 767px)').matches) return
    const panel = root.current?.querySelector<HTMLElement>('.signal-panel')
    if (!panel) return
    const header = root.current?.closest('.site-shell')?.querySelector<HTMLElement>(':scope > .site-header')
    const style = header ? window.getComputedStyle(header) : null
    const offset = header && style && ['fixed', 'sticky'].includes(style.position)
      ? header.getBoundingClientRect().height + Math.max(0, Number.parseFloat(style.top) || 0) : 0
    const bounds = panel.getBoundingClientRect()
    // Leave an already readable form introduction in place. Never focus an input.
    if (bounds.top >= offset + 12 && bounds.top + Math.min(bounds.height, 240) <= window.innerHeight - 16) return
    window.scrollTo({
      top: Math.max(0, window.scrollY + bounds.top - offset - 12),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  // Mutually exclusive channel placements preserve desktop geometry and mobile tab order.
  const channels = <dl className="signal-details">
          {contactItems.map(kind => <div key={kind}><dt><ContactIcon kind={kind} />{t.contactItemLabels[kind]}</dt><dd><SiteContactValue kind={kind} /></dd></div>)}
          {(managedContact?.phone || siteContent.contact.phone) && <div><dt><ContactIcon kind="phone" />{t.contactPhone}</dt><dd><SiteContactValue kind="phone" /></dd></div>}
        </dl>

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element)
      let visible = false
      let entered = false
      const fog = gsap.to(select('.signal-fog'), { x: 9, y: -4, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const halo = gsap.to(select('.signal-halo'), { opacity: .65, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const envelopes = gsap.to(select('.signal-envelopes'), { y: -6, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const sync = () => {
        const active = visible && !document.hidden
        if (!entered) { if (active) entrance.play(); else entrance.pause() }
        for (const tween of [fog, halo, envelopes]) { if (active && entered) tween.play(); else tween.pause() }
      }
      // Animate a border/lighting layer, never hide or transform interactive form fields.
      const entrance = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: () => { entered = true; sync() } })
        .from(select('.signal-environment'), { opacity: 0, duration: 1.1 }, 0)
        .from(select('.signal-kicker, .signal-title > span'), { opacity: 0, y: 12, duration: .75, stagger: .1, clearProps: 'transform,opacity' }, .15)
        .from(select('.signal-description'), { opacity: 0, y: 10, duration: .7, clearProps: 'transform,opacity' }, .4)
        .from(select('.signal-categories button'), { opacity: 0, y: 8, duration: .65, stagger: .07, clearProps: 'transform,opacity' }, .5)
        .from(select('.signal-panel-light'), { opacity: 0, x: 12, duration: 1, clearProps: 'transform,opacity' }, .55)
        .from(select('.signal-halo, .signal-envelopes'), { opacity: 0, duration: 1, stagger: .12 }, .6)
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: .05 })
      observer.observe(element)
      document.addEventListener('visibilitychange', sync)
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
    }, root)
    return () => media.revert()
  }, [language])

  return <section id="contact" className="home-contact" ref={root} dir={language === 'ar' ? 'rtl' : 'ltr'} aria-labelledby="contact-title">
    <div className="signal-environment" aria-hidden="true">
      <img {...art.background} alt="" loading="lazy" decoding="async" />
      <div className="signal-ambient" />
    </div>
    <img className="signal-fog" {...art.fog} alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <div className="signal-layout">
      <div className="signal-copy">
        <p className="signal-kicker">{copy.label}</p>
        <h2 id="contact-title" className="signal-title">{copy.headline.map((line, i) => <span key={i}>{line}</span>)}</h2>
        <p className="signal-description">{copy.description}</p>
        <h3 className="signal-connect" id="signal-categories-title">{copy.connect}</h3>
        <div className="signal-categories" role="group" aria-labelledby="signal-categories-title">
          {homepageContactSubjects.map((id, index) => <button key={id} type="button" aria-pressed={subject === id} aria-controls="signal-enquiry-requestType" disabled={locked} onClick={() => selectCategory(id)}>
            <ContactIcon kind={id} /><span>{copy.categories[index]}</span><span className="signal-chevron" aria-hidden="true">›</span>
          </button>)}
        </div>
        <div className="signal-desktop-channels">{channels}</div>
      </div>
      <div className="signal-terminal">
        <img className="signal-halo" {...art.halo} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <img className="signal-platform" {...art.platform} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <img className="signal-envelopes" {...art.envelopes} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="signal-panel">
          <span className="signal-panel-light" aria-hidden="true" />
          <header className="signal-panel-heading"><ContactIcon kind="email" /><h3 id="signal-form-title">{copy.title}</h3></header>
          <EnquiryForm signalHub={{
            subject, onSubjectChange: setSubject, onLockedChange: setLocked,
            labels: copy, note: copy.note, send: copy.send,
            subjects: homepageContactSubjects.map((id, index) => ({ id, label: copy.categories[index] })),
          }} />
        </div>
      </div>
      <div className="signal-mobile-channels">{channels}</div>
    </div>
  </section>
}
