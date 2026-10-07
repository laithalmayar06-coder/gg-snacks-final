import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../i18n/LanguageContext'
import { homepageStory } from '../data/homepageStory'
import '../styles/homepage-story.css'

gsap.registerPlugin(ScrollTrigger)

const pillarIcons = [
  'M13 3c1 5 6 7 6 12a7 7 0 0 1-14 0c0-4 2-6 4-8v6c4-2 5-5 4-10Z',
  'm12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Zm-4 10 3 3 5-6',
  'M7 7h10c3 0 5 10 4 12s-4-2-6-3H9c-2 1-5 5-6 3S4 7 7 7Zm0 3v5m-2-2h4m7-2h.01m2 3h.01',
]

function StoryEnvironment() {
  return <div className="story-environment" aria-hidden="true">
    <img className="story-scene-image" src="/preview-assets/ABOUT%20VISUAL.png" alt="" width="1448" height="1086" loading="lazy" decoding="async" />
    <img className="story-logo" src="/preview-assets/web/LOGO%20.PNG.png" alt="" width="355" height="426" loading="lazy" decoding="async" />
  </div>
}

export default function HomepageStory() {
  const { t, language } = useLanguage()
  const copy = homepageStory[language]
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.story-visual, .story-copy > *', {
        opacity: 0, y: 14, duration: .8, stagger: .07, ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    }, root)
    return () => media.revert()
  }, [])

  return <section id="gg-universe" className="gg-story" ref={root} aria-labelledby="story-title">
    <div className="story-layout">
      <figure className="story-visual">
        <StoryEnvironment />
        <figcaption><span>{t.location}</span><span aria-hidden="true" dir="ltr">GG / 04</span></figcaption>
      </figure>
      <div className="story-copy">
        <p className="story-kicker">{copy.label}</p>
        <h2 id="story-title">{copy.heading}</h2>
        <p className="story-subtitle">{copy.subtitle}</p>
        <p className="story-description">{copy.description}</p>
        <ul className="story-pillars">
          {copy.pillars.map((pillar, index) => <li key={index}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={pillarIcons[index]} /></svg>
            <span>{pillar}</span>
            <span className="story-pillar-description">{copy.pillarDescriptions[index]}</span>
          </li>)}
        </ul>
        <Link to="/business" className="story-cta">{copy.cta}<span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </section>
}
