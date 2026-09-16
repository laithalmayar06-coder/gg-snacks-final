import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router'
import { useStaffSession } from '../auth/StaffSession'
import { cmsSections, newCmsRow, validateCmsRow, type CmsRow } from './schema'
import { getCmsRole, readCmsRows, saveCmsRow, deleteStore } from './api'
import AdminNavigation from './AdminNavigation'

export default function CmsAdmin() {
  const { section: sectionKey = 'products' } = useParams()
  const section = cmsSections[sectionKey]
  const { session } = useStaffSession()
  const [role, setRole] = useState<'admin' | 'viewer' | null>(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<CmsRow[]>([])
  const [products, setProducts] = useState<CmsRow[]>([])
  const [original, setOriginal] = useState<CmsRow | null>(null)
  const [draft, setDraft] = useState<CmsRow | null>(null)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setRole(null); setDraft(null); setOriginal(null); setError(''); setSuccess(''); setErrors({}); setRows([])
    if (!section) { setLoading(false); return () => controller.abort() }
    void (async () => {
      const access = await getCmsRole(AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]))
      if (!access) throw new Error('Access denied. This account is not an authorized staff member.')
      const [data, parents] = await Promise.all([readCmsRows(section.table, true, controller.signal), section.table === 'flavors' ? readCmsRows('products', true, controller.signal) : Promise.resolve([])])
      if (controller.signal.aborted) return
      setRole(access); setRows(data); setProducts(parents)
      if (section.singleton) { setOriginal(data[0] ?? null); setDraft(data[0] ?? newCmsRow(section)) }
    })().catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load CMS.') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [section, session?.user.id, reload])
  const edit = (row: CmsRow | null) => {
    if (busy) return
    if (draft && JSON.stringify(draft) !== JSON.stringify(original ?? newCmsRow(section)) && !window.confirm('Discard unsaved changes?')) return
    setOriginal(row); setDraft(row ? { ...row } : newCmsRow(section)); setErrors({}); setSuccess(''); setError('')
    requestAnimationFrame(() => heading.current?.focus())
  }
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft || busy || role !== 'admin') return
    const problems = validateCmsRow(section, draft)
    setErrors(problems); setSuccess('')
    if (Object.keys(problems).length) { setError('Correct the highlighted fields.'); return }
    setBusy(true); setError('')
    try {
      const saved = await saveCmsRow(section, draft, original)
      if (!mounted.current) return
      setRows(current => [...current.filter(row => row.id !== saved.id), saved].sort((a,b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0)))
      setOriginal(saved); setDraft(saved); setSuccess('Saved. Public pages use this content on their next load.')
    } catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Save failed.') }
    finally { if (mounted.current) setBusy(false) }
  }
  const remove = async () => {
    if (!original || busy || role !== 'admin' || section.table !== 'stores') return
    if (!window.confirm(`Delete store “${original.name_en}”? This cannot be undone.`)) return
    setBusy(true); setError(''); setSuccess('')
    try { await deleteStore(original); if (mounted.current) { setRows(current => current.filter(row => row.id !== original.id)); setDraft(null); setOriginal(null); setSuccess('Store deleted.') } }
    catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Delete failed.') }
    finally { if (mounted.current) setBusy(false) }
  }
  return <div className="cms-shell" dir="ltr" lang="en"><AdminNavigation /><main className="cms-main">
    <header className="cms-header"><div><p>GG / CONTENT MANAGEMENT</p><h1>{section?.title ?? 'Unknown CMS section'}</h1></div><button type="button" disabled={busy || loading} onClick={() => { if (!draft || JSON.stringify(draft) === JSON.stringify(original ?? newCmsRow(section)) || window.confirm('Reload and discard unsaved changes?')) setReload(value => value + 1) }}>Reload</button></header>
    {loading && <p role="status">Checking staff access and loading content…</p>}
    {error && <p className="cms-error" role="alert">{error}</p>}{success && <p className="cms-success" role="status">{success}</p>}
    {!loading && role && section && <>
      <p className="cms-note">{role === 'viewer' ? 'Viewer access: read only. Only administrators can save or delete.' : 'Administrator access. English and Arabic content are edited together.'}</p>
      {['products','flavors'].includes(section.table) && <p className="cms-note">Slugs and flavor parent references cannot change after creation. Disable entries to hide them from discovery; do not delete printed URLs. Only existing supported rating combinations accept ratings in this phase.</p>}
      <div className={`cms-workspace ${section.singleton ? 'cms-singleton' : ''}`}>
        {!section.singleton && <aside className="cms-records" aria-label="Records"><button type="button" disabled={role !== 'admin' || busy} onClick={() => edit(null)}>+ Add {section.title.toLowerCase()}</button>{!rows.length && <p>No records yet.</p>}{rows.map(row => <button type="button" disabled={busy} key={String(row.id)} aria-pressed={original?.id === row.id} onClick={() => edit(row)}><strong>{String(row.name_en || row.title_en || row.key || row.slug || row.id)}</strong><span>{row.slug ? String(row.slug) : ''}{row.is_active === false ? ' · Inactive' : ''}{section.table === 'flavors' ? ` · ${products.find(product => product.id === row.product_id)?.name_en ?? ''}` : ''}</span></button>)}</aside>}
        {draft ? <form className="cms-editor" onSubmit={save} noValidate aria-busy={busy}><h2 ref={heading} tabIndex={-1}>{original ? 'Edit record' : 'New record'}</h2><fieldset disabled={busy || role !== 'admin'}><legend className="sr-only">Content fields</legend><div className="cms-fields">{section.fields.map(field => <div className={`cms-field ${field.type === 'textarea' ? 'cms-wide' : ''}`} key={field.key}><label htmlFor={`cms-${field.key}`}>{field.label}{field.required ? ' *' : ''}</label>
          {field.type === 'boolean' ? <input id={`cms-${field.key}`} type="checkbox" checked={draft[field.key] === true} onChange={e => setDraft({ ...draft, [field.key]: e.target.checked })} />
            : field.type === 'select' || field.type === 'product' ? <select id={`cms-${field.key}`} disabled={Boolean(original && field.immutable)} value={String(draft[field.key] ?? '')} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `cms-error-${field.key}` : undefined} onChange={e => setDraft({ ...draft, [field.key]: e.target.value })}><option value="">Choose…</option>{field.type === 'product' ? products.map(product => <option key={String(product.id)} value={String(product.id)}>{String(product.name_en)}</option>) : field.options?.map(option => <option key={option}>{option}</option>)}</select>
            : field.type === 'textarea' ? <textarea id={`cms-${field.key}`} rows={4} dir={field.key.endsWith('_ar') ? 'rtl' : 'ltr'} lang={field.key.endsWith('_ar') ? 'ar' : 'en'} value={String(draft[field.key] ?? '')} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `cms-error-${field.key}` : undefined} onChange={e => setDraft({ ...draft, [field.key]: e.target.value })} />
            : <input id={`cms-${field.key}`} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'} step={field.key === 'display_order' ? 1 : 'any'} min={field.min} max={field.max} readOnly={Boolean(original && field.immutable)} dir={field.key.endsWith('_ar') ? 'rtl' : 'ltr'} value={String(draft[field.key] ?? '')} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `cms-error-${field.key}` : undefined} onChange={e => setDraft({ ...draft, [field.key]: e.target.value })} />}
          {errors[field.key] && <span id={`cms-error-${field.key}`} className="cms-error">{errors[field.key]}</span>}
        </div>)}</div><div className="cms-actions"><button type="submit">{busy ? 'Saving…' : 'Save changes'}</button>{section.table === 'stores' && original && <button type="button" className="cms-delete" onClick={() => void remove()}>Delete store</button>}</div></fieldset></form> : <p>Select a record or add a new one.</p>}
      </div>
    </>}
  </main></div>
}
