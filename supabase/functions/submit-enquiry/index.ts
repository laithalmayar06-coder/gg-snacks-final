import { createClient } from 'npm:@supabase/supabase-js@2.115.0'
import { readBody, validate } from './validation.ts'
const origins = (Deno.env.get('ENQUIRIES_ALLOWED_ORIGINS') ?? '').split(',').map(value => value.trim()).filter(Boolean)
Deno.serve(async (request: Request) => {
 const origin = request.headers.get('origin')
 const headers: Record<string,string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' }
 if (origin && origins.includes(origin)) {
  headers['Access-Control-Allow-Origin'] = origin
  headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info'
  headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
 }
 const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers })
 if (!origins.length) return respond(503, { error: 'Submission unavailable' })
 if (origin && !origins.includes(origin)) return respond(403, { error: 'Origin not allowed' })
 if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
 if (request.method !== 'POST') return respond(405, { error: 'Method not allowed' })
 let row
 try { row = validate(await readBody(request)) } catch { return respond(400, { error: 'Invalid enquiry' }) }
 if (!row) return respond(400, { error: 'Invalid enquiry' })
 try {
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return respond(503, { error: 'Submission unavailable' })
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await client.from('enquiries').insert(row).abortSignal(AbortSignal.timeout(15000))
  if (error) return respond(503, { error: 'Submission unavailable' })
  // Persistence is the acceptance boundary. Future notifications must not undo accepted enquiries.
  return respond(201, { accepted: true })
 } catch { return respond(503, { error: 'Submission unavailable' }) }
})