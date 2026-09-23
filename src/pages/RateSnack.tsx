import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router'
import gsap from 'gsap'
import { getProduct, getFlavor, getProductImage } from '../data/products'
import ProductImage from '../components/ProductImage'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/rating-page.css'
import { submitRating, RatingRateLimitError } from '../services/ratings'

const emojis = ['😞', '🙁', '😐', '🙂', '🤩']

export default function RateSnack() {
  const { productSlug, flavorSlug } = useParams()
  // Remount the local form when navigating between package URLs.
  return <RatingExperience key={`${productSlug}/${flavorSlug}`} productSlug={productSlug} flavorSlug={flavorSlug} />
}

function RatingExperience({ productSlug, flavorSlug }: { productSlug?: string; flavorSlug?: string }) {
  const { t, language, setLanguage } = useLanguage()
  const product = getProduct(productSlug)
  const flavor = getFlavor(productSlug, flavorSlug)
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)
  const [limited, setLimited] = useState(false)
  const inFlight = useRef(false)
  const root = useRef<HTMLDivElement>(null)
  const success = useRef<HTMLHeadingElement>(null)

  async function handleSubmit() {
    if (inFlight.current || submitted || !product || !flavor || rating === null) return
    inFlight.current = true
    setSubmitting(true)
    setFailed(false); setLimited(false)
    try {
      await submitRating({ productSlug: product.slug, flavorSlug: flavor.slug, rating, comment, language })
      setSubmitted(true)
    } catch (error) {
      setFailed(true); setLimited(error instanceof RatingRateLimitError)
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.rating-panel', { opacity: 0, y: 12, duration: .6, ease: 'power2.out' })
      gsap.from('.rating-identity', { opacity: 0, y: 8, duration: .6, delay: .1, ease: 'power2.out' })
    }, root)
    return () => media.revert()
  }, [])

  useLayoutEffect(() => {
    if (!submitted) return
    success.current?.focus()
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.rating-success', { opacity: 0, y: 10, duration: .6, ease: 'power2.out' })
    }, root)
    return () => media.revert()
  }, [submitted])

  useLayoutEffect(() => {
    if (rating === null || submitted) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.rating-choice:has(input:checked) .rating-face', { y: 2, scale: .96 }, { y: 0, scale: 1, duration: .25, ease: 'power2.out' })
    }, root)
    return () => media.revert()
  }, [rating, submitted])

  return <div ref={root} className="rating-page" style={{ '--rating-accent': flavor?.accentColor ?? product?.accentColor ?? '#6bf4ff' } as CSSProperties}>
    <header className="rating-nav"><Link to="/" className="rating-logo" aria-label={t.brandName}><span dir="ltr">GG / SNACKS</span></Link><div className="rating-languages" role="group" aria-label={t.footerLanguage}>{(['en', 'ar'] as const).map(value => <button type="button" key={value} lang={value} aria-pressed={value === language} onClick={() => setLanguage(value)}>{value === 'en' ? 'English' : 'العربية'}</button>)}</div></header>
    <main className="rating-main">
      <div className="rating-panel">
        {!product || !flavor ? <div className="rating-error"><span className="rating-marker" aria-hidden="true">×</span><h1>{t.ratingNotFound}</h1><Link className="rating-home" to="/">{t.ratingBack}</Link></div> : submitted ? <div className="rating-success"><span className="rating-marker" aria-hidden="true">✓</span><h1 ref={success} tabIndex={-1}>{t.ratingSuccess}</h1><p>{t.ratingThanks}</p><p className="rating-note">{t.ratingSaved}</p><Link className="rating-home" to="/">{t.ratingBack}</Link></div> : <>
          <div className="rating-identity"><div className="rating-package"><ProductImage src={getProductImage(product, flavor)} alt={`${product.name} / ${flavor.name[language]}`}><span role="img" aria-label={t.worldPlaceholder}>+</span></ProductImage></div><div><p className="rating-product" dir="ltr">{product.name}</p><p className="rating-flavor">{flavor.name[language]}</p></div></div>
          <form aria-busy={submitting} onSubmit={event => { event.preventDefault(); void handleSubmit() }}>
            <h1 id="rating-question">{t.rateQuestion}</h1>
            <fieldset disabled={submitting} className="rating-options" aria-labelledby="rating-question"><legend className="sr-only">{t.ratingChoose}</legend>{emojis.map((emoji, index) => <label className="rating-choice" key={emoji}><input type="radio" name="snack-rating" value={index + 1} checked={rating === index + 1} onChange={() => setRating(index + 1)} aria-label={t.ratingLabels[index]} /><span className="rating-face" aria-hidden="true">{emoji}</span><span className="rating-label" aria-hidden="true">{t.ratingLabels[index]}</span></label>)}</fieldset>
            <label className="rating-comment-label" htmlFor="rating-comment">{t.rateComment}</label><textarea id="rating-comment" className="rating-comment" rows={4} value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} readOnly={submitting} />
            <p className="rating-note" id="rating-local-note">{t.ratingSubmitNote}</p>
            <p role="status" className="rating-note">{submitting ? t.ratingSubmitting : null}</p>{failed && <p role="alert" className="rating-note">{limited ? t.ratingRateLimited : t.ratingSubmitError}</p>}<button type="submit" className="rating-submit" disabled={rating === null || submitting} aria-describedby="rating-local-note">{submitting ? t.ratingSubmitting : t.rateSubmit}<span aria-hidden="true">+</span></button>
          </form>
        </>}
      </div>
    </main>
  </div>
}
