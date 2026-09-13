import { getContactDetail, getSocialLinks } from '../data/siteLinks'
import { useLanguage } from '../i18n/LanguageContext'

export function SocialLinks({ fallback }: { fallback: string }) {
  const links = getSocialLinks()
  return links.length ? <>{links.map((link, index) => <span key={link.name}>{index > 0 && ' · '}<a href={link.href}>{link.name}</a></span>)}</> : <>{fallback}</>
}
export default function SiteContactValue({ kind }: { kind: 'whatsapp' | 'email' | 'phone' | 'location' | 'social' }) {
  const { language, t } = useLanguage()
  if (kind === 'social') return <SocialLinks fallback={t.contactPending} />
  const detail = getContactDetail(kind, language)
  return detail ? detail.href ? <a href={detail.href} dir="auto">{detail.text}</a> : <span dir="auto">{detail.text}</span> : <>{t.contactPending}</>
}
