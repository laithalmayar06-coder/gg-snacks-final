import { useLayoutEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/product-pages.css'
import { secondaryNavigation } from '../data/publicContent'

export default function ProductPageLayout({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage()
  const { pathname } = useLocation()
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return <div className="product-pages"><a className="skip-link" href="#products-content">{t.skip}</a><header className="catalogue-nav"><Link to="/" className="catalogue-logo" aria-label={t.brandName}><span dir="ltr">GG / SNACKS</span></Link><nav aria-label={t.menu}><Link to="/">{t.home}</Link><Link to="/products" aria-current={pathname === '/products' ? 'page' : undefined}>{t.products}</Link><Link to="/feedback">{secondaryNavigation[0].label[language]}</Link></nav><div className="catalogue-language" role="group" aria-label={t.footerLanguage}>{(['en', 'ar'] as const).map(value => <button type="button" lang={value} key={value} aria-pressed={language === value} onClick={() => setLanguage(value)}>{value === 'en' ? 'English' : 'العربية'}</button>)}</div></header><main id="products-content" tabIndex={-1}>{children}</main></div>
}
