import { getProductImage, type Flavor, type ProductFamily } from '../data/products'
import ProductImage from './ProductImage'
import { useLanguage } from '../i18n/LanguageContext'

export default function WorldStage({ family, flavor }: { family: ProductFamily; flavor?: Flavor }) {
  const { language, t } = useLanguage()
  return <div className="world-stage" aria-label={`${family.name} / ${(flavor?.name[language] ?? t.catalogueNoFlavors)}`}>
    <div className="world-stage-meta"><span>{t.worldPreview}</span><span dir="ltr">{family.slug.toUpperCase()} / {(flavor?.slug.toUpperCase() ?? '—')}</span></div>
    <div className="world-stage-visual" role="img" aria-label={t.worldPlaceholder}>
      <div className="world-grid" aria-hidden="true" />
      <div className="world-halo" aria-hidden="true" />
      <div className="world-ring" aria-hidden="true" /><div className="world-ring world-ring--inner" aria-hidden="true" />
      <span className="world-watermark" aria-hidden="true" dir="ltr">{family.name}</span>
      <div className="world-object" data-placeholder={`${family.id}/${flavor?.id ?? 'preview'}`} aria-hidden="true">
        <i className="world-bracket world-bracket--tl" /><i className="world-bracket world-bracket--tr" />
        <i className="world-bracket world-bracket--bl" /><i className="world-bracket world-bracket--br" />
        <ProductImage src={getProductImage(family, flavor)} alt={`${family.name} / ${(flavor?.name[language] ?? t.catalogueNoFlavors)}`}><div className="world-silhouette"><span>+</span><span className="world-object-line" /><span className="world-object-code" dir="ltr">{String(flavor ? family.flavors.indexOf(flavor) + 1 : 0).padStart(2, '0')}</span></div></ProductImage>
      </div>
      <span className="world-axis world-axis--start" aria-hidden="true">+</span><span className="world-axis world-axis--end" aria-hidden="true">+</span>
    </div>
    <div className="world-stage-caption"><h3 dir="ltr">{family.name}</h3><span>{(flavor?.name[language] ?? t.catalogueNoFlavors)}</span></div>
  </div>
}
