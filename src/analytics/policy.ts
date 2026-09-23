import { publicPaths } from '../data/publicContent'
import { getFlavor } from '../data/products'
export function analyticsPath(pathname: string): string | null {
 const path = pathname.replace(/\/+$/, '') || '/'
 if (['/', '/products', ...publicPaths].includes(path)) return path
 // Do not send dynamic slugs: CMS values and arbitrary URL input need not enter analytics.
 if (/^\/products\/[^/]+$/.test(path)) return '/products/:productSlug'
 const rating = /^\/rate\/([^/]+)\/([^/]+)$/.exec(path)
 if (rating && getFlavor(rating[1], rating[2])) return '/rate/:productSlug/:flavorSlug'
 return null
}
export const routeEvents: Record<string, string> = {
 '/feedback': 'feedback_started', '/contact': 'contact_form_opened',
 '/business': 'business_enquiry_opened', '/arena': 'arena_viewed',
 '/tournaments': 'tournaments_viewed', '/find-gg': 'find_gg_viewed',
}
export function cleanAnalyticsUrl(value: string, currentPath: string): string | null {
 if (!analyticsPath(currentPath)) return null
 try {
  const url = new URL(value)
  const path = url.pathname === '/rate/:productSlug/:flavorSlug' ? url.pathname : analyticsPath(url.pathname)
  return path ? `${url.origin}${path}` : null
 } catch { return null }
}