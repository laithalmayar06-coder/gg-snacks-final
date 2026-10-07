import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageContent } from '../data/homepage'
import { homepageArena } from '../data/homepageArena'
import { heroPreviewLogo } from '../data/heroPreview'
import { productWorldAssets } from '../data/productWorldAssets'
import '../styles/homepage-arena.css'

const arenaPack = productWorldAssets.find(asset => asset.id === 'pop-g')

// Decorative staging only; this visual can later be replaced by approved Arena artwork.
function ArenaScene({ title, status }: { title: string; status: string }) {
  return <div className="arena-scene" aria-hidden="true">
    <div className="arena-scene-haze" />
    <div className="arena-scene-architecture"><span /><span /><span /></div>
    <svg className="arena-scene-floor" viewBox="0 0 760 560" fill="none" focusable="false">
      <path className="arena-floor-grid" d="M40 476h680M0 518h760M112 443l-65 117m190-117-30 117m173-117v117m143-117 30 117m95-117 65 117" />
      <ellipse className="arena-floor-shadow" cx="390" cy="473" rx="268" ry="45" />
      <path className="arena-floor-edge" d="M127 468c38-62 479-62 527 0v16c-36 67-491 67-527 0Z" />
      <ellipse className="arena-floor-top" cx="390" cy="464" rx="263" ry="47" />
      <path className="arena-floor-cyan" d="M141 481c35 27 123 37 209 38" />
      <path className="arena-floor-violet" d="M443 518c100-4 176-21 198-39" />
    </svg>
    <div className="arena-device-reflection" />
    <div className="arena-device">
      <div className="arena-device-screen">
        <span className="arena-device-speaker" />
        <p className="arena-device-title">{title}</p>
        <div className="arena-device-scan">
          <svg className="arena-scan-frame" viewBox="0 0 220 220" fill="none" focusable="false">
            <path className="arena-scan-corners" d="M20 58V20h38m104 0h38v38m0 104v38h-38M58 200H20v-38" />
            <path className="arena-scan-guides" d="M6 110h20m168 0h20M110 6v20m0 168v20" />
            <path className="arena-scan-arc" d="M45 70a76 76 0 0 1 130 0m0 80a76 76 0 0 1-130 0" />
          </svg>
          <img className="arena-device-logo" src={heroPreviewLogo} alt="" width="355" height="426" loading="lazy" decoding="async" />
          <span className="arena-scan-light" />
        </div>
        <span className="arena-device-status">{status}</span>
        <span className="arena-device-baseline" />
      </div>
    </div>
    {arenaPack && <div className="arena-pack-stage">
      <img src={arenaPack.src} alt="" width={arenaPack.width} height={arenaPack.height} loading="lazy" decoding="async" />
    </div>}
    <span className="arena-scene-glint arena-scene-glint-cyan" />
    <span className="arena-scene-glint arena-scene-glint-violet" />
  </div>
}

export default function HomepageArena() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  const copy = homepageArena[language]

  return <section id="gg-arena" className="arena-showcase" aria-labelledby="homepage-arena-title">
    <div className="arena-showcase-layout">
      <header className="arena-showcase-heading">
        <p className="arena-showcase-kicker">{copy.label}</p>
        <h2 id="homepage-arena-title">{c.arena}</h2>
        <p className="arena-showcase-tagline">{c.arenaLine}</p>
      </header>
      <ArenaScene title={c.arena} status={c.soon} />
      <div className="arena-showcase-details">
        <p className="arena-showcase-description">{copy.teaser}</p>
        <Link className="arena-showcase-status" to="/arena" aria-label={c.arena + ' — ' + c.soon}>
          <span className="arena-status-light" aria-hidden="true" />
          {c.soon}
          <span className="arena-status-arrow" aria-hidden="true">{language === 'ar' ? '↖' : '↗'}</span>
        </Link>
      </div>
    </div>
  </section>
}
