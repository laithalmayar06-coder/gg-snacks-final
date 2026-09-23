import { createClient } from 'npm:@supabase/supabase-js@2.115.0'
import { hashSource, networkSource, readSmallJson, validateRating } from './protection.ts'

const origins = (Deno.env.get('RATINGS_ALLOWED_ORIGINS') ?? '').split(',').map(value => value.trim()).filter(Boolean)
Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin')
  const headers: Record<string,string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' }
  if (origin && origins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info'
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    headers['Access-Control-Expose-Headers'] = 'Retry-After'
  }
  const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers })
  if (origin && !origins.includes(origin)) return respond(403, { error: 'Origin not allowed' })
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed' })
  let payload
  try { payload = validateRating(await readSmallJson(request)) } catch { return respond(400, { error: 'Invalid rating request' }) }
  if (!payload) return respond(400, { error: 'Invalid rating request' })
  const url = Deno.env.get('SUPABASE_URL'), serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const secret = Deno.env.get('RATINGS_HASH_SECRET')
  const ipHeader = Deno.env.get('RATINGS_TRUSTED_IP_HEADER')
  if (!url || !serviceKey || !secret || secret.length < 32 || !ipHeader || !['x-forwarded-for','x-real-ip'].includes(ipHeader)) return respond(503, { error: 'Submission unavailable' })
  // Deployment must verify this header is overwritten by the trusted ingress.
  const source = networkSource(request.headers.get(ipHeader))
  if (!source) return respond(503, { error: 'Submission unavailable' })
  try {
    const sourceHash = await hashSource(source, secret)
    const server = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data, error } = await server.rpc('submit_anonymous_rating', {
      p_source_hash: sourceHash, p_product: payload.product_slug, p_flavor: payload.flavor_slug,
      p_rating: payload.rating, p_comment: payload.comment, p_language: payload.language,
    }).abortSignal(AbortSignal.timeout(15000))
    if (error || !data || typeof data.accepted !== 'boolean') return respond(503, { error: 'Submission unavailable' })
    if (!data.accepted) {
      const retry = Number.isInteger(data.retry_after) && data.retry_after > 0 ? Math.min(data.retry_after,3600) : 60
      headers['Retry-After'] = String(retry)
      return respond(429, { error: 'Please wait before submitting again', retry_after: retry })
    }
    return respond(201, { accepted: true })
  } catch { return respond(503, { error: 'Submission unavailable' }) }
})
