// Paths intentionally preserve the supplied filenames. The real logo stays in heroPreview.ts.
export const heroLayers = [
  { id: 'crumbs', src: '/hero/crumbs.png', width: 1254, height: 1254 },
  { id: 'controller', src: '/hero/controller.png', width: 1774, height: 887 },
  { id: 'chip-one', src: '/hero/chip 1.png', width: 1254, height: 1254 },
  { id: 'chip-two', src: '/hero/chip 2.png', width: 1254, height: 1254 },
  { id: 'popcorn-one', src: '/hero/popcorn 1.png', width: 1254, height: 1254 },
  { id: 'popcorn-two', src: '/hero/pop corn2.png', width: 1254, height: 1254 },
] as const

// Background stays at native resolution: mobile crops a full-height 16:9 environment.
export const heroBackground = '/hero/web/environment-1672.webp'
export const HERO_MOBILE_MEDIA = '(max-width: 767px)'
// An embedded, transparent pixel makes the mobile picture selection network-free.
// The desktop img and every GSAP wrapper stay mounted; resizing reselects its source natively.
export const heroHiddenSource = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const deliveryWidths = {
  controller: [640, 960, 1440, 1774],
  'chip-one': [192, 320, 480, 640],
  'chip-two': [192, 320, 480, 640],
  'popcorn-one': [192, 320, 480, 640],
  'popcorn-two': [192, 320, 480, 640],
  crumbs: [128, 256, 384],
} as const
const desktopFractions = { controller: .33, 'chip-one': .09, 'chip-two': .1, 'popcorn-one': .065, 'popcorn-two': .07, crumbs: .05 } as const
const mobileSizes = { controller: 'min(88vw, 460px)', 'chip-one': 'min(21vw, 110px)', 'chip-two': 'min(20vw, 100px)', 'popcorn-one': 'min(16vw, 85px)', 'popcorn-two': 'min(16vw, 85px)', crumbs: '1px' } as const
export function getHeroDelivery(id: typeof heroLayers[number]['id']) {
  const widths = deliveryWidths[id]
  const url = (width: number) => '/hero/web/' + id + '-' + width + '.webp'
  const fraction = desktopFractions[id]
  const sceneRatio = 1672 / 941 * fraction
  const round = (n: number) => Number(n.toFixed(4))
  // Match the approved scene geometry: mobile, tablet, then viewport/height-led desktop.
  const desktop = 'max(' + round(fraction * 100) + 'vw, clamp(' + round(640 * sceneRatio) + 'px, calc(' + round(100 * sceneRatio) + 'svh - ' + round(88 * sceneRatio) + 'px), ' + round(1000 * sceneRatio) + 'px))'
  return {
    src: url(id === 'controller' ? 960 : id === 'crumbs' ? 256 : 320),
    srcSet: widths.map(width => url(width) + ' ' + width + 'w').join(', '),
    sizes: HERO_MOBILE_MEDIA + ' ' + mobileSizes[id] + ', (max-width: 1100px) ' + round(fraction * 100) + 'vw, ' + desktop,
  }
}

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
