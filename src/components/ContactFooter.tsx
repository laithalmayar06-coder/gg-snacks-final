import BrandMark from './BrandMark'
import { footerGroups } from '../data/footer'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/contact-footer.css'
import { siteContent } from '../data/siteContent'
import { publicNavigation, secondaryNavigation } from '../data/publicContent'
import { SocialLinks } from './SiteContactValue'
import HomepageContact from './HomepageContact'

export default function ContactFooter() { return <HomepageContact /> }

export function SiteFooter() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <footer className="gg-footer">
      <div className="footer-columns">
        <div className="footer-identity"><a href="#main-content" className="footer-wordmark" aria-label={t.brandName}><BrandMark /></a><p>{t.footerLocation}</p></div>
        <nav className="footer-shortcuts" aria-label={t.footerNavigation}>{footerGroups.map(group => <div className="footer-link-group" key={group.id}><h2>{group.title[language]}</h2><ul>{group.paths.map(path => { const link = [...publicNavigation, ...secondaryNavigation].find(item => item.path === path)!; return <li key={path}><Link to={path}>{link.label[language]}</Link></li> })}</ul></div>)}</nav>
        <div className="footer-preferences"><div className="footer-languages" role="group" aria-label={t.footerLanguage}>{(['en', 'ar'] as const).map(value => <button key={value} type="button" lang={value} aria-pressed={language === value} onClick={() => setLanguage(value)}>{value === 'en' ? 'English' : 'العربية'}</button>)}</div><div className="footer-social"><h2 className="footer-social-label">{siteContent.footer.socialLabel[language]}</h2><div className="footer-social-links"><SocialLinks fallback="" /></div></div></div>
      </div>
      <div className="footer-bottom"><p>{t.footerCopyright}</p><span aria-hidden="true" dir="ltr">{`GG / ${siteContent.company.city.en.toUpperCase()}`}</span></div>
    </footer>
  )
}
