const fs = require('node:fs')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
function load(path, imports = {}) {
  const box = { exports: {}, require: name => imports[name] }
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, box)
  return box.exports
}
const products = load('src/data/products.ts')
const { feedbackDestination } = load('src/data/feedback.ts', { './products': products })
for (const family of products.productFamilies) {
  for (const flavour of products.getActiveFlavors(family)) assert.equal(feedbackDestination(family.slug, flavour.slug), flavour.ratingPath)
}
assert.equal(feedbackDestination('missing', 'flavor-1'), null)
assert.equal(feedbackDestination('pop-g', 'missing'), null)
const flavour = products.productFamilies[0].flavors[0]
flavour.isActive = false
assert.equal(feedbackDestination(products.productFamilies[0].slug, flavour.slug), null)

const { stores, filterStores } = load('src/data/stores.ts')
assert.equal(filterStores(stores, '', '').length, 3)
assert.equal(filterStores(stores, 'Jeddah', '').length, 2)
assert.equal(filterStores(stores, 'Jeddah', 'Sample district A').length, 1)
assert.equal(filterStores(stores, 'Riyadh', 'Sample district B').length, 0)
assert.equal(filterStores([], '', '').length, 0)
assert.ok(stores.every(store => store.isPlaceholder && store.latitude === null && store.longitude === null))

const { validateEnquiry, emptyEnquiry, requestTypes } = load('src/data/enquiries.ts')
const valid = { name: 'Test Person', company: 'Test Company', email: 'test@example.test', phone: '', requestType: 'general', message: 'A sample enquiry.' }
assert.equal(Object.keys(validateEnquiry(valid, true)).length, 0)
assert.equal(Object.keys(validateEnquiry({ ...valid, company: '', requestType: '' }, false)).length, 0)
assert.equal(Object.keys(validateEnquiry(emptyEnquiry, true)).length, 4)
assert.equal(validateEnquiry({ ...valid, name: '   ' }, true).name, 'required')
assert.equal(validateEnquiry({ ...valid, email: 'broken@' }, true).email, 'invalidEmail')
assert.equal(validateEnquiry({ ...valid, phone: 'abc123' }, true).phone, 'invalidPhone')
assert.equal(validateEnquiry({ ...valid, phone: '+966 500 000 000' }, true).phone, undefined)
assert.equal(validateEnquiry({ ...valid, requestType: 'unknown' }, true).requestType, 'required')
assert.equal(validateEnquiry({ ...valid, message: 'x'.repeat(3001) }, true).message, 'tooLong')
for (const type of requestTypes) assert.equal(validateEnquiry({ ...valid, requestType: type.id }, true).requestType, undefined)
const { pageCopy, pageTitles, publicPaths, legalContent } = load('src/data/publicContent.ts')
assert.deepEqual(Object.keys(pageCopy.en).sort(), Object.keys(pageCopy.ar).sort())
assert.equal(publicPaths.length, 10)
for (const path of publicPaths) assert.ok(pageTitles[path].en && pageTitles[path].ar)
assert.equal(legalContent.privacy.body, null)
assert.equal(legalContent.terms.body, null)
console.log('Phase 3 feedback handoff, store filtering, enquiry validation and bilingual content checks passed')
