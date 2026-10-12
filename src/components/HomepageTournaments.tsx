import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageContext'
import { useCms } from '../cms/CmsProvider'
import { localized, textValue } from '../cms/publicCatalog'
import { homepageTournaments } from '../data/homepageTournaments'
import '../styles/homepage-tournaments.css'

const art = '/arena-gateway/'

// Retain CMS month information without implying an approved day or countdown target.
function monthLabel(value: string, language: string, fallback: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback
  const date = new Date(value + 'T12:00:00Z')
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return fallback
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', {
    month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(date).toLocaleUpperCase(language)
}

function GatewayIcon({ kind }: { kind: 'calendar' | 'trophy' | 'arrow' }) {
  const paths = {
    calendar: 'M8 3v4M16 3v4M4 10h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 14h2M14 14h2M8 17h2',
    trophy: 'M8 3h8v6a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6v3H9v-3Z',
    arrow: 'M7 17 17 7M7 7h10v10',
  }
  return <svg className={'gateway-icon gateway-icon-' + kind} viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[kind]} /></svg>
}

function WalkwayLights() {
  return <>
    <svg className="gateway-walkway gateway-walkway-desktop" viewBox="0 0 1920 1080" fill="none" preserveAspectRatio="xMidYMid slice">
      {['M160 994 435 965', 'M515 956 760 929', 'M842 921 1050 898', 'M1110 892 1265 876', 'M1310 872 1390 862', 'M1860 1050 1764 977', 'M1728 950 1669 906', 'M1648 891 1614 865'].map(d => <path className="gateway-step" d={d} key={d} />)}
    </svg>
    <svg className="gateway-walkway gateway-walkway-mobile" viewBox="0 0 900 1600" fill="none" preserveAspectRatio="xMidYMid slice">
      {['M55 1151 182 1134', 'M238 1126 342 1111', 'M390 1106 460 1096', 'M811 1270 748 1195', 'M719 1168 688 1132', 'M669 1113 652 1095'].map(d => <path className="gateway-step" d={d} key={d} />)}
    </svg>
  </>
}

export default function HomepageTournaments() {
  const { language } = useLanguage()
  const managed = useCms().tournament_content?.[0]
  const copy = homepageTournaments[language]
  const root = useRef<HTMLElement>(null)
  const registration = monthLabel(textValue(managed, 'registration_date'), language, copy.registrationMonth)
  const event = monthLabel(textValue(managed, 'tournament_date'), language, copy.tournamentMonth)
  const description = localized(managed, 'description')?.[language] || copy.introduction

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(element)
      let visible = false
      let entered = false
      const fog = gsap.to(select('.gateway-fog'), {
        x: 14, y: -5, duration: 14, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true,
      })
      const light = gsap.to(select('.gateway-beams'), {
        opacity: .65, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true,
      })
      const sync = () => {
        const active = visible && !document.hidden
        if (!entered) { if (active) entrance.play(); else entrance.pause() }
        for (const tween of [fog, light]) { if (active && entered) tween.play(); else tween.pause() }
      }
      const entrance = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: () => { entered = true; sync() } })
        .from(select('.gateway-environment'), { opacity: 0, duration: 1.1 }, 0)
        .from(select('.gateway-kicker'), { opacity: 0, y: 10, duration: .55, clearProps: 'transform,opacity' }, .12)
        .from(select('.gateway-title > span'), { opacity: 0, y: 20, duration: .75, stagger: .12, clearProps: 'transform,opacity' }, .24)
        .from(select('.gateway-tagline, .gateway-introduction'), { opacity: 0, y: 12, duration: .6, stagger: .1, clearProps: 'transform,opacity' }, .5)
        .from(select('.gateway-step'), { opacity: 0, duration: .5, stagger: .085 }, .35)
        .from(select('.gateway-date'), { opacity: 0, y: 12, duration: .65, stagger: .12, clearProps: 'transform,opacity' }, .78)
        .from(select('.gateway-action'), { opacity: 0, y: 10, duration: .6, clearProps: 'transform,opacity' }, 1)
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: .12 })
      observer.observe(element)
      document.addEventListener('visibilitychange', sync)
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
    }, root)
    return () => media.revert()
  }, [language])

  return <section id="gg-tournaments" className="arena-gateway" ref={root} aria-labelledby="homepage-tournaments-title" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <div className="gateway-environment" aria-hidden="true">
      <div className="gateway-scene">
        {/* Supplied artwork includes baked-in GG marks: artist branding review is still required. */}
        <picture className="gateway-background">
          <source media="(max-width: 767px)" srcSet={art + 'arena-background-mobile.webp'} width={900} height={1600} />
          <img src={art + 'arena-background-desktop.webp'} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
        </picture>
        <img className="gateway-overlay gateway-floor" src={art + 'arena-floor-glow.svg'} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
        <img className="gateway-overlay gateway-beams" src={art + 'arena-light-beams.svg'} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
        <img className="gateway-overlay gateway-fog" src={art + 'arena-fog-overlay.svg'} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
        <WalkwayLights />
      </div>
    </div>
    <div className="gateway-content">
      <header className="gateway-copy">
        <p className="gateway-kicker"><span>{copy.label}</span><i aria-hidden="true" /></p>
        <h2 className="gateway-title" id="homepage-tournaments-title">{copy.headline.map(line => <span key={line}>{line}</span>)}</h2>
        <p className="gateway-tagline">{copy.tagline}</p>
        <p className="gateway-introduction">{description}</p>
      </header>
      <div className="gateway-mobile-stage" aria-hidden="true" />
      <dl className="gateway-dates">
        <div className="gateway-date"><dt><GatewayIcon kind="calendar" /><span>{copy.registration}</span></dt><dd>{registration}</dd></div>
        <div className="gateway-date"><dt><GatewayIcon kind="trophy" /><span>{copy.firstTournament}</span></dt><dd>{event}</dd></div>
      </dl>
      <div className="gateway-action">
        <Link className="gateway-cta" to="/tournaments">{copy.details}<GatewayIcon kind="arrow" /></Link>
        <p className="gateway-date-note">{copy.datePending}</p>
      </div>
    </div>
  </section>
}
