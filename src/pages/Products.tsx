import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCatalog } from '../cms/publicCatalog'
import { cmsPublicCopy } from '../cms/copy'
import { useLanguage } from '../i18n/LanguageContext'
import ProductPageLayout from '../components/ProductPageLayout'
import PackagingStage from '../components/PackagingStage'

gsap.registerPlugin(ScrollTrigger)

export default function Products() {
  const { t, language } = useLanguage()
  const productFamilies = useCatalog().filter(product => product.isActive !== false)
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      root.current?.querySelectorAll('.catalogue-world').forEach(element => {
        gsap.from(element, { opacity: 0, y: 14, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } })
      })
    }, root)
    return () => media.revert()
  }, [])
  return <ProductPageLayout><div ref={root} className="catalogue-content"><header className="catalogue-heading"><p className="catalogue-kicker">{t.catalogueLabel}</p><h1>{t.catalogueTitle}</h1><p className="catalogue-description">{t.catalogueDescription}</p></header><div className="catalogue-grid">{!productFamilies.length && <p>{cmsPublicCopy[language].unavailable}</p>}{productFamilies.map((product, index) => <Link to={`/products/${product.slug}`} key={product.id} className="catalogue-world" style={{ '--catalogue-accent': product.accentColor } as CSSProperties} aria-label={`${t.catalogueExplore} ${product.localizedName?.[language] ?? product.name}`}><PackagingStage product={product} loading={index < 2 ? 'eager' : 'lazy'} /><div className="catalogue-world-caption"><div><span className="catalogue-index" aria-hidden="true">{String(index + 1).padStart(2, '0')} / GG</span><h2 dir="auto">{product.localizedName?.[language] ?? product.name}</h2><p>{product.shortDescription?.[language] || t.catalogueDescriptor}</p></div><span className="catalogue-explore">{t.catalogueExplore}<span aria-hidden="true">↗</span></span></div></Link>)}</div></div></ProductPageLayout>
}
