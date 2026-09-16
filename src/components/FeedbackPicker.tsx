import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { getActiveFlavors } from '../data/products'
import { useCatalog, canRate } from '../cms/publicCatalog'
import { feedbackDestination } from '../data/feedback'
import { pageCopy } from '../data/publicContent'

export default function FeedbackPicker() {
  const { language } = useLanguage()
  const c = pageCopy[language]
  const productFamilies = useCatalog().filter(product => product.isActive !== false && product.flavors.some(flavor => flavor.isActive && canRate(product.slug, flavor.slug)))
  const [family, setFamily] = useState('')
  const [flavour, setFlavour] = useState('')
  const navigate = useNavigate()
  const product = productFamilies.find(item => item.slug === family)
  const flavours = product ? getActiveFlavors(product).filter(item => canRate(product.slug, item.slug)) : []
  const destination = flavours.some(item => item.slug === flavour) ? feedbackDestination(family, flavour) : null
  const submit = (event: FormEvent) => { event.preventDefault(); if (destination) navigate(destination) }
  return <form className="public-form gg-card feedback-picker" onSubmit={submit}>
    <p className="gg-body">{c.feedbackIntro}</p>
    <div className="public-field"><label htmlFor="feedback-family">{c.family}</label><select id="feedback-family" value={family} required onChange={e => { setFamily(e.target.value); setFlavour('') }}><option value="">{c.choose}</option>{productFamilies.map(item => <option key={item.id} value={item.slug}>{item.localizedName?.[language] ?? item.name}</option>)}</select></div>
    <div className="public-field"><label htmlFor="feedback-flavour">{c.flavour}</label><select id="feedback-flavour" required value={flavour} disabled={!flavours.length} onChange={e => setFlavour(e.target.value)}><option value="">{c.choose}</option>{flavours.map(item => <option key={item.id} value={item.slug}>{item.name[language]}</option>)}</select></div>
    <p className="public-notice" role="status">{product && !flavours.length ? c.noFlavours : flavours.some(item => item.isPlaceholder) ? c.previewFlavours : ''}</p>
    <button className="gg-button gg-button-primary" type="submit" disabled={!destination}>{c.continue}<span aria-hidden="true">↗</span></button>
  </form>
}
