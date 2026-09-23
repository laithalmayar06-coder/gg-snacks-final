import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import { useCatalog } from '../cms/publicCatalog'
import { pageMetadata, siteOrigin } from '../data/seo'
import { siteContent } from '../data/siteContent'

export default function PageMetadata() {
  const { pathname } = useLocation()
  const { language } = useLanguage()
  const catalog = useCatalog()
  const product = catalog.find(item => `/products/${item.slug}` === pathname.replace(/\/+$/, ''))
  const metadata = pageMetadata(pathname, language, product ? {
    name: product.localizedName?.[language] ?? product.name,
    description: product.shortDescription?.[language],
  } : undefined)
  const { title, description, canonical, robots, locale } = metadata
  useEffect(() => {
    document.title = title
    function meta(attribute: 'name' | 'property', key: string, content: string | null) {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
      if (!content) { element?.remove(); return }
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.appendChild(element) }
      element.content = content
    }
    meta('name', 'description', description)
    meta('name', 'robots', robots)
    meta('property', 'og:title', title)
    meta('property', 'og:description', description)
    meta('property', 'og:type', 'website')
    meta('property', 'og:locale', locale)
    meta('property', 'og:url', canonical)
    meta('name', 'twitter:card', 'summary')
    meta('name', 'twitter:title', title)
    meta('name', 'twitter:description', description)
    const image = siteContent.seo.defaultSocialPreviewImage
    meta('property', 'og:image', image ? new URL(image, siteOrigin).href : null)
    meta('name', 'twitter:image', image ? new URL(image, siteOrigin).href : null)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) link?.remove()
    else {
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
      link.href = canonical
    }
  }, [title, description, canonical, robots, locale])
  return null
}