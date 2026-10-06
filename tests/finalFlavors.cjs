const fs = require('node:fs')
const assert = require('node:assert/strict')
const ts = require('typescript')
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8').replace(/import\.meta\.env/g, '({})')
  module._compile(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText, filename)
}
require.extensions['.css'] = () => {}
const React = require('react')
const { renderToString } = require('react-dom/server')
const { MemoryRouter, Routes, Route } = require('react-router')
const { LanguageProvider } = require('../src/i18n/LanguageContext.tsx')
const data = require('../src/data/products.ts')
const { buildCatalog, canRate } = require('../src/cms/publicCatalog.ts')
const { cmsSections, newCmsRow, validateCmsRow } = require('../src/cms/schema.ts')
const { feedbackDestination } = require('../src/data/feedback.ts')
const { validateRating } = require('../supabase/functions/submit-rating/protection.ts')

const expected = {
  'pop-g': [
    ['flavor-1', 'White Cheese', 'جبنة بيضاء'],
    ['flavor-2', 'Sour Cream & Onion', 'كريمة حامضة وبصل'],
    ['flavor-3', 'Hot & Sweet', 'حار وحلو'],
  ],
  trigger: [
    ['flavor-1', 'Chicken Noodles', 'نودلز الدجاج'],
    ['flavor-2', 'Vegetable Noodles', 'نودلز الخضار'],
    ['flavor-3', 'Taco', 'تاكو'],
    ['flavor-4', 'Sushi', 'سوشي'],
  ],
}
const cmsProducts = [], cmsFlavors = []
for (const [productSlug, flavors] of Object.entries(expected)) {
  assert.equal(data.getProduct(productSlug).flavors.length, flavors.length)
  const productId = 'cms-' + productSlug
  cmsProducts.push({ id: productId, slug: productSlug, name_en: productSlug.toUpperCase(), name_ar: productSlug, is_active: true })
  for (const [index, [flavorSlug, en, ar]] of flavors.entries()) {
    const route = '/rate/' + productSlug + '/' + flavorSlug
    const flavor = data.getFlavor(productSlug, flavorSlug)
    assert.deepEqual(flavor.name, { en, ar })
    assert.equal(flavor.id, productSlug + '-preview-' + (index + 1))
    assert.equal(flavor.ratingPath, route)
    assert.equal(flavor.isPlaceholder, false)
    assert.equal(flavor.isActive, true)
    assert.equal(data.getFlavorName(productSlug, flavorSlug, 'en'), en)
    assert.equal(data.getFlavorName(productSlug, flavorSlug, 'ar'), ar)
    assert.equal(feedbackDestination(productSlug, flavorSlug), route)
    assert.equal(canRate(productSlug, flavorSlug), true)
    assert.ok(validateRating({ product_slug: productSlug, flavor_slug: flavorSlug, rating: 5, language: 'ar' }))
    const row = { ...newCmsRow(cmsSections.flavors), id: productId + '-' + flavorSlug, product_id: productId,
      slug: flavorSlug, name_en: en, name_ar: ar, is_placeholder: false, display_order: index }
    assert.deepEqual(validateCmsRow(cmsSections.flavors, row), {})
    cmsFlavors.push(row)
  }
}
const catalog = buildCatalog({ products: cmsProducts, flavors: cmsFlavors })
for (const product of catalog) {
  assert.equal(product.flavors.length, expected[product.slug].length)
  for (const [index, flavor] of product.flavors.entries()) {
    const [slug, en, ar] = expected[product.slug][index]
    assert.equal(flavor.slug, slug)
    assert.deepEqual(flavor.name, { en, ar })
    assert.equal(flavor.ratingPath, '/rate/' + product.slug + '/' + slug)
    assert.equal(flavor.isPlaceholder, false)
  }
}
for (const slug of ['loots', 'x-stix']) {
  assert.equal(data.getProduct(slug).flavors.length, 3)
  assert.ok(data.getProduct(slug).flavors.every(flavor => flavor.isPlaceholder))
}
for (const productSlug of ['pop-g', 'loots', 'x-stix', 'unknown']) {
  assert.equal(canRate(productSlug, 'flavor-4'), false)
  assert.equal(feedbackDestination(productSlug, 'flavor-4'), null)
  assert.equal(validateRating({ product_slug: productSlug, flavor_slug: 'flavor-4', rating: 5, language: 'en' }), null)
}
for (const flavorSlug of ['sushi', 'flavor-5', 'flavor-04', '', null]) {
  assert.equal(validateRating({ product_slug: 'trigger', flavor_slug: flavorSlug, rating: 5, language: 'en' }), null)
}

function renderPage(page, url, path, language) {
  global.localStorage = { getItem: () => language }
  const Component = require('../src/pages/' + page + '.tsx').default
  return renderToString(React.createElement(MemoryRouter, { initialEntries: [url] },
    React.createElement(LanguageProvider, null, React.createElement(Routes, null,
      React.createElement(Route, { path, element: React.createElement(Component) })))))
}
for (const language of ['en', 'ar']) {
  for (const [productSlug, flavors] of Object.entries(expected)) {
    const catalogHtml = renderPage('ProductFamily', '/products/' + productSlug, '/products/:productSlug', language)
    for (const [slug, en, ar] of flavors) {
      const name = (language === 'en' ? en : ar).replace(/&/g, '&amp;')
      assert.ok(catalogHtml.includes(name), 'Catalog is missing ' + name)
      const html = renderPage('RateSnack', '/rate/' + productSlug + '/' + slug, '/rate/:productSlug/:flavorSlug', language)
      assert.ok(html.includes(name), 'Rating page is missing ' + name)
      assert.equal((html.match(/type="radio"/g) ?? []).length, 5)
      assert.ok(html.includes('rating-options'))
      assert.ok(!html.includes('class="rating-error"'))
    }
  }
}
delete global.localStorage

// Compare against the original anonymous policy: only the TRIGGER fourth route changes.
const migration = fs.readFileSync('supabase/migrations/007_final_flavor_names.sql', 'utf8').replace(/\r\n/g, '\n')
const original = fs.readFileSync('supabase/migrations/001_create_ratings.sql', 'utf8').replace(/\r\n/g, '\n')
const policyPattern = /with check \(([\s\S]*?)\n  \);/
const expectedCheck = original.match(policyPattern)[1].replace(
  "and flavor_slug in ('flavor-1', 'flavor-2', 'flavor-3')",
  "and (flavor_slug in ('flavor-1', 'flavor-2', 'flavor-3') or (product_slug = 'trigger' and flavor_slug = 'flavor-4'))",
)
const normalize = sql => sql.replace(/\s+/g, '')
assert.equal(normalize(migration.match(policyPattern)[1]), normalize(expectedCheck))
assert.equal((migration.match(/alter policy /gi) ?? []).length, 1)
assert.match(migration, /alter policy "Anonymous rating inserts"\s+on public\.ratings\s+with check/)
assert.match(migration, /policyname = 'Anonymous rating inserts' and cmd = 'INSERT'/)
assert.match(migration, /roles = array\['anon'\]::name\[\]/)
assert.doesNotMatch(migration, /rating_security|submit_anonymous_rating|purge_rating_limits|migration 005/i)
assert.doesNotMatch(migration, /^\s*(alter table|create |drop |grant |revoke |delete from)/im)
assert.doesNotMatch(migration, /(?:update|insert into|delete from)\s+public\.ratings/i)
assert.deepEqual([...migration.matchAll(/^\s*(?:update|insert into)\s+(public\.\w+)/gim)].map(match => match[1]),
  ['public.flavors', 'public.flavors'])
assert.match(migration, /^begin;/)
assert.match(migration, /commit;\s*$/)
for (const flavors of Object.values(expected)) for (const [, en, ar] of flavors) {
  assert.ok(migration.includes("'" + en + "'") && migration.includes("'" + ar + "'"))
}
console.log('Final flavor names: stable URLs/IDs, EN/AR renders, CMS rows, feedback handoff and TRIGGER-only fourth route passed. Migration scope: flavor data and the existing anonymous INSERT policy only. No SQL executed or live submissions.')
