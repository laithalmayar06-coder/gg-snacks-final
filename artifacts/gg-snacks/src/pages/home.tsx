import { ArrowDown, ArrowUpRight, Box, Radio, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { products } from '@/data/products';
import { CtaBand, PageMeta, PlaceholderSection, SectionLabel } from '@/components/page-primitives';
import { SiteFooter } from '@/components/site-shell';

export default function HomePage() {
  return (
    <main className="page-reveal">
      <PageMeta title="The next round starts here" description="GG Snacks is a premium Saudi snack brand foundation from Jeddah." />
      <section className="relative flex min-h-[calc(100dvh-76px)] items-end overflow-hidden border-b border-white/10 bg-[#08090b]">
        <div className="absolute right-[-10%] top-[14%] h-[420px] w-[420px] rounded-full border border-primary/10 sm:h-[620px] sm:w-[620px]" />
        <div className="absolute right-[3%] top-[26%] h-[280px] w-[280px] rounded-full border border-primary/15 sm:h-[420px] sm:w-[420px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/[0.06] to-transparent" />
        <div className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-5 pb-12 pt-24 sm:px-8 sm:pb-20 lg:grid-cols-[1fr_0.44fr] lg:items-end lg:px-12">
          <div>
            <SectionLabel index="01">Jeddah / Saudi Arabia</SectionLabel>
            <h1 className="max-w-5xl font-display text-[5.2rem] font-extrabold uppercase leading-[0.8] tracking-[-0.04em] text-foreground sm:text-[8.8rem] lg:text-[11rem]">
              The next<br /><span className="text-primary">round</span><br />starts here<span className="text-accent">.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">A premium snack world in progress. Built for the pause between plays, with room for a sharper identity.</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/products" data-testid="link-hero-products" className="inline-flex items-center gap-3 bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground transition-transform hover:-translate-y-0.5">
                Explore product worlds <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/rate/loots-corn/flavor-pending" data-testid="link-hero-rate" className="inline-flex items-center gap-3 border border-white/20 px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-foreground hover:border-primary hover:text-primary">
                Rate your snack
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="border-l border-white/15 pl-6">
              <div className="mb-8 flex items-center gap-2 font-mono-brand text-[10px] uppercase tracking-[0.2em] text-primary"><Radio size={14} aria-hidden="true" /> Signal detected</div>
              <p className="text-sm leading-6 text-muted-foreground">The visual campaign is loading. This foundation keeps every future layer modular, fast, and ready for motion.</p>
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-4 font-mono-brand text-[9px] uppercase tracking-[0.14em] text-white/35"><span>Scroll to sync</span><ArrowDown size={14} aria-hidden="true" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><SectionLabel index="02">Product worlds</SectionLabel><h2 className="font-display text-5xl font-bold uppercase leading-none sm:text-7xl">Five signals.<br /><span className="text-muted-foreground">One universe.</span></h2></div>
            <Link href="/products" data-testid="link-home-products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">View all families <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-5">
            {products.map((product, index) => (
              <Link href={product.flavors[0].ratingPageUrl} data-testid={`card-product-home-${product.id}`} key={product.id} className="group relative min-h-[270px] bg-[#0d1013] p-5 transition-colors hover:bg-[#151a1e]">
                <span className="font-mono-brand text-[10px] text-white/30">0{index + 1}</span>
                <div className="mt-10"><Box size={22} style={{ color: product.accentColor }} strokeWidth={1.5} aria-hidden="true" /><h3 className="mt-5 font-display text-3xl font-bold uppercase">{product.name}</h3><p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Details pending</p></div>
                <ArrowUpRight size={16} className="absolute bottom-5 right-5 text-white/30 transition-colors group-hover:text-primary" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PlaceholderSection index="03" title="Flavor experience" description="The flavor system is reserved for final product information. Add verified flavor names, sensory cues, and visual assets here without changing the surrounding architecture." accent="#ffbf4b" />
      <PlaceholderSection index="04" title="About GG Snacks" description="A clear point of view, a local story, and the people behind the signal belong here. Company facts are intentionally held as placeholders until supplied." action={{ label: 'Read the about shell', href: '/about', testId: 'link-home-about' }} />
      <section className="border-b border-white/10 bg-[#0b0d10] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-24 lg:px-12">
          <div><SectionLabel index="05">Quality system</SectionLabel><h2 className="font-display text-5xl font-bold uppercase leading-[.9] sm:text-7xl">Built to<br /><span className="text-primary">hold up.</span></h2></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[['01', 'Quality framework', ShieldCheck], ['02', 'Traceability layer', Zap]].map(([number, label, Icon]) => (
              <div key={number as string} className="border border-white/10 bg-[#101317] p-6"><Icon size={22} className="text-primary" strokeWidth={1.5} aria-hidden="true" /><p className="mt-16 font-display text-2xl uppercase">{label as string}</p><span className="mt-2 block font-mono-brand text-[9px] uppercase tracking-[.14em] text-white/35">Module placeholder</span></div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Tell us how the round went." label="Rate your snack" href="/rate/loots-corn/flavor-pending" testId="link-home-rate" />
      <CtaBand title="Put GG Snacks in the next arena." label="Distribution shell" href="/distribution" testId="link-home-distribution" accent="accent" />
      <SiteFooter />
    </main>
  );
}