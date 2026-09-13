import { siteContent, type SiteLanguage } from './siteContent'

export function safeWebUrl(value: string | null): string | null {
  if (!value) return null
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null } catch { return null }
}
export function getSocialLinks() {
  return Object.entries(siteContent.contact.socialLinks).flatMap(([name, value]) => {
    const href = safeWebUrl(value)
    return href ? [{ name: name === 'x' ? 'X' : name.charAt(0).toUpperCase() + name.slice(1), href }] : []
  })
}
export function getContactDetail(key: 'whatsapp' | 'email' | 'phone' | 'location', language: SiteLanguage): { text: string; href: string | null } | null {
  const contact = siteContent.contact
  if (key === 'location') {
    const href = safeWebUrl(contact.mapsUrl)
    const text = contact.address?.[language] || (href ? siteContent.footer.locationLabel[language] : '')
    return text ? { text, href } : null
  }
  const value = contact[key]?.trim()
  if (!value) return null
  if (key === 'email') return { text: value, href: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${encodeURIComponent(value)}` : null }
  const digits = value.replace(/[\s()+.-]/g, '')
  return { text: value, href: /^\d{7,15}$/.test(digits) ? (key === 'whatsapp' ? `https://wa.me/${digits}` : `tel:+${digits}`) : null }
}
