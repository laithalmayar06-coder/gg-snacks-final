import { useId, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../i18n/LanguageContext'
import { siteContent } from '../data/siteContent'
import '../styles/why-gg.css'

gsap.registerPlugin(ScrollTrigger)

function ValueIllustration({ index }: { index: number }) {
  const id = useId()
  const metal = `url(#${id}-metal)`
  const energy = `url(#${id}-energy)`

  return <svg className="why-value-art" viewBox="0 0 240 140" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-metal`} x1="65" y1="20" x2="163" y2="117" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e2f4ff" /><stop offset=".24" stopColor="currentColor" stopOpacity=".85" />
        <stop offset=".52" stopColor="#273a56" /><stop offset="1" stopColor="#0c182c" />
      </linearGradient>
      <linearGradient id={`${id}-energy`} x1="92" y1="24" x2="147" y2="112" gradientUnits="userSpaceOnUse">
        <stop stopColor="#effbff" /><stop offset=".3" stopColor="currentColor" />
        <stop offset="1" stopColor="currentColor" stopOpacity=".08" />
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="123" rx="63" ry="7" fill="currentColor" opacity=".07" />
    <ellipse cx="120" cy="119" rx="70" ry="11" stroke="currentColor" strokeOpacity=".2" />
    <path d="M25 90h14l10-10M191 80l10 10h14M38 42h18M184 42h18" stroke="currentColor" strokeOpacity=".23" />
    <path d="M50 36v8m-4-4h8M191 64v6m-3-3h6" stroke="currentColor" strokeOpacity=".55" />

    {index === 0 && <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M124 13c6 27 35 32 35 63 0 23-17 40-40 40S81 100 81 78c0-18 10-31 23-42-2 17 2 23 8 28 12-14 15-30 12-51Z" fill="#07121e" stroke="currentColor" strokeOpacity=".2" strokeWidth="7" />
      <path d="M120 9c6 27 35 32 35 63 0 23-17 40-40 40S77 96 77 74c0-18 10-31 23-42-2 17 2 23 8 28 12-14 15-30 12-51Z" fill={energy} stroke="currentColor" strokeWidth="1.5" />
      <path d="M118 56c0 15-18 23-18 36 0 11 7 18 17 18s18-8 18-18c0-12-11-19-17-36Z" fill="#d9f9ff" fillOpacity=".78" />
      <path d="M87 69c-5 16 1 27 9 32M124 30c5 13 17 22 20 34" stroke="#edfcff" strokeOpacity=".6" />
      <path d="m65 62 3-10m104 38 4-8m-21-56 3-8M94 16l-3-5" stroke="currentColor" strokeWidth="2" />
    </g>}
    {index === 1 && <g strokeLinejoin="round">
      <path d="m124 15 43 17v32c0 28-22 45-43 55-21-10-43-27-43-55V32l43-17Z" fill="#081121" stroke="currentColor" strokeOpacity=".28" strokeWidth="4" />
      <path d="m119 10 43 17v32c0 28-22 45-43 55-21-10-43-27-43-55V27l43-17Z" fill={metal} stroke="currentColor" strokeWidth="1.5" />
      <path d="m119 22 32 13v24c0 21-14 36-32 46-18-10-32-25-32-46V35l32-13Z" fill="#0c192b" fillOpacity=".74" stroke="currentColor" strokeOpacity=".5" />
      <path d="m102 60 12 12 25-28" stroke={energy} strokeWidth="7" strokeLinecap="round" />
      <path d="m82 34 37-16 31 12" stroke="#edf6ff" strokeOpacity=".65" />
      <path d="m63 80-5-12m117 12 5-12m-30 30 8-5M80 98l-8-5" stroke="currentColor" strokeOpacity=".7" strokeWidth="2" />
    </g>}
    {index === 2 && <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M87 41h66c20 0 35 52 26 65-7 11-21-9-32-15h-54c-11 6-25 26-32 15-9-13 6-65 26-65Z" fill="#07111f" stroke="currentColor" strokeOpacity=".3" strokeWidth="5" />
      <path d="M84 34h66c20 0 35 52 26 65-7 11-21-9-32-15H90c-11 6-25 26-32 15-9-13 6-65 26-65Z" fill={metal} stroke="currentColor" strokeWidth="1.5" />
      <path d="M82 42c18-4 57-4 70 0M64 85l5-24m98 24-5-24" stroke="#dbeaff" strokeOpacity=".55" />
      <path d="M82 50v22m-11-11h22" stroke="#061120" strokeWidth="9" />
      <path d="M82 51v20m-10-10h20" stroke="currentColor" strokeWidth="2" />
      <circle cx="149" cy="52" r="4" fill={energy} /><circle cx="159" cy="62" r="4" fill={energy} />
      <circle cx="139" cy="62" r="4" fill={energy} /><circle cx="149" cy="72" r="4" fill={energy} />
      <circle cx="101" cy="76" r="9" fill="#091525" stroke="currentColor" strokeOpacity=".65" />
      <circle cx="130" cy="76" r="9" fill="#091525" stroke="currentColor" strokeOpacity=".65" />
      <path d="M113 50h7" stroke="#e9f8ff" strokeWidth="2" />
    </g>}
    {index === 3 && <g strokeLinejoin="round">
      <path d="M133 67v38c0 8 15 13 32 13s31-5 31-13V67" fill={metal} stroke="currentColor" strokeOpacity=".55" />
      <ellipse cx="165" cy="67" rx="31" ry="12" fill={metal} stroke="currentColor" />
      <path d="M134 80c13 11 48 11 62 0m-62 12c13 11 48 11 62 0m-62 12c13 11 48 11 62 0" stroke="currentColor" strokeOpacity=".5" />
      <path d="M51 83v22c0 7 15 12 32 12s32-5 32-12V83" fill={metal} stroke="currentColor" strokeOpacity=".6" />
      <ellipse cx="83" cy="83" rx="32" ry="12" fill={metal} stroke="currentColor" />
      <path d="M52 95c14 11 48 11 62 0" stroke="currentColor" strokeOpacity=".6" />
      <circle cx="121" cy="51" r="34" fill="#111a2e" stroke="currentColor" strokeOpacity=".35" strokeWidth="7" />
      <circle cx="118" cy="48" r="34" fill={metal} stroke="currentColor" strokeWidth="1.5" />
      <circle cx="118" cy="48" r="26" fill="#101a2c" stroke="currentColor" strokeOpacity=".7" />
      <path d="m118 29 14 19-14 19-14-19 14-19Zm-14 19h28" fill={energy} stroke="currentColor" />
      <path d="m170 22 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="currentColor" />
    </g>}
  </svg>
}

export default function WhyGG() {
  const { t, language } = useLanguage()
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.why-gg-feature', {
        opacity: 0, y: 10, duration: .7, stagger: .08, ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    }, root)
    return () => media.revert()
  }, [])

  return <section ref={root} id="why-gg" className="why-gg" aria-labelledby="why-gg-title">
    <header className="why-gg-heading">
      <h2 id="why-gg-title">{t.whyTitle}</h2><p>{t.whyLabel}</p>
    </header>
    {siteContent.whyGG.intro && <p className="why-core-intro">{siteContent.whyGG.intro[language]}</p>}
    <div className="why-core-network">
      <svg className="why-core-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 50H43L35 24H26M50 50H57L65 24H74" />
        <path d="M50 50H43L35 76H26M50 50H57L65 76H74" />
      </svg>
      <div className="why-brand-core">
        <span className="why-core-orbit" aria-hidden="true" />
        <span className="why-core-orbit why-core-orbit-inner" aria-hidden="true" />
        <span className="why-core-plasma" aria-hidden="true" />
        <img src="/preview-assets/web/LOGO%20.PNG.png" alt="GG" width="355" height="426" loading="lazy" decoding="async" />
        <span className="why-core-glass" aria-hidden="true" />
      </div>
      <ul className="why-gg-features">
        {t.whyFeatures.map((feature, index) => <li className="why-gg-feature" key={index}>
          <div className="why-value-visual"><ValueIllustration index={index} /></div>
          <h3>{feature.title}</h3><p>{feature.description}</p>
        </li>)}
      </ul>
    </div>
  </section>
}
