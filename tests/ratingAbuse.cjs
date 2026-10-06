const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const assert = require('node:assert/strict')
const { createClient } = require('@supabase/supabase-js')
function load(file, imports = {}, extras = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, {
    exports, require: name => imports[name] ?? require(name),
    TextEncoder, TextDecoder, Uint8Array, Request, Response, AbortSignal, ...extras,
  })
  return exports
}
const protection = load('supabase/functions/submit-rating/protection.ts')
const products = load('src/data/products.ts')
const valid = { product_slug: 'loots', flavor_slug: 'flavor-1', rating: 5, comment: ' hello ', language: 'en', source: 'qr' }
const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'test-anonymous-key',
  RATINGS_ALLOWED_ORIGINS: 'https://gg.example',
}
let handler, dbFailure = false, transportFailure = false
const inserts = []
let clientCount = 0
// Use the real SDK with a local-only fetch stub: verify the actual REST method, headers and body.
const fakeFetch = async (url, options) => {
  assert.equal(String(url), 'https://example.supabase.co/rest/v1/ratings')
  assert.equal(options.method, 'POST')
  const headers = new Headers(options.headers)
  assert.equal(headers.get('apikey'), env.SUPABASE_ANON_KEY)
  assert.equal(headers.get('authorization'), 'Bearer ' + env.SUPABASE_ANON_KEY)
  assert.ok(!headers.get('prefer')?.includes('return=representation'))
  assert.ok(!headers.has('x-forwarded-for'))
  assert.ok(!headers.has('x-real-ip'))
  assert.ok(!headers.has('cf-connecting-ip'))
  assert.ok(options.signal instanceof AbortSignal)
  inserts.push(JSON.parse(options.body))
  if (transportFailure) throw new DOMException('Timed out', 'TimeoutError')
  if (dbFailure) return new Response(JSON.stringify({
    code: '42501', message: 'private database diagnostic', details: null, hint: null,
  }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  return new Response(null, { status: 201 })
}
load('supabase/functions/submit-rating/index.ts', {
  './protection.ts': protection,
  'npm:@supabase/supabase-js@2.115.0': { createClient: (url, key, options) => {
    clientCount++
    assert.equal(url, env.SUPABASE_URL)
    assert.equal(key, env.SUPABASE_ANON_KEY)
    assert.equal(options.auth.persistSession, false)
    assert.equal(options.auth.autoRefreshToken, false)
    assert.equal(options.auth.detectSessionInUrl, false)
    assert.equal(options.global, undefined)
    return createClient(url, key, { ...options, global: { fetch: fakeFetch } })
  } },
}, { Deno: {
  env: { get: key => {
    assert.ok(['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'RATINGS_ALLOWED_ORIGINS'].includes(key), 'Unexpected environment dependency: ' + key)
    return env[key]
  } },
  serve: callback => { handler = callback },
} })
const request = (body = valid, headers = {}, method = 'POST') => new Request('https://example.supabase.co/functions/v1/submit-rating', {
  method, headers: { origin: 'https://gg.example', 'content-type': 'application/json', ...headers },
  ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
})
;(async () => {
  let response = await handler(request())
  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { accepted: true })
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://gg.example')
  assert.deepEqual(inserts[0], { ...valid, comment: 'hello' })

  // All twelve original routes plus TRIGGER Sushi use the same anonymous INSERT contract.
  for (const product of products.productFamilies) for (const flavor of product.flavors) {
    const body = { ...valid, product_slug: product.slug, flavor_slug: flavor.slug }
    assert.ok(protection.validateRating(body))
    assert.equal((await handler(request(body))).status, 201)
    assert.equal(inserts.at(-1).product_slug, product.slug)
    assert.equal(inserts.at(-1).flavor_slug, flavor.slug)
  }
  const sushi = { ...valid, product_slug: 'trigger', flavor_slug: 'flavor-4', language: 'ar' }
  response = await handler(request(sushi, {
    authorization: 'Bearer caller-staff-token', apikey: 'caller-key',
    'x-forwarded-for': 'forged, chain', 'x-real-ip': 'not-an-ip', 'cf-connecting-ip': '192.0.2.44',
  }))
  assert.equal(response.status, 201)
  assert.deepEqual(inserts.at(-1), { ...sushi, comment: 'hello' })
  // No active limiter is claimed or required while its migration remains pending.
  assert.equal((await handler(request(sushi))).status, 201)
  for (const comment of [undefined, null, '   ', 'x'.repeat(1000)]) {
    assert.equal((await handler(request({ ...valid, comment, source: undefined }))).status, 201)
    assert.equal(inserts.at(-1).comment, typeof comment === 'string' ? comment.trim() || null : null)
    assert.equal(inserts.at(-1).source, 'qr')
  }
  assert.equal((await handler(request(valid, { origin: '' }))).status, 201)

  const before = inserts.length
  const clientsBefore = clientCount
  for (const value of [
    null, [], {}, { ...valid, rating: '5' }, { ...valid, rating: 0 }, { ...valid, rating: 6 },
    { ...valid, rating: 1.2 }, { ...valid, comment: 1 }, { ...valid, comment: 'x'.repeat(1001) },
    { ...valid, comment: '\0' }, { ...valid, product_slug: 'new-product' },
    { ...valid, flavor_slug: 'missing' }, { ...valid, language: 'xx' },
    { ...valid, source: 'other' }, { ...valid, ip: 'spoofed' }, { ...valid, id: 'caller-id' },
    ...['pop-g', 'loots', 'x-stix', 'missing'].map(product_slug => ({ ...sushi, product_slug })),
  ]) {
    assert.equal(protection.validateRating(value), null)
    assert.equal((await handler(request(value))).status, 400)
  }
  for (const body of ['{broken', 'x'.repeat(8193), JSON.stringify({ ...valid, comment: ' '.repeat(8200) })]) {
    assert.equal((await handler(request(body, { 'content-length': '1' }))).status, 400)
  }
  // Streaming byte limit applies even when each multibyte field is otherwise syntactically valid.
  await assert.rejects(() => protection.readSmallJson(request(JSON.stringify({ text: 'ح'.repeat(5000) }))))
  for (const contentType of ['text/plain', 'application/jsonp']) {
    assert.equal((await handler(request(valid, { 'content-type': contentType }))).status, 400)
  }
  response = await handler(request(valid, { origin: 'https://evil.example' }))
  assert.equal(response.status, 403)
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null)
  assert.equal((await handler(request(valid, {}, 'GET'))).status, 405)
  assert.equal((await handler(request(valid, {}, 'OPTIONS'))).status, 204)
  assert.equal(inserts.length, before)
  assert.equal(clientCount, clientsBefore)

  dbFailure = true
  response = await handler(request())
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { error: 'Submission unavailable' })
  dbFailure = false
  transportFailure = true
  response = await handler(request())
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { error: 'Submission unavailable' })
  transportFailure = false
  const countBeforeMissingConfig = inserts.length
  for (const key of ['SUPABASE_URL', 'SUPABASE_ANON_KEY']) {
    const saved = env[key]
    delete env[key]
    assert.equal((await handler(request())).status, 503)
    env[key] = saved
  }
  assert.equal(inserts.length, countBeforeMissingConfig)
  const source = fs.readFileSync('supabase/functions/submit-rating/index.ts', 'utf8')
    + fs.readFileSync('supabase/functions/submit-rating/protection.ts', 'utf8')
  assert.doesNotMatch(source, /\.rpc\s*\(|submit_anonymous_rating|rating_security|purge_rating_limits|RATINGS_HASH_SECRET|RATINGS_TRUSTED_IP_HEADER|SUPABASE_SERVICE_ROLE_KEY/)
  console.log('Rating endpoint checks passed: anonymous REST INSERT, all 13 routes, TRIGGER Sushi, validation, request limits, CORS, no credential forwarding, and safe DB/timeout failures. Fetch mocked; no network requests or live ratings.')
})().catch(error => { console.error(error); process.exitCode = 1 })
