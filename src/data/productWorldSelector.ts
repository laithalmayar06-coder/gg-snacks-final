// Presentation data belongs only to the homepage selector; catalog/rating data is unchanged.
export const worldSelectorCopy = {
  en: { eyebrow: '01 / PRODUCT WORLDS', heading: ['CHOOSE YOUR', 'WORLD'], explore: 'EXPLORE', previous: 'Previous product world', next: 'Next product world', pause: 'Pause rotation', play: 'Resume rotation', selectors: 'Choose a product world', selected: 'SELECTED', loading: 'Preparing your world…', error: 'This world could not load. Select it again to retry.', carousel: 'carousel' },
  ar: { eyebrow: '01 / عوالم المنتجات', heading: ['اختر', 'عالمك'], explore: 'استكشف', previous: 'عالم المنتج السابق', next: 'عالم المنتج التالي', pause: 'إيقاف التبديل التلقائي', play: 'استئناف التبديل التلقائي', selectors: 'اختر عالم المنتج', selected: 'محدد', loading: 'جارٍ تجهيز عالمك…', error: 'تعذّر تحميل هذا العالم. اختره مجددًا للمحاولة.', carousel: 'عارض منتجات' },
} as const

export const worldCoreAssets = {
  background: '/product-world/core/world-bg.png',
  hologram: '/product-world/core/hologram-neutral.png',
}

export const productWorldThemes = [
  { id: 'pop-g', name: 'POP-G', accent: '#32d5ff', secondary: '#2576ed', hue: '140deg',
    description: { en: 'Discover the POP-G side of the GG universe.', ar: 'اكتشف جانب POP-G من عالم GG.' },
    food: [{ file: 'popcorn-main.png', slot: 'main', width: 1242, height: 1266 }, { file: 'popcorn-scatter.png', slot: 'scatter', width: 1122, height: 1402 }] },
  { id: 'trigger', name: 'TRIGGER', accent: '#ffaa45', secondary: '#f46b23', hue: '350deg',
    description: { en: 'Bold crunch. High-energy flavour.', ar: 'قرمشة جريئة. نكهة مفعمة بالحيوية.' },
    food: [{ file: 'sticks-main.png', slot: 'main', width: 1254, height: 1254 }, { file: 'sticks-scatter.png', slot: 'scatter', width: 1254, height: 1254 }, { file: 'chili.png', slot: 'detail', width: 1254, height: 1254 }, { file: 'crumbs.png', slot: 'crumbs', width: 1254, height: 1254 }] },
  { id: 'loots', name: 'LOOTS', accent: '#ff526c', secondary: '#c92142', hue: '310deg',
    description: { en: 'Unlock bold flavour with every bite.', ar: 'اكتشف نكهة جريئة مع كل قضمة.' },
    food: [{ file: 'corn-main.png', slot: 'main', width: 1254, height: 1254 }, { file: 'corn-scatter.png', slot: 'scatter', width: 1254, height: 1254 }, { file: 'chili.png', slot: 'detail', width: 1254, height: 1254 }, { file: 'crumbs.png', slot: 'crumbs', width: 1254, height: 1254 }] },
  { id: 'x-stix', name: 'X-STIX', accent: '#a5ec69', secondary: '#9262dc', hue: '55deg',
    description: { en: 'Crunchy baked sticks made for the game.', ar: 'أصابع مخبوزة مقرمشة صُنعت للعب.' },
    food: [{ file: 'sticks-main.png', slot: 'main', width: 1536, height: 1024 }, { file: 'sticks-scatter.png', slot: 'scatter', width: 1254, height: 1254 }, { file: 'onion.png', slot: 'detail', width: 1254, height: 1254 }, { file: 'crumbs.png', slot: 'crumbs', width: 1254, height: 1254 }] },
].map(world => ({ ...world, href: `/products/${world.id}`, pack: `/product-world/${world.id}/pack.png`,
  food: world.food.map(food => ({ ...food, src: `/product-world/${world.id}/${food.file}` })),
}))

export type ProductWorldTheme = typeof productWorldThemes[number]
export const WORLD_ROTATION_MS = 5800