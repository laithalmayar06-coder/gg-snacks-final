import { siteContent, type SiteLanguage } from './siteContent'
import { pageCopy, pageTitles, publicPaths, type PublicPath } from './publicContent'
import { homepageContent } from './homepage'
import { translations } from '../i18n/translations'

export const siteOrigin = 'https://gg-snacks-final.vercel.app'
// Only stable public routes: CMS-managed product slugs can change independently of a build.
export const sitemapPaths = ['/', '/products', ...publicPaths]
export function pageMetadata(pathname: string, language: SiteLanguage, product?: { name: string; description?: string }) {
  const path = pathname.replace(/\/+$/, '') || '/'
  const t = translations[language]
  const copy = pageCopy[language]
  const home = homepageContent[language]
  let title = siteContent.seo.defaultTitle[language]
  let description = siteContent.seo.defaultDescription[language]
  let indexable = true
  const descriptions: Partial<Record<PublicPath, string>> = {
    '/arena': home.arenaBody, '/tournaments': `${home.registration}. ${home.firstTournament}.`,
    '/find-gg': home.findIntro, '/feedback': copy.feedbackIntro,
    '/business': copy.formNote, '/contact': copy.contactIntro, '/faq': copy.faqNote,
    '/privacy': copy.privacyBody, '/terms': copy.termsBody,
    '/about': siteContent.company.shortDescription[language],
  }
  if (Object.hasOwn(pageTitles, path)) {
    title = `${pageTitles[path as PublicPath][language]} | ${t.brandName}`
    description = descriptions[path as PublicPath] ?? description
  } else if (path === '/products') {
    title = `${t.products} | ${t.brandName}`
    description = t.catalogueDescription
  } else if (/^\/products\/[^/]+$/.test(path) && product) {
    title = `${product.name} | ${t.brandName}`
    description = product.description || t.catalogueDescriptor
  } else if (path !== '/') {
    // Utility, staff, rating and unknown URLs are not search landing pages.
    indexable = false
    title = `${path.startsWith('/rate/') ? t.catalogueRate : t.brandName} | GG Snacks`
  }
  return { title, description, canonical: indexable ? new URL(path, siteOrigin).href : null,
    robots: indexable ? 'index, follow' : 'noindex, nofollow', locale: language === 'ar' ? 'ar_SA' : 'en_US' }
}