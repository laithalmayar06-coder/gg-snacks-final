import { useId } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { findGGCopy } from '../data/findGG'
import type { Store } from '../data/stores'

type LocatedStore = Store & { latitude: number; longitude: number }

// This is a schematic, not a basemap or distance calculation. No invented store positions.
function schematicPins(stores: Store[]) {
  const located = stores.filter((store): store is LocatedStore =>
    !store.isPlaceholder &&
    (store.city.en.trim().toLowerCase() === 'jeddah' || store.city.ar.trim() === 'جدة') &&
    typeof store.latitude === 'number' && Number.isFinite(store.latitude) && Math.abs(store.latitude) <= 90 &&
    typeof store.longitude === 'number' && Number.isFinite(store.longitude) && Math.abs(store.longitude) <= 180,
  )
  if (!located.length) return []
  const latitudes = located.map(store => store.latitude)
  const longitudes = located.map(store => store.longitude)
  const north = Math.max(...latitudes), south = Math.min(...latitudes)
  const east = Math.max(...longitudes), west = Math.min(...longitudes)
  const latitudeSpan = Math.max(north - south, .08)
  const longitudeSpan = Math.max(east - west, .05)

  return located.map(store => ({
    store,
    x: 445 + ((store.longitude - (east + west) / 2) / longitudeSpan) * 230,
    y: 350 - ((store.latitude - (north + south) / 2) / latitudeSpan) * 440,
  }))
}

const coastline = 'M173-20 182 13 174 33 197 58 194 76 216 102 210 121 231 142 225 158 241 184 230 210 251 232 246 250 270 274 260 303 280 325 274 345 294 366 286 390 309 413 300 433 320 461 309 486 335 506 326 530 347 555 338 575 359 601 350 624 373 650 364 681 390 713 386 750'
const mainRoads = [
  'M267-30 289 100 337 242 373 355 429 502 474 660 510 770',
  'M383-30 409 109 444 224 467 359 522 491 551 628 586 770',
  'M545-20 530 109 565 250 604 369 638 517 680 717',
  'M185 123 324 147 443 129 618 83',
  'M237 257 352 286 489 261 680 207',
  'M288 393 419 406 550 373 711 317',
  'M336 538 465 532 596 481 717 451',
  'M376 671 524 660 650 602 736 584',
]

export default function StoreFinderMap({ stores }: { stores: Store[] }) {
  const { language } = useLanguage()
  const copy = findGGCopy[language]
  const id = 'gg-finder-' + useId().replace(/:/g, '')
  const fill = (name: string) => 'url(#' + id + '-' + name + ')'
  const pins = schematicPins(stores)

  return <figure className="find-gg-map">
    <svg className="find-gg-map-art" viewBox="0 0 700 740" role="img" aria-labelledby={id + '-title'} focusable="false">
      <title id={id + '-title'}>{copy.mapTitle}</title>
      <defs>
        <linearGradient id={id + '-sea'} x1="0" y1="0" x2="1" y2=".3"><stop stopColor="#050b20" /><stop offset=".7" stopColor="#071b3d" /><stop offset="1" stopColor="#07516a" /></linearGradient>
        <linearGradient id={id + '-land'}><stop stopColor="#0b2437" /><stop offset=".3" stopColor="#0d1a31" /><stop offset="1" stopColor="#100e28" /></linearGradient>
        <linearGradient id={id + '-road'}><stop stopColor="#32dfff" /><stop offset=".52" stopColor="#5b9cfc" /><stop offset="1" stopColor="#ae64ff" /></linearGradient>
        <radialGradient id={id + '-halo'}><stop stopColor="#36ddff" stopOpacity=".28" /><stop offset="1" stopColor="#36ddff" stopOpacity="0" /></radialGradient>
        <pattern id={id + '-blocks'} width="53" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)">
          <rect width="39" height="33" x="5" y="6" fill="#53659009" stroke="#7a8ba220" strokeWidth=".7" />
          <path d="M17 6v33M31 6v33M5 16h39M5 28h39" stroke="#8a9cb014" strokeWidth=".5" />
          <path d="M0 46h53M51 0v48" stroke="#5169853d" strokeWidth=".8" />
        </pattern>
        <clipPath id={id + '-coast-clip'}><path d={coastline + 'H740V-20Z'} /></clipPath>
      </defs>
      <rect width="700" height="740" fill={fill('sea')} />
      <g opacity=".12" stroke="#3e8eba" fill="none">
        <path d="M118-10Q270 225 228 383T333 750" /><path d="M95-10Q247 225 205 383T310 750" /><path d="M71-10Q223 225 181 383T286 750" />
        <path d="M48-10Q200 225 158 383T263 750" />
      </g>
      <path d={coastline + 'H740V-20Z'} fill={fill('land')} />
      <g clipPath={fill('coast-clip')}>
        <rect x="150" width="590" height="740" fill={fill('blocks')} />
        <g stroke="#46678366" strokeWidth="1" fill="none">
          <path d="m229 0 33 121 24 26 33 126 44 134 46 124 40 156m-46-687 41 121 19 90 49 168 36 109 47 193M610 0l-13 100 39 165 36 106 29 113" />
          <path d="m193 74 127 23 139-16 183-46M224 189l135 20 135-12 191-58M268 332l122 15 135-21 191-60M304 471l134 3 131-34 171-65M350 605l123-4 127-40 133-54" />
        </g>
        <g fill="none" stroke={fill('road')} strokeWidth="1.7" className="find-gg-map-roads">
          {mainRoads.map(path => <path d={path} key={path} />)}
        </g>
        <g fill="#7da4cf" opacity=".22">
          <rect x="319" y="180" width="15" height="24" transform="rotate(-15 319 180)" />
          <rect x="477" y="309" width="21" height="14" transform="rotate(-15 477 309)" />
          <rect x="387" y="467" width="13" height="24" transform="rotate(-15 387 467)" />
          <rect x="595" y="548" width="23" height="14" transform="rotate(-15 595 548)" />
        </g>
      </g>
      <path d={coastline} fill="none" stroke="#32bada" strokeWidth="12" opacity=".1" />
      <path d={coastline} fill="none" stroke="#5edafa" strokeWidth="1.6" className="find-gg-coast-glow" />
      <text className="find-gg-map-city" x="408" y="340" textAnchor="middle" direction={language === 'ar' ? 'rtl' : 'ltr'}>{copy.jeddah}</text>
      <text className="find-gg-map-sea" x="132" y="370" textAnchor="middle" direction={language === 'ar' ? 'rtl' : 'ltr'}>{copy.sea}</text>
      {pins.map(({ store, x, y }) => <g key={store.id} transform={'translate(' + x + ' ' + y + ')'} className="find-gg-map-pin">
        <title>{store.name[language] + ' / ' + store.district[language]}</title>
        <circle r="34" fill={fill('halo')} />
        <ellipse cy="9" rx="15" ry="4" fill="#60e8ff26" stroke="#64e6ff44" />
        <path d="M0 6s-10-12-10-19a10 10 0 1 1 20 0C10-6 0 6 0 6Z" fill="#65e9ff" />
        <circle cy="-13" r="4" fill="#0a2442" />
      </g>)}
    </svg>
    <figcaption>{copy.mapNote}</figcaption>
  </figure>
}
