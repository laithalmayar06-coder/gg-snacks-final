import { useEffect, useRef, useState } from 'react'
import { useStaffSession } from '../auth/StaffSession'
import { getStaffSupabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { enquiryCopy } from '../data/enquiryCopy'
import { pageCopy } from '../data/publicContent'
import { requestTypes } from '../data/enquiries'
import AdminNavigation from '../cms/AdminNavigation'

type Status = 'new' | 'in-progress' | 'resolved'
type Enquiry = { id: string; enquiry_type: string; name: string; company: string | null; email: string; phone: string | null; message: string; language: string; created_at: string; status: Status }
const statuses: Status[] = ['new','in-progress','resolved']
const columns = 'id,enquiry_type,name,company,email,phone,message,language,created_at,status'
export default function AdminEnquiries() {
 const { session, access } = useStaffSession()
 const { language } = useLanguage()
 const c = enquiryCopy[language], fields = pageCopy[language]
 const [type, setType] = useState(''), [status, setStatus] = useState('')
 const [page, setPage] = useState(0), [revision, setRevision] = useState(0)
 const [rows, setRows] = useState<Enquiry[]>([]), [more, setMore] = useState(false)
 const [loading, setLoading] = useState(true), [error, setError] = useState(false)
 const [selected, setSelected] = useState<Enquiry | null>(null)
 const [draft, setDraft] = useState<Status>('new'), [saving, setSaving] = useState(false)
 const pending = useRef(false)
 const allowed = !!session && access.aal === 'aal2' && (access.role === 'admin' || access.role === 'viewer')
 useEffect(() => {
  const controller = new AbortController()
  setRows([]); setSelected(null); setLoading(true); setError(false); setMore(false)
  if (!allowed) { setLoading(false); return () => controller.abort() }
  async function load() {
   try {
    let query = getStaffSupabase().from('enquiries').select(columns).order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * 25, page * 25 + 25)
    if (type) query = query.eq('enquiry_type', type)
    if (status) query = query.eq('status', status)
    const { data, error: failure } = await query.abortSignal(AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]))
    if (controller.signal.aborted) return
    if (failure) throw failure
    setRows((data ?? []).slice(0,25) as Enquiry[]); setMore((data?.length ?? 0) > 25)
   } catch { if (!controller.signal.aborted) setError(true) }
   finally { if (!controller.signal.aborted) setLoading(false) }
  }
  void load()
  return () => controller.abort()
 }, [allowed, session?.access_token, type, status, page, revision])
 async function save() {
  if (!selected || access.role !== 'admin' || !allowed || pending.current) return
  pending.current = true; setSaving(true); setError(false)
  try {
   const { data, error: failure } = await getStaffSupabase().from('enquiries').update({ status: draft }).eq('id', selected.id).select('id').abortSignal(AbortSignal.timeout(15000))
   if (failure || data?.length !== 1) throw new Error('Update not confirmed')
   setRevision(value => value + 1)
  } catch { setError(true) }
  finally { pending.current = false; setSaving(false) }
 }
 if (!allowed) return <main className="ratings-dashboard"><p role="status">{c.loading}</p></main>
 return <><AdminNavigation /><main className="ratings-dashboard" lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
  <h1>{c.title}</h1>
  <div className="public-form-grid">
   <label>{c.type}<select disabled={saving} value={type} onChange={e => { setType(e.target.value); setPage(0) }}><option value="">{c.all}</option>{requestTypes.map(item => <option key={item.id} value={item.id}>{item.label[language]}</option>)}</select></label>
   <label>{c.status}<select disabled={saving} value={status} onChange={e => { setStatus(e.target.value); setPage(0) }}><option value="">{c.all}</option>{statuses.map(item => <option key={item} value={item}>{c[item]}</option>)}</select></label>
  </div>
  <button disabled={loading || saving} onClick={() => setRevision(value => value + 1)}>{c.refresh}</button>
  {error && <p role="alert">{c.error}</p>}
  {loading ? <p role="status">{c.loading}</p> : !rows.length && !error ? <p>{c.empty}</p> : <ul>{rows.map(row => <li key={row.id}><button disabled={saving} onClick={() => { setSelected(row); setDraft(row.status) }}>{row.name} — {requestTypes.find(item => item.id === row.enquiry_type)?.label[language]} — {c[row.status]} — {new Date(row.created_at).toLocaleString(language)}</button></li>)}</ul>}
  <button disabled={!page || loading || saving} onClick={() => setPage(value => value - 1)}>{c.previous}</button>
  <button disabled={!more || loading || saving} onClick={() => setPage(value => value + 1)}>{c.next}</button>
  {selected && <section className="gg-card" aria-label={c.details}>
   <h2>{c.details}</h2><dl>{(['name','company','email','phone'] as const).map(key => <div key={key}><dt>{fields[key]}</dt><dd dir="auto" style={{ overflowWrap: 'anywhere' }}>{selected[key] || '—'}</dd></div>)}</dl>
   <p dir="auto" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{selected.message}</p>
   <p>{c.status}: {c[selected.status]}</p>
   {access.role === 'admin' && <><label>{c.status}<select disabled={saving} value={draft} onChange={e => setDraft(e.target.value as Status)}>{statuses.map(item => <option key={item} value={item}>{c[item]}</option>)}</select></label><button disabled={saving || draft === selected.status} onClick={() => void save()}>{saving ? c.loading : c.save}</button></>}
  </section>}
 </main></>
}