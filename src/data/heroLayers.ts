// Paths intentionally preserve the supplied filenames. The real logo stays in heroPreview.ts.
export const heroLayers = [
  { id: 'crumbs', src: '/hero/crumbs.png', width: 1254, height: 1254 },
  { id: 'controller', src: '/hero/controller.png', width: 1774, height: 887 },
  { id: 'chip-one', src: '/hero/chip 1.png', width: 1254, height: 1254 },
  { id: 'chip-two', src: '/hero/chip 2.png', width: 1254, height: 1254 },
  { id: 'popcorn-one', src: '/hero/popcorn 1.png', width: 1254, height: 1254 },
  { id: 'popcorn-two', src: '/hero/pop corn2.png', width: 1254, height: 1254 },
] as const

export const heroContent = {
  en: {
    headline: ['SNACKS', 'BUILT FOR', 'GAMERS'],
    copy: ['Bold flavor. Next-level crunch.', 'Made for your kind of play.'],
    cta: 'EXPLORE THE PRODUCTS',
  },
  ar: {
    headline: ['سناكات', 'صُنعت من أجل', 'اللاعبين'],
    copy: ['نكهة جريئة. قرمشة بمستوى جديد.', 'صُنعت لأسلوبك في اللعب.'],
    cta: 'استكشف المنتجات',
  },
}
