import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { readCmsRows } from './api'
import type { CmsRow, CmsTable } from './schema'
export type CmsTables = Partial<Record<CmsTable, CmsRow[]>>
const CmsContext = createContext<CmsTables>({})
const tables: CmsTable[] = ['products','flavors','stores','site_content','tournament_content','contact_settings']
export function CmsProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<CmsTables>({})
  const { pathname } = useLocation()
  const staffPage = pathname.startsWith('/admin') || pathname.startsWith('/dashboard')
  useEffect(() => {
    if (staffPage) return
    const controller = new AbortController()
    // Fetch independently: an unavailable table must not blank the rest of the website.
    for (const table of tables) {
      void readCmsRows(table, false, AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]))
        .then(rows => { if (!controller.signal.aborted) setContent(current => ({ ...current, [table]: rows })) })
        .catch(() => { /* Preserve the static or last good content while CMS is unavailable. */ })
    }
    return () => controller.abort()
  }, [staffPage])
  return <CmsContext.Provider value={content}>{children}</CmsContext.Provider>
}
export function useCms() { return useContext(CmsContext) }
