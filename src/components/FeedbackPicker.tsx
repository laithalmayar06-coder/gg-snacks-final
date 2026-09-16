import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { productFamilies, getProduct, getActiveFlavors } from '../data/products'
import { feedbackDestination } from '../data/feedback'
import { pageCopy } from '../data/publicContent'

export default function FeedbackPicker() {
  const { language } = useLanguage()
  const c = pageCopy[language]
  const [family, setFamily] = useState('')
  const [flavour, setFlavour] = useState('')
  const navigate = useNavigate()
  const product = getProduct(family)
  const flavours = product ? getActiveFlavors(product) : []
  const destination = feedbackDestination(family, flavour)
  const submit = (event: FormEvent) => { event.preventDefault(); if (destination) navigate(destination) }
  return <form className="public-form gg-card feedback-picker" onSubmit={submit}>
    <p className="gg-body">{c.feedbackIntro}</p>
    <div className="public-field"><label htmlFor="feedback-family">{c.family}</label><select id="feedback-family" value={family} required onChange={e => { setFamily(e.target.value); setFlavour('') }}><option value="">{c.choose}</option>{productFamilies.map(item => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></div>
    <div className="public-field"><label htmlFor="feedback-flavour">{c.flavour}</label><select id="feedback-flavour" required value={flavour} disabled={!flavours.length} onChange={e => setFlavour(e.target.value)}><option value="">{c.choose}</option>{flavours.map(item => <option key={item.id} value={item.slug}>{item.name[language]}</option>)}</select></div>
    <p className="public-notice" role="status">{product && !flavours.length ? c.noFlavours : flavours.some(item => item.isPlaceholder) ? c.previewFlavours : ''}</p>
    <button className="gg-button gg-button-primary" type="submit" disabled={!destination}>{c.continue}<span aria-hidden="true">↗</span></button>
  </form>
}
