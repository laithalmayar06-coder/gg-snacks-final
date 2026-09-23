const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const assert = require('node:assert/strict')
const crypto = require('node:crypto').webcrypto
function load(file, imports = {}, extras = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(code, { exports, require: name => imports[name] ?? require(name), URL, crypto, TextEncoder, TextDecoder, Uint8Array, Request, Response, AbortSignal, ...extras })
  return exports
}
const protection = load('supabase/functions/submit-rating/protection.ts')
const products = load('src/data/products.ts')
const valid = { product_slug: 'loots', flavor_slug: 'flavor-1', rating: 5, comment: ' hello ', language: 'en', source: 'qr' }
let handler, rpcCalls = [], history = new Map(), now = 0, dbFailure = false
const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-server-key', RATINGS_HASH_SECRET: 'test-only-secret-with-more-than-32-characters', RATINGS_TRUSTED_IP_HEADER: 'x-forwarded-for', RATINGS_ALLOWED_ORIGINS: 'https://gg.example' }
// Model the database contract to test Edge responses. Real SQL tests are separate.
const server = { rpc: (name, args) => ({ abortSignal: async () => {
  assert.equal(name,'submit_anonymous_rating'); rpcCalls.push(args)
  if (dbFailure) return { error: new Error('database unavailable'), data: null }
  const previous = (history.get(args.p_source_hash) || []).filter(time => time > now - 3600000)
  const minute = previous.filter(time => time > now - 60000)
  let retry = previous.length ? Math.max(0,10-(now-previous.at(-1))/1000) : 0
  if (minute.length >= 5) retry = Math.max(retry,60-(now-minute[0])/1000)
  if (previous.length >= 30) retry = Math.max(retry,3600-(now-previous[0])/1000)
  if (retry > 0) return { data: { accepted: false, retry_after: Math.ceil(retry) }, error: null }
  history.set(args.p_source_hash,[...previous,now])
  return { data: { accepted: true }, error: null }
} }) }
load('supabase/functions/submit-rating/index.ts', { './protection.ts': protection, 'npm:@supabase/supabase-js@2.115.0': { createClient: () => server } }, { Deno: { env: { get: key => env[key] }, serve: callback => { handler = callback } } })
const request = (body = valid, headers = {}, method = 'POST') => new Request('https://example.supabase.co/functions/v1/submit-rating', { method, headers: { origin: 'https://gg.example', 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1', ...headers }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) })
;(async () => {
  // Every existing QR combination is recognized by the server.
  for (const product of products.productFamilies) for (const flavor of product.flavors) {
    assert.ok(protection.validateRating({ ...valid, product_slug: product.slug, flavor_slug: flavor.slug }))
  }
  for (const value of [null, [], {}, { ...valid, rating: '5' }, { ...valid, rating: 0 }, { ...valid, rating: 6 }, { ...valid, rating: 1.2 }, { ...valid, comment: 1 }, { ...valid, comment: 'x'.repeat(1001) }, { ...valid, comment: '\0' }, { ...valid, product_slug: 'new-product' }, { ...valid, flavor_slug: 'missing' }, { ...valid, language: 'xx' }, { ...valid, source: 'other' }, { ...valid, ip: 'spoofed' }]) assert.equal(protection.validateRating(value),null)
  assert.equal(protection.networkSource('192.0.2.1'),'192.0.2.1')
  assert.equal(protection.networkSource('::ffff:192.0.2.1'),'192.0.2.1')
  assert.equal(protection.networkSource('2001:DB8::1'),protection.networkSource('2001:db8:0:0::2'))
  for (const ip of [null,'','fake','1.2.3.4, 5.6.7.8','fe80::1%eth0']) assert.equal(protection.networkSource(ip),null)
  const hash = await protection.hashSource('192.0.2.1',env.RATINGS_HASH_SECRET)
  assert.match(hash,/^[a-f0-9]{64}$/)
  assert.notEqual(hash,await protection.hashSource('192.0.2.1','different-secret'))
  let response = await handler(request())
  assert.equal(response.status,201); assert.equal((await response.json()).accepted,true)
  assert.equal(rpcCalls[0].p_comment,'hello')
  assert.equal(rpcCalls[0].p_source_hash,hash)
  assert.ok(!JSON.stringify(rpcCalls).includes('192.0.2.1'))
  response = await handler(request())
  assert.equal(response.status,429); assert.equal(response.headers.get('retry-after'),'10')
  assert.equal(history.get(hash).length,1)
  for (const second of [10,20,30,40]) { now = second*1000; assert.equal((await handler(request())).status,201) }
  now = 50000; assert.equal((await handler(request())).status,429)
  now = 60000; assert.equal((await handler(request())).status,201)
  assert.equal((await handler(request(valid, { 'x-forwarded-for': '192.0.2.2' }))).status,201)
  history.set(hash,Array.from({length:30},(_,i) => now - 3500000 + i*60000))
  response = await handler(request()); assert.equal(response.status,429)
  now += 3600000; assert.equal((await handler(request())).status,201)
  const parallel = await Promise.all(Array.from({ length: 8 }, () => handler(request(valid, { 'x-forwarded-for': '192.0.2.10' }))))
  assert.equal(parallel.filter(item => item.status === 201).length,1)
  assert.equal(parallel.filter(item => item.status === 429).length,7)
  const before = rpcCalls.length
  for (const body of ['{broken','x'.repeat(8193),{...valid,rating:6}]) assert.equal((await handler(request(body))).status,400)
  assert.equal((await handler(request(valid, { 'content-type':'text/plain' }))).status,400)
  assert.equal((await handler(request(valid, { 'content-type':'application/jsonp' }))).status,400)
  assert.equal((await handler(request(valid, { 'x-forwarded-for':'' }))).status,503)
  assert.equal((await handler(request(valid, { 'x-forwarded-for':'1.2.3.4, 192.0.2.1' }))).status,503)
  assert.equal((await handler(request(valid, { origin:'https://evil.example' }))).status,403)
  assert.equal((await handler(request(valid, {}, 'GET'))).status,405)
  assert.equal((await handler(request(valid, {}, 'OPTIONS'))).status,204)
  assert.equal(rpcCalls.length,before)
  dbFailure = true; assert.equal((await handler(request())).status,503); dbFailure = false
  delete env.RATINGS_HASH_SECRET
  assert.equal((await handler(request())).status,503)
  const sql = fs.readFileSync('supabase/migrations/005_rating_abuse_protection.sql','utf8')
  assert.match(sql,/for update/i)
  assert.match(sql,/drop policy "Anonymous rating inserts"/)
  assert.match(sql,/revoke insert \(product_slug,flavor_slug,rating,comment,language,source\)/)
  assert.match(sql,/revoke all on function public.submit_anonymous_rating[^;]+from public, anon, authenticated/)
  assert.ok(!/delete from public.ratings|update public.ratings|alter table public.ratings/i.test(sql))
  console.log('Rating abuse validation, all QR routes, source normalization/privacy, 429/retry, windows and fail-closed Edge checks passed (mocked RPC; SQL tests separate)')
})().catch(error => { console.error(error); process.exitCode = 1 })
