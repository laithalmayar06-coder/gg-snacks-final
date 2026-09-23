import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useStaffSession } from '../auth/StaffSession'
import { getStaffSupabase } from '../lib/supabase'
import { productFamilies, getProductName as productName, getFlavorName as flavorName } from '../data/products'
import { analyzeRatings, average, emptyFilters, filterRatings, type RatingFilters } from '../data/ratingAnalytics'
import { DashboardError, fetchDashboardRatings, type RatingRow } from '../services/dashboardRatings'
import '../styles/ratings-dashboard.css'

const dateFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' })
const displayAverage = (value: number | null) => value === null ? '—' : value.toFixed(2)

export default function RatingsDashboard() {
  const { session, refreshAccess } = useStaffSession()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  async function logout() {
    setLoggingOut(true)
    setRows([])
    try {
      const { error: failure } = await getStaffSupabase().auth.signOut({ scope: 'local' })
      if (failure) throw failure
      navigate('/admin/login', { replace: true })
    } catch { setError('Unable to sign out. Please try again.') }
    finally { setLoggingOut(false) }
  }
  const [rows, setRows] = useState<RatingRow[]>([])
  const [filters, setFilters] = useState<RatingFilters>(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [reload, setReload] = useState(0)
  const [page, setPage] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setRows([])
    fetchDashboardRatings(controller.signal).then(result => { if (controller.signal.aborted) return; setRows(result.rows); setTruncated(result.truncated); setPage(0) }).catch(async cause => {
      if (controller.signal.aborted) return
      if (cause instanceof DashboardError && cause.reason === 'mfa') { refreshAccess(); navigate('/admin/mfa', { replace: true }); return }
      if (cause instanceof DashboardError && cause.reason === 'unauthenticated') {
        setError('Your session has expired. Please sign in again.')
        try {
          const { error: failure } = await getStaffSupabase().auth.signOut({ scope: 'local' })
          if (failure) throw failure
          if (!controller.signal.aborted) navigate('/admin/login', { replace: true })
        } catch { if (!controller.signal.aborted) setError('Unable to clear the expired session. Please try Logout again.') }
        return
      }
      setError(cause instanceof DashboardError && cause.reason === 'forbidden' ? 'ACCESS DENIED — Your account does not have staff access.' : 'We could not load the ratings. Please try again.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload, navigate])
  const filtered = useMemo(() => filterRatings(rows, filters), [rows, filters])
  const stats = useMemo(() => analyzeRatings(filtered), [filtered])
  const flavors = useMemo(() => {
    const values = new Map<string, string>()
    productFamilies.filter(item => !filters.product || item.slug === filters.product).forEach(product => product.flavors.forEach(flavor => values.set(flavor.slug, flavor.name.en)))
    rows.filter(row => !filters.product || row.product_slug === filters.product).forEach(row => { if (!values.has(row.flavor_slug)) values.set(row.flavor_slug, row.flavor_slug) })
    return [...values]
  }, [filters.product, rows])
  function change(key: keyof RatingFilters, value: string) { setFilters(current => ({ ...current, [key]: value, ...(key === 'product' ? { flavor: '' } : {}) })); setPage(0) }
  const products = [...new Set([...productFamilies.map(item => item.slug), ...rows.map(row => row.product_slug)])]
  const languages = [...new Set(['en', 'ar', ...rows.map(row => row.language ?? 'unknown')])]
  const pageCount = Math.max(1, Math.ceil(filtered.length / 25))
  return <main className="ratings-dashboard" lang="en" dir="ltr">
    <header className="dashboard-header"><div><p className="dashboard-kicker">GG / STAFF DASHBOARD</p><h1>Ratings overview</h1><p>Read-only · All metrics follow the filters · Dates in Jeddah time</p></div><div className="dashboard-actions"><span>{session?.user.email}</span><Link to="/">Homepage</Link><button type="button" disabled={loggingOut} onClick={() => void logout()}>{loggingOut ? 'Signing out…' : 'Logout'}</button><button type="button" disabled={loading} onClick={() => setReload(value => value + 1)}>Refresh</button></div></header>
    {loading ? <p role="status" className="dashboard-message">Loading ratings…</p> : error ? <p role="alert" className="dashboard-message">{error}</p> : <>
      {truncated && <p className="dashboard-message">Showing the latest 10,000 ratings only. These totals and comparisons are for this partial snapshot.</p>}
      <section className="dashboard-filters" aria-label="Filter ratings">
        <label>Product<select value={filters.product} onChange={event => change('product', event.target.value)}><option value="">All products</option>{products.map(slug => <option key={slug} value={slug}>{productName(slug)}</option>)}</select></label>
        <label>Flavor<select value={filters.flavor} onChange={event => change('flavor', event.target.value)}><option value="">All flavors</option>{flavors.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label>
        <label>Rating<select value={filters.score} onChange={event => change('score', event.target.value)}><option value="">All scores</option>{[1, 2, 3, 4, 5].map(score => <option key={score} value={score}>{score}</option>)}</select></label>
        <label>Language<select value={filters.language} onChange={event => change('language', event.target.value)}><option value="">All languages</option>{languages.map(language => <option key={language} value={language}>{language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : language}</option>)}</select></label>
        <label>From<input type="date" value={filters.from} max={filters.to || undefined} onChange={event => change('from', event.target.value)} /></label>
        <label>Through<input type="date" value={filters.to} min={filters.from || undefined} onChange={event => change('to', event.target.value)} /></label>
        <button type="button" onClick={() => { setFilters(emptyFilters); setPage(0) }}>Clear filters</button>
      </section>
      {!rows.length && <p className="dashboard-message">No ratings yet. Submitted feedback will appear here.</p>}
      {!!rows.length && !filtered.length && <p role="status" className="dashboard-message">No ratings match these filters.</p>}
      <section className="dashboard-summary" aria-label="Summary">{[['Total ratings', stats.total], ['Average rating / 5', displayAverage(stats.average)], ['Total comments', stats.comments], ['Ratings today', stats.today]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
      <div className="dashboard-two-columns"><section className="dashboard-block"><h2>Product families</h2>{products.map(slug => { const group = stats.products.get(slug) ?? []; return <div className="dashboard-family" key={slug}><strong>{productName(slug)}</strong><span>{group.length} ratings</span><span>{displayAverage(average(group))} / 5</span><span>{stats.total ? (group.length / stats.total * 100).toFixed(1) : '0'}%</span></div> })}</section>
      <section className="dashboard-block"><h2>Rating distribution</h2>{stats.distribution.map(({ score, count }) => <div className="dashboard-distribution" key={score}><span>{score} · {['Very bad', 'Bad', 'Okay', 'Good', 'Excellent'][score - 1]}</span><div className="dashboard-bar" aria-hidden="true"><i style={{ width: `${stats.total ? count / stats.total * 100 : 0}%` }} /></div><strong>{count}</strong></div>)}</section></div>
      <section className="dashboard-block"><h2>Flavor performance</h2><p className="dashboard-muted">At least 3 ratings per flavor and 2 eligible flavors required. Ties are shown together.</p>{!stats.highest.length ? <p>No distinct highest and lowest flavors to compare yet.</p> : <div className="dashboard-two-columns">{[['Highest-rated flavor', stats.highest], ['Lowest-rated flavor', stats.lowest]].map(([label, values]) => <div key={String(label)}><h3>{String(label)}</h3>{(values as typeof stats.highest).map(item => { const [product, flavor] = item.key.split('/'); return <p key={item.key}>{productName(product)} / {flavorName(product, flavor)} — {item.average.toFixed(2)} / 5 ({item.count} ratings)</p> })}</div>)}</div>}</section>
      <section className="dashboard-block"><h2>Recent feedback</h2>{!stats.comments && <p className="dashboard-muted">No comments in the current results.</p>}<div className="dashboard-table-scroll" tabIndex={0} role="region" aria-label="Recent ratings table"><table><thead><tr>{['Product', 'Flavor', 'Rating', 'Comment', 'Language', 'Date / time'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{filtered.slice(page * 25, page * 25 + 25).map(row => <tr key={row.id}><td>{productName(row.product_slug)}</td><td>{flavorName(row.product_slug, row.flavor_slug)}</td><td>{row.rating} / 5</td><td dir="auto">{row.comment?.trim() || 'No comment'}</td><td>{row.language ?? 'Unknown'}</td><td>{row.created_at && !Number.isNaN(Date.parse(row.created_at)) ? dateFormat.format(new Date(row.created_at)) : 'Unknown'}</td></tr>)}</tbody></table></div><div className="dashboard-pagination"><button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page + 1} of {pageCount} · {filtered.length} results</span><button disabled={page + 1 >= pageCount} onClick={() => setPage(value => value + 1)}>Next</button></div></section>
    </>}
  </main>
}
