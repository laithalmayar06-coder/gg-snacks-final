import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageContent } from '../data/homepage'
import { FamilyAsset, useHomeFamilies, SectionHeading, worldStyle } from './HomepageSections'

export default function ProductWorlds() {
  const homeFamilies = useHomeFamilies()
  const { language } = useLanguage()
  const c = homepageContent[language]
  return <section id="product-worlds" className="gg-section" aria-labelledby="worlds-title">
    <SectionHeading id="worlds-title" label={c.worldsLabel} title={c.worlds}>{c.worldsIntro}</SectionHeading>
    <div className="gg-world-grid">{homeFamilies.map((family, index) => <Link className="gg-card gg-world-card" style={worldStyle(family)} to={`/products/${family.slug}`} key={family.id}>
      <div className="gg-world-meta"><span aria-hidden="true">0{index + 1}</span><span dir="ltr">{family.name}</span></div>
      <FamilyAsset family={family} /><div className="gg-world-copy"><h3 dir="auto">{family.localizedName?.[language] ?? family.name}</h3><p>{family.shortDescription?.[language] ?? c.familyDescriptions[index] ?? c.worldsIntro}</p><span className="gg-text-link">{c.viewFamily}<span aria-hidden="true">↗</span></span></div>
    </Link>)}</div>
  </section>
}
