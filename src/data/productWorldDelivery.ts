import type { ProductWorldTheme } from './productWorldSelector'

export const WORLD_MOBILE_QUERY = '(max-width: 767px)'

function webCopy(src: string, variant: 'desktop' | 'mobile' | 'thumb') {
  return src.replace('/product-world/', '/product-world/web/').replace(/\.png$/, `-${variant}.webp`)
}

// Rendering and preparation share this resolver, including the mobile X-STIX substitution.
export function getWorldDelivery(world: ProductWorldTheme, mobile: boolean) {
  const variant = mobile ? 'mobile' : 'desktop'
  const food = world.food.map(item => {
    if (mobile && (item.slot === 'crumbs' || (world.id === 'x-stix' && item.slot === 'scatter'))) return null
    if (mobile && world.id === 'x-stix' && item.slot === 'main') {
      return { ...item, src: webCopy('/product-world/x-stix/sticks-scatter.png', variant), width: 1254, height: 1254 }
    }
    return { ...item, src: webCopy(item.src, variant) }
  })
  const pack = webCopy(world.pack, variant)
  return { pack, food, sources: [pack, ...food.flatMap(item => item ? [item.src] : [])] }
}

export function getWorldThumbnail(world: ProductWorldTheme) {
  return webCopy(world.pack, 'thumb')
}
