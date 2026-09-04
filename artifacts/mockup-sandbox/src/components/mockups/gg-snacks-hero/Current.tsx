import { ArrowDown, ArrowUpRight, Radio } from 'lucide-react';
import './_group.css';

export function Current() {
  return (
    <main className="page-reveal min-h-screen bg-[#050607] text-[#eef2f4]">
      <section className="relative flex min-h-[720px] items-end overflow-hidden border-b border-white/10 bg-[#08090b]">
        <div className="absolute right-[-10%] top-[14%] h-[420px] w-[420px] rounded-full border border-[#35e6dc]/10 sm:h-[620px] sm:w-[620px]" />
        <div className="absolute right-[3%] top-[26%] h-[280px] w-[280px] rounded-full border border-[#35e6dc]/15 sm:h-[420px] sm:w-[420px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#35e6dc]/[0.06] to-transparent" />
        <div className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-5 pb-12 pt-24 sm:px-8 sm:pb-20 lg:grid-cols-[1fr_0.44fr] lg:items-end lg:px-12">
          <div>
            <div className="mb-5 flex items-center gap-3 font-mono-brand text-[10px] font-bold uppercase tracking-[0.2em] text-[#35e6dc]">
              <span className="text-white/35">01</span>
              <span className="h-px w-8 bg-[#35e6dc]/60" />
              <span>Jeddah / Saudi Arabia</span>
            </div>
            <h1 className="max-w-5xl font-display text-[5.2rem] font-extrabold uppercase leading-[0.8] tracking-[-0.04em] text-[#eef2f4] sm:text-[8.8rem] lg:text-[11rem]">
              The next
              <br />
              <span className="text-[#35e6dc]">round</span>
              <br />
              starts here<span className="text-[#ffbf4b]">.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-[#a0a9b2] sm:text-lg">
              A premium snack world in progress. Built for the pause between
              plays, with room for a sharper identity.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                className="inline-flex items-center gap-3 bg-[#35e6dc] px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#071012] transition-transform hover:-translate-y-0.5"
              >
                Explore product worlds <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a
                href="#rate"
                className="inline-flex items-center gap-3 border border-white/20 px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#eef2f4] hover:border-[#35e6dc] hover:text-[#35e6dc]"
              >
                Rate your snack
              </a>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="border-l border-white/15 pl-6">
              <div className="mb-8 flex items-center gap-2 font-mono-brand text-[10px] uppercase tracking-[0.2em] text-[#35e6dc]">
                <Radio size={14} aria-hidden="true" /> Signal detected
              </div>
              <p className="text-sm leading-6 text-[#a0a9b2]">
                The visual campaign is loading. This foundation keeps every
                future layer modular, fast, and ready for motion.
              </p>
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-4 font-mono-brand text-[9px] uppercase tracking-[0.14em] text-white/35">
                <span>Scroll to sync</span>
                <ArrowDown size={14} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}