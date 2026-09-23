// TEMPORARY: deploy only for ingress verification, then delete this function.
// No Supabase client, database access, rating submission or application imports.
import { isIP } from 'node:net'

Deno.serve(async (request: Request) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers })
  const token = Deno.env.get('IP_DIAGNOSTIC_TOKEN')
  if (!token || token.length < 32) return reply(503, { error: 'Diagnostic disabled' })
  if (request.headers.get('x-diagnostic-token') !== token) return reply(403, { error: 'Denied' })
  if (request.method !== 'POST') return reply(405, { error: 'POST required' })
  const run = request.headers.get('x-diagnostic-run') ?? ''
  if (!/^[0-9a-f-]{36}$/i.test(run)) return reply(400, { error: 'Invalid run' })
  const probe = request.headers.get('x-diagnostic-probe') ?? ''
  if (!['198.51.100.77','203.0.113.88'].includes(probe)) return reply(400, { error: 'Invalid probe' })
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', encoder.encode(token), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const result: Record<string, unknown> = {}
    for (const name of ['x-forwarded-for','x-real-ip','cf-connecting-ip']) {
      const raw = request.headers.get(name)
      if (raw && raw.length > 2048) return reply(400, { error: 'Header too long' })
      const value = raw?.trim() ?? ''
      const digest = value ? await crypto.subtle.sign('HMAC', key, encoder.encode(`${run}\n${name}\n${value}`)) : null
      result[name] = {
        present: Boolean(value), single_ip: isIP(value) !== 0,
        matches_probe: value === probe,
        contains_probe: value.split(',').some(part => part.trim() === probe),
        // Comparable only within this diagnostic run; cannot recover the IP without the secret.
        value_tag: digest ? Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,'0')).join('') : null,
      }
    }
    return reply(200, result)
  } catch { return reply(503, { error: 'Diagnostic unavailable' }) }
})
