import { hasProtectedStaffAccess, readStaffAccess, type StaffAccess } from './staffAccess'
import StaffLogout from './StaffLogout'
import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Navigate, Outlet } from 'react-router'
import { getStaffSupabase } from '../lib/supabase'
import '../styles/ratings-dashboard.css'

const StaffContext = createContext<{ session: Session | null; loading: boolean; error: string; access: StaffAccess; accessLoading: boolean; accessError: string; refreshAccess: () => void }>({ session: null, loading: true, error: '', access: { role: null, aal: null }, accessLoading: true, accessError: '', refreshAccess: () => {} })
export const useStaffSession = () => useContext(StaffContext)

export function StaffSessionProvider() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    let changed = false
    try {
      const auth = getStaffSupabase().auth
      const { data: { subscription } } = auth.onAuthStateChange((_event, current) => {
        changed = true
        if (active) { setSession(current); setError(''); setLoading(false) }
      })
      void auth.getSession().then(({ data, error: failure }) => {
        if (!active || changed) return
        if (failure) setError('Unable to restore your session. Please reload and sign in again.')
        setSession(data.session); setLoading(false)
      }).catch(() => { if (active) { setError('Unable to restore your session. Please reload.'); setLoading(false) } })
      return () => { active = false; subscription.unsubscribe() }
    } catch {
      setError('Staff sign-in is not configured. Check the Supabase public environment variables.')
      setLoading(false)
    }
    return () => { active = false }
  }, [])
  const [accessResult, setAccessResult] = useState<{ token: string; access: StaffAccess; error: string } | null>(null)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setAccessResult(null)
    if (session) {
      const token = session.access_token
      void readStaffAccess(token, AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]))
        .then(access => { if (!controller.signal.aborted) setAccessResult({ token, access, error: '' }) })
        .catch(() => { if (!controller.signal.aborted) setAccessResult({ token, access: { role: null, aal: null }, error: 'Unable to verify staff access. Retry or sign out.' }) })
    }
    return () => controller.abort()
  }, [session?.access_token, revision])
  // Never carry authorization across tokens or accounts. Auth callbacks stay synchronous.
  const current = session && accessResult?.token === session.access_token ? accessResult : null
  const access = current?.access ?? { role: null, aal: null }
  return <StaffContext.Provider value={{ session, loading, error, access, accessLoading: !!session && !current, accessError: current?.error ?? '', refreshAccess: () => { setAccessResult(null); setRevision(value => value + 1) } }}><Outlet /></StaffContext.Provider>
}

export function RequireStaffSession() {
  const { session, loading, error, access, accessLoading, accessError, refreshAccess } = useStaffSession()
  if (loading || error) return <main className="ratings-dashboard" dir="ltr" lang="en"><p role={error ? 'alert' : 'status'}>{error || 'Restoring session…'}</p></main>
  if (!session) return <Navigate to="/admin/login" replace />
  if (accessLoading) return <main className="ratings-dashboard"><p role="status">Checking staff access…</p><StaffLogout /></main>
  if (accessError || !access.role) return <main className="ratings-dashboard" dir="ltr" lang="en"><p role="alert">{accessError || 'Access denied. This account is not authorized staff.'}</p>{accessError && <button onClick={refreshAccess}>Retry</button>}<StaffLogout /></main>
  if (!hasProtectedStaffAccess(access)) return <Navigate to="/admin/mfa" replace />
  return <Outlet key={session.user.id} />
}
