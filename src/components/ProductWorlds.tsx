import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageContent } from '../data/homepage'
import { productWorldAssets } from '../data/productWorldAssets'
import { useHomeFamilies, SectionHeading } from './HomepageSections'
import '../styles/world-portals.css'

export default function ProductWorlds() {
  const homeFamilies = useHomeFamilies()
  const { language } = useLanguage()
  const c = homepageContent[language]

  return <section id="product-worlds" className="gg-section world-showcase" aria-labelledby="worlds-title">
    <SectionHeading id="worlds-title" label={c.worldsLabel} title={c.worlds}>{c.worldsIntro}</SectionHeading>
    <div className="gg-world-grid world-portals">
      {productWorldAssets.map((asset, index) => {
        const family = homeFamilies.find(item => item.slug === asset.id)
        if (!family) return null
        return <Link className="world-portal" data-world={asset.id} to={`/products/${family.slug}`} key={asset.id}>
          <div className="world-portal-meta" aria-hidden="true"><span>0{index + 1}</span><span className="world-portal-rule" /><span>GG</span></div>
          <div className="world-portal-visual">
            <div className="world-portal-environment" aria-hidden="true">
              <span className="world-portal-rays" /><span className="world-portal-frame" /><span className="world-portal-floor" />
            </div>
            <img className="world-portal-pack" src={asset.src} alt={asset.file.slice(0, -4)} width={asset.width} height={asset.height} loading="lazy" decoding="async" />
          </div>
          <div className="world-portal-copy">
            <h3 dir="ltr">{asset.family}</h3>
            <p>{family.shortDescription?.[language] || c.familyDescriptions[index]}</p>
            <span className="world-portal-link">{c.viewFamily}<span className="world-portal-arrow" aria-hidden="true">↗</span></span>
          </div>
        </Link>
      })}
    </div>
  </section>
}
