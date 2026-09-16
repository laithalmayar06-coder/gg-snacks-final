import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageContent, homepageFamilyOrder } from '../data/homepage'
import { familyWorlds, homepageMedia } from '../data/homepageVisuals'
import { visualCopy } from '../data/visualCopy'
import { getProduct, type ProductFamily } from '../data/products'
import ProductImage from './ProductImage'
import VisualSlot from './VisualSlot'

export const homeFamilies = homepageFamilyOrder.map(slug => getProduct(slug)).filter((family): family is ProductFamily => Boolean(family))
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
    <ProductImage src={family.image} alt={family.name} loading={priority ? 'eager' : 'lazy'}>
      <div className="gg-asset-placeholder"><span aria-hidden="true">+</span><strong dir="ltr">{family.name}</strong><span>{homepageContent[language].preview}</span></div>
    </ProductImage>
  </div>
}

export function FeaturedProducts() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  const v = visualCopy[language]
  return <section id="featured-products" className="gg-section gg-featured" aria-labelledby="featured-title">
    <SectionHeading id="featured-title" label={c.featuredLabel} title={c.featured}>{c.featuredIntro}</SectionHeading>
    <div className="gg-featured-grid">{homeFamilies.map((family, index) => <Link className="gg-featured-card" style={worldStyle(family)} to={`/products/${family.slug}`} key={family.id}>
      <span className="gg-feature-index" aria-hidden="true">0{index + 1}</span>
      <div className="gg-featured-title"><p className="gg-kicker">{v.family}</p><h3 dir="ltr">{family.name}</h3><p>{v.flavours}</p></div>
      <FamilyAsset family={family} />
      <div className="gg-featured-action"><p>{v.flavourPending}</p><span className="gg-text-link">{c.viewFamily}<span aria-hidden="true">↗</span></span></div>
    </Link>)}</div>
    <div id="rate-your-snack" className="gg-rating-entry"><p>{c.ratingHint}</p><Link className="gg-button gg-button-outline" to="/products">{c.rate}<span aria-hidden="true">↗</span></Link></div>
  </section>
}

export function ArenaTeaser() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  return <section id="gg-arena" className="gg-section gg-arena" aria-labelledby="arena-title">
    <div className="gg-arena-frame"><div><p className="gg-kicker">{c.arena}</p><h2 id="arena-title" className="gg-display">{c.arenaLine}</h2><p className="gg-body">{c.arenaBody}</p><span className="gg-badge">{c.soon}</span></div>
      <VisualSlot src={homepageMedia.arena} label={visualCopy[language].app} className="gg-app-preview"><span className="gg-app-orbit" aria-hidden="true">+</span><span className="gg-badge">{c.soon}</span></VisualSlot>
    </div>
  </section>
}

export function TournamentsTeaser() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  const v = visualCopy[language]
  return <section id="gg-tournaments" className="gg-section gg-tournaments" aria-labelledby="tournaments-title">
    <SectionHeading id="tournaments-title" label={c.tournamentsLabel} title={c.tournaments} />
    <div className="gg-event-layout">
      <VisualSlot src={homepageMedia.tournament} label={v.event} className="gg-event-stage"><span className="gg-event-year" aria-hidden="true">2027</span><span className="gg-event-platform" aria-hidden="true">+</span></VisualSlot>
      <div><ol className="gg-schedule">{[c.registration, c.firstTournament].map((text, index) => <li key={text}><span className="gg-step" aria-hidden="true">0{index + 1}</span><h3>{text}</h3></li>)}</ol>
        <div className="gg-countdown" role="group" aria-label={v.countdown}><div>{v.units.map(unit => <span key={unit}><strong aria-hidden="true">—</strong><span>{unit}</span></span>)}</div><p>{v.datePending}</p></div>
      </div>
    </div>
  </section>
}

export function FindGGTeaser() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  const v = visualCopy[language]
  return <section id="find-gg" className="gg-section gg-find" aria-labelledby="find-title">
    <div><SectionHeading id="find-title" label={c.soon} title={c.find}>{c.findIntro}</SectionHeading>
      <div className="gg-location-selectors"><label htmlFor="gg-city">{c.city}<select id="gg-city" disabled><option>{c.selectCity}</option></select></label><label htmlFor="gg-district">{c.district}<select id="gg-district" disabled><option>{c.selectDistrict}</option></select></label></div>
      <button type="button" className="gg-button gg-button-outline" disabled>{v.search}</button>
    </div>
    <div className="gg-store-preview gg-card">
      <div className="gg-abstract-map" role="img" aria-label={v.map}><span className="gg-map-pin" aria-hidden="true">⌖</span><i /><i /></div>
      <h3>{c.stores}</h3><p className="gg-body">{c.storesNote}</p>
      <ul className="gg-store-list" aria-label={c.stores}>{[1, 2].map(index => <li key={index}><span aria-hidden="true">0{index}</span><span>{v.store}</span><span aria-hidden="true">—</span></li>)}</ul>
    </div>
  </section>
}
