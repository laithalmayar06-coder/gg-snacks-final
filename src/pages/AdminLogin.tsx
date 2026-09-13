import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useStaffSession } from '../auth/StaffSession'
import { getStaffSupabase } from '../lib/supabase'

export default function AdminLogin() {
  const { session, loading, error: setupError } = useStaffSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  if (session) return <Navigate to="/dashboard/ratings" replace />
  return <main className="ratings-dashboard staff-login" lang="en" dir="ltr"><p className="dashboard-kicker">GG / STAFF ACCESS</p><h1>Staff sign in</h1><form className="dashboard-block" aria-busy={busy} onSubmit={async event => {
    event.preventDefault()
    if (lock.current) return
    lock.current = true; setBusy(true); setError('')
    try {
      const { error: failure } = await getStaffSupabase().auth.signInWithPassword({ email: email.trim(), password })
      if (failure) setError(failure.status === 400 || failure.status === 401 ? 'Email or password is incorrect.' : 'Unable to sign in. Please try again.')
      else setPassword('')
    } catch { setError('Unable to sign in. Please try again.') }
    finally { lock.current = false; setBusy(false) }
  }}><label htmlFor="staff-email">Email</label><input id="staff-email" type="email" autoComplete="username" required value={email} disabled={busy} onChange={event => setEmail(event.target.value)} /><label htmlFor="staff-password">Password</label><input id="staff-password" type="password" autoComplete="current-password" required value={password} disabled={busy} onChange={event => setPassword(event.target.value)} />{(error || setupError) && <p role="alert">{error || setupError}</p>}<button type="submit" disabled={busy || loading || !!setupError}>{busy ? 'Signing in…' : 'Sign in'}</button><p role="status">{loading ? 'Restoring session…' : ''}</p></form><Link to="/">Back to homepage</Link></main>
}
