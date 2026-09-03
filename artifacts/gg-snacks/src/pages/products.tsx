import { ArrowUpRight, Box } from 'lucide-react';
import { Link } from 'wouter';
import { products } from '@/data/products';
import { PageIntro, PageMeta, PlaceholderVisual, SectionLabel } from '@/components/page-primitives';
import { SiteFooter } from '@/components/site-shell';

export default function ProductsPage() {
  return (
    <main className="page-reveal">
      <PageMeta title="Product worlds" description="Explore the GG Snacks product family foundation." />
      <PageIntro eyebrow="01 / Product worlds" title={<>Choose your<br /><span className="text-primary">loadout.</span></>} detail="The product family architecture is ready. Final images, descriptions, and verified flavors will slot into these worlds as they arrive." />
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mb-8 flex items-end justify-between"><SectionLabel index="02">Family index</SectionLabel><span className="font-mono-brand text-[10px] uppercase tracking-[.15em] text-white/35">{products.length} families mapped</span></div>
        <div className="grid gap-4 lg:grid-cols-2">
          {products.map((product, index) => (
            <article key={product.id} className="group grid overflow-hidden border border-white/10 bg-[#0d1013] sm:grid-cols-[.82fr_1fr]">
              <PlaceholderVisual label="Neutral product image placeholder" accent={product.accentColor} tall />
              <div className="flex flex-col p-6 sm:p-8">
                <div className="flex items-center justify-between font-mono-brand text-[10px] uppercase tracking-[.15em] text-white/35"><span>Family 0{index + 1}</span><Box size={16} style={{ color: product.accentColor }} aria-hidden="true" /></div>
                <h2 className="mt-16 font-display text-5xl font-bold uppercase leading-none">{product.name}</h2>
                <p className="mt-3 text-[11px] uppercase tracking-[.1em] text-primary">{product.category}</p>
                <p className="mt-6 text-sm leading-6 text-muted-foreground">{product.description}</p>
                <div className="mt-auto pt-10">
                  {product.flavors.map((flavor) => (
                    <Link href={flavor.ratingPageUrl} data-testid={`link-rate-product-${product.slug}`} key={flavor.id} className="inline-flex items-center gap-2 border-b border-white/20 pb-2 text-xs font-bold uppercase tracking-[.13em] text-foreground transition-colors hover:border-primary hover:text-primary">Rate / {flavor.name} <ArrowUpRight size={14} aria-hidden="true" /></Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}