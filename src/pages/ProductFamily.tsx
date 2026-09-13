import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import gsap from 'gsap'
import { getProduct, getActiveFlavors, type ProductFamily as Family } from '../data/products'
import { useLanguage } from '../i18n/LanguageContext'
import ProductPageLayout from '../components/ProductPageLayout'
import PackagingStage from '../components/PackagingStage'
import ProductInformation from '../components/ProductInformation'

export default function ProductFamily() {
  const { productSlug } = useParams()
  const { t } = useLanguage()
  const product = getProduct(productSlug)
  return <ProductPageLayout>{product ? <FamilyDetail key={product.id} product={product} /> : <div className="catalogue-not-found"><p className="catalogue-kicker">GG / —</p><h1>{t.ratingNotFound}</h1><Link className="catalogue-button" to="/products">{t.catalogueBack}</Link></div>}</ProductPageLayout>
}

function FamilyDetail({ product }: { product: Family }) {
  const { t, language } = useLanguage()
  const flavors = getActiveFlavors(product)
  const [flavorId, setFlavorId] = useState(flavors[0]?.id)
  const flavor = flavors.find(item => item.id === flavorId) ?? flavors[0]
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
      gsap.to(root.current, { '--catalogue-accent': flavor?.accentColor ?? product.accentColor, duration: context.conditions?.reduced ? 0 : .5 })
      if (context.conditions?.motion) gsap.fromTo('.catalogue-package, .catalogue-stage-meta, .family-active-flavor', { opacity: .2, y: 6 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' })
    }, root)
    return () => media.kill(false)
  }, [product, flavor])
  return <div className="family-content" ref={root}><Link className="catalogue-back" to="/products">{t.catalogueBack}</Link><div className="family-hero"><PackagingStage product={product} flavor={flavor} /><div className="family-copy"><p className="catalogue-kicker">{t.catalogueLabel}</p><h1 dir="ltr">{product.name}</h1><p className="catalogue-description">{product.shortDescription?.[language] || t.catalogueDescriptor}</p><p className="family-active-flavor" role="status">{flavor?.name[language] ?? t.catalogueNoFlavors}</p><fieldset className="family-flavors"><legend>{t.worldFlavors}</legend><div>{flavors.map(item => <button type="button" key={item.id} aria-pressed={flavor?.id === item.id} onClick={() => setFlavorId(item.id)}>{item.shortName?.[language] || item.name[language]}</button>)}</div></fieldset>{flavors.some(item => item.isPlaceholder) && <p className="family-note">{t.worldFlavorNote}</p>}{flavor && <Link className="catalogue-button" to={flavor.ratingPath}>{t.catalogueRate}<span aria-hidden="true">↗</span></Link>}</div></div><ProductInformation product={product} /></div>
}
