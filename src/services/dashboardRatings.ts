import { getStaffSupabase } from '../lib/supabase'

export interface RatingRow {
  id: string
  product_slug: string
  flavor_slug: string
  rating: number
  comment: string | null
  language: string | null
  source: string | null
  created_at: string | null
}
export class DashboardError extends Error {
  constructor(public reason: 'setup' | 'fetch' | 'unauthenticated' | 'forbidden' | 'mfa') { super(reason) }
}
export async function fetchDashboardRatings(signal: AbortSignal): Promise<{ rows: RatingRow[]; truncated: boolean }> {
  const client = getStaffSupabase()
  const { data: { session }, error } = await client.auth.getSession()
  if (error || !session) throw new DashboardError('unauthenticated')
  const request = (token: string) => fetch(`${import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')}/functions/v1/ratings-dashboard`, {
    method: 'GET', signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]), cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '' },
  })
  let response = await request(session.access_token)
  if (response.status === 401) {
    const { data, error: refreshError } = await client.auth.refreshSession()
    if (refreshError || !data.session) throw new DashboardError('unauthenticated')
    response = await request(data.session.access_token)
  }
  if (response.status === 403) {
    const body: unknown = await response.clone().json().catch(() => null)
    if (body && typeof body === 'object' && 'code' in body && body.code === 'mfa_required') throw new DashboardError('mfa')
  }
  if (!response.ok) throw new DashboardError(response.status === 401 ? 'unauthenticated' : response.status === 403 ? 'forbidden' : 'fetch')
  const result: unknown = await response.json()
  if (!result || typeof result !== 'object' || !('rows' in result) || !Array.isArray(result.rows) || !('truncated' in result) || typeof result.truncated !== 'boolean') throw new DashboardError('fetch')
  if (!result.rows.every(row => row && typeof row.id === 'string' && typeof row.product_slug === 'string' && typeof row.flavor_slug === 'string' && Number.isInteger(row.rating) && row.rating >= 1 && row.rating <= 5 && ['comment', 'language', 'source', 'created_at'].every(key => row[key] === null || typeof row[key] === 'string'))) throw new DashboardError('fetch')
  return { rows: result.rows, truncated: result.truncated }
}
