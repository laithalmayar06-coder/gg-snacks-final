import { useState, type FormEvent } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { stores as fallbackStores, onlineStores, filterStores } from '../data/stores'
import { safeWebUrl } from '../data/siteLinks'
import { pageCopy } from '../data/publicContent'
import { visualCopy } from '../data/visualCopy'
import { useCms } from '../cms/CmsProvider'
import { localized, textValue } from '../cms/publicCatalog'

export default function StoreFinder() {
  const managedStores = useCms().stores
  const stores = managedStores ? managedStores.map(row => ({
    id: String(row.id), name: localized(row, 'name')!, city: localized(row, 'city')!, district: localized(row, 'district')!,
    address: localized(row, 'address'), onlineUrl: textValue(row,'online_url') || null, mapUrl: textValue(row,'map_url') || null,
    latitude: typeof row.latitude === 'number' ? row.latitude : null, longitude: typeof row.longitude === 'number' ? row.longitude : null, isPlaceholder: false,
  })) : fallbackStores
  const { language } = useLanguage()
  const c = pageCopy[language]
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [applied, setApplied] = useState({ city: '', district: '' })
  const cities = [...new Map(stores.map(store => [store.city.en, store.city])).values()]
  const districts = [...new Map(filterStores(stores, city, '').map(store => [store.district.en, store.district])).values()]
  const results = filterStores(stores, applied.city, applied.district)
  const submit = (event: FormEvent) => { event.preventDefault(); setApplied({ city, district }) }
  return <div className="finder-layout">
    <div><p className="public-notice">{stores.some(store => store.isPlaceholder) ? c.sampleStores : null}</p>
      <form className="public-form gg-card" onSubmit={submit}>
        <div className="public-field"><label htmlFor="store-city">{c.city}</label><select id="store-city" value={city} onChange={e => { setCity(e.target.value); setDistrict('') }}><option value="">{c.allCities}</option>{cities.map(item => <option key={item.en} value={item.en}>{item[language]}</option>)}</select></div>
        <div className="public-field"><label htmlFor="store-district">{c.district}</label><select id="store-district" value={district} onChange={e => setDistrict(e.target.value)}><option value="">{c.allDistricts}</option>{districts.map(item => <option key={item.en} value={item.en}>{item[language]}</option>)}</select></div>
        <button className="gg-button gg-button-primary" type="submit">{c.search}</button>
      </form>
      <div className="finder-map gg-abstract-map" role="img" aria-label={visualCopy[language].map}><span className="gg-map-pin" aria-hidden="true">⌖</span></div>
    </div>
    <section aria-labelledby="store-results"><h2 id="store-results">{c.results}</h2><p role="status" aria-live="polite">{c.results}: {results.length}</p>
      {!results.length ? <p className="public-notice">{c.empty}</p> : <ul className="finder-results">{results.map(store => {
        const online = safeWebUrl(store.onlineUrl)
        const map = safeWebUrl(store.mapUrl)
        return <li className="gg-card" key={store.id}>{store.isPlaceholder && <span className="gg-badge">{c.sample}</span>}<h3>{store.name[language]}</h3><p>{store.city[language]} / {store.district[language]}</p>{store.address && <p>{store.address[language]}</p>}<div className="store-links">{online && <a href={online}>{c.online}</a>}{map && <a href={map}>{c.map}</a>}</div></li>
      })}</ul>}
      {onlineStores.some(store => safeWebUrl(store.url)) && <section><h3>{c.onlineTitle}</h3>{onlineStores.map(store => { const href = safeWebUrl(store.url); return href ? <a key={store.id} href={href}>{store.name[language]}</a> : null })}</section>}
    </section>
  </div>
}
