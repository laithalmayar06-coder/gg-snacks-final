import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import BrandMark from './BrandMark'
import { navigation } from '../data/navigation'
import { useLanguage } from '../i18n/LanguageContext'

export default function Navigation() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const toggle = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  useEffect(() => { setOpen(false) }, [language, pathname])
  useEffect(() => { if (open) header.current?.querySelector<HTMLAnchorElement>('#main-navigation a')?.focus() }, [open])
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus() } }
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) setOpen(false) }
    const media = matchMedia('(min-width: 1100px)')
    const resize = () => { if (media.matches) setOpen(false) }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', outside)
    media.addEventListener('change', resize)
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', outside); media.removeEventListener('change', resize) }
  }, [open])
  return <header className="site-header" ref={header} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
    <Link to="/" className="brand" aria-label={t.brandName} onClick={() => setOpen(false)}><BrandMark /></Link>
    <nav id="main-navigation" aria-label={t.menu} className={`navigation ${open ? 'is-open' : ''}`}>
      {navigation.map(link => <Link key={link.path} to={link.path} aria-current={pathname === link.path || (link.path === '/products' && pathname.startsWith('/products/')) ? 'page' : undefined} onClick={() => setOpen(false)}>{link.label[language]}</Link>)}
    </nav>
    <div className="flex items-center gap-5">
      <div className="language-switch" dir="ltr" aria-label={t.footerLanguage}>{(['en', 'ar'] as const).map(value => <button key={value} type="button" lang={value} aria-label={value === 'en' ? 'English' : 'العربية'} aria-pressed={language === value} onClick={() => setLanguage(value)}>{value.toUpperCase()}</button>)}</div>
      <button ref={toggle} type="button" className="menu-toggle" aria-label={open ? t.close : t.menu} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}><span /><span /></button>
    </div>
  </header>
}
