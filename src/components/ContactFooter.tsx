import { footerGroups } from '../data/footer'
import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { contactItems } from '../data/contact'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/contact-footer.css'
import { siteContent } from '../data/siteContent'
import { homepageContent } from '../data/homepage'
import { publicNavigation, secondaryNavigation } from '../data/publicContent'
import SiteContactValue, { SocialLinks } from './SiteContactValue'
import { useCms } from '../cms/CmsProvider'

gsap.registerPlugin(ScrollTrigger)

export default function ContactFooter() {
  const { t, language } = useLanguage()
  const copy = homepageContent[language]
  const managedContact = useCms().contact_settings?.[0]
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.contact-copy, .contact-preview', {
        opacity: 0, y: 12, duration: .75, stagger: .12, ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    }, root)
    return () => media.revert()
  }, [])

  return <>
    <section id="contact" ref={root} className="gg-contact" aria-labelledby="contact-title">
      <div className="contact-copy">
        <p className="contact-kicker">{t.contactLabel}</p>
        <h2 id="contact-title">{t.contactTitle}</h2>
        <p className="contact-intro">{t.contactIntro}</p>
        <p className="contact-description">{t.contactDescription}</p>
        <div className="gg-enquiry-types"><h3>{copy.contactCategories}</h3><ul>{copy.enquiries.map(item => <li key={item}>{item}</li>)}</ul></div>
        <dl className="contact-details">{contactItems.map((key, index) => <div key={key}>
          <dt><span aria-hidden="true" dir="ltr">{String(index + 1).padStart(2, '0')}</span>{t.contactItemLabels[key]}</dt>
          <dd><SiteContactValue kind={key} /></dd>
        </div>)}{(managedContact?.phone || siteContent.contact.phone) && <div><dt>{t.contactPhone}</dt><dd><SiteContactValue kind="phone" /></dd></div>}</dl>
      </div>
      <form className="contact-preview" aria-labelledby="contact-preview-title" aria-describedby="contact-preview-note" onSubmit={event => event.preventDefault()}>
        <div className="contact-preview-header"><h3 id="contact-preview-title">{t.contactFormTitle}</h3><span aria-hidden="true" dir="ltr">09 / GG</span></div>
        <p id="contact-preview-note" className="contact-preview-note">{t.contactFormNote}</p>
        <div className="contact-field"><label htmlFor="contact-name">{t.contactName}</label><input id="contact-name" type="text" readOnly placeholder={t.contactName} /></div>
        <div className="contact-field"><label htmlFor="contact-reply">{t.contactReply}</label><input id="contact-reply" type="text" readOnly placeholder={t.contactReply} /></div>
        <div className="contact-field"><label htmlFor="contact-subject">{t.contactSubject}</label><input id="contact-subject" type="text" readOnly placeholder={t.contactSubject} /></div>
        <div className="contact-field"><label htmlFor="contact-message">{t.contactMessage}</label><textarea id="contact-message" rows={3} readOnly placeholder={t.contactMessage} /></div>
        <button className="contact-send" type="button" disabled>{t.contactSend}<span aria-hidden="true">↗</span></button>
      </form>
    </section>

  </>
}

export function SiteFooter() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <footer className="gg-footer">
      <div className="footer-columns">
        <div className="footer-identity"><a href="#main-content" className="footer-wordmark" aria-label={t.brandName}><span dir="ltr">GG<span className="footer-wordmark-dot" aria-hidden="true"> / </span>SNACKS</span></a><p>{t.footerLocation}</p></div>
        <nav className="footer-shortcuts" aria-label={t.footerNavigation}>{footerGroups.map(group => <div className="footer-link-group" key={group.id}><h2>{group.title[language]}</h2><ul>{group.paths.map(path => { const link = [...publicNavigation, ...secondaryNavigation].find(item => item.path === path)!; return <li key={path}><Link to={path}>{link.label[language]}</Link></li> })}</ul></div>)}</nav>
        <div className="footer-preferences"><div className="footer-languages" role="group" aria-label={t.footerLanguage}>{(['en', 'ar'] as const).map(value => <button key={value} type="button" lang={value} aria-pressed={language === value} onClick={() => setLanguage(value)}>{value === 'en' ? 'English' : 'العربية'}</button>)}</div><div className="footer-social"><h2 className="footer-social-label">{siteContent.footer.socialLabel[language]}</h2><div className="footer-social-links"><SocialLinks fallback="" /></div></div></div>
      </div>
      <div className="footer-bottom"><p>{t.footerCopyright}</p><span aria-hidden="true" dir="ltr">{`GG / ${siteContent.company.city.en.toUpperCase()}`}</span></div>
    </footer>
  )
}
