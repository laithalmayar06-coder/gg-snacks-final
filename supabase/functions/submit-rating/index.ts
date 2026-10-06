import { createClient } from 'npm:@supabase/supabase-js@2.115.0'
import { readSmallJson, validateRating } from './protection.ts'

const origins = (Deno.env.get('RATINGS_ALLOWED_ORIGINS') ?? '').split(',').map(value => value.trim()).filter(Boolean)
Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin')
  const headers: Record<string,string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' }
  if (origin && origins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info'
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
  }
  const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers })
  if (origin && !origins.includes(origin)) return respond(403, { error: 'Origin not allowed' })
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed' })
  let payload
  try { payload = validateRating(await readSmallJson(request)) } catch { return respond(400, { error: 'Invalid rating request' }) }
  if (!payload) return respond(400, { error: 'Invalid rating request' })
  const url = Deno.env.get('SUPABASE_URL'), anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!url || !anonKey) return respond(503, { error: 'Submission unavailable' })
  try {
    // Match the original anonymous INSERT path: keep RLS and never forward staff credentials.
    const server = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    // No .select(): anonymous clients may insert ratings but may not read them.
    const { error } = await server.from('ratings').insert({
      product_slug: payload.product_slug,
      flavor_slug: payload.flavor_slug,
      rating: payload.rating,
      comment: payload.comment || null,
      language: payload.language,
      source: 'qr',
    }).abortSignal(AbortSignal.timeout(15000))
    if (error) return respond(503, { error: 'Submission unavailable' })
    return respond(201, { accepted: true })
  } catch { return respond(503, { error: 'Submission unavailable' }) }
})
