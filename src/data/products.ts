import type { Language } from '../i18n/translations'

export type LocalizedText = Record<Language, string>
export interface NutritionEntry { label: LocalizedText; value: LocalizedText }
export interface Nutrition { basis: LocalizedText; entries: NutritionEntry[] }
export interface Flavor {
  id: string
  slug: string
  name: LocalizedText
  shortName: LocalizedText | null
  accentColor: string
  image: string | null
  ratingPath: string
  isActive: boolean
  isPlaceholder: boolean
}
export interface ProductFamily {
  id: string
  slug: string
  name: string
  shortDescription: LocalizedText | null
  longDescription: LocalizedText | null
  accentColor: string
  image: string | null
  packageSize: LocalizedText | null
  ingredients: LocalizedText | null
  nutrition: Nutrition | null
  flavors: Flavor[]
}

// Unconfirmed families retain preview slots; confirmed flavors keep their existing IDs and URL slugs.
type FlavorInput = Omit<Flavor, 'ratingPath'>
type ProductInput = Omit<ProductFamily, 'flavors'> & { flavors: FlavorInput[] }

export function ratingPath(productSlug: string, flavorSlug: string): string {
  return `/rate/${encodeURIComponent(productSlug)}/${encodeURIComponent(flavorSlug)}`
}

export function defineProducts(products: ProductInput[]): ProductFamily[] {
  return products.map(product => ({ ...product, flavors: product.flavors.map(flavor => ({ ...flavor, ratingPath: ratingPath(product.slug, flavor.slug) })) }))
}

function previewFlavors(family: string, colors: string[]): FlavorInput[] {
  return colors.map((accentColor, index) => ({
    id: `${family}-preview-${index + 1}`, slug: `flavor-${index + 1}`,
    name: { en: `Flavor ${String(index + 1).padStart(2, '0')}`, ar: `النكهة ${String(index + 1).padStart(2, '0')}` },
    accentColor, image: null, shortName: null, isActive: true, isPlaceholder: true,
  }))
}

const popGFlavors: FlavorInput[] = [
  { id: 'pop-g-preview-1', slug: 'flavor-1', name: { en: 'White Cheese', ar: 'جبنة بيضاء' },
    accentColor: '#c2ee70', image: null, shortName: null, isActive: true, isPlaceholder: false },
  { id: 'pop-g-preview-2', slug: 'flavor-2', name: { en: 'Sour Cream & Onion', ar: 'كريمة حامضة وبصل' },
    accentColor: '#d6ef86', image: null, shortName: null, isActive: true, isPlaceholder: false },
  { id: 'pop-g-preview-3', slug: 'flavor-3', name: { en: 'Hot & Sweet', ar: 'حار وحلو' },
    accentColor: '#aee58b', image: null, shortName: null, isActive: true, isPlaceholder: false },
]

const triggerFlavors: FlavorInput[] = [
  { id: 'trigger-preview-1', slug: 'flavor-1', name: { en: 'Chicken Noodles', ar: 'نودلز الدجاج' },
    accentColor: '#ffb15f', image: null, shortName: null, isActive: true, isPlaceholder: false },
  { id: 'trigger-preview-2', slug: 'flavor-2', name: { en: 'Vegetable Noodles', ar: 'نودلز الخضار' },
    accentColor: '#ffc779', image: null, shortName: null, isActive: true, isPlaceholder: false },
  { id: 'trigger-preview-3', slug: 'flavor-3', name: { en: 'Taco', ar: 'تاكو' },
    accentColor: '#ffa77d', image: null, shortName: null, isActive: true, isPlaceholder: false },
  { id: 'trigger-preview-4', slug: 'flavor-4', name: { en: 'Sushi', ar: 'سوشي' },
    accentColor: '#ffb15f', image: null, shortName: null, isActive: true, isPlaceholder: false },
]

const unknownDetails = { shortDescription: null, longDescription: null, image: null, packageSize: null, ingredients: null, nutrition: null }

// Edit these entries with confirmed data. Override unknownDetails below each spread.
// Replace previewFlavors(...) with any number of explicit FlavorInput objects.
export const productFamilies = defineProducts([
  { ...unknownDetails, id: 'loots', slug: 'loots', name: 'LOOTS', accentColor: '#6bf4ff', flavors: previewFlavors('loots', ['#6bf4ff', '#72d7ff', '#91e8ff']) },
  { ...unknownDetails, id: 'trigger', slug: 'trigger', name: 'TRIGGER', accentColor: '#ffb15f', flavors: triggerFlavors },
  { ...unknownDetails, id: 'x-stix', slug: 'x-stix', name: 'X-STIX', accentColor: '#df99ff', flavors: previewFlavors('x-stix', ['#df99ff', '#c9a3ff', '#efa2e8']) },
  { ...unknownDetails, id: 'pop-g', slug: 'pop-g', name: 'POP-G', accentColor: '#c2ee70', flavors: popGFlavors },
])

export const getProduct = (slug?: string) => productFamilies.find(product => product.slug === slug)
export const getFlavor = (productSlug?: string, flavorSlug?: string) => getProduct(productSlug)?.flavors.find(flavor => flavor.slug === flavorSlug)
export const getActiveFlavors = (product: ProductFamily) => product.flavors.filter(flavor => flavor.isActive)
export const getProductName = (slug: string) => getProduct(slug)?.name ?? slug
export const getFlavorName = (productSlug: string, flavorSlug: string, language: Language = 'en') => getFlavor(productSlug, flavorSlug)?.name[language] ?? flavorSlug
export const getProductImage = (product: ProductFamily, flavor?: Flavor) => flavor?.image ?? product.image
