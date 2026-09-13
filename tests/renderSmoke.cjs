const fs = require('node:fs')
const ts = require('typescript')
const assert = require('node:assert/strict')
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8').replace(/import\.meta\.env/g, '({})')
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename)
}
require.extensions['.css'] = () => {}
const React = require('react')
const { renderToString } = require('react-dom/server')
const { MemoryRouter, Routes, Route } = require('react-router')
const { LanguageProvider } = require('../src/i18n/LanguageContext.tsx')
const cases = [
  ['/unknown', '*', 'NotFound', 'GG / 404'],
  ['/', '/', 'Home', 'product-worlds'],
  ['/products', '/products', 'Products', '/products/loots'],
  ['/products/loots', '/products/:productSlug', 'ProductFamily', '/rate/loots/flavor-1'],
  ['/products/trigger', '/products/:productSlug', 'ProductFamily', '/rate/trigger/flavor-1'],
  ['/products/x-stix', '/products/:productSlug', 'ProductFamily', '/rate/x-stix/flavor-1'],
  ['/products/pop-g', '/products/:productSlug', 'ProductFamily', '/rate/pop-g/flavor-1'],
  ['/products/invalid', '/products/:productSlug', 'ProductFamily', 'catalogue-not-found'],
  ['/rate/loots/flavor-1', '/rate/:productSlug/:flavorSlug', 'RateSnack', 'rating-options'],
  ['/rate/loots/invalid', '/rate/:productSlug/:flavorSlug', 'RateSnack', 'rating-error'],
  ['/admin/login', '/admin/login', 'AdminLogin', 'staff-password'],
  ['/dashboard/ratings', '/dashboard/ratings', 'RatingsDashboard', 'Loading ratings'],
]
for (const language of ['en', 'ar']) {
  global.localStorage = { getItem: () => language }
  for (const [url, path, page, expected] of cases) {
    const Component = require(`../src/pages/${page}.tsx`).default
    const html = renderToString(React.createElement(MemoryRouter, { initialEntries: [url] }, React.createElement(LanguageProvider, null, React.createElement(Routes, null, React.createElement(Route, { path, element: React.createElement(Component) })))))
    assert.ok(html.includes(expected), `${language} ${url} missing ${expected}`)
    if (page === 'Home') {
      assert.equal((html.match(/<main\b/g) ?? []).length, 1)
      assert.ok(html.indexOf('</main>') < html.indexOf('<footer'))
      assert.ok(html.includes('to=') === false)
    }
    if (page === 'RateSnack' && !url.includes('invalid')) {
      assert.equal((html.match(/type="radio"/g) ?? []).length, 5)
      assert.ok(/type="submit"[^>]*disabled/.test(html))
    }
  }
}
delete global.localStorage
console.log('24 English/Arabic server-render smoke checks passed (not browser layout tests)')
