import { useLocation } from 'react-router'
import PublicPageLayout from '../components/PublicPageLayout'
import { ArenaTeaser, TournamentsTeaser } from '../components/HomepageSections'
import FeedbackPicker from '../components/FeedbackPicker'
import StoreFinder from '../components/StoreFinder'
import EnquiryForm from '../components/EnquiryForm'
import SiteContactValue from '../components/SiteContactValue'
import GGUniverse from '../components/GGUniverse'
import { useLanguage } from '../i18n/LanguageContext'
import { pageTitles, pageCopy, aboutSections, legalContent, type PublicPath } from '../data/publicContent'
import { tournament } from '../data/tournament'
import { faqItems } from '../data/faq'
import { siteContent } from '../data/siteContent'

export default function PublicPage() {
  const { pathname } = useLocation()
  const { language, t } = useLanguage()
  const c = pageCopy[language]
  const path = pathname.replace(/\/$/, '') as PublicPath
  let content
  switch (path) {
    case '/arena': content = <ArenaTeaser showPageLink={false} />; break
    case '/tournaments': content = <><TournamentsTeaser showPageLink={false} /><section className="public-block" aria-labelledby="event-details"><h2 id="event-details">{c.eventDetails}</h2><dl className="public-details">{tournament.fields.map(field => <div key={field.id}><dt>{field.label[language]}</dt><dd>{field.value?.[language] ?? c.soon}</dd></div>)}</dl></section></>; break
    case '/find-gg': content = <StoreFinder />; break
    case '/feedback': content = <FeedbackPicker />; break
    case '/business': content = <EnquiryForm business />; break
    case '/contact': content = <div className="public-contact"><section><p className="gg-body">{c.contactIntro}</p><dl className="public-details">{(['email', 'whatsapp', 'location', 'social'] as const).map(key => <div key={key}><dt>{t.contactItemLabels[key]}</dt><dd><SiteContactValue kind={key} /></dd></div>)}</dl></section><EnquiryForm /></div>; break
    case '/about': content = <><GGUniverse /><section className="public-block"><h2>{c.about}</h2><p className="gg-body">{siteContent.company.longDescription?.[language] ?? siteContent.company.shortDescription[language]}</p><div className="public-about-grid">{aboutSections.map(section => <article className="gg-card" key={section.id}><h3>{section.title[language]}</h3><p className="gg-body">{section.body?.[language] ?? c.aboutPending}</p></article>)}</div></section></>; break
    case '/faq': content = <section className="public-faq"><p className="public-notice">{c.faqNote}</p>{faqItems.map(item => <details key={item.id}><summary><span>{item.category[language]}</span>{item.question[language]}</summary><p>{item.answer[language]}</p></details>)}</section>; break
    case '/privacy':
    case '/terms': {
      const legal = legalContent[path === '/privacy' ? 'privacy' : 'terms']
      content = <article className="public-legal gg-card"><p className="public-notice">{c.legalPending}</p><p>{c.updated}: {legal.lastUpdated ?? c.updatePending}</p><h2>{pageTitles[path][language]}</h2><p className="gg-body">{legal.body?.[language] ?? (path === '/privacy' ? c.privacyBody : c.termsBody)}</p></article>
      break
    }
  }
  return <PublicPageLayout title={pageTitles[path]?.[language] ?? t.brandName}>{content}</PublicPageLayout>
}
