import { useMemo } from 'react'
import { productFamilies, getFlavor, ratingPath, type ProductFamily, type LocalizedText } from '../data/products'
import { useCms, type CmsTables } from './CmsProvider'
import type { CmsRow } from './schema'
import type { Language } from '../i18n/translations'
import { validCmsUrl } from './schema'
export type ManagedFamily = Omit<ProductFamily, 'flavors'> & { flavors: (ProductFamily['flavors'][number] & { description?: LocalizedText | null })[] } & { localizedName?: LocalizedText; allergens?: LocalizedText | null; isActive?: boolean }
export const textValue = (row: CmsRow | undefined, key: string): string => typeof row?.[key] === 'string' ? row[key] as string : ''
export const localized = (row: CmsRow | undefined, key: string): LocalizedText | null => {
  const en = textValue(row, `${key}_en`), ar = textValue(row, `${key}_ar`)
  return en || ar ? { en: en || ar, ar: ar || en } : null
}
const image = (row: CmsRow) => { const value = textValue(row, 'image_url'); return value && validCmsUrl(value, true) ? value : null }
export function buildCatalog(tables: CmsTables): ManagedFamily[] {
  if (!tables.products || !tables.flavors) return productFamilies
  const flavors = tables.flavors
  return tables.products.map(row => {
    const slug = textValue(row, 'slug')
    const legacy = productFamilies.find(product => product.slug === slug)
    const nutrition = localized(row, 'nutrition')
    return {
      id: String(row.id), slug, name: textValue(row, 'name_en'), localizedName: localized(row, 'name') ?? undefined,
      shortDescription: localized(row, 'description'), longDescription: localized(row, 'description'),
      accentColor: textValue(row, 'accent') || '#00cfff', image: image(row), packageSize: localized(row, 'size'),
      ingredients: localized(row, 'ingredients'), allergens: localized(row, 'allergens'),
      nutrition: nutrition ? { basis: nutrition, entries: [] } : null,
      isActive: row.is_active === true,
      flavors: flavors.filter(flavor => flavor.product_id === row.id).map(flavor => ({
        id: String(flavor.id), slug: textValue(flavor,'slug'), name: localized(flavor, 'name') ?? { en: '', ar: '' },
        shortName: null, accentColor: textValue(flavor,'accent') || '#00cfff', image: image(flavor),
        ratingPath: ratingPath(slug, textValue(flavor,'slug')), isActive: flavor.is_active === true,
        isPlaceholder: flavor.is_placeholder === true,
        description: localized(flavor,'description'),
      })),
      // If a legacy flavor is absent from a future CMS migration, its printed route still uses static rating data.
      legacy: Boolean(legacy),
    }
  })
}
export function useCatalog() {
  const tables = useCms()
  return useMemo(() => buildCatalog(tables), [tables.products, tables.flavors])
}
export function canRate(productSlug: string, flavorSlug: string) { return Boolean(getFlavor(productSlug, flavorSlug)) }
export function cmsText(tables: CmsTables, key: string, part: 'title' | 'body', language: Language): string | undefined {
  const row = tables.site_content?.find(item => item.key === key && item.is_active === true)
  return localized(row, part)?.[language] || undefined
}
