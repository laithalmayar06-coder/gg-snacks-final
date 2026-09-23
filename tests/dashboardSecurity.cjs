const fs = require('node:fs')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
const code = ts.transpileModule(fs.readFileSync('supabase/functions/ratings-dashboard/index.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
async function run({ token, user = null, role = null, origin = 'http://localhost:5173', method = 'GET', staffError = null, aal = 'aal2', claimsError = null, claimSub }) {
  let handler
  const calls = []
  const client = {
    auth: { getClaims: async supplied => { calls.push(['claims', supplied]); return { data: { claims: { sub: claimSub ?? user?.id, aal } }, error: claimsError } }, getUser: async supplied => { calls.push(['auth', supplied]); return { data: { user }, error: user ? null : new Error('invalid') } } },
    from: table => {
      calls.push(['table', table])
      if (table === 'staff_users') return { select: () => ({ eq: (column, id) => { calls.push(['membership', column, id]); return { maybeSingle: async () => ({ data: role ? { role } : null, error: staffError }) } } }) }
      const query = { select: () => query, or: () => query, order: () => query, range: () => query, abortSignal: async () => ({ data: [], error: null, count: 0 }) }
      return query
    },
  }
  vm.runInNewContext(code, {
    exports: {}, require: () => ({ createClient: () => client }), Response, Request, AbortSignal, Date,
    Deno: { env: { get: name => ({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'server-test-value', DASHBOARD_ALLOWED_ORIGINS: 'http://localhost:5173' })[name] }, serve: value => { handler = value } },
  })
  const headers = { Origin: origin }
  if (token) headers.Authorization = `Bearer ${token}`
  return { response: await handler(new Request('https://example.supabase.co/functions/v1/ratings-dashboard', { method, headers })), calls }
}
;(async () => {
  for (const options of [{}, { token: 'invalid' }]) {
    const result = await run(options)
    assert.equal(result.response.status, 401)
    assert.equal(result.calls.some(call => call[0] === 'table'), false)
  }
  const nonstaff = await run({ token: 'valid', user: { id: 'user-1' } })
  assert.equal(nonstaff.response.status, 403)
  assert.equal(nonstaff.calls.some(call => call[1] === 'ratings'), false)
  assert.ok(nonstaff.calls.some(call => call[0] === 'membership' && call[2] === 'user-1'))
  for (const role of ['viewer', 'admin']) {
    const staff = await run({ token: 'valid', user: { id: 'staff-1' }, role })
    assert.equal(staff.response.status, 200)
    assert.equal(staff.response.headers.get('Cache-Control'), 'no-store')
    assert.deepEqual(await staff.response.json(), { rows: [], truncated: false })
    assert.ok(staff.calls.findIndex(call => call[0] === 'membership') < staff.calls.findIndex(call => call[1] === 'ratings'))
  }
  for (const role of ['admin', 'viewer']) {
    for (const aal of ['aal1', null, 'unexpected']) {
      const denied = await run({ token: 'valid', user: { id: 'staff-1' }, role, aal })
      assert.equal(denied.response.status, 403)
      assert.equal((await denied.response.json()).code, 'mfa_required')
      assert.equal(denied.calls.some(call => call[1] === 'ratings'), false)
    }
  }
  for (const extra of [{ claimsError: new Error('invalid signature') }, { claimSub: 'other-user' }]) {
    const denied = await run({ token: 'valid', user: { id: 'staff-1' }, role: 'admin', ...extra })
    assert.equal(denied.response.status, 401)
    assert.equal(denied.calls.some(call => call[1] === 'ratings'), false)
  }
  const failed = await run({ token: 'valid', user: { id: 'staff-1' }, role: 'admin', staffError: new Error('db') })
  assert.equal(failed.response.status, 503)
  assert.equal(failed.calls.some(call => call[1] === 'ratings'), false)
  assert.equal((await run({ origin: 'https://untrusted.example' })).response.status, 403)
  assert.equal((await run({ method: 'POST' })).response.status, 405)
  assert.equal((await run({ method: 'OPTIONS' })).response.status, 204)
  console.log('Edge authorization checks passed (mocked Supabase)')
})().catch(error => { console.error(error); process.exitCode = 1 })
