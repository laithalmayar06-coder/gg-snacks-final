import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { stores as fallbackStores, onlineStores, filterStores } from '../data/stores'
import { safeWebUrl } from '../data/siteLinks'
import { pageCopy } from '../data/publicContent'
import { findGGCopy } from '../data/findGG'
import { heroPreviewAssets, heroPreviewLogo } from '../data/heroPreview'
import { useCms } from '../cms/CmsProvider'
import { localized, textValue } from '../cms/publicCatalog'
import StoreFinderMap from './StoreFinderMap'
import '../styles/find-gg.css'

const foregroundPack = heroPreviewAssets.find(asset => asset.id === 'trigger')
const iconPaths = {
  pin: 'M12 21s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  district: 'M4 21V8h6v13M10 21V3h7v18M17 21V11h4v10M1 21h22M6 11h2m-2 4h2m4-9h3m-3 4h3m-3 4h3',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.5-2 6 6',
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15',
} as const

function FinderIcon({ kind }: { kind: keyof typeof iconPaths }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={iconPaths[kind]} /></svg>
}

export default function StoreFinder({ standalone = false }: { standalone?: boolean }) {
  const managedStores = useCms().stores
  const stores = managedStores ? managedStores.map(row => ({
    id: String(row.id), name: localized(row, 'name')!, city: localized(row, 'city')!, district: localized(row, 'district')!,
    address: localized(row, 'address'), onlineUrl: textValue(row,'online_url') || null, mapUrl: textValue(row,'map_url') || null,
    latitude: typeof row.latitude === 'number' ? row.latitude : null, longitude: typeof row.longitude === 'number' ? row.longitude : null, isPlaceholder: false,
  })) : fallbackStores.filter(store => !store.isPlaceholder)
  const { language } = useLanguage()
  const c = pageCopy[language]
  const copy = findGGCopy[language]
  const fieldId = useId()
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [applied, setApplied] = useState({ city: '', district: '' })
  const cities = [...new Map(stores.map(store => [store.city.en, store.city])).values()]
  const districts = [...new Map(filterStores(stores, city, '').map(store => [store.district.en, store.district])).values()]
  const results = filterStores(stores, applied.city, applied.district)
  const submit = (event: FormEvent) => { event.preventDefault(); setApplied({ city, district }) }
  const Heading = standalone ? 'h1' : 'h2'
  const ResultsHeading = standalone ? 'h2' : 'h3'

  return <section id="find-gg" className="find-gg-showcase" aria-labelledby={fieldId + '-title'}>
    <div className="find-gg-layout">
      <div className="find-gg-controls">
        <p className="find-gg-kicker">{copy.label}</p>
        <Heading id={fieldId + '-title'} className="find-gg-title">{copy.headline.map(line => <span key={line}>{line}</span>)}</Heading>
        <p className="find-gg-intro">{copy.intro}</p>
        <form className="find-gg-form" onSubmit={submit}>
          <div className="find-gg-field">
            <label htmlFor={fieldId + '-city'}>{c.city}</label>
            <div className="find-gg-select-wrap">
              <FinderIcon kind="pin" />
              <select id={fieldId + '-city'} value={city} onChange={e => { setCity(e.target.value); setDistrict('') }}>
                <option value="">{c.allCities}</option>
                {cities.map(item => <option key={item.en} value={item.en}>{item[language]}</option>)}
              </select>
            </div>
          </div>
          <div className="find-gg-field">
            <label htmlFor={fieldId + '-district'}>{c.district}</label>
            <div className="find-gg-select-wrap">
              <FinderIcon kind="district" />
              <select id={fieldId + '-district'} value={district} onChange={e => setDistrict(e.target.value)}>
                <option value="">{c.allDistricts}</option>
                {districts.map(item => <option key={item.en} value={item.en}>{item[language]}</option>)}
              </select>
            </div>
          </div>
          <button className="find-gg-search" type="submit"><FinderIcon kind="search" />{c.search}</button>
        </form>
        <ul className="find-gg-details">
          <li><FinderIcon kind="pin" /><span>{c.city}</span></li>
          <li><FinderIcon kind="district" /><span>{c.district}</span></li>
          <li><FinderIcon kind="map" /><span>{copy.directions}</span></li>
        </ul>
        <div className="find-gg-signature">
          <img src={heroPreviewLogo} alt="" width="355" height="426" loading="lazy" decoding="async" />
          <span>{copy.brand}</span>
        </div>
        {!standalone && <Link className="find-gg-directory-link" to="/find-gg">{copy.allStores}<span aria-hidden="true">{language === 'ar' ? '↖' : '↗'}</span></Link>}
      </div>

      <StoreFinderMap stores={results} />

      <div className="find-gg-right">
        <section className="find-gg-results-panel" aria-labelledby={fieldId + '-results'}>
          <div className="find-gg-results-top"><ResultsHeading id={fieldId + '-results'}>{copy.nearby}</ResultsHeading><FinderIcon kind="map" /></div>
          <p className="find-gg-results-note">{copy.listNote}</p>
          <p className="find-gg-count" role="status" aria-live="polite">{c.results}: {results.length}</p>
          {!results.length ? <p className="find-gg-empty">{stores.length ? c.empty : copy.noListings}</p> : <ul className="find-gg-results">
            {results.map(store => {
              const online = safeWebUrl(store.onlineUrl)
              const map = safeWebUrl(store.mapUrl)
              return <li className="find-gg-store" key={store.id}>
                <FinderIcon kind="pin" />
                <div className="find-gg-store-info">
                  <h3>{store.name[language]}</h3>
                  <p>{store.city[language]} / {store.district[language]}</p>
                  {store.address && <p>{store.address[language]}</p>}
                  <div className="find-gg-store-links">{online && <a href={online}>{c.online}</a>}{map && <a href={map}>{c.map}</a>}</div>
                </div>
              </li>
            })}
          </ul>}
          {onlineStores.some(store => safeWebUrl(store.url)) && <section className="find-gg-online"><h3>{c.onlineTitle}</h3>{onlineStores.map(store => {
            const href = safeWebUrl(store.url)
            return href ? <a key={store.id} href={href}>{store.name[language]}</a> : null
          })}</section>}
        </section>
        {foregroundPack && <div className="find-gg-pack-accent" aria-hidden="true">
          <span className="find-gg-pack-plinth" />
          <img src={foregroundPack.src} alt="" width={foregroundPack.width} height={foregroundPack.height} loading="lazy" decoding="async" />
        </div>}
      </div>
    </div>
  </section>
}
