import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageContent, homepageFamilyOrder } from '../data/homepage'
import { getProduct, type ProductFamily } from '../data/products'
import ProductImage from './ProductImage'

export const homeFamilies = homepageFamilyOrder.map(slug => getProduct(slug)).filter((family): family is ProductFamily => Boolean(family))

export function SectionHeading({ id, label, title, children }: { id: string; label: string; title: string; children?: ReactNode }) {
  return <header className="gg-section-heading"><p className="gg-kicker">{label}</p><h2 id={id}>{title}</h2>{children && <p className="gg-body">{children}</p>}</header>
}

export function FamilyAsset({ family }: { family: ProductFamily }) {
  const { language } = useLanguage()
  const copy = homepageContent[language]
  return <div className="gg-asset-slot" style={{ '--family-accent': family.accentColor } as CSSProperties}>
    <ProductImage src={family.image} alt={family.name}>
      <div className="gg-asset-placeholder"><span aria-hidden="true">+</span><strong dir="ltr">{family.name}</strong><span>{copy.preview}</span></div>
    </ProductImage>
  </div>
}

export function FeaturedProducts() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  return <section id="featured-products" className="gg-section gg-featured" aria-labelledby="featured-title">
    <SectionHeading id="featured-title" label={c.featuredLabel} title={c.featured}>{c.featuredIntro}</SectionHeading>
    <div className="gg-featured-grid">{homeFamilies.map(family => <Link className="gg-card gg-featured-card" to={`/products/${family.slug}`} key={family.id}><FamilyAsset family={family} /><div><h3 dir="ltr">{family.name}</h3><span>{c.viewFamily} <span aria-hidden="true">↗</span></span></div></Link>)}</div>
    <div id="rate-your-snack" className="gg-rating-entry"><p>{c.ratingHint}</p><Link className="gg-button gg-button-outline" to="/products">{c.rate}<span aria-hidden="true">↗</span></Link></div>
  </section>
}

export function ArenaTeaser() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  return <section id="gg-arena" className="gg-section gg-arena" aria-labelledby="arena-title"><div className="gg-arena-frame"><div><p className="gg-kicker">{c.arena}</p><h2 id="arena-title" className="gg-display">{c.arenaLine}</h2><p className="gg-body">{c.arenaBody}</p><span className="gg-badge">{c.soon}</span></div><span className="gg-arena-cross" aria-hidden="true">+</span></div></section>
}

export function TournamentsTeaser() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  return <section id="gg-tournaments" className="gg-section gg-tournaments" aria-labelledby="tournaments-title"><SectionHeading id="tournaments-title" label={c.tournamentsLabel} title={c.tournaments} /><ol className="gg-schedule">{[c.registration, c.firstTournament].map((text, index) => <li key={text}><span className="gg-step" aria-hidden="true">0{index + 1}</span><h3>{text}</h3></li>)}</ol></section>
}

export function FindGGTeaser() {
  const { language } = useLanguage()
  const c = homepageContent[language]
  return <section id="find-gg" className="gg-section gg-find" aria-labelledby="find-title"><div><SectionHeading id="find-title" label={c.soon} title={c.find}>{c.findIntro}</SectionHeading><div className="gg-location-selectors"><label htmlFor="gg-city">{c.city}<select id="gg-city" disabled><option>{c.selectCity}</option></select></label><label htmlFor="gg-district">{c.district}<select id="gg-district" disabled><option>{c.selectDistrict}</option></select></label></div><button type="button" className="gg-button gg-button-outline" disabled>{c.findCta}</button></div><div className="gg-store-preview gg-card"><span className="gg-location-mark" aria-hidden="true">⌖</span><h3>{c.stores}</h3><p className="gg-body">{c.storesNote}</p></div></section>
}
