import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { productFamilies, getActiveFlavors } from '../data/products'
import { useLanguage } from '../i18n/LanguageContext'
import WorldSelector from './WorldSelector'
import WorldStage from './WorldStage'
import '../styles/product-worlds.css'

gsap.registerPlugin(ScrollTrigger)

export default function ProductWorlds() {
  const { language, t } = useLanguage()
  const [selection, setSelection] = useState({ familyId: productFamilies[0].id, flavorIndex: 0 })
  const family = productFamilies.find(item => item.id === selection.familyId)!
  const flavors = getActiveFlavors(family)
  const flavor = flavors[selection.flavorIndex] ?? flavors[0]
  const root = useRef<HTMLElement>(null)
  const previousFamily = useRef(family.id)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', once: true }, defaults: { duration: .8, ease: 'power3.out' } })
        .from('.world-heading', { y: 24, opacity: 0 })
        .from('.world-selector--family', { y: 18, opacity: 0 }, '-=.5')
        .from('.world-display', { y: 22, opacity: 0 }, '-=.55')
    }, root)
    media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const ambient = gsap.timeline({ paused: true, repeat: -1, yoyo: true })
        .to('.world-halo', { x: 12, y: -10, duration: 7, ease: 'sine.inOut' })
      const scanner = gsap.to('.world-ring', { rotation: 360, duration: 100, repeat: -1, ease: 'none', paused: true })
      ScrollTrigger.create({ trigger: root.current, start: 'top bottom', end: 'bottom top', onToggle: self => {
        if (self.isActive) { ambient.play(); scanner.play() } else { ambient.pause(); scanner.pause() }
      } })
    }, root)
    return () => media.revert()
  }, [])

  useLayoutEffect(() => {
    const familyChanged = previousFamily.current !== family.id
    previousFamily.current = family.id
    const media = gsap.matchMedia()
    media.add({ reduced: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 767px)', desktop: '(min-width: 768px)' }, context => {
      const reduced = context.conditions?.reduced
      // Reset interrupted reveals before starting the latest selection.
      gsap.set('.world-object, .world-stage-meta, .world-stage-caption, .world-watermark, .world-selector--flavor .world-options', { opacity: 1, y: 0, scale: 1 })
      gsap.to(root.current, { '--world-accent': family.accentColor, '--flavor-accent': flavor?.accentColor ?? family.accentColor, duration: reduced ? 0 : .65, ease: 'power2.inOut' })
      if (!reduced) {
        const distance = context.conditions?.mobile ? 5 : 10
        const reveal = gsap.timeline({ defaults: { ease: 'power2.out' } })
        reveal.fromTo('.world-object', { opacity: .15, y: distance }, { opacity: 1, y: 0, duration: .65 })
          .fromTo('.world-stage-meta, .world-stage-caption', { opacity: 0, y: distance / 2 }, { opacity: 1, y: 0, duration: .45, stagger: .04 }, .08)
        if (familyChanged) {
          reveal.fromTo('.world-watermark', { opacity: 0 }, { opacity: 1, duration: .6 }, 0)
            .fromTo('.world-selector--flavor .world-options', { opacity: 0, y: distance / 2 }, { opacity: 1, y: 0, duration: .45 }, .14)
        }
      }
    }, root)
    // Kill interrupted transitions without reverting the current accent, so rapid selections stay smooth.
    return () => { media.kill(false) }
  }, [family, flavor])

  return <section ref={root} id="product-worlds" className="product-worlds" aria-labelledby="worlds-title">
    <header className="world-heading"><div><p className="world-kicker">{t.worldLoadout}</p><h2 id="worlds-title">{t.worldTitle}</h2></div><span className="world-section-code" aria-hidden="true">02 / GG</span></header>
    <div className="world-layout">
      <WorldSelector label={t.worldFamilies} options={productFamilies.map(product => ({ ...product, to: `/products/${product.slug}` }))} value={family.id} variant="family" onChange={familyId => setSelection({ familyId, flavorIndex: 0 })} />
      <div className="world-display">
        <WorldStage family={family} flavor={flavor} />
        <div className="world-flavors"><WorldSelector label={t.worldFlavors} options={flavors.map(item => ({ ...item, name: item.shortName?.[language] || item.name[language] }))} value={flavor?.id ?? ''} variant="flavor" onChange={id => setSelection(current => ({ ...current, flavorIndex: flavors.findIndex(item => item.id === id) }))} />{flavors.some(item => item.isPlaceholder) && <p>{t.worldFlavorNote}</p>}</div>
      </div>
    </div>
    <p className="sr-only" role="status" aria-atomic="true">{family.name} — {flavor?.name[language] ?? t.catalogueNoFlavors}</p>
  </section>
}
