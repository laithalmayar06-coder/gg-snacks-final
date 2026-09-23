const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const assert = require('node:assert/strict')
const React = require('react')
function load(file, mocks) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  vm.runInNewContext(code, { exports, require: name => name.endsWith('.css') ? {} : name in mocks ? mocks[name] : require(name), AbortSignal })
  return exports
}
let role = 'admin', aal = 'aal1', roleFailure = false, aalFailure = false, logoutFailure = false
let logoutCalls = 0, assuranceCalls = 0, signedOutScope
let factors = { all: [], totp: [] }, enrolled = 0, verified = 0, removed = [], factorFailure = false, verifyFailure = false
const client = { auth: {
  signOut: async options => { logoutCalls++; signedOutScope = options.scope; return { error: logoutFailure ? new Error('network') : null } },
  mfa: {
    getAuthenticatorAssuranceLevel: async token => { assuranceCalls++; assert.equal(token, 'test-token'); return { data: { currentLevel: aal }, error: aalFailure ? new Error('failed') : null } },
    listFactors: async () => ({ data: factors, error: factorFailure ? new Error('failed') : null }),
    unenroll: async ({ factorId }) => { removed.push(factorId); return { error: null } },
    enroll: async options => { enrolled++; assert.equal(options.factorType, 'totp'); return { data: { id: 'new-factor', totp: { qr_code: '<svg></svg>', secret: 'MUST_NOT_ESCAPE', uri: 'otpauth://MUST_NOT_ESCAPE' } }, error: null } },
    challengeAndVerify: async input => { verified++; assert.equal(input.factorId, 'new-factor'); assert.equal(input.code, '123456'); return { error: verifyFailure ? new Error('wrong code') : null } },
  },
} }
const access = load('src/auth/staffAccess.ts', { '../lib/supabase': { getStaffSupabase: () => client }, '../cms/api': { getCmsRole: async () => { if (roleFailure) throw new Error('failed'); return role } } })
const mfa = load('src/auth/staffMfa.ts', { '../lib/supabase': { getStaffSupabase: () => client } })
;(async () => {
  for (const staffRole of ['admin','viewer']) {
    role = staffRole
    for (const level of ['aal1','aal2',null]) {
      aal = level
      const result = await access.readStaffAccess('test-token', new AbortController().signal)
      assert.equal(access.hasProtectedStaffAccess(result), level === 'aal2')
    }
  }
  role = null
  const before = assuranceCalls
  assert.equal(access.hasProtectedStaffAccess(await access.readStaffAccess('test-token', new AbortController().signal)), false)
  assert.equal(assuranceCalls, before)
  role = 'admin'; roleFailure = true
  await assert.rejects(access.readStaffAccess('test-token', new AbortController().signal))
  roleFailure = false; aalFailure = true
  await assert.rejects(access.readStaffAccess('test-token', new AbortController().signal))
  aalFailure = false

  const ownPending = { id: 'abandoned', status: 'unverified', factor_type: 'totp', friendly_name: 'GG Snacks staff' }
  factors = { all: [ownPending, { ...ownPending, id: 'other', friendly_name: 'Other app' }], totp: [] }
  const setup = await mfa.beginStaffEnrollment()
  assert.deepEqual(removed, ['abandoned'])
  assert.equal(setup.id, 'new-factor'); assert.ok(setup.qr.startsWith('data:image/svg+xml'))
  assert.deepEqual(Object.keys(setup).sort(), ['id','qr'])
  assert.equal(JSON.stringify(setup).includes('MUST_NOT_ESCAPE'), false)
  factors = { all: [{ id: 'verified', status: 'verified', factor_type: 'totp' }], totp: [{ id: 'verified', status: 'verified' }] }
  assert.equal(await mfa.beginStaffEnrollment(), null)
  assert.equal(enrolled, 1)
  assert.equal((await mfa.loadStaffFactors()).length, 1)
  factorFailure = true; await assert.rejects(mfa.beginStaffEnrollment()); await assert.rejects(mfa.loadStaffFactors()); factorFailure = false
  await assert.rejects(mfa.verifyStaffCode('new-factor', '12'))
  assert.equal(verified, 0)
  await mfa.verifyStaffCode('new-factor', '123456')
  verifyFailure = true; await assert.rejects(mfa.verifyStaffCode('new-factor', '123456')); verifyFailure = false

  // Exercise the actual route guard with supplied session states, not only the predicate.
  let context = { session: { user: { id: 'staff' } }, loading: false, error: '', accessLoading: false, accessError: '', access: { role: 'admin', aal: 'aal1' } }
  const router = { Navigate: () => null, Outlet: () => null }
  const gate = load('src/auth/StaffSession.tsx', { react: { ...React, useContext: () => context }, 'react-router': router, './staffAccess': access, './StaffLogout': { default: () => null }, '../lib/supabase': { getStaffSupabase: () => client } })
  assert.equal(gate.RequireStaffSession().props.to, '/admin/mfa')
  context.access = { role: 'viewer', aal: 'aal2' }
  assert.equal(gate.RequireStaffSession().type, router.Outlet)
  context.access = { role: 'admin', aal: 'aal2' }
  assert.equal(gate.RequireStaffSession().type, router.Outlet)
  context.access = { role: null, aal: 'aal2' }
  assert.equal(gate.RequireStaffSession().type, 'main')
  context.session = null
  assert.equal(gate.RequireStaffSession().props.to, '/admin/login')

  // Exercise the shared button used in CMS navigation, including failed logout.
  const navigations = [], stateUpdates = []
  const logout = load('src/auth/StaffLogout.tsx', { react: { ...React, useRef: () => ({ current: false }), useState: value => [value, next => stateUpdates.push(next)] }, 'react-router': { useNavigate: () => (...args) => navigations.push(args) }, './staffAccess': access })
  await logout.default().props.children[0].props.onClick()
  assert.equal(signedOutScope, 'local'); assert.equal(logoutCalls, 1); assert.equal(navigations[0][0], '/admin/login')
  logoutFailure = true
  await logout.default().props.children[0].props.onClick()
  assert.equal(navigations.length, 1); assert.ok(stateUpdates.includes('Unable to sign out. Please try again.'))
  assert.ok(fs.readFileSync('src/cms/AdminNavigation.tsx','utf8').includes('<StaffLogout />'))

  const sql = fs.readFileSync('supabase/migrations/004_staff_mfa.sql','utf8')
  for (const policy of ['Staff read CMS','Admin insert CMS','Admin update CMS','Admin delete stores']) assert.ok(sql.includes(`alter policy "${policy}"`))
  assert.equal((sql.match(/aal2/g) || []).length, 5)
  assert.ok(!/alter policy "Public CMS read"|alter policy "Anonymous rating inserts"|alter table|create table|drop policy/i.test(sql))
  console.log('Staff MFA: access gate, enrollment/challenge failures, secret minimization, shared CMS logout and migration structure passed (mocked; SQL not executed)')
})().catch(error => { console.error(error); process.exitCode = 1 })
