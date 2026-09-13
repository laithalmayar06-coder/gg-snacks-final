const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const assert = require('node:assert/strict')
const code = ts.transpileModule(fs.readFileSync('src/data/products.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const context = { exports: {} }
vm.runInNewContext(code, context)
const data = context.exports
assert.equal(data.productFamilies.length, 4)
for (const product of data.productFamilies) {
  assert.equal(product.ingredients, null)
  assert.equal(product.nutrition, null)
  for (const flavor of product.flavors) {
    assert.equal(flavor.ratingPath, `/rate/${product.slug}/${flavor.slug}`)
    assert.equal(data.getFlavor(product.slug, flavor.slug), flavor)
    assert.equal(data.getProductImage(product, flavor), null)
  }
}
for (const count of [0, 1, 2, 3, 4, 5, 6, 12]) {
  const sample = data.productFamilies[0]
  const result = data.defineProducts([{ ...sample, flavors: Array.from({ length: count }, (_, index) => ({ ...sample.flavors[0], id: `id-${index}`, slug: `slot-${index}` })) }])[0]
  assert.equal(result.flavors.length, count)
  assert.equal(data.getActiveFlavors(result).length, count)
  result.flavors.forEach((flavor, index) => assert.equal(flavor.ratingPath, `/rate/loots/slot-${index}`))
}
const product = { ...data.productFamilies[0], image: '/family.png' }
assert.equal(data.getProductImage(product), '/family.png')
assert.equal(data.getProductImage(product, { ...product.flavors[0], image: '/flavor.png' }), '/flavor.png')
assert.equal(data.getActiveFlavors({ ...product, flavors: [{ ...product.flavors[0], isActive: false }] }).length, 0)
assert.equal(data.getFlavorName('unknown', 'archived-flavor'), 'archived-flavor')
console.log('Product data checks passed')
