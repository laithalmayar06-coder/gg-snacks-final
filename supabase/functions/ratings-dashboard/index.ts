import { createClient } from 'npm:@supabase/supabase-js@2.115.0'

const allowedOrigins = (Deno.env.get('DASHBOARD_ALLOWED_ORIGINS') ?? '').split(',').map(value => value.trim()).filter(Boolean)

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin')
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' }
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info'
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
  }
  const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers })
  if (origin && !allowedOrigins.includes(origin)) return respond(403, { error: 'Origin not allowed' })
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'GET') return respond(405, { error: 'Method not allowed' })
  const bearer = request.headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1]
  if (!bearer) return respond(401, { error: 'Authentication required' })
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return respond(503, { error: 'Service unavailable' })
  try {
    const server = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    const { data: { user }, error: authError } = await server.auth.getUser(bearer)
    if (authError || !user) return respond(401, { error: 'Authentication required' })
    const { data: verified, error: claimsError } = await server.auth.getClaims(bearer)
    if (claimsError || !verified || verified.claims.sub !== user.id) return respond(401, { error: 'Authentication required' })
    if (verified.claims.aal !== 'aal2') return respond(403, { error: 'MFA required', code: 'mfa_required' })
    const { data: staff, error: staffError } = await server.from('staff_users').select('role').eq('user_id', user.id).maybeSingle()
    if (staffError) return respond(503, { error: 'Service unavailable' })
    if (!staff || !['viewer', 'admin'].includes(staff.role)) return respond(403, { error: 'Access denied' })

    // Authorization precedes every ratings query. Return a bounded snapshot for
    // the existing client analytics; the UI clearly labels truncated totals.
    const rows = []
    let total = 0
    const snapshot = new Date().toISOString()
    for (let offset = 0; offset < 10000; offset += 1000) {
      const { data, error, count } = await server.from('ratings')
        .select('id,product_slug,flavor_slug,rating,comment,language,source,created_at', { count: 'exact' })
        .or(`created_at.lte.${snapshot},created_at.is.null`).order('created_at', { ascending: false, nullsFirst: false }).order('id', { ascending: false })
        .range(offset, offset + 999).abortSignal(AbortSignal.timeout(15000))
      if (error) return respond(502, { error: 'Unable to load ratings' })
      rows.push(...(data ?? [])); total = count ?? 0
      if (!data || data.length < 1000 || rows.length >= total) break
    }
    return respond(200, { rows, truncated: total > rows.length })
  } catch { return respond(502, { error: 'Unable to load ratings' }) }
})
