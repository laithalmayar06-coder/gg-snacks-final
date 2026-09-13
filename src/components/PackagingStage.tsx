import { getProductImage, type Flavor, type ProductFamily } from '../data/products'
import ProductImage from './ProductImage'
import { useLanguage } from '../i18n/LanguageContext'

export default function PackagingStage({ product, flavor }: { product: ProductFamily; flavor?: Flavor }) {
  const { t, language } = useLanguage()
  const image = getProductImage(product, flavor)
  return <div className="catalogue-stage">
    <div className="catalogue-stage-meta" aria-hidden="true"><span>{t.worldPreview}</span><span dir="ltr">{product.slug.toUpperCase()}{flavor ? ` / ${flavor.slug.toUpperCase()}` : ''}</span></div>
    <div className="catalogue-stage-space"><div className="catalogue-ring" aria-hidden="true" /><span className="catalogue-watermark" dir="ltr" aria-hidden="true">{product.name}</span><div className="catalogue-package" data-placeholder={flavor?.id ?? product.id}><ProductImage src={image} alt={`${product.name}${flavor ? ` / ${flavor.name[language]}` : ''}`}><div className="catalogue-package-shape" role="img" aria-label={t.worldPlaceholder}><span aria-hidden="true">+</span></div></ProductImage></div></div>
  </div>
}
