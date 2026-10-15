import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageArena, digitalArenaArtwork } from '../data/homepageArena'
import '../styles/homepage-arena.css'

/**
 * Lighting is registered to the supplied artwork's native coordinates.
 * The empty QR slot is intentionally inert. A future VERIFIED QR can cover the
 * illustrated code inside this group; it must not be connected to rating routes.
 * Both coordinate systems must be updated together when introducing a real QR.
 */
function ChamberLighting({ mobile = false }: { mobile?: boolean }) {
  const id = mobile ? 'portrait' : 'landscape'
  const center = mobile ? 640 : 1180
  const ceiling = mobile ? 785 : 150
  const scanner = mobile ? { x: 525, y: 932, w: 230, h: 277 } : { x: 1050, y: 285, w: 260, h: 295 }
  return <svg className={`digital-arena-lights digital-arena-lights--${id}`} viewBox={mobile ? '0 0 941 1672' : '0 0 1672 941'} preserveAspectRatio={mobile ? 'xMidYMin meet' : 'xMidYMid slice'} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`arena-beam-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#00cfff" stopOpacity="0" />
        <stop offset=".5" stopColor="#b5f7ff" stopOpacity=".17" />
        <stop offset="1" stopColor="#00cfff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`arena-ceiling-${id}`}>
        <stop stopColor="#b8f7ff" stopOpacity=".24" />
        <stop offset="1" stopColor="#00cfff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse className="digital-arena-ceiling" cx={center} cy={ceiling} rx={mobile ? 175 : 225} ry={mobile ? 45 : 40} fill={`url(#arena-ceiling-${id})`} />
    <path className="digital-arena-beam" d={`M${center - 34} ${ceiling}h68l65 ${mobile ? 480 : 500}H${center - 99}Z`} fill={`url(#arena-beam-${id})`} />
    <rect className="digital-arena-scanner" x={scanner.x} y={scanner.y} width={scanner.w} height={scanner.h} rx="8" fill="none" stroke="#75e8ff" strokeOpacity=".26" strokeWidth="1.5" />
    {/* Empty replacement/cover slot: no image, URL, interaction, or scanning code. */}
    <g data-qr-replacement-slot={id} transform={mobile ? 'translate(566 980)' : 'translate(1100 344)'} data-cover-width={mobile ? 142 : 165} data-cover-height={mobile ? 155 : 180} />
  </svg>
}

function ArenaEnvironment() {
  return <div className="digital-arena-environment" aria-hidden="true">
    <picture className="digital-arena-background">
      <source media="(max-width: 767px)" srcSet={digitalArenaArtwork.mobile} width={941} height={1672} />
      <img src={digitalArenaArtwork.desktop} alt="" width={1672} height={941} loading="lazy" decoding="async" />
    </picture>
    <ChamberLighting />
    <ChamberLighting mobile />
    <div className="digital-arena-fog" />
  </div>
}

export default function HomepageArena() {
  const { language } = useLanguage()
  const copy = homepageArena[language]
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element)
      let visible = false
      let entered = false
      const fog = gsap.to(select('.digital-arena-fog'), { x: 9, y: -3, duration: 19, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const energy = gsap.to(select('.digital-arena-beam'), { opacity: .65, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      const sync = () => {
        const active = visible && !document.hidden
        if (!entered) { if (active) entrance.play(); else entrance.pause() }
        for (const tween of [fog, energy]) { if (active && entered) tween.play(); else tween.pause() }
      }
      const entrance = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: () => { entered = true; sync() } })
        .from(select('.digital-arena-environment'), { opacity: 0, duration: 1.2 }, 0)
        .from(select('.digital-arena-ceiling'), { opacity: 0, duration: .7 }, .2)
        .from(select('.digital-arena-beam'), { opacity: 0, scaleY: .85, transformOrigin: '50% 0%', duration: .8 }, .4)
        .from(select('.digital-arena-scanner'), { opacity: 0, duration: .65 }, .65)
        .from(select('.digital-arena-kicker'), { opacity: 0, y: 8, duration: .6, clearProps: 'transform,opacity' }, .7)
        .from(select('.digital-arena-heading > span'), { opacity: 0, y: 14, duration: .7, stagger: .1, clearProps: 'transform,opacity' }, .8)
        .from(select('.digital-arena-activation, .digital-arena-teaser'), { opacity: 0, y: 10, duration: .65, stagger: .08, clearProps: 'transform,opacity' }, 1.05)
        .from(select('.digital-arena-ending'), { opacity: 0, y: 8, duration: .65, clearProps: 'transform,opacity' }, 1.4)
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: .08 })
      observer.observe(element)
      document.addEventListener('visibilitychange', sync)
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
    }, root)
    return () => media.revert()
  }, [language])

  return <section id="gg-arena" className="digital-arena" ref={root} aria-labelledby="homepage-arena-title" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <ArenaEnvironment />
    <div className="digital-arena-layout">
      <header className="digital-arena-copy">
        <p className="digital-arena-kicker">{copy.label}</p>
        <h2 className="digital-arena-heading" id="homepage-arena-title">
          {copy.headline.map(line => <span key={line}>{line}</span>)}
        </h2>
        <p className="digital-arena-activation">{copy.activation}</p>
        <p className="digital-arena-teaser">{copy.teaser}</p>
      </header>
      <div className="digital-arena-mobile-window" aria-hidden="true" />
      <div className="digital-arena-ending">
        <p className="digital-arena-status"><span aria-hidden="true" />{copy.soon}</p>
        <Link className="digital-arena-cta" to="/arena">
          <span>{copy.details}</span>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10" /></svg>
        </Link>
      </div>
    </div>
  </section>
}
