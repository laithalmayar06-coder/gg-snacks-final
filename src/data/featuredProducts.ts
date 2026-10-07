import type { Language } from '../i18n/translations'

// Presentation labels match the supplied packs; catalog routes remain unchanged.
export const featuredProductDetails: Record<string, {
  accent: string
  flavor: Record<Language, string>
}> = {
  'pop-g': {
    accent: '#36baff',
    flavor: { en: 'WHITE CHEESE', ar: 'جبنة بيضاء' },
  },
  trigger: {
    accent: '#f49232',
    flavor: { en: 'TACO', ar: 'تاكو' },
  },
  loots: {
    accent: '#e52d43',
    flavor: { en: 'CORN HOT', ar: 'ذرة حارة' },
  },
  'x-stix': {
    accent: '#a3cc22',
    flavor: { en: 'SOUR CREAM & ONION', ar: 'قشطة حامضة وبصل' },
  },
}

export const featuredProductCopy = {
  en: { viewProduct: 'VIEW PRODUCT' },
  ar: { viewProduct: 'استعرض المنتج' },
} as const
