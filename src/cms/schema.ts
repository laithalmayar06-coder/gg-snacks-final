export type CmsTable = 'products' | 'flavors' | 'stores' | 'site_content' | 'tournament_content' | 'contact_settings'
export type CmsRow = Record<string, string | number | boolean | null>
export interface CmsField { key: string; label: string; type?: 'textarea' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'asset' | 'slug' | 'select' | 'product'; required?: boolean; options?: string[]; min?: number; max?: number; immutable?: boolean }
export interface CmsSection { table: CmsTable; title: string; singleton?: boolean; fields: CmsField[] }
const bilingual = (key: string, label: string, type: CmsField['type'] = 'textarea', required = false): CmsField[] => [
  { key: `${key}_en`, label: `${label} — English`, type, required }, { key: `${key}_ar`, label: `${label} — Arabic`, type, required },
]
const active: CmsField = { key: 'is_active', label: 'Published / active', type: 'boolean' }
const order: CmsField = { key: 'display_order', label: 'Display order (lower first)', type: 'number', min: 0, max: 10000 }
const slug: CmsField = { key: 'slug', label: 'Permanent URL slug', type: 'slug', required: true, immutable: true }
const image: CmsField = { key: 'image_url', label: 'Image URL or /public-asset-path', type: 'asset' }
const accent: CmsField = { key: 'accent', label: 'Accent (#RRGGBB)', required: true }
export const cmsSections: Record<string, CmsSection> = {
  products: { table: 'products', title: 'Products', fields: [slug, ...bilingual('name','Name', undefined, true), ...bilingual('description','Description'), ...bilingual('size','Size', undefined), ...bilingual('ingredients','Ingredients'), ...bilingual('allergens','Allergens'), ...bilingual('nutrition','Nutrition text'), image, accent, active, order] },
  flavors: { table: 'flavors', title: 'Flavors', fields: [{ key: 'product_id', label: 'Product family', type: 'product', required: true, immutable: true }, slug, ...bilingual('name','Name', undefined, true), ...bilingual('description','Description'), image, accent, { key: 'is_placeholder', label: 'Preview flavour (not final)', type: 'boolean' }, active, order] },
  stores: { table: 'stores', title: 'Stores', fields: [...bilingual('name','Store name', undefined, true), ...bilingual('city','City', undefined, true), ...bilingual('district','District', undefined, true), ...bilingual('address','Address'), { key: 'map_url', label: 'Map URL', type: 'url' }, { key: 'online_url', label: 'Online store URL', type: 'url' }, { key: 'latitude', label: 'Latitude (optional)', type: 'number', min: -90, max: 90 }, { key: 'longitude', label: 'Longitude (optional)', type: 'number', min: -180, max: 180 }, active, order] },
  content: { table: 'site_content', title: 'Website Content', fields: [{ key: 'key', label: 'Content section', type: 'select', required: true, options: ['about','story','vision','mission','values','why-1','why-2','why-3','why-4'] }, ...bilingual('title','Heading'), ...bilingual('body','Text'), active, order] },
  tournament: { table: 'tournament_content', title: 'Tournament', singleton: true, fields: [...bilingual('title','Title'), { key: 'registration_date', label: 'Registration opens', type: 'date' }, { key: 'tournament_date', label: 'Tournament date', type: 'date' }, ...bilingual('game','Game'), ...bilingual('prize','Prize'), ...bilingual('description','Description'), ...bilingual('rules','Rules'), ...bilingual('registration','Registration information'), { key: 'stream_url', label: 'Stream URL', type: 'url' }, { key: 'status', label: 'Status', type: 'select', options: ['coming-soon','announced','completed'], required: true }, active] },
  contact: { table: 'contact_settings', title: 'Contact / Social', singleton: true, fields: [{ key: 'email', label: 'Public email', type: 'email' }, { key: 'phone', label: 'Public phone (optional)' }, { key: 'whatsapp', label: 'WhatsApp number (optional)' }, ...['instagram','tiktok','x','youtube'].map(key => ({ key, label: `${key} URL`, type: 'url' as const })), active] },
}
export function newCmsRow(section: CmsSection): CmsRow {
  return Object.fromEntries(section.fields.map(field => [field.key, field.key === 'is_active' ? true : field.type === 'boolean' ? false : field.key === 'display_order' ? 0 : field.key === 'accent' ? '#00cfff' : field.key === 'status' ? 'coming-soon' : '']))
}
export function validCmsUrl(value: string, asset = false): boolean {
  if (!value) return true
  if (asset && /^\/[^/\s][^\s]*$/.test(value) && !value.includes('\\')) return true
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !/\s/.test(value) } catch { return false }
}
export function validateCmsRow(section: CmsSection, row: CmsRow): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of section.fields) {
    const value = String(row[field.key] ?? '').trim()
    if (field.required && !value) errors[field.key] = 'Required.'
    if (value && field.type === 'slug' && (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) || value.length > 80)) errors[field.key] = 'Use lowercase letters, numbers and hyphens (80 characters maximum).'
    if (value && ['url','asset'].includes(field.type ?? '') && !validCmsUrl(value, field.type === 'asset')) errors[field.key] = 'Use a valid http(s) URL or, for images, a local /asset path.'
    if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.key] = 'Enter a valid email.'
    if (field.key === 'accent' && !/^#[\da-f]{6}$/i.test(value)) errors[field.key] = 'Use a six-digit hex colour.'
    if (value && field.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < (field.min ?? -Infinity) || Number(value) > (field.max ?? Infinity) || (field.key === 'display_order' && !Number.isInteger(Number(value))))) errors[field.key] = 'Enter a number within the allowed range.'
    if (field.options && !field.options.includes(value)) errors[field.key] = 'Choose an available option.'
    if (value && field.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) errors[field.key] = 'Choose a valid date.'
    if (value.length > (field.key.startsWith('name_') ? 150 : field.type === 'textarea' ? 10000 : 2000)) errors[field.key] = 'Text is too long.'
  }
  if (row.registration_date && row.tournament_date && row.registration_date > row.tournament_date) errors.tournament_date = 'Tournament date must be on or after registration opens.'
  return errors
}
export function cmsPayload(section: CmsSection, row: CmsRow): CmsRow {
  return Object.fromEntries(section.fields.map(field => {
    const raw = row[field.key]
    const text = String(raw ?? '').trim()
    const value = field.type === 'boolean' ? raw === true : field.type === 'number' ? text === '' ? null : Number(text) : ['url','asset','date'].includes(field.type ?? '') ? text || null : text
    return [field.key, value]
  }))
}
