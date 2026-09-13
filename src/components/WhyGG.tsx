import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/why-gg.css'
import { siteContent } from '../data/siteContent'

gsap.registerPlugin(ScrollTrigger)

export default function WhyGG() {
  const { t, language } = useLanguage()
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.why-gg-feature', {
        opacity: 0, y: 10, duration: .7, stagger: .08, ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    }, root)
    return () => media.revert()
  }, [])

  return <section ref={root} id="why-gg" className="why-gg" aria-labelledby="why-gg-title">
    <header className="why-gg-heading"><div><p>{t.whyLabel}</p><h2 id="why-gg-title">{t.whyTitle}</h2></div><span aria-hidden="true" dir="ltr">04 / GG</span></header>
    {siteContent.whyGG.intro && <p>{siteContent.whyGG.intro[language]}</p>}
    <ul className="why-gg-features">
      {t.whyFeatures.map((feature, index) => <li className="why-gg-feature" key={feature.title}>
        <div className="why-gg-hud" aria-hidden="true"><span dir="ltr">{String(index + 1).padStart(2, '0')}</span><span>+</span></div>
        <h3>{feature.title}</h3><p>{feature.description}</p>
      </li>)}
    </ul>
  </section>
}
