import { usePublicMotion } from '../hooks/usePublicMotion'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import ProductWorlds from '../components/ProductWorlds'
import GGUniverse from '../components/GGUniverse'
import WhyGG from '../components/WhyGG'
import { FeaturedProducts, ArenaTeaser, TournamentsTeaser, FindGGTeaser } from '../components/HomepageSections'
import '../styles/design-system.css'
import '../styles/homepage.css'
import '../styles/phase2.css'
import ContactFooter, { SiteFooter } from '../components/ContactFooter'
import { useLanguage } from '../i18n/LanguageContext'

import '../styles/phase5.css'

export default function Home() {
  const { t, language } = useLanguage()
  const motionRoot = usePublicMotion(language)
  return <div ref={motionRoot} className="site-shell home-redesign phase-five">
    <a className="skip-link" href="#main-content">{t.skip}</a>
    <Navigation />
    <main id="main-content" tabIndex={-1}>
      <Hero /><ProductWorlds /><FeaturedProducts /><GGUniverse /><WhyGG />
      <ArenaTeaser /><TournamentsTeaser /><FindGGTeaser /><ContactFooter />
    </main><SiteFooter />
  </div>
}
