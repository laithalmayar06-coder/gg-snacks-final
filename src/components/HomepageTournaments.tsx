import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { useCms } from '../cms/CmsProvider'
import { localized, textValue } from '../cms/publicCatalog'
import { cmsPublicCopy } from '../cms/copy'
import { homepageContent } from '../data/homepage'
import { homepageTournaments } from '../data/homepageTournaments'
import { heroPreviewLogo } from '../data/heroPreview'
import { tournament } from '../data/tournament'
import '../styles/homepage-tournaments.css'

const skyline = [
  [340, 62, 20], [370, 108, 18], [400, 81, 24], [437, 144, 17],
  [469, 97, 27], [511, 70, 17], [550, 114, 22], [595, 62, 16],
  [833, 93, 20], [871, 128, 18], [910, 76, 23], [950, 149, 17],
  [988, 99, 27], [1031, 75, 18], [1062, 111, 20],
]

function StadiumEnvironment() {
  return <div className="tourney-environment" aria-hidden="true">
    <svg className="tourney-stadium" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id="gg-tourney-floor" x1="720" y1="516" x2="720" y2="900" gradientUnits="userSpaceOnUse">
          <stop stopColor="#162243" /><stop offset=".4" stopColor="#070d20" /><stop offset="1" stopColor="#040711" />
        </linearGradient>
        <linearGradient id="gg-tourney-trim"><stop stopColor="#38ceff" /><stop offset=".47" stopColor="#b9d9ff" /><stop offset=".72" stopColor="#a670ff" /><stop offset="1" stopColor="#f376ff" /></linearGradient>
        <linearGradient id="gg-tourney-metal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#304767" /><stop offset=".09" stopColor="#0a1123" /><stop offset=".83" stopColor="#070b18" /><stop offset="1" stopColor="#465170" />
        </linearGradient>
        <linearGradient id="gg-tourney-beam" x1="0" y1="1" x2="0" y2="0">
          <stop stopColor="#b4b1ff" stopOpacity=".3" /><stop offset="1" stopColor="#83aaff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="gg-tourney-haze">
          <stop stopColor="#725cdf" stopOpacity=".45" /><stop offset="1" stopColor="#392d97" stopOpacity="0" />
        </radialGradient>
        <pattern id="gg-tourney-windows" width="9" height="11" patternUnits="userSpaceOnUse">
          <rect width="2" height="3" x="3" y="3" fill="#9ba9fd" opacity=".45" />
        </pattern>
        <pattern id="gg-tourney-crowd" width="17" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="5" r="1" fill="#8ca7ef" opacity=".42" /><circle cx="12" cy="11" r="1" fill="#b480ea" opacity=".27" />
        </pattern>
      </defs>
      <ellipse cx="720" cy="490" rx="660" ry="245" fill="url(#gg-tourney-haze)" />
      <g fill="url(#gg-tourney-beam)">
        <path d="m638 560-220-360 80-40 176 400Z" /><path d="m668 560-94-379 48-2 68 381Z" />
        <path d="m750 560 66-385 56 22-92 363Z" /><path d="m776 560 240-351 72 45-280 306Z" />
      </g>
      <g opacity=".56">
        {skyline.map(([x, height, width]) => <g key={x}>
          <path d={'M' + x + ' 506v-' + height + 'l' + width / 2 + '-13 ' + width / 2 + ' 13v' + height + 'Z'} fill="#0c1430" stroke="#7277c74d" />
          <rect x={x + 2} y={506 - height + 7} width={width - 4} height={height - 7} fill="url(#gg-tourney-windows)" />
          <path d={'M' + (x + width / 2) + ' ' + (493 - height) + 'v-14'} stroke="#948aea66" />
        </g>)}
      </g>
      <path d="M0 220 471 433 540 521 0 437Z" fill="#0b1328" stroke="#56669544" />
      <path d="m1440 220-471 213-69 88h540Z" fill="#0c1127" stroke="#79639b44" />
      <path d="m0 246 443 202 64 60L0 422Z" fill="url(#gg-tourney-crowd)" />
      <path d="m1440 246-443 202-64 60 507-86Z" fill="url(#gg-tourney-crowd)" />
      <g stroke="#8c9bc02b">
        <path d="m0 292 466 173M0 340l485 141M0 388l503 109" />
        <path d="m1440 292-466 173m466-125-485 141m485-93-503 109" />
      </g>
      <g stroke="url(#gg-tourney-trim)" className="tourney-stadium-lights">
        <path d="m0 218 459 213m981-213-459 213" strokeWidth="3" />
        <path d="m0 241 419 191m1021-191-419 191" strokeWidth="1" opacity=".6" />
        <path d="M0 531 535 552h370l535-21" strokeWidth="3" />
      </g>
      <path d="M0 554 720 514l720 40v346H0Z" fill="url(#gg-tourney-floor)" />
      <g stroke="#657eab19">
        <path d="M720 535 34 900m686-365L327 900m393-365L589 900m131-365 131 365m-131-365 393 365m-393-365 686 365" />
        <path d="M0 627h1440M0 712h1440M0 815h1440" />
      </g>
      <path d="m0 527 304 3 252 42-20 53L0 602Z" fill="url(#gg-tourney-metal)" stroke="#59cbed88" />
      <path d="m1440 527-304 3-252 42 20 53 536-23Z" fill="url(#gg-tourney-metal)" stroke="#c98aea88" />
      <path d="m0 535 300 4 238 39-14 35L0 591" stroke="#5bdfff" strokeWidth="3" className="tourney-stadium-lights" />
      <path d="m1440 535-300 4-238 39 14 35 524-22" stroke="#d68aff" strokeWidth="3" className="tourney-stadium-lights" />
      <g fill="#050914" stroke="#50658788">
        <path d="m47 477 68 5-3 42-69-4Zm104 13 59 5-2 33-61-3Zm97 14 50 4 3 25-53-4Z" />
        <path d="m1393 477-68 5 3 42 69-4Zm-104 13-59 5 2 33 61-3Zm-97 14-50 4-3 25 53-4Z" />
      </g>
      <path d="m0 645 463-26 112 6m290 0 112-6 463 26" stroke="url(#gg-tourney-trim)" strokeWidth="4" className="tourney-stadium-lights" />
      <g opacity=".15" stroke="url(#gg-tourney-trim)" strokeWidth="13">
        <path d="m0 671 435-24m570 0 435 24M98 608l-28 92m176-87-12 68m960-73 28 92m-176-87 12 68" />
      </g>
      <ellipse cx="720" cy="603" rx="285" ry="23" fill="#707aea12" />
      <path d="M444 600q276-44 552 0" stroke="url(#gg-tourney-trim)" strokeWidth="2" className="tourney-stadium-lights" />
    </svg>
    <div className="tourney-floor-sheen" />
    <div className="tourney-banner tourney-banner-left">
      <img src={heroPreviewLogo} alt="" width="355" height="426" loading="lazy" decoding="async" />
      <span className="tourney-banner-lines" />
    </div>
    <div className="tourney-banner tourney-banner-right">
      <img src={heroPreviewLogo} alt="" width="355" height="426" loading="lazy" decoding="async" />
      <span className="tourney-banner-lines" />
    </div>
    <div className="tourney-spotlight tourney-spotlight-left" />
    <div className="tourney-spotlight tourney-spotlight-right" />
  </div>
}

function TrophyArtwork({ reflection = false }: { reflection?: boolean }) {
  const metal = reflection ? 'gg-trophy-reflection-metal' : 'gg-trophy-metal'
  const face = reflection ? 'gg-trophy-reflection-face' : 'gg-trophy-face'
  return <svg viewBox="0 0 240 330" fill="none" focusable="false">
    <defs>
      <linearGradient id={metal}>
        <stop stopColor="#43516b" /><stop offset=".16" stopColor="#f1f4ff" /><stop offset=".29" stopColor="#7187ae" /><stop offset=".52" stopColor="#14243e" /><stop offset=".73" stopColor="#aba2c3" /><stop offset=".9" stopColor="#fff1dd" /><stop offset="1" stopColor="#555979" />
      </linearGradient>
      <linearGradient id={face} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#263755" /><stop offset=".4" stopColor="#080f22" /><stop offset=".76" stopColor="#101b33" /><stop offset="1" stopColor="#76758e" />
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="309" rx="108" ry="17" fill="#0008" />
    <path d="m59 254 122 0 33 54H26Z" fill="#0a1023" stroke="#9fafd28c" />
    <path d="m59 254 122 0 13 18H46Z" fill="url(#gg-tourney-metal)" stroke="#8599c3" />
    <path d="m48 271-16 33h176l-16-33Z" fill="#10182d" stroke="#434e74" />
    <path d="M30 305h180" stroke="#bfbdff" strokeWidth="2" />
    <path d="m40 23 38 18 26 196H88Z" fill={'url(#' + metal + ')'} stroke="#c5e7ff" />
    <path d="m200 23-38 18-26 196h16Z" fill={'url(#' + metal + ')'} stroke="#ddc9fa" />
    <path d="m58 21 62-17 62 17-45 220h-34Z" fill={'url(#' + metal + ')'} stroke="#dae0f6" />
    <path d="m69 34 51-16 51 16-38 199h-26Z" fill={'url(#' + face + ')'} stroke="#8093b5" />
    <path d="m69 34 38 199h-9L58 21Zm102 0-38 199h9l40-212Z" fill={'url(#' + metal + ')'} />
    <path d="m73 39 30 172" stroke="#a9edff" strokeWidth="2" />
    <path d="m169 39-30 172" stroke="#eeb9ff" strokeWidth="2" />
    <path d="M91 239h58v12H91Z" fill={'url(#' + metal + ')'} stroke="#abb4d2" />
    <image href={heroPreviewLogo} x="88" y="65" width="64" height="77" />
    <path d="M87 287h66m-53 6h40" stroke="#8196bb66" />
  </svg>
}

// A date-only CMS field cannot supply a truthful seconds-level countdown.
function useCountdown(target: string | null) {
  const timestamp = target && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(target) ? Date.parse(target) : NaN
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!Number.isFinite(timestamp)) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [timestamp])
  if (!Number.isFinite(timestamp)) return null
  const seconds = Math.max(0, Math.floor((timestamp - now) / 1000))
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60]
}

export default function HomepageTournaments() {
  const { language } = useLanguage()
  const managed = useCms().tournament_content?.[0]
  const c = homepageContent[language]
  const copy = homepageTournaments[language]
  const cmsCopy = cmsPublicCopy[language]
  const countdown = useCountdown(tournament.startsAt)
  const registrationDate = textValue(managed, 'registration_date')
  const tournamentDate = textValue(managed, 'tournament_date')
  const formatDate = (value: string) => new Date(value + 'T12:00:00Z').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
  const description = localized(managed, 'description')?.[language]

  return <section id="gg-tournaments" className="tourney-showcase" aria-labelledby="homepage-tournaments-title">
    <StadiumEnvironment />
    <div className="tourney-content">
      <header className="tourney-heading">
        <img className="tourney-heading-logo" src={heroPreviewLogo} alt="" width="355" height="426" loading="lazy" decoding="async" />
        <h2 id="homepage-tournaments-title">{localized(managed, 'title')?.[language] || c.tournaments}</h2>
        <p className="tourney-registration">{registrationDate ? cmsCopy.registration + ' ' + formatDate(registrationDate) : c.registration}</p>
        <p className="tourney-date">{tournamentDate ? cmsCopy.event + ' · ' + formatDate(tournamentDate) : copy.firstTournament}</p>
      </header>
      <div className="tourney-centerpiece" aria-hidden="true">
        <div className="tourney-trophy-glow" />
        <div className="tourney-trophy"><TrophyArtwork /></div>
        <div className="tourney-trophy-reflection"><TrophyArtwork reflection /></div>
      </div>
      <div className="tourney-footer">
        <div className="tourney-countdown" role="timer" aria-live="off" aria-label={copy.countdown} aria-describedby={countdown ? undefined : 'tourney-date-note'}>
          {copy.units.map((unit, index) => <div className="tourney-countdown-unit" key={unit}>
            <strong>{countdown ? String(countdown[index]).padStart(2, '0') : '—'}</strong>
            <span>{unit}</span>
          </div>)}
        </div>
        {!countdown && <p className="tourney-date-note" id="tourney-date-note">{copy.datePending}</p>}
        <button className="tourney-registration-button" type="button" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false"><rect x="6" y="10" width="12" height="10" rx="2" /><path d="M9 10V7a3 3 0 0 1 6 0v3m-3 4v3" /></svg>
          {copy.registrationSoon}
        </button>
        {description && <p className="tourney-description">{description}</p>}
        <Link className="tourney-details-link" to="/tournaments">{copy.details}<span aria-hidden="true">{language === 'ar' ? '↖' : '↗'}</span></Link>
      </div>
    </div>
  </section>
}
