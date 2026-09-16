import { getContactDetail, getSocialLinks, safeWebUrl } from '../data/siteLinks'
import { useLanguage } from '../i18n/LanguageContext'
import { useCms } from '../cms/CmsProvider'
import { textValue } from '../cms/publicCatalog'

export function SocialLinks({ fallback }: { fallback: string }) {
  const cms = useCms()
  const managed = cms.contact_settings?.[0]
  const links = cms.contact_settings ? ['instagram','tiktok','x','youtube'].flatMap(name => {
    const href = safeWebUrl(textValue(managed, name))
    return href ? [{ name: name === 'x' ? 'X' : name.charAt(0).toUpperCase() + name.slice(1), href }] : []
  }) : getSocialLinks()
  return links.length ? <>{links.map((link, index) => <span key={link.name}>{index > 0 && ' · '}<a href={link.href}>{link.name}</a></span>)}</> : <>{fallback}</>
}
export default function SiteContactValue({ kind }: { kind: 'whatsapp' | 'email' | 'phone' | 'location' | 'social' }) {
  const { language, t } = useLanguage()
  const cms = useCms()
  if (kind === 'social') return <SocialLinks fallback={t.contactPending} />
  if (cms.contact_settings && kind !== 'location') {
    const value = textValue(cms.contact_settings[0], kind)
    const digits = value.replace(/[\s()+.-]/g, '')
    const href = kind === 'email' ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${encodeURIComponent(value)}` : null)
      : /^\d{7,15}$/.test(digits) ? (kind === 'whatsapp' ? `https://wa.me/${digits}` : `tel:+${digits}`) : null
    return value ? href ? <a href={href} dir="auto">{value}</a> : <span dir="auto">{value}</span> : <>{t.contactPending}</>
  }
  const detail = getContactDetail(kind, language)
  return detail ? detail.href ? <a href={detail.href} dir="auto">{detail.text}</a> : <span dir="auto">{detail.text}</span> : <>{t.contactPending}</>
}
