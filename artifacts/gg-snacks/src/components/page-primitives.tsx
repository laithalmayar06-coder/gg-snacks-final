import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight, Check, ChevronRight, CircleDashed, ScanLine } from 'lucide-react';
import { Link } from 'wouter';

export function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} — GG Snacks`;
    const metaDescription = document.querySelector('meta[name="description"]') ?? document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', description);
    document.head.appendChild(metaDescription);
    const ogTitle = document.querySelector('meta[property="og:title"]') ?? document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', `${title} — GG Snacks`);
    document.head.appendChild(ogTitle);
    const ogDescription = document.querySelector('meta[property="og:description"]') ?? document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', description);
    document.head.appendChild(ogDescription);
  }, [description, title]);
  return null;
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 font-mono-brand text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
      <span className="text-white/35">{index}</span>
      <span className="h-px w-8 bg-primary/60" />
      <span>{children}</span>
    </div>
  );
}

export function PlaceholderVisual({
  label = 'Product image placeholder',
  accent = '#35e6dc',
  tall = false,
}: {
  label?: string;
  accent?: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`surface-grid clip-corner relative flex overflow-hidden border border-white/10 bg-[#101317] ${tall ? 'min-h-[350px]' : 'min-h-[220px]'}`}
      style={{ '--placeholder-accent': accent } as CSSProperties}
      data-testid={`placeholder-visual-${label.toLowerCase().replaceAll(' ', '-')}`}
    >
      <div className="absolute inset-5 border border-dashed border-white/15" />
      <div className="absolute right-5 top-5 font-mono-brand text-[9px] uppercase tracking-[0.16em] text-white/30">IMG / 00{tall ? '2' : '1'}</div>
      <div className="relative m-auto flex flex-col items-center gap-4 px-6 text-center">
        <div className="grid h-14 w-14 place-items-center border border-[var(--placeholder-accent)]/60 text-[var(--placeholder-accent)]">
          <ScanLine size={22} strokeWidth={1.4} aria-hidden="true" />
        </div>
        <span className="max-w-[180px] font-mono-brand text-[10px] uppercase leading-5 tracking-[0.12em] text-white/45">{label}</span>
      </div>
      <div className="absolute bottom-5 left-5 flex items-center gap-2 font-mono-brand text-[9px] uppercase tracking-[0.12em] text-white/25">
        <CircleDashed size={11} aria-hidden="true" /> asset pending
      </div>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: ReactNode;
  detail: string;
}) {
  return (
    <section className="page-reveal border-b border-white/10 bg-[#0b0d10]">
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12">
        <SectionLabel index="00">{eyebrow}</SectionLabel>
        <h1 className="max-w-4xl font-display text-6xl font-extrabold uppercase leading-[0.88] tracking-[-0.025em] text-foreground sm:text-8xl lg:text-[9.5rem]">{title}</h1>
        <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{detail}</p>
      </div>
    </section>
  );
}

export function PlaceholderSection({
  index,
  title,
  description,
  accent = '#35e6dc',
  action,
}: {
  index: string;
  title: string;
  description: string;
  accent?: string;
  action?: { label: string; href: string; testId: string };
}) {
  return (
    <section className="border-b border-white/10 py-16 sm:py-24">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24 lg:px-12">
        <div>
          <SectionLabel index={index}>Placeholder module</SectionLabel>
          <h2 className="font-display text-5xl font-bold uppercase leading-[0.92] tracking-tight sm:text-7xl">{title}</h2>
        </div>
        <div className="border-l border-white/10 pl-6 sm:pl-10">
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
          <div className="mt-10 flex min-h-[120px] items-center border border-dashed border-white/15 bg-white/[0.015] px-5">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-white/35">
              <span className="h-2 w-2 rounded-full bg-[var(--module-accent)]" style={{ '--module-accent': accent } as CSSProperties} />
              Visual/content system placeholder
            </div>
          </div>
          {action && (
            <Link href={action.href} data-testid={action.testId} className="mt-7 inline-flex items-center gap-2 border border-primary/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
              {action.label} <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function CtaBand({
  title,
  label,
  href,
  testId,
  accent = 'primary',
}: {
  title: string;
  label: string;
  href: string;
  testId: string;
  accent?: 'primary' | 'accent';
}) {
  const accentClass = accent === 'accent' ? 'border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground' : 'border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground';
  return (
    <section className="border-b border-white/10 bg-[#0b0d10] py-16 sm:py-24">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:px-12">
        <div>
          <p className="mb-5 font-mono-brand text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Next module</p>
          <h2 className="max-w-2xl font-display text-5xl font-bold uppercase leading-[0.9] sm:text-7xl">{title}</h2>
        </div>
        <Link href={href} data-testid={testId} className={`inline-flex shrink-0 items-center gap-3 border px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${accentClass}`}>
          {label} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function StatusList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 space-y-4" data-testid="list-foundation-status">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
          <Check size={15} className="text-primary" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function BackLink({ href = '/products', children = 'Back to products' }: { href?: string; children?: ReactNode }) {
  return (
    <Link href={href} data-testid="link-back" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary">
      <ChevronRight size={14} className="rotate-180" aria-hidden="true" /> {children}
    </Link>
  );
}