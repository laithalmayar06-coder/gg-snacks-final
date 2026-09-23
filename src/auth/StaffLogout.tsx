import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { signOutStaff } from './staffAccess'

export default function StaffLogout({ disabled = false }: { disabled?: boolean } = {}) {
  const navigate = useNavigate()
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return <span><button type="button" disabled={busy || disabled} onClick={async () => {
    if (lock.current || disabled) return
    lock.current = true; setBusy(true); setError('')
    try { await signOutStaff(); navigate('/admin/login', { replace: true }) }
    catch { setError('Unable to sign out. Please try again.') }
    finally { lock.current = false; setBusy(false) }
  }}>{busy ? 'Signing out…' : 'Logout'}</button>{error && <span role="alert">{error}</span>}</span>
}
