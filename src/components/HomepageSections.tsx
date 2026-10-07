import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageContent } from '../data/homepage'
import { productWorldAssets } from '../data/productWorldAssets'
import { featuredProductCopy, featuredProductDetails } from '../data/featuredProducts'
import { familyWorlds, homepageMedia } from '../data/homepageVisuals'
import { visualCopy } from '../data/visualCopy'
import { pageTitles } from '../data/publicContent'
import type { ManagedFamily as ProductFamily } from '../cms/publicCatalog'
import { useCatalog, localized, textValue } from '../cms/publicCatalog'
import { useCms } from '../cms/CmsProvider'
import { cmsPublicCopy } from '../cms/copy'
import ProductImage from './ProductImage'
import VisualSlot from './VisualSlot'
import StoreFinder from './StoreFinder'
import '../styles/featured-products.css'

export function useHomeFamilies() { return useCatalog().filter(family => family.isActive !== false) }
export function worldStyle(family: ProductFamily): CSSProperties {
  const world = familyWorlds[family.slug]
  return { '--family-accent': world?.accent ?? family.accentColor, '--family-secondary': world?.secondary ?? family.accentColor } as CSSProperties
}

export function SectionHeading({ id, label, title, children }: { id: string; label: string; title: string; children?: ReactNode }) {
  return <header className="gg-section-heading"><p className="gg-kicker">{label}</p><h2 id={id}>{title}</h2>{children && <p className="gg-body">{children}</p>}</header>
}

export function FamilyAsset({ family, priority = false }: { family: ProductFamily; priority?: boolean }) {
  const { language } = useLanguage()
  return <div className="gg-asset-slot" data-world={familyWorlds[family.slug]?.theme} style={worldStyle(family)}>
    <ProductImage src={family.image} alt={family.localizedName?.[language] ?? family.name} loading={priority ? 'eager' : 'lazy'}>
      <div className="gg-asset-placeholder"><span aria-hidden="true">+</span><strong dir="auto">{family.localizedName?.[language] ?? family.name}</strong><span>{homepageContent[language].preview}</span></div>
    </ProductImage>
  </div>
}

export function FeaturedProducts() {
  const homeFamilies = useHomeFamilies()
  const { language } = useLanguage()
  const c = homepageContent[language]
  const copy = featuredProductCopy[language]

  return <section id="featured-products" className="gg-section gg-featured" aria-labelledby="featured-title">
    <SectionHeading id="featured-title" label={c.featuredLabel} title={c.featured} />
    <div className="gg-featured-grid featured-picks-grid">
      {productWorldAssets.map(asset => {
        const family = homeFamilies.find(item => item.slug === asset.id)
        const details = featuredProductDetails[asset.id]
        if (!family || !details) return null

        return <Link
          className="featured-pick"
          style={{ '--pick-accent': details.accent } as CSSProperties}
          to={'/products/' + family.slug}
          key={asset.id}
        >
          <div className="featured-pick-stage">
            <img
              className="featured-pick-pack"
              src={asset.src}
              alt={asset.family + ' ' + details.flavor[language]}
              width={asset.width}
              height={asset.height}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="featured-pick-copy">
            <h3><bdi dir="ltr">{asset.family}</bdi></h3>
            <p className="featured-pick-flavor">{details.flavor[language]}</p>
            <span className="featured-pick-cta">
              {copy.viewProduct}
              <span className="featured-pick-arrow" aria-hidden="true">{language === 'ar' ? '↖' : '↗'}</span>
            </span>
          </div>
        </Link>
      })}
    </div>
    <div id="rate-your-snack" className="gg-rating-entry"><p>{c.ratingHint}</p><Link className="gg-button gg-button-outline" to="/feedback">{c.rate}<span aria-hidden="true">↗</span></Link></div>
  </section>
}

export function ArenaTeaser({ showPageLink = true }: { showPageLink?: boolean }) {
  const { language } = useLanguage()
  const c = homepageContent[language]
  return <section id="gg-arena" className="gg-section gg-arena" aria-labelledby="arena-title">
    <div className="gg-arena-frame"><div><p className="gg-kicker">{c.arena}</p><h2 id="arena-title" className="gg-display">{c.arenaLine}</h2><p className="gg-body">{c.arenaBody}</p><span className="gg-badge">{c.soon}</span>{showPageLink && <p><Link className="gg-text-link" to="/arena">{pageTitles['/arena'][language]}<span aria-hidden="true">↗</span></Link></p>}</div>
      <VisualSlot src={homepageMedia.arena} label={visualCopy[language].app} className="gg-app-preview"><span className="gg-app-orbit" aria-hidden="true">+</span><span className="gg-badge">{c.soon}</span></VisualSlot>
    </div>
  </section>
}

export function TournamentsTeaser({ showPageLink = true }: { showPageLink?: boolean }) {
  const managed = useCms().tournament_content?.[0]
  const { language } = useLanguage()
  const c = homepageContent[language]
  const v = visualCopy[language]
  return <section id="gg-tournaments" className="gg-section gg-tournaments" aria-labelledby="tournaments-title">
    <SectionHeading id="tournaments-title" label={c.tournamentsLabel} title={localized(managed, 'title')?.[language] || c.tournaments} />{showPageLink && <Link className="gg-text-link" to="/tournaments">{pageTitles['/tournaments'][language]}<span aria-hidden="true">↗</span></Link>}
    <div className="gg-event-layout">
      <VisualSlot src={homepageMedia.tournament} label={v.event} className="gg-event-stage"><span className="gg-event-year" aria-hidden="true">2027</span><span className="gg-event-platform" aria-hidden="true">+</span></VisualSlot>
      <div><ol className="gg-schedule">{[textValue(managed, 'registration_date') ? `${cmsPublicCopy[language].registration} ${new Date(`${managed?.registration_date}T12:00:00Z`).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}` : c.registration, textValue(managed, 'tournament_date') ? `${cmsPublicCopy[language].event} ${new Date(`${managed?.tournament_date}T12:00:00Z`).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}` : c.firstTournament].map((text, index) => <li key={text}><span className="gg-step" aria-hidden="true">0{index + 1}</span><h3>{text}</h3></li>)}</ol>
        <p className="gg-body">{localized(managed, 'description')?.[language]}</p><span className="gg-badge">{cmsPublicCopy[language][(textValue(managed, 'status') || 'coming-soon') as 'coming-soon' | 'announced' | 'completed']}</span><div className="gg-countdown" role="group" aria-label={v.countdown}><div>{v.units.map(unit => <span key={unit}><strong aria-hidden="true">—</strong><span>{unit}</span></span>)}</div><p>{v.datePending}</p></div>
      </div>
    </div>
  </section>
}

export function FindGGTeaser() {
  return <StoreFinder />
}
