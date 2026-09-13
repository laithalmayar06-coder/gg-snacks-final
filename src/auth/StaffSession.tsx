import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Navigate, Outlet } from 'react-router'
import { getStaffSupabase } from '../lib/supabase'
import '../styles/ratings-dashboard.css'

const StaffContext = createContext<{ session: Session | null; loading: boolean; error: string }>({ session: null, loading: true, error: '' })
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
  return <StaffContext.Provider value={{ session, loading, error }}><Outlet /></StaffContext.Provider>
}

export function RequireStaffSession() {
  const { session, loading, error } = useStaffSession()
  if (loading || error) return <main className="ratings-dashboard" dir="ltr" lang="en"><p role={error ? 'alert' : 'status'} className="dashboard-message">{error || 'Restoring session…'}</p></main>
  if (!session) return <Navigate to="/admin/login" replace />
  // This gate controls navigation only; the Edge Function verifies staff membership.
  return <Outlet key={session.user.id} />
}
