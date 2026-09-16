import type { SiteText } from './siteContent'
export interface Store {
  id: string; name: SiteText; city: SiteText; district: SiteText; address: SiteText | null
  onlineUrl: string | null; mapUrl: string | null; latitude: number | null; longitude: number | null; isPlaceholder: boolean
}
// Demo records are never represented as real stockists. Replace with confirmed records.
export const stores: Store[] = [
  { id: 'demo-1', name: { en: 'Sample store A', ar: 'متجر نموذجي أ' }, city: { en: 'Jeddah', ar: 'جدة' }, district: { en: 'Sample district A', ar: 'حي نموذجي أ' }, address: null, onlineUrl: null, mapUrl: null, latitude: null, longitude: null, isPlaceholder: true },
  { id: 'demo-2', name: { en: 'Sample store B', ar: 'متجر نموذجي ب' }, city: { en: 'Jeddah', ar: 'جدة' }, district: { en: 'Sample district B', ar: 'حي نموذجي ب' }, address: null, onlineUrl: null, mapUrl: null, latitude: null, longitude: null, isPlaceholder: true },
  { id: 'demo-3', name: { en: 'Sample store C', ar: 'متجر نموذجي ج' }, city: { en: 'Riyadh', ar: 'الرياض' }, district: { en: 'Sample district A', ar: 'حي نموذجي أ' }, address: null, onlineUrl: null, mapUrl: null, latitude: null, longitude: null, isPlaceholder: true },
]
export const onlineStores: { id: string; name: SiteText; url: string }[] = []
export function filterStores(records: Store[], city: string, district: string) {
  return records.filter(store => (!city || store.city.en === city) && (!district || store.district.en === district))
}
