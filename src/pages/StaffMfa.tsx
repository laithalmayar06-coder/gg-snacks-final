import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router'
import { useStaffSession } from '../auth/StaffSession'
import { hasProtectedStaffAccess } from '../auth/staffAccess'
import StaffLogout from '../auth/StaffLogout'
import { beginStaffEnrollment, loadStaffFactors, verifyStaffCode } from '../auth/staffMfa'

export default function StaffMfa() {
  const { session, loading, error: sessionError, access, accessLoading, accessError, refreshAccess } = useStaffSession()
  const [factors, setFactors] = useState<{ id: string; friendly_name?: string }[]>([])
  const [factorId, setFactorId] = useState('')
  // Retain only the setup QR in component memory, never a raw secret or provisioning URI.
  const [setup, setSetup] = useState<{ id: string; qr: string } | null>(null)
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const lock = useRef(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    let active = true
    setSetup(null); setCode(''); setFactors([]); setFactorId(''); setError(''); setPending(true)
    if (session && access.role) {
      void loadStaffFactors().then(verified => {
        if (!active) return

        setFactors(verified); setFactorId(verified[0]?.id ?? ''); setPending(false)
      }).catch(() => { if (active) setError('Unable to load authenticator devices. Retry before continuing.') })
    }
    return () => { active = false }
  }, [session?.user.id, access.role, retry])

  const enroll = async () => {
    if (lock.current || pending || accessLoading || !access.role) return
    lock.current = true; setBusy(true); setError(''); setCode(''); setSetup(null)
    try {
      const result = await beginStaffEnrollment()
      if (mounted.current) { if (result) setSetup(result); else setRetry(value => value + 1) }
    } catch { if (mounted.current) setError('Unable to start setup. Retry or contact your administrator.') }
    finally { lock.current = false; if (mounted.current) setBusy(false) }
  }
  const verify = async () => {
    if (lock.current || accessLoading || !access.role || !/^\d{6}$/.test(code) || !(setup?.id || factorId)) return
    lock.current = true; setBusy(true); setError('')
    const enteredCode = code; setCode('')
    try {
      await verifyStaffCode(setup?.id || factorId, enteredCode)
      if (mounted.current) { setSetup(null); refreshAccess() }
    } catch { if (mounted.current) setError('Verification failed. Enter a fresh authenticator code and try again.') }
    finally { lock.current = false; if (mounted.current) setBusy(false) }
  }

  if (loading || sessionError) return <main className="ratings-dashboard staff-login"><p role={sessionError ? 'alert' : 'status'}>{sessionError || 'Restoring session…'}</p></main>
  if (!session) return <Navigate to="/admin/login" replace />
  if (hasProtectedStaffAccess(access) && !accessLoading && !accessError) return <Navigate to="/dashboard/ratings" replace />
  return <main className="ratings-dashboard staff-login" dir="ltr" lang="en"><p className="dashboard-kicker">GG / STAFF ACCESS</p><h1>Staff verification</h1>
    {accessLoading ? <p role="status">Checking staff access…</p> : accessError || !access.role ? <><p role="alert">{accessError || 'Access denied. This account is not authorized staff.'}</p>{accessError && <button onClick={refreshAccess}>Retry access check</button>}</> : <>
      {error && <p role="alert">{error}</p>}
      {pending ? <><p role="status">Loading authenticator devices…</p>{error && <button onClick={() => setRetry(value => value + 1)}>Retry</button>}</> : <section className="dashboard-block">
        <p>{factors.length ? 'Enter the six-digit code from your authenticator app.' : 'Set up an authenticator app to protect your staff account. Scan the QR code, then enter its six-digit code to finish setup.'}</p>
        {!factors.length && !setup && <button type="button" disabled={busy} onClick={() => void enroll()}>{busy ? 'Starting setup…' : 'Set up authenticator'}</button>}
        {setup && <img src={setup.qr} alt="Scan this private setup QR code with your authenticator app" width={240} height={240} style={{ maxWidth: '100%', height: 'auto', background: 'white' }} />}
        {(setup || factors.length > 0) && <form onSubmit={event => { event.preventDefault(); void verify() }} aria-busy={busy}>
          {factors.length > 1 && <><label htmlFor="staff-factor">Authenticator</label><select id="staff-factor" disabled={busy} value={factorId} onChange={event => { setFactorId(event.target.value); setCode('') }}>{factors.map((factor, index) => <option key={factor.id} value={factor.id}>{factor.friendly_name || `Authenticator ${index + 1}`}</option>)}</select></>}
          <label htmlFor="staff-code">Authenticator code</label><input id="staff-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required disabled={busy} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
          <button type="submit" disabled={busy || !/^\d{6}$/.test(code)}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
        </form>}
      </section>}
      <p>Keep your setup QR private. Lost access to your authenticator? Contact your administrator for identity-verified recovery.</p>
    </>}
    <StaffLogout disabled={busy} />
  </main>
}
