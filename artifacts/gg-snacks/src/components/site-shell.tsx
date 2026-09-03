import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpRight, Globe2, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Quality', href: '/quality' },
  { label: 'Distribution', href: '/distribution' },
  { label: 'Rate Your Snack', href: '/rate/loots-corn/flavor-pending' },
  { label: 'Contact', href: '/contact' },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'AR'>('EN');

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090b]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" data-testid="link-logo" className="group flex items-center gap-3" aria-label="GG Snacks home">
            <span className="grid h-10 w-10 place-items-center border border-primary/70 bg-primary text-lg font-black tracking-tighter text-primary-foreground transition-transform group-hover:-rotate-3">
              GG
            </span>
            <span className="hidden font-display text-2xl font-extrabold uppercase tracking-[0.08em] text-foreground sm:inline">
              Snacks<span className="text-primary">.</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                className={`relative px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  location === item.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={location === item.href ? 'page' : undefined}
              >
                {item.label}
                {location === item.href && <span className="absolute inset-x-3 -bottom-[22px] h-px bg-primary" />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="button-language-switcher"
              onClick={() => setLanguage((current) => current === 'EN' ? 'AR' : 'EN')}
              className="hidden items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground md:flex"
              aria-label="Language switcher placeholder"
              title="Arabic and English support planned"
            >
              <Globe2 size={14} aria-hidden="true" />
              {language} <span className="text-white/30">/</span> {language === 'EN' ? 'AR' : 'EN'}
            </button>
            <button
              type="button"
              data-testid="button-mobile-menu"
              className="grid h-10 w-10 place-items-center border border-white/10 text-foreground transition-colors hover:border-primary hover:text-primary xl:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="border-t border-white/10 bg-[#0b0d10] px-5 py-4 xl:hidden"
          >
            <div className="mx-auto grid max-w-[1440px] gap-1">
              {navigation.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`link-mobile-nav-${index}`}
                  className={`flex items-center justify-between border-b border-white/[0.07] py-3 text-sm font-bold uppercase tracking-[0.1em] ${
                    location === item.href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              ))}
              <button
                type="button"
                data-testid="button-mobile-language-switcher"
                onClick={() => setLanguage((current) => current === 'EN' ? 'AR' : 'EN')}
                className="flex items-center gap-2 py-3 text-left text-sm font-bold uppercase tracking-[0.1em] text-muted-foreground"
                title="Arabic and English support planned"
              >
                <Globe2 size={15} aria-hidden="true" /> {language} / {language === 'EN' ? 'AR' : 'EN'} — language placeholder
              </button>
            </div>
          </nav>
        )}
      </header>
      {children}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#07080a]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-12 lg:py-16">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-primary text-sm font-black text-primary-foreground">GG</span>
            <span className="font-display text-xl font-extrabold uppercase tracking-wider">Snacks.</span>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            A Saudi snack brand foundation. Product stories, final imagery, and company details are in progress.
          </p>
        </div>
        <div>
          <p className="mb-4 font-mono-brand text-[10px] uppercase tracking-[0.2em] text-primary">Navigate</p>
          <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground">
            <Link href="/products" data-testid="link-footer-products" className="hover:text-foreground">Products</Link>
            <Link href="/about" data-testid="link-footer-about" className="hover:text-foreground">About</Link>
            <Link href="/quality" data-testid="link-footer-quality" className="hover:text-foreground">Quality</Link>
            <Link href="/contact" data-testid="link-footer-contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 font-mono-brand text-[10px] uppercase tracking-[0.2em] text-primary">Signal</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Jeddah, Saudi Arabia
            <br />
            Contact details placeholder — coming soon
          </p>
        </div>
      </div>
      <div className="metal-line opacity-40" />
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span data-testid="text-footer-status">Foundation build / details pending</span>
        <span>GG Snacks / Jeddah</span>
      </div>
    </footer>
  );
}