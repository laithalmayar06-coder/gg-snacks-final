import { usePublicMotion } from '../hooks/usePublicMotion'
import { useEffect, type ReactNode } from 'react'
import Navigation from './Navigation'
import { SiteFooter } from './ContactFooter'
import { useLanguage } from '../i18n/LanguageContext'
import { pageCopy } from '../data/publicContent'
import '../styles/design-system.css'
import '../styles/homepage.css'
import '../styles/phase2.css'
import '../styles/public-pages.css'

import '../styles/phase5.css'

export default function PublicPageLayout({ title, children }: { title: string; children: ReactNode }) {
  const { language, t } = useLanguage()
  const motionRoot = usePublicMotion(title + language)
  useEffect(() => {
    document.title = `${title} | ${t.brandName}`
    return () => { document.title = t.title }
  }, [title, t.brandName, t.title])
  return <div ref={motionRoot} className="site-shell home-redesign phase-five public-page">
    <a className="skip-link" href="#main-content">{t.skip}</a><Navigation />
    <main id="main-content" tabIndex={-1}>
      <header className="public-page-hero"><p className="gg-kicker">{pageCopy[language].overview}</p><h1>{title}</h1></header>
      <div className="public-page-body">{children}</div>
    </main><SiteFooter />
  </div>
}
