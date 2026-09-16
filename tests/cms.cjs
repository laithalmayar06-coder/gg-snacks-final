const fs = require('node:fs')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
function load(path, imports = {}) {
  const box = { exports: {}, URL, AbortSignal, require: name => imports[name] }
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, box)
  return box.exports
}
const schema = load('src/cms/schema.ts')
const products = load('src/data/products.ts')
const catalog = load('src/cms/publicCatalog.ts', { react: { useMemo: fn => fn() }, '../data/products': products, './CmsProvider': { useCms: () => ({}) }, './schema': schema })
const section = schema.cmsSections.products
const draft = { ...schema.newCmsRow(section), slug: 'test-product', name_en: 'Test', name_ar: 'اختبار', id: 'injected', updated_at: 'injected' }
assert.equal(Object.keys(schema.validateCmsRow(section, draft)).length, 0)
const payload = schema.cmsPayload(section, draft)
assert.equal(payload.id, undefined)
assert.equal(payload.updated_at, undefined)
assert.equal(payload.image_url, null)
assert.ok(schema.validateCmsRow(section, { ...draft, slug: 'Bad slug' }).slug)
assert.ok(schema.validateCmsRow(section, { ...draft, image_url: 'javascript:alert(1)' }).image_url)
assert.ok(schema.validateCmsRow(section, { ...draft, display_order: 1.5 }).display_order)
assert.ok(schema.validateCmsRow(section, { ...draft, accent: 'red' }).accent)
assert.equal(schema.validCmsUrl('/images/package.png', true), true)
assert.equal(schema.validCmsUrl('//evil.example/path', true), false)
assert.equal(schema.validCmsUrl('https://user:secret@example.test'), false)
assert.equal(schema.validCmsUrl('data:text/html,test', true), false)
assert.ok(schema.validateCmsRow(schema.cmsSections.stores, { ...schema.newCmsRow(schema.cmsSections.stores), latitude: 91 }).latitude)
assert.ok(schema.validateCmsRow(schema.cmsSections.tournament, { ...schema.newCmsRow(schema.cmsSections.tournament), registration_date: '2027-04-01', tournament_date: '2027-03-01' }).tournament_date)
assert.ok(schema.validateCmsRow(schema.cmsSections.tournament, { ...schema.newCmsRow(schema.cmsSections.tournament), tournament_date: '2027-02-30' }).tournament_date)
assert.equal(catalog.buildCatalog({}), products.productFamilies)
assert.equal(catalog.buildCatalog({ products: [], flavors: [] }).length, 0)
const managed = catalog.buildCatalog({ products: [{ ...payload, id: 'p1', slug: 'pop-g', is_active: false, allergens_en: 'Milk', allergens_ar: 'حليب' }], flavors: [{ id: 'f1', product_id: 'p1', slug: 'flavor-1', name_en: 'New display name', name_ar: 'اسم جديد', is_active: true, is_placeholder: false, accent: '#00cfff' }] })
assert.equal(managed[0].isActive, false)
assert.equal(managed[0].flavors[0].ratingPath, '/rate/pop-g/flavor-1')
assert.equal(managed[0].allergens.ar, 'حليب')
assert.equal(catalog.canRate('pop-g', 'flavor-1'), true)
assert.equal(catalog.canRate('new-product', 'new-flavor'), false)
assert.equal(catalog.cmsText({ site_content: [{ key: 'about', is_active: false, body_en: 'Draft' }] }, 'about', 'body', 'en'), undefined)
assert.equal(catalog.cmsText({ site_content: [{ key: 'about', is_active: true, body_en: 'Published', body_ar: 'منشور' }] }, 'about', 'body', 'ar'), 'منشور')

let role = 'admin', savedPayload, failSave = false
const client = {
  rpc: () => ({ abortSignal: async () => ({ data: role, error: null }) }),
  from: table => {
    const query = {
      insert: value => { savedPayload = value; return query }, update: value => { savedPayload = value; return query },
      eq: () => query, select: () => query, abortSignal: () => query,
      single: async () => ({ data: failSave ? null : { ...savedPayload, id: 'saved' }, error: failSave ? { code: 'PGRST116' } : null }),
    }
    return query
  },
}
const api = load('src/cms/api.ts', { '../lib/supabase': { getStaffSupabase: () => client, getSupabase: () => client }, './schema': schema })
;(async () => {
  assert.equal(await api.getCmsRole(new AbortController().signal), 'admin')
  role = 'viewer'; assert.equal(await api.getCmsRole(new AbortController().signal), 'viewer')
  role = 'unknown'; assert.equal(await api.getCmsRole(new AbortController().signal), null)
  await api.saveCmsRow(section, draft, null)
  assert.equal(savedPayload.slug, 'test-product')
  assert.equal(savedPayload.id, undefined)
  failSave = true
  await assert.rejects(() => api.saveCmsRow(section, draft, { id: 'p1', updated_at: 'old' }))
  await assert.rejects(() => api.saveCmsRow(section, { ...draft, slug: 'bad slug' }, null))
  const sql = fs.readFileSync('supabase/migrations/003_admin_cms.sql', 'utf8')
  assert.ok(sql.includes('security definer set search_path'))
  assert.ok(sql.includes('where user_id = (select auth.uid())'))
  assert.ok(sql.includes('enable row level security'))
  assert.ok(sql.includes('revoke all on function public.cms_staff_role() from public, anon'))
  assert.ok(sql.includes('Slugs and parent identities are permanent'))
  assert.ok(!/alter table public\.(ratings|staff_users)|create policy[^;]*on public\.ratings/i.test(sql))
  console.log('CMS validation, safe URLs, catalog/rating compatibility, access-gate and save failure checks passed; SQL assertions are structural, not live RLS execution')
})().catch(error => { console.error(error); process.exitCode = 1 })
