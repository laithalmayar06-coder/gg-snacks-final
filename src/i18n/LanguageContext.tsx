import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react'
import { translations, type Language } from './translations'
import { siteContent } from '../data/siteContent'

const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void; t: typeof translations.en } | null>(null)
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try { return localStorage.getItem('gg-language') === 'ar' ? 'ar' : 'en' } catch { return 'en' }
  })
  useLayoutEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.title = translations[language].title
    document.querySelector('meta[name="description"]')?.setAttribute('content', translations[language].meta)
    for (const [property, content] of [['og:title', translations[language].title], ['og:description', translations[language].meta], ['og:image', siteContent.seo.defaultSocialPreviewImage]] as const) {
      let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      if (!content) { tag?.remove(); continue }
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag) }
      tag.content = content
    }
    try { localStorage.setItem('gg-language', language) } catch { /* Language still works when storage is unavailable. */ }
  }, [language])
  return <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>{children}</LanguageContext.Provider>
}
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
