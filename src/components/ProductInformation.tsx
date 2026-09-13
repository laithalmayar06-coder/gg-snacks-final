import type { ProductFamily } from '../data/products'
import { useLanguage } from '../i18n/LanguageContext'

export default function ProductInformation({ product }: { product: ProductFamily }) {
  const { t, language } = useLanguage()
  const values = [product.packageSize?.[language], product.ingredients?.[language],
    product.nutrition ? <><span>{product.nutrition.basis[language]}</span><ul>{product.nutrition.entries.map((entry, index) => <li key={index}>{entry.label[language]}: {entry.value[language]}</li>)}</ul></> : null,
    product.longDescription?.[language]]
  return <section className="family-info" aria-labelledby="family-info-title"><h2 id="family-info-title">{t.catalogueInfo}</h2><dl>{t.catalogueInfoLabels.map((label, index) => <div key={label}><dt>{label}</dt><dd>{values[index] || t.catalogueInfoPending}</dd></div>)}</dl></section>
}
