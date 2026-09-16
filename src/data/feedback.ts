import { getProduct, getActiveFlavors } from './products'
export function feedbackDestination(productSlug: string, flavorSlug: string): string | null {
  const product = getProduct(productSlug)
  return product ? getActiveFlavors(product).find(flavor => flavor.slug === flavorSlug)?.ratingPath ?? null : null
}
