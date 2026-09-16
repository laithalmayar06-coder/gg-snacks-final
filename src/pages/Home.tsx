import { useEffect, useState } from 'react'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import ProductWorlds from '../components/ProductWorlds'
import GGUniverse from '../components/GGUniverse'
import WhyGG from '../components/WhyGG'
import { FeaturedProducts, ArenaTeaser, TournamentsTeaser, FindGGTeaser } from '../components/HomepageSections'
import '../styles/design-system.css'
import '../styles/homepage.css'
import ContactFooter, { SiteFooter } from '../components/ContactFooter'
import { useLanguage } from '../i18n/LanguageContext'

export default function Home() {
  const { t } = useLanguage()
  const [notice, setNotice] = useState(false)
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(false), 6000)
    return () => window.clearTimeout(timer)
  }, [notice])
  return <div className="site-shell home-redesign">
    <a className="skip-link" href="#main-content">{t.skip}</a>
    <Navigation onPending={() => setNotice(true)} />
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <ProductWorlds />
      <FeaturedProducts />
      <GGUniverse />
      <WhyGG />
      <ArenaTeaser />
      <TournamentsTeaser />
      <FindGGTeaser />
      <ContactFooter />
    </main>
    <SiteFooter />
    <div className={`notice ${notice ? 'notice-visible' : ''}`}>
      <p role="status">{notice ? t.soon : ''}</p>
      {notice && <button type="button" aria-label={t.dismiss} onClick={() => setNotice(false)}>×</button>}
    </div>
  </div>
}
