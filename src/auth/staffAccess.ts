import { getStaffSupabase } from '../lib/supabase'
import { getCmsRole } from '../cms/api'

export interface StaffAccess { role: 'admin' | 'viewer' | null; aal: string | null }
export const hasProtectedStaffAccess = (access: StaffAccess) =>
  (access.role === 'admin' || access.role === 'viewer') && access.aal === 'aal2'

export async function readStaffAccess(token: string, signal: AbortSignal): Promise<StaffAccess> {
  const role = await getCmsRole(signal)
  if (!role) return { role: null, aal: null }
  const { data, error } = await getStaffSupabase().auth.mfa.getAuthenticatorAssuranceLevel(token)
  if (error || !data) throw new Error('Unable to verify staff MFA. Please sign in again.')
  return { role, aal: data.currentLevel }
}

export async function signOutStaff() {
  const { error } = await getStaffSupabase().auth.signOut({ scope: 'local' })
  if (error) throw new Error('Unable to sign out. Please try again.')
}
