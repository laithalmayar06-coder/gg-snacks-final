import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight, Crosshair, ScanLine } from 'lucide-react';
import { gsap } from 'gsap';
import { Link } from 'wouter';

const heroStyles = `
  .hero-section {
    isolation: isolate;
    background:
      radial-gradient(circle at 72% 46%, rgba(54, 210, 220, .085), transparent 28%),
      radial-gradient(circle at 15% 90%, rgba(168, 178, 184, .05), transparent 30%),
      linear-gradient(120deg, rgba(255, 255, 255, .018), transparent 40%),
      linear-gradient(180deg, #080b0d 0%, #050607 100%);
  }
  .hero-section::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    opacity: .42;
    background-image:
      linear-gradient(rgba(183, 198, 204, .045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(183, 198, 204, .045) 1px, transparent 1px);
    background-size: 72px 72px;
    animation: hero-grid-drift 34s linear infinite;
    mask-image: linear-gradient(90deg, black, transparent 88%);
  }
  .hero-section::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: .035;
    background-image: repeating-linear-gradient(116deg, rgba(255,255,255,.8) 0 1px, transparent 1px 5px);
    mix-blend-mode: screen;
  }
  .hero-glow {
    background: radial-gradient(circle, rgba(55, 226, 232, .12), rgba(55, 226, 232, 0) 68%);
    filter: blur(10px);
    animation: hero-glow-breathe 6.8s ease-in-out infinite;
    will-change: transform, opacity;
  }
  .hero-ring {
    border: 1px solid rgba(174, 191, 198, .16);
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.018);
  }
  .hero-ring::after {
    content: "";
    position: absolute;
    inset: 10%;
    border: 1px solid rgba(59, 219, 226, .15);
    border-radius: inherit;
  }
  .hero-metal-line {
    background: linear-gradient(90deg, transparent, rgba(212, 221, 225, .74), rgba(53, 224, 228, .62), transparent);
  }
  .hero-product-outline {
    border: 1px solid rgba(203, 213, 217, .38);
    background: linear-gradient(145deg, rgba(255, 255, 255, .035), rgba(53, 224, 228, .025) 52%, rgba(0, 0, 0, .16));
    box-shadow: 0 0 0 1px rgba(53, 224, 228, .06), inset 0 0 42px rgba(100, 112, 119, .055);
    clip-path: polygon(16% 0, 84% 0, 100% 16%, 92% 88%, 78% 100%, 22% 100%, 8% 88%, 0 16%);
    filter: drop-shadow(0 0 18px rgba(53, 224, 228, .16));
  }
  .hero-scanline {
    animation: hero-scanline 3.8s ease-in-out infinite;
  }
  .hero-scroll-dot {
    animation: hero-scroll-dot 2.1s ease-in-out infinite;
  }
  .hero-title-metal {
    background: linear-gradient(180deg, #f1f5f5 4%, #b7c1c5 49%, #f7faf9 52%, #7c898f 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  @keyframes hero-grid-drift {
    from { background-position: 0 0, 0 0; }
    to { background-position: 72px 36px, 72px 36px; }
  }
  @keyframes hero-glow-breathe {
    0%, 100% { opacity: .68; transform: scale(.98); }
    50% { opacity: 1; transform: scale(1.04); }
  }
  @keyframes hero-scanline {
    0%, 100% { opacity: .2; transform: translateY(-88px); }
    50% { opacity: .64; transform: translateY(88px); }
  }
  @keyframes hero-scroll-dot {
    0%, 100% { opacity: .25; transform: translateY(-3px); }
    50% { opacity: 1; transform: translateY(8px); }
  }
  @media (max-width: 767px) {
    .hero-section::before { background-size: 48px 48px; mask-image: linear-gradient(180deg, black, transparent 82%); }
    .hero-ring { opacity: .72; }
    .hero-ring-three { display: none; }
    .hero-scanline, .hero-scroll-dot { animation-duration: 3.6s; }
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-section::before, .hero-glow, .hero-scanline, .hero-scroll-dot { animation: none; }
  }
`;

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = heroRef.current;
    if (!root) return;

    const select = gsap.utils.selector(root);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let cleanupPointerListeners: (() => void) | undefined;
    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(select('.hero-eyebrow, .hero-title-line, .hero-copy, .hero-actions, .hero-visual, .hero-scroll'), {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        });
        return;
      }

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .fromTo(select('.hero-eyebrow'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .65 })
        .fromTo(select('.hero-title-line'), { opacity: 0, y: 54 }, { opacity: 1, y: 0, duration: .95, stagger: .12 }, '-=.32')
        .fromTo(select('.hero-copy'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .65 }, '-=.45')
        .fromTo(select('.hero-actions'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .65 }, '-=.35')
        .fromTo(select('.hero-visual'), { opacity: 0, y: 24, scale: .975 }, { opacity: 1, y: 0, scale: 1, duration: 1.05 }, '-=.82')
        .fromTo(select('.hero-scroll'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .55 }, '-=.35');

      gsap.to(select('.hero-ring-one'), {
        rotation: 360,
        duration: 48,
        ease: 'none',
        repeat: -1,
      });
      gsap.to(select('.hero-ring-two'), {
        rotation: -360,
        duration: 66,
        ease: 'none',
        repeat: -1,
      });
      gsap.to(select('.hero-ring-three'), {
        rotation: 360,
        duration: 32,
        ease: 'none',
        repeat: -1,
      });
      gsap.to(select('.hero-visual-float'), {
        y: -9,
        rotation: .35,
        duration: 3.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      if (finePointer) {
        const onPointerMove = (event: PointerEvent) => {
          const x = (event.clientX / window.innerWidth - .5);
          const y = (event.clientY / window.innerHeight - .5);
          gsap.to(select('.hero-parallax-back'), { x: x * 18, y: y * 12, duration: .9, ease: 'power3.out', overwrite: true });
          gsap.to(select('.hero-parallax-front'), { x: x * -9, y: y * -7, duration: 1.1, ease: 'power3.out', overwrite: true });
        };
        const onPointerLeave = () => {
          gsap.to(select('.hero-parallax-back, .hero-parallax-front'), { x: 0, y: 0, duration: 1.2, ease: 'power3.out', overwrite: true });
        };
        root.addEventListener('pointermove', onPointerMove);
        root.addEventListener('pointerleave', onPointerLeave);
        cleanupPointerListeners = () => {
          root.removeEventListener('pointermove', onPointerMove);
          root.removeEventListener('pointerleave', onPointerLeave);
        };
      }
    }, root);

    return () => {
      cleanupPointerListeners?.();
      context.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-title"
      data-testid="hero-section"
      className="hero-section relative flex min-h-[calc(100dvh-76px)] overflow-hidden border-b border-white/10"
    >
      <style>{heroStyles}</style>

      <div className="hero-glow hero-parallax-back pointer-events-none absolute -right-28 top-[17%] z-0 h-[34rem] w-[34rem] rounded-full sm:-right-10 sm:h-[48rem] sm:w-[48rem]" aria-hidden="true" />
      <div className="hero-ring hero-ring-one hero-parallax-back pointer-events-none absolute -right-[16rem] top-[5%] z-0 h-[38rem] w-[38rem] sm:-right-[14rem] sm:h-[58rem] sm:w-[58rem]" aria-hidden="true" />
      <div className="hero-ring hero-ring-two hero-parallax-back pointer-events-none absolute right-[4%] top-[19%] z-0 h-[23rem] w-[23rem] sm:right-[11%] sm:top-[15%] sm:h-[38rem] sm:w-[38rem]" aria-hidden="true" />
      <div className="hero-ring hero-ring-three hero-parallax-back pointer-events-none absolute right-[17%] top-[29%] z-0 h-[13rem] w-[13rem] sm:right-[22%] sm:top-[27%] sm:h-[22rem] sm:w-[22rem]" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-x-0 top-[21%] z-0 hidden items-center gap-4 px-6 lg:flex" aria-hidden="true">
        <span className="hero-metal-line h-px w-16 opacity-50" />
        <span className="font-mono-brand text-[9px] uppercase tracking-[.28em] text-white/25">Arena / 01</span>
        <span className="h-px flex-1 bg-white/[.06]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-8 px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20 lg:grid-cols-[.92fr_1.08fr] lg:gap-0 lg:px-12 lg:py-10">
        <div className="relative z-20 max-w-3xl">
          <div className="hero-eyebrow flex items-center gap-3 font-mono-brand text-[10px] font-bold uppercase tracking-[.22em] text-primary" data-testid="text-hero-location">
            <span className="text-white/30">01</span>
            <span className="h-px w-8 bg-primary/70" />
            <span>Jeddah / Saudi Arabia</span>
          </div>

          <h1 id="hero-title" className="mt-7 font-display text-[4.75rem] font-extrabold uppercase leading-[.76] tracking-[-.045em] text-foreground sm:text-[7.5rem] lg:mt-9 lg:text-[10.7rem]">
            <span className="hero-title-line hero-title-metal block">Level up</span>
            <span className="hero-title-line block text-foreground">Your <span className="text-primary">snack.</span></span>
          </h1>

          <p className="hero-copy mt-8 max-w-md text-sm leading-6 text-muted-foreground sm:mt-10 sm:text-base sm:leading-7">
            A premium Saudi snack signal for the pause between plays. Built in Jeddah, tuned for the next round.
          </p>

          <div className="hero-actions mt-8 flex flex-wrap items-center gap-3 sm:mt-10" data-testid="hero-actions">
            <Link
              href="/products"
              data-testid="link-hero-products"
              className="group inline-flex min-h-12 items-center gap-3 bg-primary px-5 py-4 text-[11px] font-bold uppercase tracking-[.16em] text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 sm:px-6"
            >
              Explore products
              <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/rate/loots-corn/flavor-pending"
              data-testid="link-hero-rate"
              className="inline-flex min-h-12 items-center gap-3 border border-white/20 px-5 py-4 text-[11px] font-bold uppercase tracking-[.16em] text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 sm:px-6"
            >
              Rate your snack
            </Link>
          </div>
        </div>

        <div className="hero-visual relative mx-auto flex min-h-[20rem] w-full max-w-[39rem] items-center justify-center lg:min-h-[36rem]" data-testid="hero-product-visual">
          <div className="hero-parallax-front hero-visual-float relative aspect-[.82/1] w-[min(75vw,24rem)] sm:w-[min(58vw,29rem)]">
            <div className="hero-product-outline absolute inset-[10%]">
              <div className="hero-scanline absolute inset-x-[12%] top-1/2 h-px bg-primary/60" />
              <div className="absolute left-1/2 top-[13%] h-[74%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
              <div className="absolute left-[13%] top-1/2 h-px w-[74%] bg-white/10" />
              <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center border border-primary/40 bg-[#081013]/65 text-primary/80 sm:h-24 sm:w-24">
                <ScanLine size={27} strokeWidth={1} aria-hidden="true" />
              </div>
              <span className="absolute bottom-[8%] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono-brand text-[9px] uppercase tracking-[.24em] text-white/35">PNG / pending</span>
            </div>
            <div className="absolute inset-[4%] border border-dashed border-white/15 [clip-path:polygon(13%_0,87%_0,100%_13%,93%_88%,80%_100%,20%_100%,7%_88%,0_13%)]" />
            <div className="absolute -left-1 top-[19%] h-10 w-10 border-l border-t border-primary/70" />
            <div className="absolute -right-1 bottom-[19%] h-10 w-10 border-b border-r border-primary/70" />
            <div className="absolute -right-6 top-[15%] font-mono-brand text-[9px] uppercase tracking-[.2em] text-white/30 [writing-mode:vertical-rl]">Asset / 002</div>
          </div>

          <div className="pointer-events-none absolute left-[2%] top-[18%] hidden items-center gap-2 font-mono-brand text-[9px] uppercase tracking-[.16em] text-white/30 sm:flex">
            <Crosshair size={13} className="text-primary/70" aria-hidden="true" />
            <span>Signal locked</span>
          </div>
          <div className="pointer-events-none absolute right-[7%] top-[8%] hidden flex-col items-end gap-1 font-mono-brand text-[8px] uppercase tracking-[.18em] text-white/25 sm:flex">
            <span className="text-primary/60">Grid 21 / Sector 39</span>
            <span>Stage / Ready</span>
          </div>
          <div className="pointer-events-none absolute bottom-[11%] right-[3%] hidden items-center gap-2 font-mono-brand text-[9px] uppercase tracking-[.16em] text-white/25 sm:flex">
            <span>Replace with final asset</span>
            <span className="h-px w-8 bg-white/25" />
          </div>
        </div>
      </div>

      <div className="hero-scroll absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/35 sm:bottom-8" data-testid="hero-scroll-indicator">
        <span className="font-mono-brand text-[9px] uppercase tracking-[.25em]">Scroll to sync</span>
        <span className="relative flex h-8 w-px overflow-hidden bg-white/15">
          <span className="hero-scroll-dot absolute left-0 top-0 h-3 w-px bg-primary" />
        </span>
        <ArrowDown size={13} strokeWidth={1.4} aria-hidden="true" />
      </div>
    </section>
  );
}