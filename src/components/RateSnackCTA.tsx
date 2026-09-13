import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/rate-snack.css'

gsap.registerPlugin(ScrollTrigger)

export default function RateSnackCTA({ onPending }: { onPending: () => void }) {
  const { t } = useLanguage()
  const root = useRef<HTMLElement>(null)
  const emojis = ['😞', '🙁', '😐', '🙂', '🤩']

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', once: true }, defaults: { duration: .8, ease: 'power2.out' } })
        .from('.rate-cta-heading span', { opacity: 0, y: 18, stagger: .1 })
        .from('.rate-cta-action', { opacity: 0, y: 10 }, '-=.5')
        .from('.rate-preview', { opacity: 0, y: 16 }, '-=.65')
    }, root)
    media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.rate-preview-scan', { y: -30 }, { y: 30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 2 } })
    }, root)
    return () => media.revert()
  }, [])

  return <section id="rate-your-snack" ref={root} className="rate-snack-cta" aria-labelledby="rate-cta-title">
    <div className="rate-cta-copy">
      <p className="rate-cta-kicker">{t.rateCta}</p>
      <h2 id="rate-cta-title" className="rate-cta-heading">{t.rateHeadline.map(line => <span key={line}>{line}</span>)}</h2>
      <p className="rate-cta-description">{t.rateDescription}</p>
      <div className="rate-cta-action"><button className="cta cta-primary" type="button" onClick={onPending}>{t.rateCta}<span aria-hidden="true">↗</span></button><p className="rate-cta-hint">{t.rateSteps}</p></div>
    </div>
    <div className="rate-preview" role="group" aria-labelledby="rate-preview-label" aria-describedby="rate-preview-note">
      <div className="rate-preview-scan" aria-hidden="true" />
      <div className="rate-preview-meta"><span id="rate-preview-label">{t.ratePreview}</span><span aria-hidden="true" dir="ltr">05 / GG</span></div>
      <div className="rate-preview-product"><div className="rate-mini-product" aria-hidden="true">+</div><div><p>{t.rateProduct}</p><span>{t.rateFlavor}</span></div></div>
      <h3>{t.rateQuestion}</h3>
      <div className="rate-preview-emojis">{emojis.map((emoji, index) => <span className="rate-preview-emoji" key={emoji} role="img" aria-label={t.rateEmojiLabels[index]} title={t.rateEmojiLabels[index]}>{emoji}</span>)}</div>
      <div className="rate-preview-comment">{t.rateComment}<span aria-hidden="true" /></div>
      <div className="rate-preview-submit" aria-disabled="true">{t.rateSubmit}<span aria-hidden="true">↗</span></div>
      <p id="rate-preview-note" className="rate-preview-note">{t.ratePreviewNote}</p>
    </div>
  </section>
}
