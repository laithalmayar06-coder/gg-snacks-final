import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, Check, MessageSquare, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { findFlavor, findProduct } from '@/data/products';
import { BackLink, PageMeta, PlaceholderVisual, SectionLabel } from '@/components/page-primitives';
import { SiteFooter } from '@/components/site-shell';

const ratings = [
  { value: 1, emoji: '😖', label: 'Not for me' },
  { value: 2, emoji: '😕', label: 'Could be better' },
  { value: 3, emoji: '😐', label: 'It was okay' },
  { value: 4, emoji: '🙂', label: 'Good round' },
  { value: 5, emoji: '🤩', label: 'Top tier' },
];

export default function RatingPage() {
  const params = useParams<{ productSlug: string; flavorSlug: string }>();
  const product = findProduct(params.productSlug);
  const flavor = findFlavor(product, params.flavorSlug);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!product || !flavor) {
    return (
      <main className="page-reveal">
        <PageMeta title="Rating link not found" description="This GG Snacks rating link is not available." />
        <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12"><SectionLabel index="404">Rating channel</SectionLabel><h1 className="font-display text-7xl font-bold uppercase">Signal<br /><span className="text-primary">not found.</span></h1><p className="mt-6 max-w-md text-muted-foreground">This permanent rating URL does not match a product and flavor in the current structured data.</p><Link href="/products" data-testid="link-rating-not-found-products" className="mt-8 inline-flex items-center gap-2 border border-primary px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-primary">Browse product families <ArrowUpRight size={15} aria-hidden="true" /></Link></section><SiteFooter /></main>
    );
  }

  function submitRating(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedRating) setSubmitted(true);
  }

  return (
    <main className="page-reveal">
      <PageMeta title={`Rate ${product.name}`} description={`Rate your ${product.name} snack experience.`} />
      <section className="border-b border-white/10 bg-[#0b0d10]">
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
          <BackLink>Back to product worlds</BackLink>
          <div className="mb-8 flex flex-wrap items-center gap-3 font-mono-brand text-[10px] uppercase tracking-[.18em] text-primary">
            <span data-testid="text-rating-product">{product.name}</span><span className="text-white/30">/</span><span data-testid="text-rating-flavor">{flavor.name}</span>
          </div>
          <h1 className="font-display text-6xl font-extrabold uppercase leading-[.85] tracking-[-.02em] sm:text-8xl">How was<br />your <span className="text-primary">snack?</span></h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">One quick signal helps shape the next round. This foundation stores nothing yet.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[.75fr_1.25fr] lg:gap-24 lg:px-12">
        <div><PlaceholderVisual label="Neutral rating product image placeholder" accent={flavor.accentColor} tall /><div className="mt-5 flex items-center justify-between font-mono-brand text-[10px] uppercase tracking-[.14em] text-white/35"><span>{product.name}</span><span data-testid="text-rating-url">{flavor.ratingPageUrl}</span></div></div>
        <div>
          {submitted ? (
            <div className="border border-primary/50 bg-primary/[0.05] p-8 sm:p-12" data-testid="status-rating-submitted"><Check className="text-primary" size={28} aria-hidden="true" /><h2 className="mt-8 font-display text-5xl font-bold uppercase">Signal<br /><span className="text-primary">received.</span></h2><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Thanks for sending a rating placeholder. Submission wiring can connect here when the backend is ready.</p><button type="button" data-testid="button-rate-again" onClick={() => { setSubmitted(false); setSelectedRating(null); setComment(''); }} className="mt-8 inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-[.14em] hover:border-primary hover:text-primary"><RotateCcw size={14} aria-hidden="true" /> Rate again</button></div>
          ) : (
            <form onSubmit={submitRating} className="border border-white/10 bg-[#0d1013] p-6 sm:p-10">
              <fieldset>
                <legend className="mb-5 flex items-center gap-2 font-mono-brand text-[10px] uppercase tracking-[.16em] text-white/50"><MessageSquare size={14} aria-hidden="true" /> Choose your rating</legend>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {ratings.map((rating) => (
                    <button type="button" key={rating.value} data-testid={`button-rating-${rating.value}`} onClick={() => setSelectedRating(rating.value)} aria-pressed={selectedRating === rating.value} aria-label={rating.label} className={`group flex min-h-[88px] flex-col items-center justify-center border text-3xl transition-colors sm:min-h-[110px] ${selectedRating === rating.value ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/60'}`}>
                      <span aria-hidden="true">{rating.emoji}</span><span className={`mt-2 font-mono-brand text-[8px] uppercase tracking-[.08em] ${selectedRating === rating.value ? 'text-primary' : 'text-white/35'}`}>{rating.value}/5</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <label htmlFor="rating-comment" className="mt-10 block font-mono-brand text-[10px] uppercase tracking-[.16em] text-white/50">Optional note</label>
              <textarea id="rating-comment" value={comment} onChange={(event) => setComment(event.target.value)} data-testid="input-rating-comment" rows={5} placeholder="Leave a note for the next round..." className="mt-3 w-full resize-y border border-white/10 bg-[#08090b] p-4 text-sm text-foreground outline-none placeholder:text-white/25 focus:border-primary focus:ring-1 focus:ring-primary" />
              <button type="submit" disabled={!selectedRating} data-testid="button-submit-rating" className="mt-6 inline-flex w-full items-center justify-center gap-3 bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[.15em] text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-30 hover:enabled:opacity-85">Submit rating <ArrowUpRight size={16} aria-hidden="true" /></button>
              <p className="mt-4 text-center font-mono-brand text-[9px] uppercase tracking-[.12em] text-white/25">Rating endpoint placeholder / no data stored</p>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}