import { usePublicMotion } from '../hooks/usePublicMotion'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import ProductWorlds from '../components/ProductWorlds'
import HomepageStory from '../components/HomepageStory'
import WhyGG from '../components/WhyGG'
import HomepageArena from '../components/HomepageArena'
import HomepageTournaments from '../components/HomepageTournaments'
import { FeaturedProducts, FindGGTeaser } from '../components/HomepageSections'
import '../styles/design-system.css'
import '../styles/homepage.css'
import '../styles/phase2.css'
import ContactFooter, { SiteFooter } from '../components/ContactFooter'
import { useLanguage } from '../i18n/LanguageContext'

import '../styles/phase5.css'

const SHOW_FEATURED_PRODUCTS = false
const SHOW_WHY_GG = false

export default function Home() {
  const { t, language } = useLanguage()
  const motionRoot = usePublicMotion(language)
  return <div ref={motionRoot} className="site-shell home-redesign phase-five">
    <a className="skip-link" href="#main-content">{t.skip}</a>
    <Navigation />
    <main id="main-content" tabIndex={-1}>
      <Hero /><ProductWorlds /><HomepageTournaments />
      {SHOW_FEATURED_PRODUCTS && <FeaturedProducts />}
      <HomepageStory />
      {SHOW_WHY_GG && <WhyGG />}
      <HomepageArena /><FindGGTeaser /><ContactFooter />
    </main><SiteFooter />
  </div>
}
