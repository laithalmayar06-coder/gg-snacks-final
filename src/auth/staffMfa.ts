import { getStaffSupabase } from '../lib/supabase'

const enrollmentName = 'GG Snacks staff'
export async function loadStaffFactors() {
  const { data, error } = await getStaffSupabase().auth.mfa.listFactors()
  if (error || !data) throw new Error('Unable to load authenticator devices.')
  return data.totp.filter(factor => factor.status === 'verified')
}
export async function beginStaffEnrollment(): Promise<{ id: string; qr: string } | null> {
  const mfa = getStaffSupabase().auth.mfa
  const { data: existing, error: listError } = await mfa.listFactors()
  if (listError || !existing) throw new Error('Unable to check devices.')
  if (existing.totp.some(factor => factor.status === 'verified')) return null
  // Only remove abandoned setup factors created by this flow, never verified devices.
  for (const factor of existing.all.filter(item => item.factor_type === 'totp' && item.status === 'unverified' && item.friendly_name === enrollmentName)) {
    const { error } = await mfa.unenroll({ factorId: factor.id })
    if (error) throw new Error('Unable to restart setup.')
  }
  const { data, error } = await mfa.enroll({ factorType: 'totp', friendlyName: enrollmentName, issuer: 'GG Snacks' })
  if (error || !data) throw new Error('Unable to start setup.')
  // Do not return or persist the raw secret or provisioning URI.
  return { id: data.id, qr: data.totp.qr_code.startsWith('data:') ? data.totp.qr_code : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.totp.qr_code)}` }
}
export async function verifyStaffCode(factorId: string, code: string) {
  if (!factorId || !/^\d{6}$/.test(code)) throw new Error('Enter a six-digit code.')
  const { error } = await getStaffSupabase().auth.mfa.challengeAndVerify({ factorId, code })
  if (error) throw new Error('Verification failed.')
}
